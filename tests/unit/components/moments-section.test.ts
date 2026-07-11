import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MomentContactSheet } from "../../../src/components/v1/moments/moment-contact-sheet";
import { MomentsSection } from "../../../src/components/v1/moments/moments-section";
import type { MomentRecord } from "../../../src/content/types";
import {
  makeMoment,
  makePlannedAsset,
  makeReadyImage,
} from "../content/fixtures";

function occurrenceCount(value: string, search: string): number {
  return value.split(search).length - 1;
}

function moment(
  mode: MomentRecord["mode"],
  overrides: Partial<MomentRecord> = {},
): MomentRecord {
  return makeMoment({
    id: `moment-${mode}`,
    mode,
    ...overrides,
  });
}

function documentaryAsset(id: string, caption = `Documentary frame ${id}`) {
  return makeReadyImage({
    id,
    alt: `Documentary alt ${id}`,
    caption,
    provenance: {
      kind: "documentary-photo",
      source: `owner-supplied/${id}.heic`,
      credit: "Wildan Syukri Niam",
      rights: "owned",
      consent: "confirmed",
      capturedAt: "2026-01-31",
    },
    src: `/media/moments/${id}.webp`,
  });
}

describe("server-rendered moments section", () => {
  it("renders all four authored modes with documentary metadata outside the media", () => {
    const moments = (["lead", "portrait", "evidence", "contact-sheet"] as const).map(
      (mode) =>
        moment(mode, {
          assets: [documentaryAsset(`${mode}-frame`)],
          caption: `Documentary frame ${mode}-frame`,
          context:
            mode === "lead"
              ? { kind: "project", projectSlugs: ["fradium"] }
              : { kind: "journey", label: "Learning in public" },
          event: `${mode} event`,
          place: "Bandung, Indonesia",
          reflection: `Reflection for ${mode}`,
          result: `Outcome for ${mode}`,
          title: `${mode} documentary moment`,
        }),
    );
    const markup = renderToStaticMarkup(
      createElement(MomentsSection, {
        archiveHref: "/moments",
        heading: "Build moments",
        intro: "A documentary sequence.",
        moments,
      }),
    );

    expect(markup).toContain('data-moments-section="archive"');
    for (const mode of ["lead", "portrait", "evidence", "contact-sheet"]) {
      expect(markup).toContain(`data-mode="${mode}"`);
      expect(markup).toContain(`${mode} documentary moment`);
      expect(markup).toContain(`Reflection for ${mode}`);
      expect(markup).toContain(`Outcome for ${mode}`);
    }
    expect(markup).toContain('<time dateTime="2026-07-11">11 July 2026</time>');
    expect(markup).toContain("Fradium");
    expect(markup).toContain("Learning in public");
    expect(markup).toContain("Photo credit / Wildan Syukri Niam");
    expect(markup).toContain(
      "<span>Outcome</span><span>Outcome for lead</span>",
    );
    expect(markup).toContain('href="/moments"');
    expect(markup).toContain("View all moments");
    expect(occurrenceCount(markup, "<figure")).toBe(4);
    expect(markup).not.toContain("placeholder");
  });

  it("uses multiple assets only for contact sheets and excludes unready records", () => {
    const first = documentaryAsset("first-frame");
    const second = documentaryAsset("second-frame");
    const vector = makeReadyImage({
      ...documentaryAsset("vector-frame"),
      mediaKind: "svg",
      src: "/media/moments/vector-frame.svg",
    });
    const planned = makePlannedAsset({
      id: "private-master",
      status: "private",
      acquisitionNotes: "Must not be rendered.",
    });

    const leadMarkup = renderToStaticMarkup(
      createElement(MomentContactSheet, {
        moment: moment("lead", { assets: [first, vector, second, planned] }),
      }),
    );
    expect(leadMarkup).toContain("first-frame.webp");
    expect(leadMarkup).not.toContain("second-frame.webp");
    expect(leadMarkup).not.toContain("vector-frame.svg");
    expect(leadMarkup).not.toContain("private-master");
    expect(occurrenceCount(leadMarkup, "<figure")).toBe(1);

    const sheetMarkup = renderToStaticMarkup(
      createElement(MomentContactSheet, {
        moment: moment("contact-sheet", {
          assets: [first, vector, second, planned],
        }),
        priorityFirstAsset: true,
      }),
    );
    expect(sheetMarkup).toContain('data-asset-count="2"');
    expect(sheetMarkup).toContain("first-frame.webp");
    expect(sheetMarkup).toContain("second-frame.webp");
    expect(sheetMarkup).not.toContain("private-master");
    expect(sheetMarkup).not.toContain("vector-frame.svg");
    expect(occurrenceCount(sheetMarkup, 'loading="eager"')).toBe(1);
    expect(occurrenceCount(sheetMarkup, 'loading="lazy"')).toBe(1);
    expect(sheetMarkup).toContain('media="(max-width: 639px)"');
  });

  it("keeps text but emits no empty media frame when a moment has no ready asset", () => {
    const markup = renderToStaticMarkup(
      createElement(MomentsSection, {
        heading: "Build moments",
        intro: "A documentary sequence.",
        moments: [
          moment("evidence", {
            assets: [makePlannedAsset({ id: "capture-pending" })],
            title: "A truthful text-only preview",
          }),
        ],
      }),
    );

    expect(markup).toContain("A truthful text-only preview");
    expect(markup).not.toContain("opg-moment-story__media");
    expect(markup).not.toContain("opg-evidence-figure");
    expect(markup).not.toContain("capture-pending");
    expect(markup).not.toContain("Coming soon");
  });

  it("withholds text-only records from the visual homepage sequence", () => {
    const markup = renderToStaticMarkup(
      createElement(MomentsSection, {
        heading: "Build moments",
        intro: "Selected records.",
        moments: [
          moment("lead", {
            assets: [makePlannedAsset({ id: "homepage-capture-pending" })],
          }),
        ],
        variant: "home",
      }),
    );

    expect(markup).toBe("");
  });

  it("keeps the homepage concise while the archive retains reflection copy", () => {
    const fixture = moment("portrait", {
      assets: [documentaryAsset("portrait-frame")],
      reflection: "A longer reflection reserved for the documentary archive.",
    });
    const homeMarkup = renderToStaticMarkup(
      createElement(MomentsSection, {
        heading: "Build moments",
        intro: "Selected records.",
        moments: [fixture],
        variant: "home",
      }),
    );
    const archiveMarkup = renderToStaticMarkup(
      createElement(MomentsSection, {
        heading: "Inside the build",
        intro: "The full sequence.",
        moments: [fixture],
      }),
    );

    expect(homeMarkup).toContain('data-moments-section="home"');
    expect(homeMarkup).not.toContain("A longer reflection");
    expect(archiveMarkup).toContain("A longer reflection");
  });

  it("preserves an evidence asset's authored aspect and focal crop", () => {
    const asset = documentaryAsset("portrait-evidence");
    asset.crop = {
      mode: "focal",
      aspectRatio: "3:4",
      focalPoint: { x: 0.48, y: 0.57 },
    };

    const markup = renderToStaticMarkup(
      createElement(MomentContactSheet, {
        moment: moment("evidence", { assets: [asset] }),
      }),
    );

    expect(markup).toContain('data-ratio="intrinsic"');
    expect(markup).toContain('--opg-evidence-aspect:3 / 4');
    expect(markup).toContain('--opg-evidence-position:48% 57%');
    expect(markup).toContain('data-crop="focal"');
  });

  it("keeps the moments implementation server-only and free of animation runtimes", () => {
    const componentPaths = [
      "../../../src/components/v1/moments/moment-caption.tsx",
      "../../../src/components/v1/moments/moment-contact-sheet.tsx",
      "../../../src/components/v1/moments/moment-figure.tsx",
      "../../../src/components/v1/moments/moments-archive.tsx",
      "../../../src/components/v1/moments/moments-section.tsx",
    ];

    for (const path of componentPaths) {
      const source = readFileSync(
        fileURLToPath(new URL(path, import.meta.url)),
        "utf8",
      );
      expect(source).not.toMatch(/^\s*["']use client["'];?/m);
      expect(source).not.toMatch(/from\s+["'](?:@gsap\/react|gsap|motion|framer-motion)/);
    }
  });
});
