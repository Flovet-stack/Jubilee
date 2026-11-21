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

/** Props only next/link understands; a plain <a> must not receive them. */
const LINK_ONLY_PROPS = new Set([
  "as",
  "replace",
  "scroll",
  "shallow",
  "passHref",
  "prefetch",
  "locale",
  "legacyBehavior",
  "onNavigate",
]);

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
  const classes = cn(
    "rounded-paper font-semibold text-violet underline decoration-1 underline-offset-[0.2em]",
    "transition-[text-decoration-thickness,color] duration-(--dur-exit) active:text-violet-press hover-fine:decoration-2 hover-fine:duration-(--dur-fast)",
    className,
  );

  // A jump within the page: a native anchor, so the browser moves focus to
  // the target (next/link scrolls but leaves focus on the link). A mailto:
  // link is not a route either.
  if (
    typeof props.href === "string" &&
    (props.href.startsWith("#") || props.href.startsWith("mailto:"))
  ) {
    // Keep every anchor attribute (aria-*, id, onClick…); drop only the
    // props that mean something to next/link alone.
    const anchorProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !LINK_ONLY_PROPS.has(key)),
    ) as ComponentProps<"a">;
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <Link
      className={classes}
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
