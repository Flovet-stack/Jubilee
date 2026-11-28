import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./actions", () => ({ importCvAction: vi.fn() }));
vi.mock("@/features/cv/editor-actions", () => ({ createCvAction: vi.fn() }));
const redirect = vi.fn((url: string) => {
  throw new Error(`redirect:${url}`);
});
vi.mock("next/navigation", () => ({ redirect, notFound: vi.fn() }));

import en from "@/messages/en.json";

const { StartCards } = await import("./components/start-cards");
const NewCvPage = (await import("@/app/[locale]/(app)/cvs/new/page")).default;

describe("start cards (spec 31)", () => {
  it("renders the four cards with For a job disabled", () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider locale="en-us" messages={en}>
        <StartCards locale="en-us" language="en" market="US" />
      </NextIntlClientProvider>,
    );
    const buttons = html.match(/<button[^>]*>.*?<\/button>/g) ?? [];
    expect(buttons).toHaveLength(4);
    const job = buttons.find((b) => b.includes(en.cv.start.job.title))!;
    expect(job).toContain('disabled=""');
    expect(job).toContain('aria-disabled="true"');
    expect(job).toContain('type="button"');
    expect(job).not.toContain("form=");
  });
});

describe("/cvs/new (0050)", () => {
  it("redirects to the Resumes page", async () => {
    await expect(
      NewCvPage({ params: Promise.resolve({ locale: "fr-fr" }) } as never),
    ).rejects.toThrow("redirect:/fr-fr/cvs");
  });
});
