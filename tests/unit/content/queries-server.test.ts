import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getAdjacentWorkProjectSummaries,
  getMomentsNarrative,
  getProjectBySlug,
  getSiteShell,
  getWorkProjectSummaries,
} from "../../../src/content/queries.server";

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

  it("keeps site and archive wrappers public unless both preview gates pass", () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;

    expect(getSiteShell({ preview: true }).profile.name).toBe(
      "Wildan Syukri Niam",
    );
    expect(getWorkProjectSummaries({ preview: true })).toEqual([]);

    process.env.PORTFOLIO_V1_PREVIEW = "1";
    expect(getWorkProjectSummaries()).toEqual([]);
    expect(getWorkProjectSummaries({ preview: false })).toEqual([]);
    expect(
      getWorkProjectSummaries({ preview: true }).map((project) => project.slug),
    ).toEqual([
      "quorum",
      "paygate",
      "crucible",
      "specheal",
      "nova-ai",
      "agentpay",
      "fradium",
    ]);
  });

  it("applies the same preview gate to adjacent work summaries", () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";

    expect(
      getAdjacentWorkProjectSummaries("quorum", { preview: false }),
    ).toBeUndefined();
    expect(
      getAdjacentWorkProjectSummaries("quorum", { preview: true }),
    ).toMatchObject({ next: { slug: "paygate" } });
  });

  it("does not let preview records satisfy the public moments gate", () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";
    expect(getMomentsNarrative()).toBeUndefined();
  });

  it("requires both preview gates before querying a preview moments narrative", () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;
    expect(getMomentsNarrative({ preview: true })).toBeUndefined();

    process.env.PORTFOLIO_V1_PREVIEW = "1";
    expect(getMomentsNarrative({ preview: false })).toBeUndefined();
  });
});
