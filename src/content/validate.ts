import type { ZodIssue } from "zod";

import { hasMinimumMomentNarrative } from "./moment-policy";
import { ContentBundleSchema } from "./schema";
import { toJsonSafe } from "./parse";
import type {
  ContentBundle,
  ContentDiagnostic,
  ContentValidationResult,
  FilePresenceAdapter,
  MediaAsset,
  MomentRecord,
  ProjectBrandAsset,
  ProjectRecord,
  VerifiedClaim,
} from "./types";

const THIRD_PARTY_CLAIM_KINDS = new Set<VerifiedClaim["kind"]>([
  "award",
  "grant",
  "metric",
  "partnership",
  "third-party-outcome",
]);

const REQUIRED_FULL_EVIDENCE_FUNCTIONS = [
  "product-reality",
  "system-reasoning",
  "verification",
] as const;

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function sortContentDiagnostics(diagnostics: readonly ContentDiagnostic[]): ContentDiagnostic[] {
  return [...diagnostics].sort(
    (left, right) =>
      compareText(left.path, right.path) ||
      compareText(left.code, right.code) ||
      compareText(left.severity, right.severity) ||
      compareText(left.message, right.message),
  );
}

export class ContentValidationError extends Error {
  readonly diagnostics: ContentDiagnostic[];

  constructor(diagnostics: readonly ContentDiagnostic[]) {
    const sorted = sortContentDiagnostics(diagnostics);
    super(
      `Content validation failed with ${sorted.filter((diagnostic) => diagnostic.severity === "error").length} error(s)`,
    );
    this.name = "ContentValidationError";
    this.diagnostics = sorted;
  }
}

function zodPath(issue: ZodIssue): string {
  if (issue.path.length === 0) return "$content";

  return issue.path.reduce<string>((path, segment) => {
    if (typeof segment === "number") return `${path}[${segment}]`;
    const key = String(segment);
    return /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
  }, "$content");
}

function zodDiagnostics(issues: readonly ZodIssue[]): ContentDiagnostic[] {
  return sortContentDiagnostics(
    issues.map((issue) => ({
      severity: "error" as const,
      code: `schema.${issue.code}`,
      path: zodPath(issue),
      message: issue.message,
    })),
  );
}

function addError(
  diagnostics: ContentDiagnostic[],
  code: string,
  path: string,
  message: string,
): void {
  diagnostics.push({ severity: "error", code, path, message });
}

function duplicateIndexes(values: readonly string[]): Map<string, number[]> {
  const indexesByValue = new Map<string, number[]>();
  values.forEach((value, index) => {
    const indexes = indexesByValue.get(value) ?? [];
    indexes.push(index);
    indexesByValue.set(value, indexes);
  });

  return new Map([...indexesByValue].filter(([, indexes]) => indexes.length > 1));
}

function reportDuplicates(
  diagnostics: ContentDiagnostic[],
  values: readonly string[],
  basePath: string,
  field: string,
  code: string,
  label: string,
): void {
  for (const [value, indexes] of duplicateIndexes(values)) {
    for (const index of indexes) {
      addError(diagnostics, code, `${basePath}[${index}].${field}`, `${label} "${value}" is duplicated`);
    }
  }
}

function toPartialDateBoundary(value: string, boundary: "start" | "end"): string {
  if (value.length === 4) return `${value}-${boundary === "start" ? "01-01" : "12-31"}`;
  if (value.length === 7) {
    if (boundary === "start") return `${value}-01`;
    const [year, month] = value.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return `${value}-${String(lastDay).padStart(2, "0")}`;
  }
  return value;
}

function isReadyAsset(asset: MediaAsset): asset is Extract<MediaAsset, { status: "ready" }> {
  return asset.status === "ready";
}

function projectBrandAssets(project: ProjectRecord): ProjectBrandAsset[] {
  if (!project.branding) return [];
  return [
    project.branding.mark,
    ...(project.branding.wordmark ? [project.branding.wordmark] : []),
  ];
}

function presenceCheck(adapter: FilePresenceAdapter, repositoryPath: string): boolean {
  if (typeof adapter === "function") return adapter(repositoryPath);
  if ("exists" in adapter) return adapter.exists(repositoryPath);
  return adapter.has(repositoryPath);
}

function checkFilePresence(
  diagnostics: ContentDiagnostic[],
  adapter: FilePresenceAdapter,
  repositoryPath: string,
  path: string,
  missingCode: string,
  label: string,
): void {
  try {
    if (!presenceCheck(adapter, repositoryPath)) {
      addError(
        diagnostics,
        missingCode,
        path,
        `${label} "${repositoryPath}" is missing`,
      );
    }
  } catch (error) {
    addError(
      diagnostics,
      "source.file-presence-failed",
      path,
      `Could not verify ${label.toLowerCase()} presence: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

function checkReferencedId(
  diagnostics: ContentDiagnostic[],
  id: string,
  ids: ReadonlySet<string>,
  path: string,
  code: string,
  label: string,
): void {
  if (!ids.has(id)) addError(diagnostics, code, path, `${label} "${id}" does not exist`);
}

type RecordIndexes = {
  allAssetIds: Set<string>;
  assetsById: Map<string, MediaAsset>;
  brandAssetIds: Set<string>;
  readyDocumentIds: Set<string>;
  allCollaboratorIds: Set<string>;
  projectSlugs: Set<string>;
  momentIds: Set<string>;
  currentlyBuildingIds: Set<string>;
};

function buildIndexes(content: ContentBundle): RecordIndexes {
  const assets = [
    ...content.projects.flatMap((project) => project.evidence),
    ...content.moments.flatMap((moment) => moment.assets),
  ];
  const brandAssets = content.projects.flatMap((project) =>
    project.branding
      ? [
          project.branding.mark,
          ...(project.branding.wordmark ? [project.branding.wordmark] : []),
        ]
      : [],
  );

  return {
    allAssetIds: new Set(assets.map((asset) => asset.id)),
    assetsById: new Map(assets.map((asset) => [asset.id, asset])),
    brandAssetIds: new Set(brandAssets.map((asset) => asset.id)),
    readyDocumentIds: new Set(
      assets
        .filter((asset) => isReadyAsset(asset) && asset.mediaKind === "document")
        .map((asset) => asset.id),
    ),
    allCollaboratorIds: new Set(
      content.projects.flatMap((project) => project.collaborators?.map((collaborator) => collaborator.id) ?? []),
    ),
    projectSlugs: new Set(content.projects.map((project) => project.slug)),
    momentIds: new Set(content.moments.map((moment) => moment.id)),
    currentlyBuildingIds: new Set(content.currentlyBuilding.items.map((item) => item.id)),
  };
}

function isIndependentOutcomeSource(
  source: VerifiedClaim["sources"][number],
  indexes: RecordIndexes,
): boolean {
  if (
    source.kind === "url" ||
    source.kind === "official-document" ||
    source.kind === "collaborator-confirmation"
  ) {
    return true;
  }

  if (source.kind !== "evidence") return false;
  const asset = indexes.assetsById.get(source.evidenceId);
  return (
    asset !== undefined &&
    isReadyAsset(asset) &&
    asset.provenance.kind !== "owned"
  );
}

function validateClaim(
  claim: VerifiedClaim,
  path: string,
  diagnostics: ContentDiagnostic[],
  indexes: RecordIndexes,
): void {
  if (
    THIRD_PARTY_CLAIM_KINDS.has(claim.kind) &&
    !claim.sources.some((source) =>
      isIndependentOutcomeSource(source, indexes),
    )
  ) {
    addError(
      diagnostics,
      "claim.third-party-source-required",
      `${path}.sources`,
      `A ${claim.kind} claim requires a URL, official document, collaborator confirmation, or ready non-owner evidence`,
    );
  }

  claim.sources.forEach((source, sourceIndex) => {
    const sourcePath = `${path}.sources[${sourceIndex}]`;
    if (source.kind === "evidence") {
      checkReferencedId(
        diagnostics,
        source.evidenceId,
        indexes.allAssetIds,
        `${sourcePath}.evidenceId`,
        "reference.claim-evidence",
        "Evidence",
      );
    }
    if (source.kind === "official-document") {
      checkReferencedId(
        diagnostics,
        source.documentId,
        indexes.readyDocumentIds,
        `${sourcePath}.documentId`,
        "reference.claim-document",
        "Ready document evidence",
      );
    }
    if (source.kind === "collaborator-confirmation") {
      checkReferencedId(
        diagnostics,
        source.collaboratorId,
        indexes.allCollaboratorIds,
        `${sourcePath}.collaboratorId`,
        "reference.claim-collaborator",
        "Collaborator",
      );
    }
  });
}

function validateAssetClaimReferences(
  assets: readonly MediaAsset[],
  localClaimIds: ReadonlySet<string>,
  path: string,
  diagnostics: ContentDiagnostic[],
): void {
  assets.forEach((asset, assetIndex) => {
    if (!isReadyAsset(asset)) return;
    asset.claimIds?.forEach((claimId, claimIndex) => {
      checkReferencedId(
        diagnostics,
        claimId,
        localClaimIds,
        `${path}[${assetIndex}].claimIds[${claimIndex}]`,
        "reference.asset-claim",
        "Local claim",
      );
    });
  });
}

function validateProjectReferences(
  project: ProjectRecord,
  projectIndex: number,
  diagnostics: ContentDiagnostic[],
  indexes: RecordIndexes,
): void {
  const path = `$content.projects[${projectIndex}]`;
  const localClaims = new Map(project.claims.map((claim) => [claim.id, claim]));
  const localClaimIds = new Set(localClaims.keys());
  const localEvidenceIds = new Set(project.evidence.map((asset) => asset.id));
  const localCollaboratorIds = new Set(project.collaborators?.map((collaborator) => collaborator.id) ?? []);

  reportDuplicates(
    diagnostics,
    project.claims.map((claim) => claim.id),
    `${path}.claims`,
    "id",
    "duplicate.project-claim-id",
    "Project claim ID",
  );
  reportDuplicates(
    diagnostics,
    project.evidence.map((asset) => asset.id),
    `${path}.evidence`,
    "id",
    "duplicate.project-evidence-id",
    "Project evidence ID",
  );
  const brandAssets = projectBrandAssets(project);
  if (
    project.branding?.wordmark &&
    project.branding.mark.id === project.branding.wordmark.id
  ) {
    addError(
      diagnostics,
      "duplicate.project-brand-asset-id",
      `${path}.branding.wordmark.id`,
      `Project brand asset ID "${project.branding.wordmark.id}" is duplicated`,
    );
  }
  if (project.branding && project.links.source.status === "public") {
    const sourceUrl = project.links.source.url;
    brandAssets.forEach((asset, assetIndex) => {
      if (asset.provenance.sourceRepository !== sourceUrl) {
        addError(
          diagnostics,
          "reference.brand-source-repository",
          `${path}.branding.${assetIndex === 0 ? "mark" : "wordmark"}.provenance.sourceRepository`,
          `Brand source repository must match the project's public source URL "${sourceUrl}"`,
        );
      }
    });
  }
  if (project.collaborators) {
    reportDuplicates(
      diagnostics,
      project.collaborators.map((collaborator) => collaborator.id),
      `${path}.collaborators`,
      "id",
      "duplicate.project-collaborator-id",
      "Project collaborator ID",
    );
  }

  project.role.claimIds.forEach((claimId, index) => {
    checkReferencedId(
      diagnostics,
      claimId,
      localClaimIds,
      `${path}.role.claimIds[${index}]`,
      "reference.role-claim",
      "Local project claim",
    );
  });
  project.role.evidenceIds.forEach((evidenceId, index) => {
    checkReferencedId(
      diagnostics,
      evidenceId,
      localEvidenceIds,
      `${path}.role.evidenceIds[${index}]`,
      "reference.role-evidence",
      "Local project evidence",
    );
  });

  if (project.role.claimIds.length + project.role.evidenceIds.length === 0) {
    addError(
      diagnostics,
      "publication.role-provenance-required",
      `${path}.role`,
      "A role needs at least one claim or evidence reference; owner attestation is valid",
    );
  }

  const roleClaims = project.role.claimIds
    .map((claimId) => localClaims.get(claimId))
    .filter((claim): claim is VerifiedClaim => Boolean(claim));
  if (!roleClaims.some((claim) => claim.kind === "role")) {
    addError(
      diagnostics,
      "publication.role-claim-required",
      `${path}.role.claimIds`,
      "A role must reference a claim classified as role; that claim may use owner attestation",
    );
  }

  if (project.endedAt) {
    const started = toPartialDateBoundary(project.startedAt, "start");
    const ended = toPartialDateBoundary(project.endedAt, "end");
    if (started > ended) {
      addError(
        diagnostics,
        "date.project-range",
        `${path}.endedAt`,
        "endedAt cannot be earlier than startedAt",
      );
    }
  }

  if (project.lastVerifiedAt < project.lastUpdatedAt) {
    addError(
      diagnostics,
      "date.project-verification-stale",
      `${path}.lastVerifiedAt`,
      "lastVerifiedAt cannot be earlier than lastUpdatedAt",
    );
  }

  project.claims.forEach((claim, claimIndex) =>
    validateClaim(claim, `${path}.claims[${claimIndex}]`, diagnostics, indexes),
  );
  validateAssetClaimReferences(project.evidence, localClaimIds, `${path}.evidence`, diagnostics);

  if (project.socialImageAssetId) {
    const socialImage = project.evidence.find(
      (asset) => asset.id === project.socialImageAssetId,
    );

    if (!socialImage) {
      addError(
        diagnostics,
        indexes.allAssetIds.has(project.socialImageAssetId)
          ? "reference.project-social-image-ownership"
          : "reference.project-social-image",
        `${path}.socialImageAssetId`,
        indexes.allAssetIds.has(project.socialImageAssetId)
          ? `Social image "${project.socialImageAssetId}" belongs to another record`
          : `Project evidence "${project.socialImageAssetId}" does not exist`,
      );
    } else if (!isReadyAsset(socialImage)) {
      addError(
        diagnostics,
        "reference.project-social-image-readiness",
        `${path}.socialImageAssetId`,
        "A project social image must reference ready evidence",
      );
    } else if (socialImage.mediaKind !== "image") {
      addError(
        diagnostics,
        "reference.project-social-image-kind",
        `${path}.socialImageAssetId`,
        "A project social image must reference a ready raster image",
      );
    }
  }

  if (project.caseStudyState === "full") {
    project.teamContext.collaboratorIds.forEach((collaboratorId, index) => {
      checkReferencedId(
        diagnostics,
        collaboratorId,
        localCollaboratorIds,
        `${path}.teamContext.collaboratorIds[${index}]`,
        "reference.team-collaborator",
        "Local project collaborator",
      );
    });
    project.decisions.forEach((decision, decisionIndex) => {
      decision.evidenceIds.forEach((evidenceId, evidenceIndex) => {
        checkReferencedId(
          diagnostics,
          evidenceId,
          localEvidenceIds,
          `${path}.decisions[${decisionIndex}].evidenceIds[${evidenceIndex}]`,
          "reference.decision-evidence",
          "Local project evidence",
        );
      });
    });
  }
}

function validatePublishedProject(
  project: ProjectRecord,
  projectIndex: number,
  diagnostics: ContentDiagnostic[],
  content: ContentBundle,
  filePresence: FilePresenceAdapter,
): void {
  if (project.publication !== "published") return;

  const path = `$content.projects[${projectIndex}]`;
  const readyAssets = project.evidence.filter(isReadyAsset);
  project.evidence.forEach((asset, assetIndex) => {
    if (!isReadyAsset(asset)) {
      addError(
        diagnostics,
        "publication.planned-project-media",
        `${path}.evidence[${assetIndex}]`,
        `Published projects cannot contain ${asset.status} media`,
      );
    }
  });

  if (project.caseStudyState === "brief") {
    if (readyAssets.length === 0) {
      addError(
        diagnostics,
        "publication.brief-ready-media-required",
        `${path}.evidence`,
        "A published brief needs at least one ready media item",
      );
    }
    return;
  }

  if (!project.socialImageAssetId) {
    addError(
      diagnostics,
      "publication.full-social-image-required",
      `${path}.socialImageAssetId`,
      "A published full case study needs a ready raster social image",
    );
  }

  const fulfilledFunctions = new Set(readyAssets.flatMap((asset) => asset.evidenceFunctions));
  for (const evidenceFunction of REQUIRED_FULL_EVIDENCE_FUNCTIONS) {
    if (!fulfilledFunctions.has(evidenceFunction)) {
      addError(
        diagnostics,
        "publication.full-evidence-gate",
        `${path}.evidence`,
        `A published full case study needs ready ${evidenceFunction} evidence`,
      );
    }
  }

  const source = content.sources.projects.find((candidate) => candidate.slug === project.slug);
  if (!source?.caseStudyMdxPath) {
    addError(
      diagnostics,
      "publication.full-mdx-metadata-required",
      `${path}.caseStudyState`,
      "A published full case study needs a caseStudyMdxPath in source metadata",
    );
    return;
  }

  try {
    if (!presenceCheck(filePresence, source.caseStudyMdxPath)) {
      addError(
        diagnostics,
        "publication.full-mdx-missing",
        `$content.sources.projects[${content.sources.projects.indexOf(source)}].caseStudyMdxPath`,
        `Case-study source "${source.caseStudyMdxPath}" is missing`,
      );
    }
  } catch (error) {
    addError(
      diagnostics,
      "source.file-presence-failed",
      `$content.sources.projects[${content.sources.projects.indexOf(source)}].caseStudyMdxPath`,
      `Could not verify case-study source presence: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

function validateMoment(
  moment: MomentRecord,
  momentIndex: number,
  diagnostics: ContentDiagnostic[],
  indexes: RecordIndexes,
): void {
  const path = `$content.moments[${momentIndex}]`;
  const localClaimIds = new Set(moment.claims.map((claim) => claim.id));

  reportDuplicates(
    diagnostics,
    moment.claims.map((claim) => claim.id),
    `${path}.claims`,
    "id",
    "duplicate.moment-claim-id",
    "Moment claim ID",
  );
  reportDuplicates(
    diagnostics,
    moment.assets.map((asset) => asset.id),
    `${path}.assets`,
    "id",
    "duplicate.moment-asset-id",
    "Moment asset ID",
  );

  moment.claimIds.forEach((claimId, claimIndex) => {
    checkReferencedId(
      diagnostics,
      claimId,
      localClaimIds,
      `${path}.claimIds[${claimIndex}]`,
      "reference.moment-claim",
      "Local moment claim",
    );
  });
  moment.claims.forEach((claim, claimIndex) =>
    validateClaim(claim, `${path}.claims[${claimIndex}]`, diagnostics, indexes),
  );
  validateAssetClaimReferences(moment.assets, localClaimIds, `${path}.assets`, diagnostics);

  if (moment.context.kind === "project") {
    moment.context.projectSlugs.forEach((slug, slugIndex) => {
      checkReferencedId(
        diagnostics,
        slug,
        indexes.projectSlugs,
        `${path}.context.projectSlugs[${slugIndex}]`,
        "reference.moment-project",
        "Project",
      );
    });
  }

  if (moment.result && moment.claimIds.length === 0) {
    addError(
      diagnostics,
      "publication.moment-result-provenance",
      `${path}.claimIds`,
      "A stated moment result needs at least one local claim reference",
    );
  }

  if (moment.publication !== "published") return;

  const readyAssets = moment.assets.filter(isReadyAsset);
  const readyRasterPhotos = readyAssets.filter(
    (asset) => asset.mediaKind === "image",
  );
  if (readyAssets.length === 0) {
    addError(
      diagnostics,
      "publication.moment-ready-media-required",
      `${path}.assets`,
      "A published moment needs at least one ready asset",
    );
  }

  moment.assets.forEach((asset, assetIndex) => {
    if (!isReadyAsset(asset)) {
      addError(
        diagnostics,
        "publication.planned-moment-media",
        `${path}.assets[${assetIndex}]`,
        `Published moments cannot contain ${asset.status} media`,
      );
      return;
    }

    if (asset.mediaKind !== "image") {
      addError(
        diagnostics,
        "publication.moment-raster-photo-required",
        `${path}.assets[${assetIndex}].mediaKind`,
        "Published moments accept ready raster photographs only",
      );
      return;
    }

    if (asset.alt.trim().length === 0) {
      addError(
        diagnostics,
        "publication.moment-alt-required",
        `${path}.assets[${assetIndex}].alt`,
        "A published documentary photograph needs factual alt text",
      );
    }

    if (asset.provenance.kind !== "documentary-photo") {
      addError(
        diagnostics,
        "publication.moment-photo-provenance",
        `${path}.assets[${assetIndex}].provenance`,
        "Published moment imagery needs documentary-photo provenance, rights, credit, and consent",
      );
    }
  });

  const photoCount = readyRasterPhotos.length;
  if (moment.mode === "contact-sheet") {
    if (photoCount < 2 || photoCount > 6) {
      addError(
        diagnostics,
        "publication.moment-contact-sheet-cardinality",
        `${path}.assets`,
        "A published contact sheet needs between two and six ready raster photographs",
      );
    }
  } else if (photoCount !== 1) {
    addError(
      diagnostics,
      "publication.moment-single-photo-cardinality",
      `${path}.assets`,
      `A published ${moment.mode} moment needs exactly one ready raster photograph`,
    );
  }

  if (
    moment.mode === "lead" &&
    readyRasterPhotos.length === 1 &&
    !readyRasterPhotos[0].mobile
  ) {
    addError(
      diagnostics,
      "publication.moment-lead-mobile-required",
      `${path}.assets[${moment.assets.indexOf(readyRasterPhotos[0])}].mobile`,
      "A published lead photograph needs an intentional mobile derivative",
    );
  }

  if (moment.mode === "evidence" && moment.context.kind !== "project") {
    addError(
      diagnostics,
      "publication.moment-evidence-project-context",
      `${path}.context`,
      "A published evidence photograph must reference at least one project",
    );
  }
}

function validateGlobalUniqueness(content: ContentBundle, diagnostics: ContentDiagnostic[]): void {
  reportDuplicates(
    diagnostics,
    content.projects.map((project) => project.slug),
    "$content.projects",
    "slug",
    "duplicate.project-slug",
    "Project slug",
  );
  reportDuplicates(
    diagnostics,
    content.moments.map((moment) => moment.id),
    "$content.moments",
    "id",
    "duplicate.moment-id",
    "Moment ID",
  );

  const allAssets = [
    ...content.projects.flatMap((project, projectIndex) =>
      project.evidence.map((asset, assetIndex) => ({
        id: asset.id,
        path: `$content.projects[${projectIndex}].evidence[${assetIndex}].id`,
      })),
    ),
    ...content.moments.flatMap((moment, momentIndex) =>
      moment.assets.map((asset, assetIndex) => ({
        id: asset.id,
        path: `$content.moments[${momentIndex}].assets[${assetIndex}].id`,
      })),
    ),
  ];
  const duplicateAssetIds = new Set(
    [...duplicateIndexes(allAssets.map((asset) => asset.id)).keys()],
  );
  allAssets.forEach((asset) => {
    if (duplicateAssetIds.has(asset.id)) {
      addError(
        diagnostics,
        "duplicate.global-evidence-id",
        asset.path,
        `Evidence ID "${asset.id}" must be globally unique`,
      );
    }
  });

  const allBrandAssets = content.projects.flatMap((project, projectIndex) =>
    project.branding
      ? [
          {
            id: project.branding.mark.id,
            path: `$content.projects[${projectIndex}].branding.mark.id`,
          },
          ...(project.branding.wordmark
            ? [
                {
                  id: project.branding.wordmark.id,
                  path: `$content.projects[${projectIndex}].branding.wordmark.id`,
                },
              ]
            : []),
        ]
      : [],
  );
  const duplicateBrandAssetIds = new Set(
    [...duplicateIndexes(allBrandAssets.map((asset) => asset.id)).keys()],
  );
  const evidenceIds = new Set(allAssets.map((asset) => asset.id));
  allBrandAssets.forEach((asset) => {
    if (duplicateBrandAssetIds.has(asset.id)) {
      addError(
        diagnostics,
        "duplicate.global-brand-asset-id",
        asset.path,
        `Brand asset ID "${asset.id}" must be globally unique`,
      );
    }
    if (evidenceIds.has(asset.id)) {
      addError(
        diagnostics,
        "duplicate.global-asset-id",
        asset.path,
        `Brand asset ID "${asset.id}" collides with an evidence asset ID`,
      );
    }
  });

  const allClaims = [
    ...content.projects.flatMap((project, projectIndex) =>
      project.claims.map((claim, claimIndex) => ({
        id: claim.id,
        path: `$content.projects[${projectIndex}].claims[${claimIndex}].id`,
      })),
    ),
    ...content.moments.flatMap((moment, momentIndex) =>
      moment.claims.map((claim, claimIndex) => ({
        id: claim.id,
        path: `$content.moments[${momentIndex}].claims[${claimIndex}].id`,
      })),
    ),
  ];
  const duplicateClaimIds = new Set(
    [...duplicateIndexes(allClaims.map((claim) => claim.id)).keys()],
  );
  allClaims.forEach((claim) => {
    if (duplicateClaimIds.has(claim.id)) {
      addError(
        diagnostics,
        "duplicate.global-claim-id",
        claim.path,
        `Claim ID "${claim.id}" must be globally unique`,
      );
    }
  });
}

function validateSiteReferences(
  content: ContentBundle,
  diagnostics: ContentDiagnostic[],
  indexes: RecordIndexes,
): void {
  content.homepage.projectStages.forEach((stage, stageIndex) => {
    const stagePath = `$content.homepage.projectStages[${stageIndex}]`;
    const project = content.projects.find(
      (candidate) => candidate.slug === stage.projectSlug,
    );

    if (!project) {
      addError(
        diagnostics,
        "reference.homepage-project",
        `${stagePath}.projectSlug`,
        `Project "${stage.projectSlug}" does not exist`,
      );
      return;
    }

    if (project.publication !== "published") {
      addError(
        diagnostics,
        "publication.homepage-project",
        `${stagePath}.projectSlug`,
        "A homepage project stage must reference a published project",
      );
    }

    if (!project.branding) {
      addError(
        diagnostics,
        "reference.homepage-project-branding",
        `${stagePath}.projectSlug`,
        `Homepage project "${project.slug}" needs typed branding`,
      );
    } else if (project.branding.mark.accessibility.mode !== "decorative") {
      addError(
        diagnostics,
        "accessibility.homepage-project-mark",
        `${stagePath}.projectSlug`,
        "A project mark beside textual identity must be decorative",
      );
    }

    if (
      !project.claims.some((claim) => claim.id === stage.outcomeClaimId)
    ) {
      const owningProject = content.projects.find((candidate) =>
        candidate.claims.some((claim) => claim.id === stage.outcomeClaimId),
      );
      addError(
        diagnostics,
        owningProject
          ? "reference.homepage-outcome-ownership"
          : "reference.homepage-outcome-claim",
        `${stagePath}.outcomeClaimId`,
        owningProject
          ? `Claim "${stage.outcomeClaimId}" belongs to project "${owningProject.slug}", not "${project.slug}"`
          : `Project claim "${stage.outcomeClaimId}" does not exist`,
      );
    }

    stage.artifactAssetIds.forEach((assetId, assetIndex) => {
      const artifactPath = `${stagePath}.artifactAssetIds[${assetIndex}]`;
      const artifact = project.evidence.find((asset) => asset.id === assetId);
      if (!artifact) {
        const owningProject = content.projects.find((candidate) =>
          candidate.evidence.some((asset) => asset.id === assetId),
        );
        addError(
          diagnostics,
          owningProject
            ? "reference.homepage-artifact-ownership"
            : indexes.brandAssetIds.has(assetId)
              ? "reference.homepage-artifact-brand-asset"
              : "reference.homepage-artifact",
          artifactPath,
          owningProject
            ? `Artifact "${assetId}" belongs to project "${owningProject.slug}", not "${project.slug}"`
            : indexes.brandAssetIds.has(assetId)
              ? `Brand asset "${assetId}" cannot be used as a project artifact`
              : `Project artifact "${assetId}" does not exist`,
        );
        return;
      }
      if (!isReadyAsset(artifact)) {
        addError(
          diagnostics,
          "reference.homepage-artifact-readiness",
          artifactPath,
          `Homepage artifact "${assetId}" must be ready`,
        );
        return;
      }

      if (artifact.provenance.kind === "owned") {
        const projectIndex = content.projects.indexOf(project);
        const evidenceIndex = project.evidence.indexOf(artifact);
        const provenancePath = `$content.projects[${projectIndex}].evidence[${evidenceIndex}].provenance`;
        const sourceFields = [
          ["sourceRepository", artifact.provenance.sourceRepository],
          ["revision", artifact.provenance.revision],
          ["sourcePath", artifact.provenance.sourcePath],
        ] as const;
        sourceFields.forEach(([field, value]) => {
          if (!value) {
            addError(
              diagnostics,
              "reference.homepage-artifact-source-provenance",
              `${provenancePath}.${field}`,
              `Homepage artifact "${assetId}" needs reproducible repository provenance`,
            );
          }
        });
        if (
          project.links.source.status === "public" &&
          artifact.provenance.sourceRepository &&
          artifact.provenance.sourceRepository !== project.links.source.url
        ) {
          addError(
            diagnostics,
            "reference.homepage-artifact-source-repository",
            `${provenancePath}.sourceRepository`,
            `Artifact source repository must match the project's public source URL "${project.links.source.url}"`,
          );
        }
      }
    });
  });

  content.research.territories.forEach((territory, territoryIndex) => {
    territory.projectSlugs.forEach((slug, slugIndex) => {
      const path = `$content.research.territories[${territoryIndex}].projectSlugs[${slugIndex}]`;
      const project = content.projects.find((candidate) => candidate.slug === slug);
      if (!project) {
        addError(
          diagnostics,
          "reference.research-project",
          path,
          `Project "${slug}" does not exist`,
        );
      } else if (project.publication !== "published") {
        addError(
          diagnostics,
          "publication.research-project",
          path,
          "A public research territory must reference a published project",
        );
      }
    });
  });

  content.homepage.featuredMomentIds.forEach((id, index) => {
    checkReferencedId(
      diagnostics,
      id,
      indexes.momentIds,
      `$content.homepage.featuredMomentIds[${index}]`,
      "reference.homepage-moment",
      "Moment",
    );
    const moment = content.moments.find((candidate) => candidate.id === id);
    if (moment && moment.publication !== "published") {
      addError(
        diagnostics,
        "publication.homepage-moment",
        `$content.homepage.featuredMomentIds[${index}]`,
        "A homepage moment must be published",
      );
    }
  });
  content.homepage.currentlyBuildingIds.forEach((id, index) => {
    checkReferencedId(
      diagnostics,
      id,
      indexes.currentlyBuildingIds,
      `$content.homepage.currentlyBuildingIds[${index}]`,
      "reference.homepage-currently-building",
      "Currently-building item",
    );
  });

  content.currentlyBuilding.items.forEach((item, index) => {
    if (item.projectSlug) {
      checkReferencedId(
        diagnostics,
        item.projectSlug,
        indexes.projectSlugs,
        `$content.currentlyBuilding.items[${index}].projectSlug`,
        "reference.currently-building-project",
        "Project",
      );
    }
  });

  const navigationItems = [...content.navigation.primary, ...(content.navigation.secondary ?? [])];
  const duplicateNavigationIds = new Set(
    [...duplicateIndexes(navigationItems.map((item) => item.id)).keys()],
  );
  const navigationLocations = [
    ...content.navigation.primary.map((item, index) => ({
      item,
      path: `$content.navigation.primary[${index}]`,
    })),
    ...(content.navigation.secondary ?? []).map((item, index) => ({
      item,
      path: `$content.navigation.secondary[${index}]`,
    })),
  ];
  navigationLocations.forEach(({ item, path }) => {
    if (duplicateNavigationIds.has(item.id)) {
      addError(
        diagnostics,
        "duplicate.navigation-id",
        `${path}.id`,
        `Navigation item ID "${item.id}" is duplicated`,
      );
    }
  });
  navigationLocations.forEach(({ item, path }) => {
    if (item.projectSlug) {
      checkReferencedId(
        diagnostics,
        item.projectSlug,
        indexes.projectSlugs,
        `${path}.projectSlug`,
        "reference.navigation-project",
        "Project",
      );

      const project = content.projects.find((candidate) => candidate.slug === item.projectSlug);
      if (project && project.publication !== "published") {
        addError(
          diagnostics,
          "publication.navigation-project",
          `${path}.projectSlug`,
          "Production navigation cannot reference a draft or preview project",
        );
      }
    }
  });

  if (navigationItems.some((item) => item.href === "/moments" || item.href.startsWith("/moments?"))) {
    const publishedMoments = content.moments.filter(
      (moment) => moment.publication === "published",
    );
    if (!hasMinimumMomentNarrative(publishedMoments)) {
      addError(
        diagnostics,
        "publication.moments-route-gate",
        "$content.navigation",
        "The /moments navigation item requires at least two distinct published event/date/place narrative points",
      );
    }
  }

  if (content.profile.portraitAssetId) {
    checkReferencedId(
      diagnostics,
      content.profile.portraitAssetId,
      indexes.allAssetIds,
      "$content.profile.portraitAssetId",
      "reference.profile-portrait",
      "Ready portrait evidence",
    );
    const portraitMoment = content.moments.find((moment) =>
      moment.assets.some((asset) => asset.id === content.profile.portraitAssetId),
    );
    const portrait = indexes.assetsById.get(content.profile.portraitAssetId);
    if (portrait && (!isReadyAsset(portrait) || portrait.mediaKind !== "image")) {
      addError(
        diagnostics,
        "reference.profile-portrait-kind",
        "$content.profile.portraitAssetId",
        "A profile portrait must reference a ready image asset",
      );
    }
    if (portrait && !portraitMoment) {
      addError(
        diagnostics,
        "reference.profile-portrait-owner",
        "$content.profile.portraitAssetId",
        "A profile portrait must be owned by a documentary moment",
      );
    }
    if (portraitMoment && portraitMoment.publication !== "published") {
      addError(
        diagnostics,
        "publication.profile-portrait-owner",
        "$content.profile.portraitAssetId",
        "A profile portrait must belong to a published moment",
      );
    }
    if (portraitMoment && portraitMoment.mode !== "portrait") {
      addError(
        diagnostics,
        "publication.profile-portrait-mode",
        "$content.profile.portraitAssetId",
        "A profile portrait must belong to a moment in portrait mode",
      );
    }
    if (
      portrait &&
      isReadyAsset(portrait) &&
      portrait.mediaKind === "image" &&
      portrait.provenance.kind !== "documentary-photo"
    ) {
      addError(
        diagnostics,
        "publication.profile-portrait-provenance",
        "$content.profile.portraitAssetId",
        "A profile portrait needs documentary-photo provenance",
      );
    }
  }
}

function validateAssetLicenses(
  content: ContentBundle,
  diagnostics: ContentDiagnostic[],
  indexes: RecordIndexes,
): void {
  const assetsById = new Map(
    [
      ...content.projects.flatMap((project) => project.evidence),
      ...content.moments.flatMap((moment) => moment.assets),
    ].map((asset) => [asset.id, asset]),
  );

  content.assetLicenseManifest.entries.forEach((entry, entryIndex) => {
    if (entry.usage === "published-asset" && entry.assetIds.length === 0) {
      addError(
        diagnostics,
        "license.published-asset-reference-required",
        `$content.assetLicenseManifest.entries[${entryIndex}].assetIds`,
        "A published-asset license entry must reference at least one asset",
      );
    }
    entry.assetIds.forEach((assetId, assetIndex) => {
      checkReferencedId(
        diagnostics,
        assetId,
        indexes.allAssetIds,
        `$content.assetLicenseManifest.entries[${entryIndex}].assetIds[${assetIndex}]`,
        "reference.license-asset",
        "Asset",
      );
      const asset = assetsById.get(assetId);
      if (entry.usage === "published-asset" && asset && !isReadyAsset(asset)) {
        addError(
          diagnostics,
          "license.published-asset-not-ready",
          `$content.assetLicenseManifest.entries[${entryIndex}].assetIds[${assetIndex}]`,
          `Published-asset license reference "${assetId}" must point to a ready asset`,
        );
      }
    });
  });

  const licensedPublishedAssetIds = new Set(
    content.assetLicenseManifest.entries
      .filter((entry) => entry.usage === "published-asset")
      .flatMap((entry) => entry.assetIds),
  );
  const publishedRecords = [
    ...content.projects.filter((project) => project.publication === "published").map((project) => project.evidence),
    ...content.moments.filter((moment) => moment.publication === "published").map((moment) => moment.assets),
  ].flat();
  publishedRecords.forEach((asset) => {
    if (
      isReadyAsset(asset) &&
      asset.provenance.kind === "third-party" &&
      !licensedPublishedAssetIds.has(asset.id)
    ) {
      addError(
        diagnostics,
        "license.third-party-published-asset",
        "$content.assetLicenseManifest.entries",
        `Published third-party asset "${asset.id}" needs a published-asset manifest entry`,
      );
    }
  });
}

function validateSourceMetadata(
  content: ContentBundle,
  diagnostics: ContentDiagnostic[],
  filePresence: FilePresenceAdapter,
): void {
  const sourceBySlug = new Map(content.sources.projects.map((source) => [source.slug, source]));
  content.projects.forEach((project, projectIndex) => {
    if (!sourceBySlug.has(project.slug)) {
      addError(
        diagnostics,
        "reference.project-source-metadata",
        `$content.projects[${projectIndex}].slug`,
        `Project "${project.slug}" needs exactly one source metadata entry`,
      );
    }
  });

  content.sources.projects.forEach((source, sourceIndex) => {
    checkReferencedId(
      diagnostics,
      source.slug,
      new Set(content.projects.map((project) => project.slug)),
      `$content.sources.projects[${sourceIndex}].slug`,
      "reference.source-project",
      "Project",
    );

    checkFilePresence(
      diagnostics,
      filePresence,
      source.recordPath,
      `$content.sources.projects[${sourceIndex}].recordPath`,
      "source.project-record-missing",
      "Project record source",
    );
  });
}

function validateReadyAssetFiles(
  content: ContentBundle,
  diagnostics: ContentDiagnostic[],
  filePresence: FilePresenceAdapter,
): void {
  const locations = [
    ...content.projects.flatMap((project, projectIndex) =>
      project.evidence.map((asset, assetIndex) => ({
        asset,
        path: `$content.projects[${projectIndex}].evidence[${assetIndex}]`,
      })),
    ),
    ...content.moments.flatMap((moment, momentIndex) =>
      moment.assets.map((asset, assetIndex) => ({
        asset,
        path: `$content.moments[${momentIndex}].assets[${assetIndex}]`,
      })),
    ),
  ];

  locations.forEach(({ asset, path }) => {
    if (!isReadyAsset(asset)) return;
    checkFilePresence(
      diagnostics,
      filePresence,
      `public${asset.src}`,
      `${path}.src`,
      "source.ready-asset-missing",
      "Ready asset",
    );
    if (asset.mobile) {
      checkFilePresence(
        diagnostics,
        filePresence,
        `public${asset.mobile.src}`,
        `${path}.mobile.src`,
        "source.ready-mobile-asset-missing",
        "Ready mobile asset",
      );
    }
    if (asset.mediaKind === "video") {
      checkFilePresence(
        diagnostics,
        filePresence,
        `public${asset.poster}`,
        `${path}.poster`,
        "source.ready-video-poster-missing",
        "Ready video poster",
      );
    }
  });

  content.projects.forEach((project, projectIndex) => {
    if (!project.branding) return;
    const brandLocations = [
      {
        asset: project.branding.mark,
        path: `$content.projects[${projectIndex}].branding.mark`,
      },
      ...(project.branding.wordmark
        ? [
            {
              asset: project.branding.wordmark,
              path: `$content.projects[${projectIndex}].branding.wordmark`,
            },
          ]
        : []),
    ];

    brandLocations.forEach(({ asset, path }) => {
      checkFilePresence(
        diagnostics,
        filePresence,
        `public${asset.src}`,
        `${path}.src`,
        "source.brand-asset-missing",
        "Brand asset",
      );
    });
  });
}

function collectCrossRecordDiagnostics(
  content: ContentBundle,
  filePresence: FilePresenceAdapter,
): ContentDiagnostic[] {
  const diagnostics: ContentDiagnostic[] = [];
  const indexes = buildIndexes(content);

  validateGlobalUniqueness(content, diagnostics);
  content.projects.forEach((project, projectIndex) => {
    validateProjectReferences(project, projectIndex, diagnostics, indexes);
    validatePublishedProject(project, projectIndex, diagnostics, content, filePresence);
  });
  content.moments.forEach((moment, momentIndex) =>
    validateMoment(moment, momentIndex, diagnostics, indexes),
  );
  validateSiteReferences(content, diagnostics, indexes);
  validateAssetLicenses(content, diagnostics, indexes);
  validateSourceMetadata(content, diagnostics, filePresence);
  validateReadyAssetFiles(content, diagnostics, filePresence);

  return sortContentDiagnostics(diagnostics);
}

/**
 * Parses strict schemas, verifies cross-record references and publication
 * gates, and returns a detached JSON-safe bundle. It never reads the
 * filesystem: callers explicitly supply the source-presence boundary.
 */
export function validateContentBundle(
  input: unknown,
  filePresence: FilePresenceAdapter,
): ContentValidationResult {
  const parsed = ContentBundleSchema.safeParse(input);
  if (!parsed.success) throw new ContentValidationError(zodDiagnostics(parsed.error.issues));

  const content = toJsonSafe(parsed.data);
  const diagnostics = collectCrossRecordDiagnostics(content, filePresence);
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    throw new ContentValidationError(diagnostics);
  }

  return toJsonSafe({ content, diagnostics });
}
