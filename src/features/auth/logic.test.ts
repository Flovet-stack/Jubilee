import { describe, expect, it } from "vitest";

import {
  afterSend,
  authErrorFor,
  firstName,
  initialEmailState,
  nextOrHome,
  normaliseCode,
  normaliseEmail,
  oauthReturnError,
  pageErrorFrom,
  safeNextPath,
  signInPath,
  type EmailFormState,
} from "./logic";

describe("safeNextPath", () => {
  it.each([
    ["/en-us/home", "/en-us/home"],
    ["/en-gb/home", "/en-gb/home"],
    ["/fr-fr/home", "/fr-fr/home"],
    ["/en-gb", "/en-gb"],
    ["/en-us/cv?tab=2", "/en-us/cv?tab=2"],
    ["/en-gb/a/../home", "/en-gb/home"],
    // Saved before decision 0017: upgraded, not dropped.
    ["/en/home", "/en-us/home"],
    ["/fr/cv?tab=2", "/fr-fr/cv?tab=2"],
    ["/fr", "/fr-fr"],
  ])("accepts %s", (raw, expected) => {
    expect(safeNextPath(raw)).toBe(expected);
  });

  it.each([
    ["//evil.com"],
    ["/\\evil.com"],
    ["/en\\..\\..\\evil"],
    ["https://evil.com/en/home"],
    ["http:/evil.com"],
    ["evil.com"],
    ["/home"],
    ["/de/home"],
    ["/de-de/home"],
    ["/english"],
    ["/en-gbx/home"],
    [""],
    ["/%2F%2Fevil.com"],
    ["/en/../..//evil.com"],
    ["/en/\nhome"],
    ["/en/sign-in"],
    ["/en-gb/sign-in"],
    ["/fr-fr/auth/callback?code=1"],
    ["/fr/auth/callback?code=1"],
    ["/" + "a".repeat(600)],
  ])("rejects %j", (raw) => {
    expect(safeNextPath(raw)).toBeNull();
  });

  it("rejects values that aren't strings", () => {
    expect(safeNextPath(undefined)).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(["/en/home"])).toBeNull();
  });

  it("falls back to the locale's home", () => {
    expect(nextOrHome("//evil.com", "fr-fr")).toBe("/fr-fr/home");
    expect(nextOrHome("/en-gb/cv", "fr-fr")).toBe("/en-gb/cv");
  });
});

describe("normalising input", () => {
  it("trims and lowercases emails", () => {
    expect(normaliseEmail("  Ada@Example.COM ")).toBe("ada@example.com");
    expect(normaliseEmail(undefined)).toBe("");
  });

  it("keeps only the digits of a pasted code", () => {
    expect(normaliseCode("123 456")).toBe("123456");
    expect(normaliseCode(" 123456 \n")).toBe("123456");
    expect(normaliseCode(null)).toBe("");
  });
});

describe("authErrorFor", () => {
  it("covers a wrong or expired code with one message", () => {
    expect(authErrorFor({ code: "otp_expired" }, "code")).toEqual({
      key: "codeInvalid",
    });
  });

  it("says an expired link is expired", () => {
    expect(authErrorFor({ code: "otp_expired" }, "link")).toEqual({
      key: "linkExpired",
    });
  });

  it("reads the wait from a rate-limit message", () => {
    expect(
      authErrorFor(
        {
          code: "over_email_send_rate_limit",
          message:
            "For security purposes, you can only request this after 42 seconds.",
        },
        "code",
      ),
    ).toEqual({ key: "rateLimited", seconds: 42 });
  });

  it("waits 60 seconds when the message has no number", () => {
    expect(authErrorFor({ code: "over_request_rate_limit" }, "code")).toEqual({
      key: "rateLimited",
      seconds: 60,
    });
  });

  it("explains that email sign-in is closed", () => {
    expect(
      authErrorFor({ code: "email_address_not_authorized" }, "code").key,
    ).toBe("emailNotAllowed");
  });

  it("maps bad addresses", () => {
    expect(authErrorFor({ code: "email_address_invalid" }, "code").key).toBe(
      "emailInvalid",
    );
  });

  it("treats unknown OAuth failures as a provider error", () => {
    expect(authErrorFor({ code: "flow_state_expired" }, "oauth").key).toBe(
      "provider",
    );
    expect(authErrorFor({}, "oauth").key).toBe("provider");
    expect(authErrorFor({}, "code").key).toBe("unknown");
  });
});

describe("errors in the URL", () => {
  it("accepts only known keys", () => {
    expect(pageErrorFrom("cancelled")).toBe("cancelled");
    expect(pageErrorFrom("<script>")).toBeNull();
    expect(pageErrorFrom(undefined)).toBeNull();
  });

  it("tells a cancel from other provider errors", () => {
    expect(oauthReturnError("access_denied")).toBe("cancelled");
    expect(oauthReturnError("server_error")).toBe("provider");
    expect(oauthReturnError(null)).toBeNull();
  });

  it("builds sign-in links and drops an unsafe next", () => {
    expect(signInPath("fr-fr")).toBe("/fr-fr/sign-in");
    expect(
      signInPath("en-gb", {
        error: "provider",
        provider: "google",
        next: "/en-gb/cv",
      }),
    ).toBe("/en-gb/sign-in?error=provider&provider=google&next=%2Fen-gb%2Fcv");
    expect(signInPath("en-us", { next: "//evil.com" })).toBe("/en-us/sign-in");
  });
});

describe("firstName", () => {
  it("takes the first word, or nothing", () => {
    expect(firstName("Ada Lovelace")).toBe("Ada");
    expect(firstName("  Ada  ")).toBe("Ada");
    expect(firstName("")).toBeNull();
    expect(firstName(null)).toBeNull();
  });
});

describe("afterSend", () => {
  const onCode: EmailFormState = {
    ...initialEmailState,
    step: "code",
    email: "old@mail.com",
    nonce: 1,
  };

  it("moves to the code step after a first send", () => {
    const state = afterSend(initialEmailState, {
      email: "ada@mail.com",
      fromEmailStep: true,
      error: null,
    });
    expect(state).toMatchObject({
      step: "code",
      email: "ada@mail.com",
      resent: false,
      wait: 60,
      nonce: 1,
    });
  });

  it("marks a send from the code step as a resend", () => {
    const state = afterSend(onCode, {
      email: "old@mail.com",
      fromEmailStep: false,
      error: null,
    });
    expect(state.resent).toBe(true);
  });

  it("after Change email, a failure stays on the email step", () => {
    const state = afterSend(onCode, {
      email: "new@",
      fromEmailStep: true,
      error: { key: "emailInvalid" },
    });
    expect(state).toMatchObject({
      step: "email",
      email: "new@",
      error: { key: "emailInvalid" },
    });
  });

  it("after Change email, a success is not called a resend", () => {
    const state = afterSend(onCode, {
      email: "new@mail.com",
      fromEmailStep: true,
      error: null,
    });
    expect(state).toMatchObject({ step: "code", resent: false });
  });

  it("a rate-limited resend stays on the code step and waits", () => {
    const state = afterSend(onCode, {
      email: "old@mail.com",
      fromEmailStep: false,
      error: { key: "rateLimited", seconds: 42 },
    });
    expect(state).toMatchObject({ step: "code", wait: 42 });
  });
});
