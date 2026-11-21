import type { MetadataRoute } from "next";

import { env } from "@/env";
import { routing } from "@/i18n/routing";
import { publicPaths } from "@/lib/seo";

// One entry per page and locale, each listing every language version (0003).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;

  return publicPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
