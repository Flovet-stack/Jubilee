import { beforeEach, describe, expect, it, vi } from "vitest";

import { emptyCvContent } from "./logic";

/**
 * saveContent's version check (spec 14, decision 0024 §4), with a fake
 * Supabase client that keeps one row in memory. The real filter is
 * PostgREST's `eq`; here it's an equality on the stored values.
 */

type Row = { id: string; updated_at: string; content: unknown };
let row: Row | null;
let clock = 0;

function fakeClient() {
  return {
    from: () => ({
      update: (values: Partial<Row>) => {
        const filters: [keyof Row, string][] = [];
        const chain = {
          eq: (column: keyof Row, value: string) => {
            filters.push([column, value]);
            return chain;
          },
          select: () => ({
            maybeSingle: async () => {
              const match = row && filters.every(([c, v]) => row?.[c] === v);
              if (!row || !match) return { data: null, error: null };
              row = { ...row, ...values, updated_at: `t${++clock}` };
              return { data: { updated_at: row.updated_at }, error: null };
            },
          }),
        };
        return chain;
      },
      select: () => ({
        eq: (_column: string, id: string) => ({
          maybeSingle: async () => ({
            data: row && row.id === id ? { id } : null,
            error: null,
          }),
        }),
      }),
    }),
  };
}

vi.mock("server-only", () => ({}));
vi.mock("./queries", () => ({
  signedInClient: async () => fakeClient(),
  getCvDocument: vi.fn(),
  getRevisionContent: vi.fn(),
}));

const { saveContent } = await import("./actions");

const ID = "00000000-0000-4000-8000-000000000001";
const content = emptyCvContent(
  () => `00000000-0000-4000-8000-${String(++clock).padStart(12, "0")}`,
);

beforeEach(() => {
  row = { id: ID, updated_at: "t0", content: {} };
});

describe("saveContent version check (0024 §4)", () => {
  it("saves when the row is unchanged and returns the new version", async () => {
    const result = await saveContent({ kind: "cv", id: ID }, content, "t0");
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.updatedAt).toBe(row?.updated_at);
  });

  it("refuses a stale save as a conflict and leaves the row alone", async () => {
    const first = await saveContent({ kind: "cv", id: ID }, content, "t0");
    if (!first.ok) throw new Error("first save failed");
    const before = row;
    const stale = await saveContent({ kind: "cv", id: ID }, content, "t0");
    expect(stale).toEqual({ ok: false, error: { code: "conflict" } });
    expect(row).toBe(before);
  });

  it("says not found when the row is gone", async () => {
    row = null;
    const result = await saveContent({ kind: "cv", id: ID }, content, "t0");
    expect(result).toEqual({ ok: false, error: { code: "not_found" } });
  });
});
