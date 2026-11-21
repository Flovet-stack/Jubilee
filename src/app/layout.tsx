import type { Metadata } from "next";

import { site } from "@/lib/site";

import "./globals.css";

// Fonts, tokens and the shell come with the design decision and spec 01.
export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
