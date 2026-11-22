import { countries } from "country-flag-icons";
import * as flags from "country-flag-icons/string/3x2";

/**
 * Country flags as static SVG files, `/flags/FR.svg` (decision 0021). Built
 * once at build time, so the phone field loads only the flags it shows and
 * no page ships the full set (about 1.2 MB) in its JavaScript. Flag emoji
 * are not used: Windows shows them as two letters.
 */

const svgs = flags as Record<string, string | undefined>;

export function generateStaticParams() {
  return countries.map((code) => ({ file: `${code}.svg` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const svg = /^[A-Z]{2}\.svg$/.test(file) ? svgs[file.slice(0, 2)] : undefined;
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
