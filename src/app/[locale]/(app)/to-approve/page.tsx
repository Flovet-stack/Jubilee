import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/features/shell/components/placeholder-page";

export function generateMetadata({
  params,
}: PageProps<"/[locale]/to-approve">) {
  return placeholderMetadata(params, "toApprove");
}

/** Placeholder until its own spec ships (spec 15). */
export default function ToApprovePage({
  params,
}: PageProps<"/[locale]/to-approve">) {
  return <PlaceholderPage params={params} page="toApprove" />;
}
