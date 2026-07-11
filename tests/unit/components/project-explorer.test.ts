import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectExplorer } from "../../../src/components/v1/explorer/project-explorer";
import {
  toProjectExplorerDto,
  type ExplorerProjectDto,
} from "../../../src/content/explorer-dto";
import {
  cloneSeedBundle,
  makeReadyImage,
  makeReadyVideo,
  projectBySlug,
} from "../content/fixtures";

const flagshipSlugs = ["fradium", "nova-ai", "paygate", "quorum"] as const;

function makeExplorerProjects(): ExplorerProjectDto[] {
  const content = cloneSeedBundle();
  const projects = flagshipSlugs.map((slug) => projectBySlug(content, slug));
  projects[0].evidence.push(
    makeReadyImage({
      id: "fradium-ready-frame",
      src: "/media/projects/fradium/public-beta.webp",
      mobile: {
        src: "/media/projects/fradium/public-beta-mobile.webp",
        width: 800,
        height: 1000,
        crop: {
          mode: "focal",
          aspectRatio: "4:5",
          focalPoint: { x: 0.5, y: 0.5 },
        },
      },
    }),
  );

  return projects.map((project) =>
    toProjectExplorerDto(
      project,
      project.claims[0],
      `/preview/open-proving-ground/content/${project.slug}`,
    ),
  );
}

function occurrenceCount(value: string, search: string): number {
  return value.split(search).length - 1;
}

describe("static project explorer markup", () => {
  it("keeps four anchors beside native GET preview controls and a stable panel", () => {
    const projects = makeExplorerProjects();
    const markup = renderToStaticMarkup(
      createElement(ProjectExplorer, {
        formAction: "/preview/open-proving-ground/site#test-work-explorer-panel",
        id: "test-work-explorer",
        projects,
      }),
    );

    expect(
      occurrenceCount(markup, 'class="opg-project-explorer__project-link"'),
    ).toBe(4);
    expect(
      occurrenceCount(markup, 'class="opg-project-explorer__preview-button"'),
    ).toBe(4);
    expect(occurrenceCount(markup, " disabled=\"\"")).toBe(0);
    for (const project of projects) {
      expect(markup).toContain(
        `aria-controls="test-work-explorer-panel-${project.slug}"`,
      );
      expect(markup).toContain(
        `formAction="/preview/open-proving-ground/site#test-work-explorer-panel-${project.slug}"`,
      );
    }
    expect(occurrenceCount(markup, 'aria-pressed="true"')).toBe(1);
    expect(occurrenceCount(markup, 'aria-pressed="false"')).toBe(3);
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Project evidence previews"');
    expect(markup).toContain('method="get"');
    expect(occurrenceCount(markup, 'name="project"')).toBe(4);
    expect(markup).toContain('id="test-work-explorer-panel"');
    expect(occurrenceCount(markup, " data-explorer-panel=\"true\"")).toBe(4);
    expect(occurrenceCount(markup, " hidden=\"\"")).toBe(3);
    expect(markup).toMatch(
      /class="opg-project-explorer__project-link"[^>]*>Fradium<\/a><button/,
    );

    for (const project of projects) {
      expect(markup).toContain(`href="${project.href}"`);
      expect(markup).toContain(`Preview evidence for ${project.title}`);
    }
  });

  it("renders ready evidence for SSR/no-JS without fabricating empty media frames", () => {
    const projects = makeExplorerProjects();
    const nova = projects.find((project) => project.slug === "nova-ai");
    expect(nova).toBeDefined();
    if (!nova) return;
    nova.media = [
      {
        ...projects[0].media[0],
        id: "nova-ready-frame",
        src: "/media/projects/nova/ready.webp",
        mobile: undefined,
        caption: "An approved Nova product frame.",
      },
    ];

    const markup = renderToStaticMarkup(
      createElement(ProjectExplorer, {
        formAction: "/preview/open-proving-ground/site#test-ready-explorer-panel",
        id: "test-ready-explorer",
        projects,
      }),
    );

    expect(markup).toContain("/media/projects/fradium/public-beta.webp");
    expect(markup).toContain("/media/projects/nova/ready.webp");
    expect(markup).toMatch(
      /data-project-slug="nova-ai" data-project-title="Nova AI Wallet" hidden=""/,
    );

    const novaMarkup = renderToStaticMarkup(
      createElement(ProjectExplorer, {
        defaultSlug: "nova-ai",
        formAction: "/preview/open-proving-ground/site#test-ready-explorer-panel",
        id: "test-ready-explorer",
        projects,
      }),
    );
    expect(novaMarkup).toContain("/media/projects/nova/ready.webp");
    expect(novaMarkup).toMatch(
      /data-project-slug="fradium" data-project-title="Fradium" hidden=""/,
    );
    expect(novaMarkup).toMatch(
      /data-project-slug="nova-ai" data-project-title="Nova AI Wallet" id=/,
    );
    expect(markup).not.toContain("01 / 04");
    expect(markup).not.toContain("·");

    const projectsWithoutMedia = projects.map((project) => ({
      ...project,
      media: [],
    }));
    const emptyMarkup = renderToStaticMarkup(
      createElement(ProjectExplorer, {
        formAction: "/preview/open-proving-ground/site#test-empty-explorer-panel",
        id: "test-empty-explorer",
        projects: projectsWithoutMedia,
      }),
    );

    expect(emptyMarkup).not.toContain("opg-evidence-contact-sheet");
    expect(emptyMarkup).not.toContain("placeholder");
    expect(emptyMarkup).not.toContain("Coming soon");
  });

  it("keeps SVG diagrams inspectable and honors explicit-intent video loading", () => {
    const projects = makeExplorerProjects();
    const fixtureProject = projectBySlug(cloneSeedBundle(), "fradium");
    const fixtureClaim = fixtureProject.claims[0];
    if (!fixtureClaim) throw new Error("Fradium fixture must have a claim.");

    fixtureProject.evidence = [
      makeReadyImage({
        id: "inspectable-system-map",
        mediaKind: "svg",
        src: "/media/projects/fradium/system-map.svg",
        alt: "Fradium system map",
        mobile: undefined,
      }),
      makeReadyVideo({
        id: "intentional-demo",
        controls: "explicit-intent",
      }),
    ];
    const media = toProjectExplorerDto(
      fixtureProject,
      fixtureClaim,
      "/preview/open-proving-ground/content/fradium",
    ).media;
    projects[0].media.push(...media);

    const markup = renderToStaticMarkup(
      createElement(ProjectExplorer, {
        formAction: "/preview/open-proving-ground/site#inspectable-explorer-panel",
        id: "inspectable-explorer",
        projects,
      }),
    );

    expect(markup).toContain("Scroll horizontally to inspect the full diagram.");
    expect(markup).toContain('aria-label="Fradium system map - scrollable diagram"');
    expect(markup).toContain('role="region"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain("Open full diagram");
    expect(markup).toContain('preload="none"');
  });
});
