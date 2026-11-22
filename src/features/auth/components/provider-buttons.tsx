"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { GoogleLogo, LinkedInLogo } from "@/components/brand/logos";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

import type { Provider } from "../logic";

type ProviderButtonsProps = {
  locale: Locale;
  next: string | null;
  action: (formData: FormData) => Promise<void>;
};

const LOGOS: Record<Provider, ReactNode> = {
  google: <GoogleLogo />,
  linkedin_oidc: <LinkedInLogo />,
};

/**
 * Continue with Google / LinkedIn (0012): equal size and weight, Google's own
 * button colours, the official marks. Each is a form, so it works before
 * JavaScript loads.
 */
export function ProviderButtons({
  locale,
  next,
  action,
}: ProviderButtonsProps) {
  const t = useTranslations("auth");
  const labels: Record<Provider, string> = {
    google: t("signIn.google"),
    linkedin_oidc: t("signIn.linkedin"),
  };

  return (
    <div className="flex flex-col gap-3">
      {(["google", "linkedin_oidc"] as const).map((provider) => (
        <form key={provider} action={action}>
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="locale" value={locale} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <ProviderSubmit
            icon={LOGOS[provider]}
            loadingLabel={t("signIn.redirecting", {
              provider: t(`providers.${provider}`),
            })}
          >
            {labels[provider]}
          </ProviderSubmit>
        </form>
      ))}
    </div>
  );
}

function ProviderSubmit({
  icon,
  loadingLabel,
  children,
}: {
  icon: ReactNode;
  loadingLabel: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      fullWidth
      loading={pending}
      loadingLabel={loadingLabel}
      icon={icon}
      className="bg-provider text-provider-ink shadow-[inset_0_0_0_1px_var(--provider-line)] active:bg-[color-mix(in_oklab,var(--provider),var(--provider-ink)_12%)] hover-fine:bg-[color-mix(in_oklab,var(--provider),var(--provider-ink)_6%)]"
    >
      {children}
    </Button>
  );
}
