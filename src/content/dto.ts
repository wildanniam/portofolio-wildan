import { toJsonSafe } from "./parse";
import type {
  LinkState,
  ProjectRecord,
  ReadyAsset,
  ReadyDocumentAsset,
  ReadyImageAsset,
  ReadyVideoAsset,
} from "./types";

export type LinkDto =
  | {
      status: "public";
      href: string;
      lastVerifiedAt: string;
    }
  | {
      status: "private" | "offline" | "unavailable" | "not-applicable";
      note?: string;
    };

export type ReadyEvidenceDto = ReadyAsset;

export type ProjectSummaryDto = {
  slug: string;
  href: string;
  title: string;
  caseStudyState: ProjectRecord["caseStudyState"];
  lifecycle: ProjectRecord["lifecycle"];
  origin: ProjectRecord["origin"];
  validationKinds: ProjectRecord["validationKinds"];
  startedAt: string;
  endedAt?: string;
  lastUpdatedAt: string;
  lastVerifiedAt: string;
  oneLiner: string;
  role: {
    label: string;
    scope: string[];
  };
  technologies: string[];
  claims: Array<{
    id: string;
    kind: ProjectRecord["claims"][number]["kind"];
    text: string;
    scope?: string;
  }>;
  evidence: ReadyEvidenceDto[];
  links: {
    live: LinkDto;
    source: LinkDto;
    docs?: LinkDto;
    demo?: LinkDto;
  };
};

export function isReadyAsset(
  asset: ProjectRecord["evidence"][number],
): asset is ReadyAsset {
  return asset.status === "ready";
}

export function toLinkDto(link: LinkState): LinkDto {
  if (link.status === "public") {
    return {
      status: "public",
      href: link.url,
      lastVerifiedAt: link.lastVerifiedAt,
    };
  }

  return link.note
    ? { status: link.status, note: link.note }
    : { status: link.status };
}

function toReadyEvidenceDto(asset: ReadyAsset): ReadyEvidenceDto {
  const crop =
    asset.crop.mode === "intrinsic"
      ? { mode: "intrinsic" as const }
      : {
          mode: "focal" as const,
          aspectRatio: asset.crop.aspectRatio,
          focalPoint: { ...asset.crop.focalPoint },
        };
  const mobile = asset.mobile
    ? {
        src: asset.mobile.src,
        width: asset.mobile.width,
        height: asset.mobile.height,
        crop:
          asset.mobile.crop.mode === "intrinsic"
            ? { mode: "intrinsic" as const }
            : {
                mode: "focal" as const,
                aspectRatio: asset.mobile.crop.aspectRatio,
                focalPoint: { ...asset.mobile.crop.focalPoint },
              },
      }
    : undefined;
  const provenance =
    asset.provenance.kind === "owned"
      ? {
          kind: "owned" as const,
          creator: asset.provenance.creator,
          rightsNote: asset.provenance.rightsNote,
          ...(asset.provenance.capturedAt
            ? { capturedAt: asset.provenance.capturedAt }
            : {}),
        }
      : asset.provenance.kind === "third-party"
        ? {
            kind: "third-party" as const,
            creator: asset.provenance.creator,
            source: asset.provenance.source,
            license: asset.provenance.license,
            ...(asset.provenance.attribution
              ? { attribution: asset.provenance.attribution }
              : {}),
          }
        : {
            kind: "documentary-photo" as const,
            source: asset.provenance.source,
            credit: asset.provenance.credit,
            rights: asset.provenance.rights,
            consent: asset.provenance.consent,
            ...(asset.provenance.capturedAt
              ? { capturedAt: asset.provenance.capturedAt }
              : {}),
          };
  const common = {
    id: asset.id,
    status: "ready" as const,
    slot: asset.slot,
    evidenceType: asset.evidenceType,
    evidenceFunctions: [...asset.evidenceFunctions],
    src: asset.src,
    width: asset.width,
    height: asset.height,
    crop,
    ...(mobile ? { mobile } : {}),
    caption: asset.caption,
    provenance,
    ...(asset.claimIds ? { claimIds: [...asset.claimIds] } : {}),
  };

  if (isReadyImage(asset)) {
    return {
      ...common,
      mediaKind: asset.mediaKind,
      alt: asset.alt,
      ...(asset.longDescription
        ? { longDescription: asset.longDescription }
        : {}),
    };
  }

  if (isReadyVideo(asset)) {
    return {
      ...common,
      mediaKind: "video",
      poster: asset.poster,
      posterAlt: asset.posterAlt,
      transcriptOrSteps: [...asset.transcriptOrSteps],
      durationSeconds: asset.durationSeconds,
      controls: asset.controls,
    };
  }

  if (!isReadyDocument(asset)) {
    throw new TypeError("Unsupported ready evidence kind.");
  }

  const document = asset;
  return {
    ...common,
    mediaKind: "document",
    title: document.title,
    textAlternative: document.textAlternative,
    ...(document.pageCount ? { pageCount: document.pageCount } : {}),
  };
}

function isReadyImage(asset: ReadyAsset): asset is ReadyImageAsset {
  return asset.mediaKind === "image" || asset.mediaKind === "svg";
}

function isReadyVideo(asset: ReadyAsset): asset is ReadyVideoAsset {
  return asset.mediaKind === "video";
}

function isReadyDocument(asset: ReadyAsset): asset is ReadyDocumentAsset {
  return asset.mediaKind === "document";
}

/**
 * Produces the bounded payload used by future client-side evidence selection.
 * Planned/private assets and claim provenance never cross the RSC boundary.
 */
export function toProjectSummaryDto(
  project: ProjectRecord,
): ProjectSummaryDto {
  const dto: ProjectSummaryDto = {
    slug: project.slug,
    href: `/work/${project.slug}`,
    title: project.title,
    caseStudyState: project.caseStudyState,
    lifecycle: project.lifecycle,
    origin: [...project.origin],
    validationKinds: [...project.validationKinds],
    startedAt: project.startedAt,
    ...(project.endedAt ? { endedAt: project.endedAt } : {}),
    lastUpdatedAt: project.lastUpdatedAt,
    lastVerifiedAt: project.lastVerifiedAt,
    oneLiner: project.oneLiner,
    role: {
      label: project.role.label,
      scope: [...project.role.scope],
    },
    technologies: [...project.technologies],
    claims: project.claims.map((claim) => ({
      id: claim.id,
      kind: claim.kind,
      text: claim.text,
      ...(claim.scope ? { scope: claim.scope } : {}),
    })),
    evidence: project.evidence.filter(isReadyAsset).map(toReadyEvidenceDto),
    links: {
      live: toLinkDto(project.links.live),
      source: toLinkDto(project.links.source),
      ...(project.links.docs
        ? { docs: toLinkDto(project.links.docs) }
        : {}),
      ...(project.links.demo
        ? { demo: toLinkDto(project.links.demo) }
        : {}),
    },
  };

  return toJsonSafe(dto);
}
