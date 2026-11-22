import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// A refresh that rotates the session cookie, as Supabase does when the
// access token has expired.
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: { name: string; value: string; options: object }[],
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getClaims: async () => {
        options.cookies.setAll(
          [{ name: "sb-test-auth-token", value: "fresh", options: {} }],
          { "Cache-Control": "private, no-store" },
        );
        return { data: null };
      },
    },
  }),
}));

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  },
}));

const { proxy } = await import("./proxy");

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, "http://localhost"), { headers });
}

describe("proxy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("forwards the refreshed session cookie to the page render", async () => {
    const response = await proxy(
      request("/en-us", { cookie: "sb-test-auth-token=expired" }),
    );
    const forwarded = response.headers.get("x-middleware-request-cookie");
    expect(forwarded).toContain("sb-test-auth-token=fresh");
    expect(forwarded).not.toContain("expired");
  });

  it("sets the refreshed cookie and no-cache header on the response", async () => {
    const response = await proxy(request("/en-us"));
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("fresh");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});

describe("locale redirects (decision 0017)", () => {
  it("redirects / by Accept-Language, keeping the session cookie", async () => {
    const response = await proxy(
      request("/", { "accept-language": "fr-CM,fr;q=0.9" }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/fr-fr");
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("fresh");
  });

  it("sends English outside the US and Canada to en-GB", async () => {
    const response = await proxy(request("/", { "accept-language": "en-NG" }));
    expect(response.headers.get("location")).toBe("http://localhost/en-gb");
  });

  it("falls back to en-US for an unsupported language", async () => {
    const response = await proxy(request("/", { "accept-language": "de-DE" }));
    expect(response.headers.get("location")).toBe("http://localhost/en-us");
  });

  it("prefers the saved choice at /, old values included", async () => {
    const saved = await proxy(
      request("/", { cookie: "NEXT_LOCALE=en-gb", "accept-language": "fr" }),
    );
    expect(saved.headers.get("location")).toBe("http://localhost/en-gb");

    const old = await proxy(
      request("/", { cookie: "NEXT_LOCALE=fr", "accept-language": "en" }),
    );
    expect(old.headers.get("location")).toBe("http://localhost/fr-fr");
  });

  it("ignores an unknown saved value", async () => {
    const response = await proxy(
      request("/", { cookie: "NEXT_LOCALE=de", "accept-language": "fr" }),
    );
    expect(response.headers.get("location")).toBe("http://localhost/fr-fr");
  });

  it("never redirects a shared link, nor writes the locale cookie", async () => {
    const response = await proxy(
      request("/en-gb/privacy", {
        cookie: "NEXT_LOCALE=fr-fr",
        "accept-language": "fr",
      }),
    );
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });

  it("does not write the locale cookie at / either", async () => {
    const response = await proxy(request("/", { "accept-language": "fr" }));
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });

  it("moves old /en and /fr links permanently, keeping path and query", async () => {
    const en = await proxy(request("/en/privacy?x=1"));
    expect(en.status).toBe(308);
    expect(en.headers.get("location")).toBe(
      "http://localhost/en-us/privacy?x=1",
    );

    const fr = await proxy(request("/fr"));
    expect(fr.headers.get("location")).toBe("http://localhost/fr-fr");
  });

  it("lowercases a locale typed in another case", async () => {
    const response = await proxy(request("/EN-GB/privacy"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "http://localhost/en-gb/privacy",
    );
  });
});
