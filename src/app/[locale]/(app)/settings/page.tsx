import {
  PlaceholderPage,
  placeholderMetadata,
} from "@/features/shell/components/placeholder-page";

export function generateMetadata({ params }: PageProps<"/[locale]/settings">) {
  return placeholderMetadata(params, "settings");
}

/** Placeholder until its own spec ships (spec 15). */
export default function SettingsPage({
  params,
}: PageProps<"/[locale]/settings">) {
  return <PlaceholderPage params={params} page="settings" />;
}
