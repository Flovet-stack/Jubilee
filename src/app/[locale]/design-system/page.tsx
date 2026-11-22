import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { trialFontVariables } from "./font-lab";
import { Gallery } from "./gallery";

import "./font-lab.css";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Every token and component in every state (spec 03). Development only: a
 * reference for builders and reviewers, not a product page, so its sample
 * copy lives beside it rather than in the message files.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Gallery fontVariables={trialFontVariables} />;
}
