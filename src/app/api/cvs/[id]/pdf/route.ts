import { contentDisposition } from "@/features/cv/file-name";
import { cvFileWord, cvLabels } from "@/features/cv/labels";
import { isUuid } from "@/features/cv/logic";
import { renderCvPdf } from "@/features/cv/pdf";
import { getCvDocument } from "@/features/cv/queries";
import { buildCvTree } from "@/features/cv/tree";

/**
 * The CV as a PDF (spec 23, decision 0035). RLS limits the read to the
 * owner, so another user's CV is "not found". Rendered on every request and
 * never stored. Node is the default runtime, which react-pdf needs.
 */

const status = (code: number) =>
  new Response(null, {
    status: code,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/cvs/[id]/pdf">,
) {
  const { id } = await params;
  if (!isUuid(id)) return status(404);

  const result = await getCvDocument({ kind: "cv", id });
  if (!result.ok) {
    if (result.error.code === "unauthenticated") return status(401);
    if (result.error.code === "not_found") return status(404);
    console.error("cv pdf: read failed", result.error.code);
    return status(500);
  }

  const cv = result.value;
  try {
    const [labels, word] = await Promise.all([
      cvLabels(cv.language),
      cvFileWord(cv.language, cv.market),
    ]);
    const tree = buildCvTree(cv.content, {
      language: cv.language,
      market: cv.market,
      labels,
    });
    const { bytes, fileName } = await renderCvPdf(tree, {
      title: cv.title,
      word,
    });
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition(fileName),
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "cv pdf: render failed",
      error instanceof Error ? error.name : "unknown",
    );
    return status(500);
  }
}
