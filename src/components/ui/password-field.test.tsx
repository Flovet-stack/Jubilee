import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PasswordField } from "./password-field";

/**
 * The GOV.UK password rules from decision 0021, checked on the rendered
 * markup. (Hiding again on submit needs a DOM; it is checked in the browser,
 * see spec 13's evidence.)
 */
function render(purpose: "current" | "new") {
  return renderToStaticMarkup(
    <PasswordField
      label="Password"
      purpose={purpose}
      showLabel="Show password"
      hideLabel="Hide password"
      capsLockLabel="Caps Lock is on"
      name="password"
    />,
  );
}

describe("PasswordField (0021)", () => {
  it("starts hidden, with the show toggle not pressed", () => {
    const html = render("current");
    expect(html).toContain('type="password"');
    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("sets autocomplete from its purpose", () => {
    expect(render("current")).toContain('autoComplete="current-password"');
    expect(render("new")).toContain('autoComplete="new-password"');
  });

  it("turns off spellcheck and autocapitalise, and never limits length", () => {
    const html = render("new");
    expect(html).toContain('spellCheck="false"');
    expect(html).toContain('autoCapitalize="off"');
    expect(html).not.toMatch(/maxLength/i);
  });
});
