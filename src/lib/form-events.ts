/**
 * Form submit hooks shared by the spec 13 fields, kept free of React and the
 * DOM types so they can be tested with a plain `EventTarget`.
 */

/** Calls `handler` on each submit of `form`; returns the cleanup. */
export function onFormSubmit(
  form: EventTarget | null | undefined,
  handler: (event: Event) => void,
): () => void {
  if (!form) return () => {};
  form.addEventListener("submit", handler);
  return () => form.removeEventListener("submit", handler);
}

/**
 * A password field hides its text again whenever its form submits (GOV.UK
 * password input; decision 0021).
 */
export function hideOnSubmit(
  form: EventTarget | null | undefined,
  setVisible: (visible: boolean) => void,
): () => void {
  return onFormSubmit(form, () => setVisible(false));
}

/** Stops the submit when `check` fails, so the field can show its error. */
export function blockSubmitUnless(
  form: EventTarget | null | undefined,
  check: () => boolean,
): () => void {
  return onFormSubmit(form, (event) => {
    if (!check()) event.preventDefault();
  });
}
