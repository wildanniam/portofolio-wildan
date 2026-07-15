import type {
  MomentRecord,
  ProjectRecord,
  ReadyImageAsset,
  VerifiedClaim,
} from "@/content/types";

export type ProjectAtlasVariant = "feature" | "column" | "compact" | "landscape";

const atlasVariants: Record<string, ProjectAtlasVariant> = {
  fradium: "feature",
  "nova-ai": "column",
  paygate: "compact",
  quorum: "landscape",
};

const flagshipClaimIds: Record<string, string> = {
  fradium: "fradium-wchl-2025",
  "nova-ai": "nova-lisk-recognition",
  paygate: "paygate-instaward-2026",
  quorum: "quorum-six-testnet-flows",
};

const momentOrder = [
  "learning-in-public",
  "refactory-build-room",
  "fradium-wchl-team",
  "self-healing-research",
  "nova-lisk-team",
  "specheal-refactory-team",
  "serambi-bank-indonesia",
] as const;

export function readyImages(assets: ProjectRecord["evidence"] | MomentRecord["assets"]) {
  return assets.filter(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" && asset.mediaKind === "image",
  );
}

export function projectPrimaryImage(project: ProjectRecord): ReadyImageAsset | undefined {
  const images = readyImages(project.evidence);
  return (
    images.find((image) => image.id === project.socialImageAssetId) ??
    images.find((image) => image.evidenceFunctions.includes("product-reality")) ??
    images[0]
  );
}

export function projectOutcome(project: ProjectRecord): VerifiedClaim | undefined {
  const preferredId = flagshipClaimIds[project.slug];
  return (
    project.claims.find((claim) => claim.id === preferredId) ??
    project.claims.find((claim) => claim.kind === "award" || claim.kind === "grant") ??
    project.claims.find((claim) => claim.kind !== "role")
  );
}

export function projectAtlasVariant(project: ProjectRecord): ProjectAtlasVariant {
  return atlasVariants[project.slug] ?? "compact";
}

export function orderMomentsForDisplay(moments: MomentRecord[]): MomentRecord[] {
  const rank = new Map<string, number>(momentOrder.map((id, index) => [id, index]));
  return [...moments].sort(
    (left, right) =>
      (rank.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(right.id) ?? Number.MAX_SAFE_INTEGER) ||
      right.date.localeCompare(left.date),
  );
}

export function momentPrimaryImage(moment: MomentRecord): ReadyImageAsset | undefined {
  return readyImages(moment.assets)[0];
}

export function projectPeriod(project: ProjectRecord) {
  return project.endedAt
    ? `${project.startedAt} to ${project.endedAt}`
    : `${project.startedAt} to present`;
}
