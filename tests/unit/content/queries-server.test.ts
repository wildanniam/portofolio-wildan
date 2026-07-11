import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getProjectBySlug } from "../../../src/content/queries.server";

const originalPreviewEnvironment = process.env.PORTFOLIO_V1_PREVIEW;

afterEach(() => {
  if (originalPreviewEnvironment === undefined) {
    delete process.env.PORTFOLIO_V1_PREVIEW;
  } else {
    process.env.PORTFOLIO_V1_PREVIEW = originalPreviewEnvironment;
  }
});

describe("server preview query gate", () => {
  it("requires both caller intent and the preview environment", () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;
    expect(getProjectBySlug("fradium", { preview: true })).toBeUndefined();

    process.env.PORTFOLIO_V1_PREVIEW = "1";
    expect(getProjectBySlug("fradium")).toBeUndefined();
    expect(getProjectBySlug("fradium", { preview: false })).toBeUndefined();
    expect(getProjectBySlug("fradium", { preview: true })?.slug).toBe(
      "fradium",
    );
  });

  it("does not make unknown records routable when preview is enabled", () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";

    expect(
      getProjectBySlug("not-a-project", { preview: true }),
    ).toBeUndefined();
  });
});
