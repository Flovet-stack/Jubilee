import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { HugeiconsExternalLinkIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type TextLinkProps = ComponentProps<typeof Link> & {
  /** Opens another site: new tab, an icon, and the hint for screen readers. */
  external?: boolean;
  /** Read after the label when `external`, e.g. "(opens in a new tab)". */
  externalHint?: string;
  children: ReactNode;
};

/**
 * Inline link: violet, underlined (links are never colour alone), thicker
 * underline on hover. Wraps with the text.
 */
export function TextLink({
  external = false,
  externalHint,
  className,
  children,
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={cn(
        "rounded-paper font-semibold text-violet underline decoration-1 underline-offset-[0.2em]",
        "transition-[text-decoration-thickness,color] duration-(--dur-exit) active:text-violet-press hover-fine:decoration-2 hover-fine:duration-(--dur-fast)",
        className,
      )}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
      {external ? (
        <>
          <HugeiconsExternalLinkIcon
            size={16}
            className="ms-1 inline-flex align-[-0.15em]"
          />
          {externalHint ? (
            <span className="sr-only"> {externalHint}</span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}
