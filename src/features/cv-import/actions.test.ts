import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const runTask = vi.fn();
const createCv = vi.fn();
const addRevision = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`redirect:${url}`);
});

vi.mock("@/lib/ai", () => ({ runTask }));
vi.mock("@/features/cv/actions", () => ({ createCv, addRevision }));
vi.mock("@/features/auth/queries", () => ({
  getCurrentUserId: async () => "user-1",
}));
vi.mock("next/navigation", () => ({ redirect }));

const { importCvAction } = await import("./actions");

const profile =
  "Aminata Diallo\naminata@example.fr\nwww.linkedin.com/in/aminata-d\nExperience\n" +
  "Data analyst at Acme, 2021 to 2024. ".repeat(10);

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};

const paste = form({
  locale: "fr-fr",
  source: "linkedin",
  mode: "paste",
  text: profile,
});

const answer = {
  language: "en",
  basics: {
    name: "Aminata Diallo",
    headline: null,
    city: null,
    region: null,
    countryCode: null,
    summary: null,
  },
  work: [
    {
      position: "Data analyst",
      company: "Acme",
      location: null,
      startDate: "2021",
      endDate: "2024",
      summary: null,
      highlights: [],
    },
  ],
  education: [],
  skills: [],
  languages: [],
  certificates: [],
  projects: [],
  volunteer: [],
  unread: [],
};

beforeEach(() => {
  runTask.mockReset();
  createCv.mockReset();
  addRevision.mockReset();
});

describe("importCvAction (spec 31)", () => {
  it("creates one CV, records an import revision and opens it", async () => {
    runTask.mockResolvedValue({ ok: true, data: answer });
    createCv.mockResolvedValue({ ok: true, value: { id: "cv-1" } });
    addRevision.mockResolvedValue({ ok: true, value: { id: "r-1" } });

    await expect(importCvAction({ error: null }, paste)).rejects.toThrow(
      "redirect:/fr-fr/cvs/cv-1",
    );
    expect(createCv).toHaveBeenCalledOnce();
    const [meta, content] = createCv.mock.calls[0]!;
    expect(meta).toMatchObject({ language: "en", market: "US" });
    expect(content.basics.email).toBe("aminata@example.fr");
    expect(content.imported).toHaveLength(2);
    expect(content.basics.links[0].url).toBe(
      "https://www.linkedin.com/in/aminata-d",
    );
    expect(addRevision).toHaveBeenCalledWith(
      { kind: "cv", id: "cv-1" },
      { source: "import", note: "Import LinkedIn" },
    );
  });

  it("sends the profile text, which runTask strips of contact details", async () => {
    // runTask redacts every input (spec 26); this checks the action sends the
    // text as is to it, and that the real redaction removes what matters.
    runTask.mockResolvedValue({ ok: false, reason: "failed" });
    await importCvAction({ error: null }, paste);
    const sent = runTask.mock.calls[0]![1].text as string;
    const { stripContactDetails } = await import("@/lib/ai/redact");
    const clean = stripContactDetails(sent);
    expect(clean).not.toContain("aminata@example.fr");
    expect(clean).not.toContain("linkedin.com/in");
  });

  it("returns failed when the output fails its schema", async () => {
    // runTask validates the output and reports a mismatch as "failed".
    runTask.mockResolvedValue({ ok: false, reason: "failed" });
    expect(await importCvAction({ error: null }, paste)).toEqual({
      error: "failed",
    });
    expect(createCv).not.toHaveBeenCalled();
  });

  it("writes nothing when the AI fails", async () => {
    runTask.mockResolvedValue({ ok: false, reason: "limit" });
    expect(await importCvAction({ error: null }, paste)).toEqual({
      error: "limit",
    });
    expect(createCv).not.toHaveBeenCalled();
  });

  it("writes nothing when nothing usable came back", async () => {
    runTask.mockResolvedValue({
      ok: true,
      data: { ...answer, basics: { ...answer.basics, name: null }, work: [] },
    });
    expect(await importCvAction({ error: null }, paste)).toEqual({
      error: "failed",
    });
    expect(createCv).not.toHaveBeenCalled();
  });

  it("refuses a short paste before calling the AI", async () => {
    const short = form({
      locale: "en-us",
      source: "linkedin",
      mode: "paste",
      text: "Hi",
    });
    expect(await importCvAction({ error: null }, short)).toEqual({
      error: "no_text",
    });
    expect(runTask).not.toHaveBeenCalled();
  });

  it("only reads a PDF for Upload a CV, even with text sent", async () => {
    const upload = form({
      locale: "en-us",
      source: "upload",
      mode: "paste",
      text: profile,
    });
    expect(await importCvAction({ error: null }, upload)).toEqual({
      error: "not_pdf",
    });
    expect(runTask).not.toHaveBeenCalled();
  });
});
