import { TextLink } from "@/components/ui/text-link";

type Props = {
  title: string;
  body: string;
  homeLabel: string;
  homeHref: string;
  lang?: string;
};

/** The 404 body, shared by the locale not-found and the global one. */
export function NotFoundContent({
  title,
  body,
  homeLabel,
  homeHref,
  lang,
}: Props) {
  return (
    <section lang={lang} className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p>{body}</p>
      <p>
        <TextLink href={homeHref}>{homeLabel}</TextLink>
      </p>
    </section>
  );
}
