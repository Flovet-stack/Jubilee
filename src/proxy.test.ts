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
      request("/en", { cookie: "sb-test-auth-token=expired" }),
    );
    const forwarded = response.headers.get("x-middleware-request-cookie");
    expect(forwarded).toContain("sb-test-auth-token=fresh");
    expect(forwarded).not.toContain("expired");
  });

  it("sets the refreshed cookie and no-cache header on the response", async () => {
    const response = await proxy(request("/en"));
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("fresh");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("redirects / by Accept-Language, keeping the session cookie", async () => {
    const response = await proxy(
      request("/", { "accept-language": "fr-CM,fr;q=0.9" }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/fr");
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("fresh");
  });

  it("falls back to English for an unsupported language", async () => {
    const response = await proxy(request("/", { "accept-language": "de-DE" }));
    expect(response.headers.get("location")).toBe("http://localhost/en");
  });
});
