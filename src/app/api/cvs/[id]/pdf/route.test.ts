import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CvError } from "@/features/cv/logic";

const getCvDocument = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/features/cv/queries", () => ({
  getCvDocument: (...args: unknown[]) => getCvDocument(...args),
}));

const { GET } = await import("./route");

const UUID = "00000000-0000-4000-8000-000000000001";
const call = (id: string) =>
  GET(new Request(`http://localhost/api/cvs/${id}/pdf`), {
    params: Promise.resolve({ id }),
  });
const failWith = (code: CvError["code"]) =>
  getCvDocument.mockResolvedValue({ ok: false, error: { code } });

describe("GET /api/cvs/[id]/pdf (spec 25)", () => {
  beforeEach(() => getCvDocument.mockReset());

  it("is 404 for an id that can't be a CV, without reading", async () => {
    const response = await call("not-a-uuid");
    expect(response.status).toBe(404);
    expect(getCvDocument).not.toHaveBeenCalled();
  });

  it("is 401 when signed out", async () => {
    failWith("unauthenticated");
    expect((await call(UUID)).status).toBe(401);
  });

  it("is 404 for another user's or a missing CV (RLS)", async () => {
    failWith("not_found");
    const response = await call(UUID);
    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("is 500 for other failures", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    failWith("database");
    expect((await call(UUID)).status).toBe(500);
  });
});
