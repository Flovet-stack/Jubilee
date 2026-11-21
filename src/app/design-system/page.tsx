import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Gallery } from "./gallery";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Every token and component in every state (spec 02). Development only: a
 * reference for builders and reviewers, not a product page, so its sample
 * copy lives beside it rather than in the message files.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Gallery />;
}
