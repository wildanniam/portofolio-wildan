import { describe, expect, it } from "vitest";

import {
  isRoutableMoment,
  isRoutableProject,
  selectHomepage,
  selectProjectBySlug,
  selectProjectParams,
  selectPublishedMoments,
  selectPublishedProjects,
  selectRoutableMoments,
  selectRoutableProjects,
} from "../../../src/content/queries";
import { cloneSeedBundle, makeMoment, projectBySlug } from "./fixtures";

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
