import { cpSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentBundle } from "../../../src/content/repository.node";
import type {
  BriefProjectRecord,
  ContentBundle,
  ContentDiagnostic,
  MomentRecord,
  PlannedAsset,
  ProjectRecord,
  ReadyImageAsset,
  ReadyVideoAsset,
} from "../../../src/content/types";
import {
  ContentValidationError,
  validateContentBundle,
} from "../../../src/content/validate";

export const REPOSITORY_ROOT = fileURLToPath(
  new URL("../../../", import.meta.url),
);

export function cloneSeedBundle(): ContentBundle {
  const content = structuredClone(
    loadContentBundle({ repositoryRoot: REPOSITORY_ROOT }),
  );
  // Moment tests construct their own small visibility/publication matrices. Keep
  // that fixture deterministic even as the real editorial intake grows.
  content.moments = [];
  content.homepage.featuredMomentIds = [];
  return content;
}

export function projectBySlug(
  content: ContentBundle,
  slug: string,
): ProjectRecord {
  const project = content.projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Missing project fixture: ${slug}`);
  return project;
}

export function makeReadyImage(
  overrides: Partial<ReadyImageAsset> = {},
): ReadyImageAsset {
  return {
    id: "test-ready-image",
    status: "ready",
    slot: "test-product-frame",
    evidenceType: "product",
    evidenceFunctions: ["product-reality"],
    mediaKind: "image",
    src: "/media/tests/product-desktop.webp",
    width: 1600,
    height: 1000,
    crop: { mode: "intrinsic" },
    mobile: {
      src: "/media/tests/product-mobile.webp",
      width: 900,
      height: 1200,
      crop: {
        mode: "focal",
        aspectRatio: "3:4",
        focalPoint: { x: 0.5, y: 0.4 },
      },
    },
    caption: "A verified product state used by the content-system tests.",
    provenance: {
      kind: "owned",
      creator: "Wildan Syukri Niam",
      rightsNote: "Approved for this portfolio test fixture.",
    },
    alt: "A test product interface",
    ...overrides,
  };
}

export function makeReadyVideo(
  overrides: Partial<ReadyVideoAsset> = {},
): ReadyVideoAsset {
  return {
    id: "test-ready-video",
    status: "ready",
    slot: "test-verification-loop",
    evidenceType: "test-result",
    evidenceFunctions: ["verification"],
    mediaKind: "video",
    src: "/media/tests/verification-loop.mp4",
    width: 1600,
    height: 1000,
    crop: { mode: "intrinsic" },
    caption: "A short verification loop used by the content-system tests.",
    provenance: {
      kind: "owned",
      creator: "Wildan Syukri Niam",
      rightsNote: "Approved for this portfolio test fixture.",
    },
    poster: "/media/tests/verification-poster.webp",
    posterAlt: "Verification result before playback",
    transcriptOrSteps: ["Open the result.", "Inspect the verified state."],
    durationSeconds: 8,
    controls: "visible",
    ...overrides,
  };
}

export function makePlannedAsset(
  overrides: Partial<PlannedAsset> = {},
): PlannedAsset {
  return {
    id: "test-planned-image",
    status: "needs-capture",
    slot: "test-planned-product-frame",
    evidenceFunctions: ["product-reality"],
    intendedEvidenceType: "product",
    intendedMediaKind: "image",
    acquisitionNotes: "Capture approved public evidence for this test fixture.",
    ...overrides,
  };
}

export function makeMoment(
  overrides: Partial<MomentRecord> = {},
): MomentRecord {
  return {
    id: "test-moment",
    mode: "lead",
    title: "A documented builder moment",
    event: "Test event",
    date: "2026-07-11",
    place: "Bandung, Indonesia",
    context: { kind: "journey", label: "Learning in public" },
    caption: "A truthful moment fixture with an explicit publication state.",
    claims: [],
    claimIds: [],
    assets: [],
    publication: "preview",
    ...overrides,
  };
}

export function toBriefProject(
  project: ProjectRecord,
  overrides: Partial<BriefProjectRecord> = {},
): BriefProjectRecord {
  return {
    slug: project.slug,
    title: project.title,
    publication: project.publication,
    ...(project.socialImageAssetId
      ? { socialImageAssetId: project.socialImageAssetId }
      : {}),
    caseStudyState: "brief",
    lifecycle: project.lifecycle,
    origin: [...project.origin],
    validationKinds: [...project.validationKinds],
    startedAt: project.startedAt,
    ...(project.endedAt ? { endedAt: project.endedAt } : {}),
    lastUpdatedAt: project.lastUpdatedAt,
    lastVerifiedAt: project.lastVerifiedAt,
    oneLiner: project.oneLiner,
    role: structuredClone(project.role),
    ...(project.collaborators
      ? { collaborators: structuredClone(project.collaborators) }
      : {}),
    technologies: [...project.technologies],
    claims: structuredClone(project.claims),
    evidence: structuredClone(project.evidence),
    links: structuredClone(project.links),
    context: "A bounded project summary for the archive.",
    outcome: "The project reached the lifecycle stated in this record.",
    ...overrides,
  };
}

export function validationDiagnostics(
  input: unknown,
  filePresence: (repositoryPath: string) => boolean = () => true,
): ContentDiagnostic[] {
  try {
    validateContentBundle(input, filePresence);
  } catch (error) {
    if (error instanceof ContentValidationError) return error.diagnostics;
    throw error;
  }

  throw new Error("Expected content validation to fail.");
}

export function createTemporaryRepository(): {
  root: string;
  cleanup(): void;
} {
  const root = realpathSync(
    mkdtempSync(resolve(tmpdir(), "portfolio-content-test-")),
  );
  cpSync(resolve(REPOSITORY_ROOT, "content"), resolve(root, "content"), {
    recursive: true,
  });
  cpSync(
    resolve(REPOSITORY_ROOT, "public/media"),
    resolve(root, "public/media"),
    { recursive: true },
  );

  return {
    root,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
