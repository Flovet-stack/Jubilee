import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Validates env at build time: a missing variable fails `next build` (0004).
import "./src/env";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The root layout sits under `[locale]`, so unmatched URLs need a 404
    // that renders without it (app/global-not-found.tsx).
    globalNotFound: true,
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
