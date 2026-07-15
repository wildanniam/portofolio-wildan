import type {
  FullProjectRecord,
  MomentRecord,
  ReadyImageAsset,
  VerifiedClaim,
} from "@/content/types";

const outcomeClaimIds: Record<string, string> = {
  fradium: "fradium-wchl-2025",
  "nova-ai": "nova-lisk-recognition",
  paygate: "paygate-instaward-2026",
  quorum: "quorum-six-testnet-flows",
};

export function readyVisualEvidence(project: FullProjectRecord) {
  return project.evidence.filter(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" &&
      (asset.mediaKind === "image" || asset.mediaKind === "svg"),
  );
}

export function projectOpeningVisual(project: FullProjectRecord) {
  const evidence = readyVisualEvidence(project);
  return (
    evidence.find((asset) => asset.slot === "atlas-primary-surface") ??
    evidence.find((asset) => asset.id === project.socialImageAssetId) ??
    evidence.find((asset) =>
      asset.evidenceFunctions.includes("product-reality"),
    ) ??
    evidence[0]
  );
}

export function projectOutcome(project: FullProjectRecord): VerifiedClaim | undefined {
  return (
    project.claims.find((claim) => claim.id === outcomeClaimIds[project.slug]) ??
    project.claims.find(
      (claim) => claim.kind === "grant" || claim.kind === "award",
    ) ??
    project.claims.find((claim) => claim.kind !== "role")
  );
}

export function projectPeriod(project: FullProjectRecord) {
  return project.endedAt
    ? `${project.startedAt}–${project.endedAt}`
    : `${project.startedAt}–present`;
}

export function momentVisual(moment?: MomentRecord) {
  return moment?.assets.find(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" && asset.mediaKind === "image",
  );
}
