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
  it("requires both caller intent and the preview environment for unpublished archive records", () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;
    expect(getProjectBySlug("agentpay", { preview: true })).toBeUndefined();
    expect(getProjectBySlug("fradium")?.slug).toBe("fradium");

    process.env.PORTFOLIO_V1_PREVIEW = "1";
    expect(getProjectBySlug("agentpay")).toBeUndefined();
    expect(getProjectBySlug("agentpay", { preview: false })).toBeUndefined();
    expect(getProjectBySlug("agentpay", { preview: true })?.slug).toBe(
      "agentpay",
    );
  });

  it("does not make unknown records routable when preview is enabled", () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";

    expect(
      getProjectBySlug("not-a-project", { preview: true }),
    ).toBeUndefined();
  });

  it("keeps published work public and adds preview work only when both preview gates pass", () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;

    expect(getSiteShell({ preview: true }).profile.name).toBe(
      "Wildan Syukri Niam",
    );
    expect(getWorkProjectSummaries({ preview: true }).map((project) => project.slug)).toEqual([
      "quorum", "paygate", "nova-ai", "fradium",
    ]);

    process.env.PORTFOLIO_V1_PREVIEW = "1";
    expect(getWorkProjectSummaries().map((project) => project.slug)).toEqual([
      "quorum", "paygate", "nova-ai", "fradium",
    ]);
    expect(getWorkProjectSummaries({ preview: false }).map((project) => project.slug)).toEqual([
      "quorum", "paygate", "nova-ai", "fradium",
    ]);
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

  it("applies the same preview gate to adjacent preview work summaries", () => {
    process.env.PORTFOLIO_V1_PREVIEW = "1";

    expect(
      getAdjacentWorkProjectSummaries("agentpay", { preview: false }),
    ).toBeUndefined();
    expect(
      getAdjacentWorkProjectSummaries("agentpay", { preview: true }),
    ).toMatchObject({ next: { slug: "fradium" } });
  });

  it("exposes published moments without a preview environment", () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;
    expect(getMomentsNarrative()?.length).toBeGreaterThanOrEqual(5);
  });

  it("keeps the published moments narrative stable when preview is requested", () => {
    delete process.env.PORTFOLIO_V1_PREVIEW;
    expect(getMomentsNarrative({ preview: true })?.length).toBeGreaterThanOrEqual(5);

    process.env.PORTFOLIO_V1_PREVIEW = "1";
    expect(getMomentsNarrative({ preview: false })?.length).toBeGreaterThanOrEqual(5);
  });
});
