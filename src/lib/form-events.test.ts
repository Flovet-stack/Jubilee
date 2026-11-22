import { describe, expect, it } from "vitest";

import { blockSubmitUnless, hideOnSubmit } from "./form-events";

const submit = (target: EventTarget) => {
  const event = new Event("submit", { cancelable: true });
  target.dispatchEvent(event);
  return event;
};

describe("hideOnSubmit (PasswordField, 0021)", () => {
  it("hides the password again when its form submits", () => {
    const form = new EventTarget();
    const calls: boolean[] = [];
    const stop = hideOnSubmit(form, (visible) => calls.push(visible));
    submit(form);
    expect(calls).toEqual([false]);
    stop();
    submit(form);
    expect(calls).toEqual([false]);
  });

  it("does nothing without a form", () => {
    expect(() => hideOnSubmit(null, () => {})()).not.toThrow();
  });
});

describe("blockSubmitUnless (phone and date fields)", () => {
  it("cancels the submit while the field is invalid", () => {
    const form = new EventTarget();
    let valid = false;
    const stop = blockSubmitUnless(form, () => valid);
    expect(submit(form).defaultPrevented).toBe(true);
    valid = true;
    expect(submit(form).defaultPrevented).toBe(false);
    stop();
  });
});
