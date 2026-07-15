import { describe, expect, it } from "vitest";

import {
  isRoutableMoment,
  isRoutableProject,
  MINIMUM_PUBLISHED_MOMENTS_FOR_NARRATIVE,
  selectAdjacentWorkProjects,
  selectHomepage,
  selectMomentsNarrative,
  selectProjectBySlug,
  selectProjectParams,
  selectProjectSocialImage,
  selectPublishedMoments,
  selectPublishedProjects,
  selectRoutableMoments,
  selectRoutableProjects,
  selectSiteShell,
  selectWorkProjects,
} from "../../../src/content/queries";
import {
  cloneSeedBundle,
  makeMoment,
  makeReadyImage,
  projectBySlug,
} from "./fixtures";

function createVisibilityMatrix() {
  const content = cloneSeedBundle();
  content.projects.forEach((project) => {
    project.publication = "draft";
  });
  const publishedProject = projectBySlug(content, "fradium");
  const previewProject = projectBySlug(content, "nova-ai");
  const draftProject = projectBySlug(content, "paygate");
  const secondPreview = projectBySlug(content, "quorum");
  publishedProject.publication = "published";
  previewProject.publication = "preview";
  draftProject.publication = "draft";
  secondPreview.publication = "preview";

  const publishedMoment = makeMoment({
    id: "published-moment",
    publication: "published",
  });
  const previewMoment = makeMoment({
    id: "preview-moment",
    publication: "preview",
  });
  const draftMoment = makeMoment({
    id: "draft-moment",
    publication: "draft",
  });
  content.moments = [publishedMoment, previewMoment, draftMoment];

  return {
    content,
    publishedProject,
    previewProject,
    draftProject,
    secondPreview,
    publishedMoment,
    previewMoment,
    draftMoment,
  };
}

describe("public, preview, and draft route selectors", () => {
  it("exposes published records by default, preview only on opt-in, and never draft", () => {
    const matrix = createVisibilityMatrix();
    const {
      content,
      publishedProject,
      previewProject,
      draftProject,
      publishedMoment,
      previewMoment,
      draftMoment,
    } = matrix;

    expect(selectPublishedProjects(content)).toEqual([publishedProject]);
    expect(selectRoutableProjects(content)).toEqual([publishedProject]);
    expect(
      selectRoutableProjects(content, { includePreview: true }),
    ).toEqual([publishedProject, previewProject, matrix.secondPreview]);
    expect(selectPublishedMoments(content)).toEqual([publishedMoment]);
    expect(selectRoutableMoments(content)).toEqual([publishedMoment]);
    expect(
      selectRoutableMoments(content, { includePreview: true }),
    ).toEqual([publishedMoment, previewMoment]);

    expect(isRoutableProject(publishedProject)).toBe(true);
    expect(isRoutableProject(previewProject)).toBe(false);
    expect(
      isRoutableProject(previewProject, { includePreview: true }),
    ).toBe(true);
    expect(
      isRoutableProject(draftProject, { includePreview: true }),
    ).toBe(false);
    expect(isRoutableMoment(publishedMoment)).toBe(true);
    expect(isRoutableMoment(previewMoment)).toBe(false);
    expect(isRoutableMoment(previewMoment, { includePreview: true })).toBe(
      true,
    );
    expect(isRoutableMoment(draftMoment, { includePreview: true })).toBe(
      false,
    );
  });

  it("filters site-shell project links without making preview the default", () => {
    const { content, publishedProject, previewProject, draftProject } =
      createVisibilityMatrix();
    content.navigation.primary.push(
      {
        id: "published-shell-link",
        label: "Published",
        href: `/work/${publishedProject.slug}`,
        projectSlug: publishedProject.slug,
      },
      {
        id: "preview-shell-link",
        label: "Preview",
        href: `/work/${previewProject.slug}`,
        projectSlug: previewProject.slug,
      },
      {
        id: "draft-shell-link",
        label: "Draft",
        href: `/work/${draftProject.slug}`,
        projectSlug: draftProject.slug,
      },
    );

    expect(selectSiteShell(content).profile).toEqual(content.profile);
    expect(
      selectSiteShell(content).navigation.primary.map((item) => item.id),
    ).toEqual(expect.arrayContaining(["published-shell-link"]));
    expect(
      selectSiteShell(content).navigation.primary.map((item) => item.id),
    ).not.toEqual(expect.arrayContaining(["preview-shell-link"]));
    expect(
      selectSiteShell(content, { includePreview: true }).navigation.primary.map(
        (item) => item.id,
      ),
    ).toEqual(
      expect.arrayContaining(["published-shell-link", "preview-shell-link"]),
    );
    expect(
      selectSiteShell(content, { includePreview: true }).navigation.primary.map(
        (item) => item.id,
      ),
    ).not.toEqual(expect.arrayContaining(["draft-shell-link"]));
  });

  it("orders the work archive by update date and uses the slug as a tie-break", () => {
    const { content, publishedProject, previewProject, secondPreview } =
      createVisibilityMatrix();
    publishedProject.lastUpdatedAt = "2026-07-10";
    previewProject.lastUpdatedAt = "2026-07-11";
    secondPreview.lastUpdatedAt = "2026-07-11";

    expect(
      selectWorkProjects(content, { includePreview: true }).map(
        (project) => project.slug,
      ),
    ).toEqual([previewProject.slug, secondPreview.slug, publishedProject.slug]);
    expect(selectWorkProjects(content).map((project) => project.slug)).toEqual([
      publishedProject.slug,
    ]);
  });

  it("derives adjacent work only from the visible, deterministic archive", () => {
    const { content, publishedProject, previewProject, secondPreview } =
      createVisibilityMatrix();
    publishedProject.lastUpdatedAt = "2026-07-10";
    previewProject.lastUpdatedAt = "2026-07-11";
    secondPreview.lastUpdatedAt = "2026-07-09";

    expect(
      selectAdjacentWorkProjects(content, publishedProject.slug, {
        includePreview: true,
      }),
    ).toEqual({ previous: previewProject, next: secondPreview });
    expect(
      selectAdjacentWorkProjects(content, previewProject.slug),
    ).toBeUndefined();
    expect(
      selectAdjacentWorkProjects(content, "not-a-project", {
        includePreview: true,
      }),
    ).toBeUndefined();
  });

  it("gates on distinct normalized points while retaining every record in deterministic order", () => {
    const content = cloneSeedBundle();
    const first = makeMoment({ id: "first", publication: "published" });
    const duplicate = makeMoment({
      id: "same-event",
      publication: "published",
      event: "  TEST   EVENT ",
      place: " BANDUNG,   INDONESIA ",
    });
    const preview = makeMoment({ id: "preview", publication: "preview" });
    const second = makeMoment({
      id: "second",
      publication: "published",
      event: "A different event",
      date: "2026-07-12",
      place: "Jakarta, Indonesia",
    });

    expect(MINIMUM_PUBLISHED_MOMENTS_FOR_NARRATIVE).toBe(2);

    content.moments = [first, duplicate, preview];
    expect(selectMomentsNarrative(content)).toBeUndefined();

    content.moments.push(second);
    expect(selectMomentsNarrative(content)).toEqual([
      second,
      first,
      duplicate,
    ]);
  });

  it("allows explicitly visible preview moments to satisfy the preview route gate", () => {
    const content = cloneSeedBundle();
    const published = makeMoment({
      id: "published",
      publication: "published",
      date: "2026-07-10",
    });
    const preview = makeMoment({
      id: "preview",
      publication: "preview",
      event: "Preview event",
      date: "2026-07-12",
      place: "Jakarta, Indonesia",
    });
    content.moments = [published, preview];

    expect(selectMomentsNarrative(content)).toBeUndefined();
    expect(
      selectMomentsNarrative(content, { includePreview: true }),
    ).toEqual([preview, published]);
  });

  it("applies the same visibility rule to slug lookup and static params", () => {
    const { content, publishedProject, previewProject, draftProject } =
      createVisibilityMatrix();

    expect(selectProjectBySlug(content, publishedProject.slug)).toBe(
      publishedProject,
    );
    expect(selectProjectBySlug(content, previewProject.slug)).toBeUndefined();
    expect(
      selectProjectBySlug(content, previewProject.slug, {
        includePreview: true,
      }),
    ).toBe(previewProject);
    expect(
      selectProjectBySlug(content, draftProject.slug, {
        includePreview: true,
      }),
    ).toBeUndefined();
    expect(selectProjectParams(content)).toEqual([
      { slug: publishedProject.slug },
    ]);
    expect(selectProjectParams(content, { includePreview: true })).toEqual(
      content.projects
        .filter((project) => project.publication !== "draft")
        .map((project) => ({ slug: project.slug })),
    );
  });

  it("preserves homepage order while filtering projects, moments, navigation, and building items", () => {
    const { content, publishedProject, previewProject, draftProject } =
      createVisibilityMatrix();
    content.homepage.featuredMomentIds = [
      "published-moment",
      "preview-moment",
      "draft-moment",
    ];
    content.navigation.primary.push(
      {
        id: "published-project-link",
        label: "Published project",
        href: `/work/${publishedProject.slug}`,
        projectSlug: publishedProject.slug,
      },
      {
        id: "preview-project-link",
        label: "Preview project",
        href: `/work/${previewProject.slug}`,
        projectSlug: previewProject.slug,
      },
      {
        id: "draft-project-link",
        label: "Draft project",
        href: `/work/${draftProject.slug}`,
        projectSlug: draftProject.slug,
      },
    );
    content.currentlyBuilding.items[0].projectSlug = previewProject.slug;

    const publicHomepage = selectHomepage(content, { asOf: "2026-07-11" });
    const previewHomepage = selectHomepage(content, {
      includePreview: true,
      asOf: "2026-07-11",
    });

    expect(publicHomepage.projects.map((project) => project.slug)).toEqual([
      publishedProject.slug,
    ]);
    expect(previewHomepage.projects.map((project) => project.slug)).toEqual([
      publishedProject.slug,
      previewProject.slug,
      "quorum",
    ]);
    expect(
      publicHomepage.projectStages.map(({ stage, artifacts }) => ({
        slug: stage.projectSlug,
        artifacts: artifacts.map((asset) => asset.id),
      })),
    ).toEqual([
      {
        slug: publishedProject.slug,
        artifacts: [
          "fradium-atlas-wallet-result",
          "fradium-atlas-send-verdict",
        ],
      },
    ]);
    expect(publicHomepage.research).toEqual(content.research);
    expect(
      publicHomepage.flagshipHighlightClaims.map(({ projectSlug, claim }) => [
        projectSlug,
        claim.id,
      ]),
    ).toEqual([[publishedProject.slug, "fradium-wchl-2025"]]);
    expect(
      previewHomepage.flagshipHighlightClaims.map(
        ({ projectSlug, claim }) => [projectSlug, claim.id],
      ),
    ).toEqual([
      [publishedProject.slug, "fradium-wchl-2025"],
      [previewProject.slug, "nova-lisk-recognition"],
      ["quorum", "quorum-six-testnet-flows"],
    ]);
    expect(publicHomepage.moments.map((moment) => moment.id)).toEqual([
      "published-moment",
    ]);
    expect(previewHomepage.moments.map((moment) => moment.id)).toEqual([
      "published-moment",
      "preview-moment",
    ]);
    expect(publicHomepage.currentlyBuilding).toEqual([]);
    expect(previewHomepage.currentlyBuilding).toHaveLength(1);
    expect(
      publicHomepage.navigation.primary.map((item) => item.id),
    ).not.toContain("preview-project-link");
    expect(
      previewHomepage.navigation.primary.map((item) => item.id),
    ).toEqual(
      expect.arrayContaining([
        "published-project-link",
        "preview-project-link",
      ]),
    );
    expect(
      previewHomepage.navigation.primary.map((item) => item.id),
    ).not.toContain("draft-project-link");
  });

  it("removes expired currently-building signals with an explicit clock", () => {
    const { content, previewProject } = createVisibilityMatrix();
    content.currentlyBuilding.items[0].projectSlug = previewProject.slug;
    content.currentlyBuilding.items[0].expiresAt = "2026-07-10";

    expect(
      selectHomepage(content, {
        includePreview: true,
        asOf: "2026-07-11",
      }).currentlyBuilding,
    ).toEqual([]);
    expect(
      selectHomepage(content, {
        includePreview: true,
        asOf: "2026-07-10",
      }).currentlyBuilding,
    ).toHaveLength(1);
  });
});

describe("project social image selector", () => {
  it("resolves only the explicitly designated ready raster asset", () => {
    const content = cloneSeedBundle();
    const project = projectBySlug(content, "fradium");
    const first = makeReadyImage({ id: "first-ready-image" });
    const designated = makeReadyImage({ id: "designated-social-image" });
    project.evidence = [first, designated];
    project.socialImageAssetId = designated.id;

    expect(selectProjectSocialImage(project)).toBe(designated);

    designated.mediaKind = "svg";
    expect(selectProjectSocialImage(project)).toBeUndefined();

    project.socialImageAssetId = first.id;
    expect(selectProjectSocialImage(project)).toBe(first);
  });
});
