import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Validates env at build time: a missing variable fails `next build` (0004).
import "./src/env";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The CV PDF route reads its fonts from disk (spec 25), so ship them with it.
  outputFileTracingIncludes: {
    "/api/cvs/*/pdf": ["src/features/cv/templates/classic/fonts/*.ttf"],
  },
  experimental: {
    // The root layout sits under `[locale]`, so unmatched URLs need a 404
    // that renders without it (app/global-not-found.tsx).
    globalNotFound: true,
    // Import takes a PDF up to 5 MB (spec 31); 6 MB leaves room for the form.
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
