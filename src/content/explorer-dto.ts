import { toJsonSafe } from "./parse";
import type {
  ProjectRecord,
  ReadyAsset,
  ReadyDocumentAsset,
  ReadyImageAsset,
  ReadyVideoAsset,
  VerifiedClaim,
} from "./types";

export type ExplorerCropDto =
  | { mode: "intrinsic" }
  | {
      mode: "focal";
      aspectRatio: string;
      focalPoint: { x: number; y: number };
    };

export type ExplorerMobileMediaDto = {
  src: string;
  width: number;
  height: number;
  crop: ExplorerCropDto;
};

type ExplorerMediaBaseDto = {
  id: string;
  status: "ready";
  evidenceType: ReadyAsset["evidenceType"];
  evidenceFunctions: ReadyAsset["evidenceFunctions"];
  src: string;
  width: number;
  height: number;
  crop: ExplorerCropDto;
  mobile?: ExplorerMobileMediaDto;
  caption: string;
};

export type ExplorerImageMediaDto = ExplorerMediaBaseDto & {
  mediaKind: "image" | "svg";
  alt: string;
  longDescription?: string;
};

export type ExplorerVideoMediaDto = ExplorerMediaBaseDto & {
  mediaKind: "video";
  poster: string;
  posterAlt: string;
  transcriptOrSteps: string[];
  durationSeconds: number;
  controls: ReadyVideoAsset["controls"];
};

export type ExplorerDocumentMediaDto = ExplorerMediaBaseDto & {
  mediaKind: "document";
  title: string;
  textAlternative: string;
  pageCount?: number;
};

export type ExplorerMediaDto =
  | ExplorerImageMediaDto
  | ExplorerVideoMediaDto
  | ExplorerDocumentMediaDto;

export type ExplorerPublicActionDto = {
  kind: "live" | "source" | "docs" | "demo";
  label: string;
  href: string;
  lastVerifiedAt: string;
};

export type ExplorerProjectDto = {
  slug: string;
  href: string;
  title: string;
  oneLiner: string;
  lifecycle: ProjectRecord["lifecycle"];
  origin: ProjectRecord["origin"];
  startedAt: string;
  endedAt?: string;
  role: {
    label: string;
  };
  highlightedClaim: {
    id: string;
    kind: VerifiedClaim["kind"];
    text: string;
  };
  media: ExplorerMediaDto[];
  actions: ExplorerPublicActionDto[];
};

const actionLabels = {
  live: "Live project",
  source: "Source repository",
  docs: "Documentation",
  demo: "Demo",
} as const;

function isReadyAsset(
  asset: ProjectRecord["evidence"][number],
): asset is ReadyAsset {
  return asset.status === "ready";
}

function toExplorerCropDto(crop: ReadyAsset["crop"]): ExplorerCropDto {
  return crop.mode === "intrinsic"
    ? { mode: "intrinsic" }
    : {
        mode: "focal",
        aspectRatio: crop.aspectRatio,
        focalPoint: { ...crop.focalPoint },
      };
}

function toExplorerMediaDto(asset: ReadyAsset): ExplorerMediaDto {
  const common: ExplorerMediaBaseDto = {
    id: asset.id,
    status: "ready",
    evidenceType: asset.evidenceType,
    evidenceFunctions: [...asset.evidenceFunctions],
    src: asset.src,
    width: asset.width,
    height: asset.height,
    crop: toExplorerCropDto(asset.crop),
    ...(asset.mobile
      ? {
          mobile: {
            src: asset.mobile.src,
            width: asset.mobile.width,
            height: asset.mobile.height,
            crop: toExplorerCropDto(asset.mobile.crop),
          },
        }
      : {}),
    caption: asset.caption,
  };

  if (asset.mediaKind === "image" || asset.mediaKind === "svg") {
    const image = asset as ReadyImageAsset;
    return {
      ...common,
      mediaKind: image.mediaKind,
      alt: image.alt,
      ...(image.longDescription
        ? { longDescription: image.longDescription }
        : {}),
    };
  }

  if (asset.mediaKind === "video") {
    const video = asset as ReadyVideoAsset;
    return {
      ...common,
      mediaKind: "video",
      poster: video.poster,
      posterAlt: video.posterAlt,
      transcriptOrSteps: [...video.transcriptOrSteps],
      durationSeconds: video.durationSeconds,
      controls: video.controls,
    };
  }

  const document = asset as ReadyDocumentAsset;
  return {
    ...common,
    mediaKind: "document",
    title: document.title,
    textAlternative: document.textAlternative,
    ...(document.pageCount ? { pageCount: document.pageCount } : {}),
  };
}

function toPublicActions(
  links: ProjectRecord["links"],
): ExplorerPublicActionDto[] {
  return (Object.keys(actionLabels) as Array<keyof typeof actionLabels>).flatMap(
    (kind) => {
      const link = links[kind];
      if (!link || link.status !== "public") return [];

      return [
        {
          kind,
          label: actionLabels[kind],
          href: link.url,
          lastVerifiedAt: link.lastVerifiedAt,
        },
      ];
    },
  );
}

function assertSafeResolvedHref(href: string): void {
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(href)
  ) {
    throw new TypeError("Explorer project href must be a safe root-relative path.");
  }
}

/**
 * Maps one explicitly selected project/claim pair into the only payload allowed
 * to cross the explorer client boundary. The canonical claim is read back from
 * the project by id so callers cannot inject unowned claim text.
 *
 * Planned/private media, link-state notes, asset provenance and rights notes,
 * claim sources, role evidence references, and the rest of the case-study record
 * are deliberately absent.
 */
export function toProjectExplorerDto(
  project: ProjectRecord,
  highlightedClaim: VerifiedClaim,
  href: string,
): ExplorerProjectDto {
  assertSafeResolvedHref(href);

  const canonicalClaim = project.claims.find(
    (claim) => claim.id === highlightedClaim.id,
  );
  if (!canonicalClaim) {
    throw new TypeError(
      `Highlighted claim ${highlightedClaim.id} does not belong to ${project.slug}.`,
    );
  }

  const dto: ExplorerProjectDto = {
    slug: project.slug,
    href,
    title: project.title,
    oneLiner: project.oneLiner,
    lifecycle: project.lifecycle,
    origin: [...project.origin],
    startedAt: project.startedAt,
    ...(project.endedAt ? { endedAt: project.endedAt } : {}),
    role: { label: project.role.label },
    highlightedClaim: {
      id: canonicalClaim.id,
      kind: canonicalClaim.kind,
      text: canonicalClaim.text,
    },
    media: project.evidence.filter(isReadyAsset).map(toExplorerMediaDto),
    actions: toPublicActions(project.links),
  };

  return toJsonSafe(dto);
}
