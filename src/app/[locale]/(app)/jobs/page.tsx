import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/features/shell/components/placeholder-page";

export function generateMetadata({ params }: PageProps<"/[locale]/jobs">) {
  return placeholderMetadata(params, "jobs");
}

/** Placeholder until its own spec ships (spec 15). */
export default function JobsPage({ params }: PageProps<"/[locale]/jobs">) {
  return <PlaceholderPage params={params} page="jobs" />;
}
