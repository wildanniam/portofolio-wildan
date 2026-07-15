import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArtifactFragment } from "../../../src/components/portfolio/media/artifact-fragment";
import { ProjectLogo } from "../../../src/components/portfolio/media/project-logo";
import { ResponsiveMedia } from "../../../src/components/portfolio/media/responsive-media";
import { loadContentBundle } from "../../../src/content/repository.node";
import type { ProjectBrandAsset } from "../../../src/content/types";
import {
  makeReadyImage,
  projectBySlug,
  REPOSITORY_ROOT,
} from "../content/fixtures";

describe("Portfolio V4 media primitives", () => {
  it("keeps responsive product media intrinsic, contain-safe, and dimensionally stable", () => {
    const asset = makeReadyImage();
    const markup = renderToStaticMarkup(
      createElement(ResponsiveMedia, {
        asset,
        sizes: "(max-width: 639px) 100vw, 60vw",
      }),
    );

    expect(markup).toContain("<picture");
    expect(markup).toContain('data-fit="contain"');
    expect(markup).toContain('media="(max-width: 639px)"');
    expect(markup).toContain(`srcSet="${asset.mobile?.src}"`);
    expect(markup).toContain(`width="${asset.width}"`);
    expect(markup).toContain(`height="${asset.height}"`);
    expect(markup).toContain(`alt="${asset.alt}"`);
    expect(markup).toContain("--portfolio-media-ratio:1600 / 1000");
    expect(markup).toContain("--portfolio-media-ratio-mobile:3 / 4");
    expect(markup).not.toContain("object-position:var(--portfolio-media-position)");
    expect(markup).not.toContain("position:absolute");
  });

  it("exposes a focal, ratio-aware cover contract without absolute positioning", () => {
    const asset = makeReadyImage({
      crop: {
        mode: "focal",
        aspectRatio: "4:5",
        focalPoint: { x: 0.6, y: 0.35 },
      },
    });
    const markup = renderToStaticMarkup(
      createElement(ResponsiveMedia, {
        asset,
        fit: "cover",
        priority: true,
        sizes: "100vw",
      }),
    );

    expect(markup).toContain('data-fit="cover"');
    expect(markup).toContain("--portfolio-media-ratio:4 / 5");
    expect(markup).toContain("--portfolio-media-position:60% 35%");
    expect(markup).not.toContain('loading="lazy"');
    expect(markup).not.toContain("position:absolute");
  });

  it("derives decorative and informative logo semantics from the brand contract", () => {
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const branding = projectBySlug(content, "fradium").branding;
    expect(branding).toBeDefined();
    if (!branding) return;

    const decorativeMarkup = renderToStaticMarkup(
      createElement(ProjectLogo, { asset: branding.mark, surface: "light" }),
    );
    expect(decorativeMarkup).toContain('alt=""');
    expect(decorativeMarkup).toContain('aria-hidden="true"');
    expect(decorativeMarkup).toContain(`width="${branding.mark.width}"`);
    expect(decorativeMarkup).toContain(`height="${branding.mark.height}"`);
    expect(decorativeMarkup).toContain("max-width:100%");

    const informativeAsset: ProjectBrandAsset = {
      ...branding.mark,
      accessibility: { mode: "informative", label: "Fradium project logo" },
    };
    const informativeMarkup = renderToStaticMarkup(
      createElement(ProjectLogo, { asset: informativeAsset }),
    );
    expect(informativeMarkup).toContain('alt="Fradium project logo"');
    expect(informativeMarkup).not.toContain('aria-hidden="true"');
  });

  it("keeps artifact evidence semantic and preserves its mobile source and description", () => {
    const asset = makeReadyImage({
      longDescription: "The product frame shows an input, a verified state, and an output.",
    });
    const markup = renderToStaticMarkup(
      createElement(ArtifactFragment, {
        asset,
        sizes: "(max-width: 639px) 100vw, 50vw",
      }),
    );

    expect(markup).toContain("<figure");
    expect(markup).toContain(`data-artifact-id="${asset.id}"`);
    expect(markup).toContain(`data-evidence-type="${asset.evidenceType}"`);
    expect(markup).toContain(`srcSet="${asset.mobile?.src}"`);
    expect(markup).toContain(`alt="${asset.alt}"`);
    expect(markup).toContain(asset.caption);
    expect(markup).toContain("Detailed image description");
    expect(markup).toContain(asset.longDescription ?? "");
    expect(markup).toContain('data-fit="contain"');
  });
});
