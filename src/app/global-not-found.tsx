import type { Metadata } from "next";

import { NotFoundContent } from "@/components/not-found-content";
import { jakarta } from "@/lib/fonts";
import { site } from "@/lib/site";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

import "./globals.css";

export const metadata: Metadata = {
  title: `${en.notFound.title} · ${site.name}`,
};

/**
 * 404 for URLs no route matches. It renders outside the `[locale]` layout, so
 * the locale is unknown: it shows both languages, English first (0017 default).
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-12 px-4 py-24">
          <NotFoundContent
            title={en.notFound.title}
            body={en.notFound.body}
            homeLabel={en.notFound.home}
            homeHref="/en-us"
          />
          <NotFoundContent
            lang="fr"
            title={fr.notFound.title}
            body={fr.notFound.body}
            homeLabel={fr.notFound.home}
            homeHref="/fr-fr"
          />
        </main>
      </body>
    </html>
  );
}
