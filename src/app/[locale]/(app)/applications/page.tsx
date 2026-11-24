import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/features/shell/components/placeholder-page";

export function generateMetadata({
  params,
}: PageProps<"/[locale]/applications">) {
  return placeholderMetadata(params, "applications");
}

/** Placeholder until its own spec ships (spec 15). */
export default function ApplicationsPage({
  params,
}: PageProps<"/[locale]/applications">) {
  return <PlaceholderPage params={params} page="applications" />;
}
