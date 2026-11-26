"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/field";
import type { Locale } from "@/i18n/routing";

import {
  initialEmailState,
  type AuthError,
  type AuthErrorKey,
  type EmailFormState,
} from "../logic";

type Action = (
  previous: EmailFormState,
  formData: FormData,
) => Promise<EmailFormState>;

type EmailSignInProps = {
  locale: Locale;
  next: string | null;
  action: Action;
  /** The Google / LinkedIn buttons, shown on the first step only. */
  providers: ReactNode;
  /** An error that came back in the URL (cancel, provider, expired link). */
  pageError: ReactNode;
};

/** Errors shown under the field; the rest show as an alert above the form. */
const FIELD_ERRORS: AuthErrorKey[] = [
  "emailInvalid",
  "codeInvalid",
  "codeFormat",
];

/**
 * The email part of sign-in (0012): ask for a code, then enter it. One
 * server action drives both steps; each response remounts the steps, which
 * restarts the countdowns and closes "Change email".
 */
export function EmailSignIn({
  locale,
  next,
  action,
  providers,
  pageError,
}: EmailSignInProps) {
  const [state, formAction] = useActionState(action, initialEmailState);
  return (
    <EmailSteps
      key={state.nonce}
      state={state}
      formAction={formAction}
      locale={locale}
      next={next}
      providers={providers}
      pageError={state.nonce === 0 ? pageError : null}
    />
  );
}

type StepsProps = {
  state: EmailFormState;
  formAction: (formData: FormData) => void;
  locale: Locale;
  next: string | null;
  providers: ReactNode;
  pageError: ReactNode;
};

function EmailSteps({
  state,
  formAction,
  locale,
  next,
  providers,
  pageError,
}: StepsProps) {
  const t = useTranslations("auth");
  const [editing, setEditing] = useState(false);
  const step = editing ? "email" : state.step;

  const message = (error: AuthError | null) =>
    error ? t(`errors.${error.key}`, { seconds: error.seconds ?? 0 }) : null;
  const fieldError =
    state.error && FIELD_ERRORS.includes(state.error.key)
      ? message(state.error)
      : null;
  const alert =
    state.error && !FIELD_ERRORS.includes(state.error.key) ? (
      <Alert tone="danger" title={message(state.error)} />
    ) : null;

  const hidden = (
    <>
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
    </>
  );

  if (step === "email") {
    return (
      <div className="flex flex-col gap-6">
        {pageError}
        {providers}
        <p
          className="flex items-center gap-3 text-sm text-ink-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line"
          role="separator"
        >
          {t("signIn.or")}
        </p>
        <form action={formAction} noValidate className="flex flex-col gap-4">
          {hidden}
          <input type="hidden" name="intent" value="send" />
          <input type="hidden" name="from" value="email" />
          {editing ? null : alert}
          <Field
            label={t("signIn.emailLabel")}
            error={editing ? null : fieldError}
          >
            <Input
              size="lg"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              autoCapitalize="none"
              defaultValue={state.email}
              autoFocus={editing || (state.nonce > 0 && fieldError != null)}
              required
            />
          </Field>
          <SubmitButton
            label={t("signIn.sendCode")}
            loadingLabel={t("signIn.sending")}
            wait={editing ? 0 : state.wait}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-center text-lg font-bold text-ink">
        {t("code.title")}
      </h2>
      <form action={formAction} noValidate className="flex flex-col gap-4">
        {hidden}
        <input type="hidden" name="intent" value="verify" />
        <input type="hidden" name="email" value={state.email} />
        {alert}
        {state.resent && !state.error ? (
          <Alert tone="success" title={t("code.resent")} />
        ) : null}
        {/* The sent-to sentence is the field's description, so a screen
            reader hears it when focus lands on the code field. */}
        <Field
          label={t("code.label")}
          hint={
            <>
              {t.rich("code.sentTo", {
                email: state.email,
                strong: (chunks) => (
                  <strong className="font-semibold break-all text-ink">
                    {chunks}
                  </strong>
                ),
              })}{" "}
              {t("code.hint")}
            </>
          }
          error={fieldError}
        >
          <Input
            size="lg"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={12}
            spellCheck={false}
            autoFocus
            required
            className="tracking-[0.2em] tabular-nums"
          />
        </Field>
        <SubmitButton
          label={t("code.submit")}
          loadingLabel={t("code.verifying")}
        />
      </form>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="quiet" onClick={() => setEditing(true)}>
          {t("code.change")}
        </Button>
        <form action={formAction}>
          {hidden}
          <input type="hidden" name="intent" value="send" />
          <input type="hidden" name="email" value={state.email} />
          <ResendButton wait={state.wait} />
        </form>
      </div>
    </div>
  );
}

/** Seconds left from `wait`, ticking down once a second. */
function useCountdown(wait: number): number {
  const [remaining, setRemaining] = useState(wait);
  useEffect(() => {
    if (wait <= 0) return;
    const id = setInterval(() => {
      setRemaining((seconds) => {
        if (seconds <= 1) clearInterval(id);
        return Math.max(0, seconds - 1);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [wait]);
  return remaining;
}

/**
 * The step's one violet button. Its spinner follows its own form only, and
 * after a rate limit it waits out the countdown before it can send again.
 */
function SubmitButton({
  label,
  loadingLabel,
  wait = 0,
}: {
  label: string;
  loadingLabel: string;
  wait?: number;
}) {
  const t = useTranslations("auth.code");
  const { pending } = useFormStatus();
  const remaining = useCountdown(wait);
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      fullWidth
      loading={pending}
      loadingLabel={loadingLabel}
      disabled={remaining > 0}
    >
      <span className="tabular-nums">
        {remaining > 0 ? t("resendIn", { seconds: remaining }) : label}
      </span>
    </Button>
  );
}

/** Counts down from `wait`; remounted with each response, so no reset logic. */
function ResendButton({ wait }: { wait: number }) {
  const t = useTranslations("auth.code");
  const { pending } = useFormStatus();
  const remaining = useCountdown(wait);
  return (
    <Button
      type="submit"
      variant="quiet"
      disabled={remaining > 0}
      loading={pending}
    >
      <span className="tabular-nums">
        {remaining > 0 ? t("resendIn", { seconds: remaining }) : t("resend")}
      </span>
    </Button>
  );
}
