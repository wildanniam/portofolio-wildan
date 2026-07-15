import { loadContentBundle } from "../src/content/repository.node.ts";
import {
  ATLAS_MEDIA_BUDGETS,
  auditReadyAssetFiles,
  auditVisualFile,
  BRAND_MEDIA_BUDGET_BYTES,
  detectFfprobe,
  DOCUMENTARY_MEDIA_BUDGETS,
  probeVideoWithFfprobe,
} from "./lib/media-audit.mjs";

const repositoryRoot = process.cwd();
const content = loadContentBundle({ repositoryRoot });
const atlasAssetIds = new Set(
  content.homepage.projectStages.flatMap((stage) => stage.artifactAssetIds),
);
const readyAssets = [
  ...(content.profile.portrait
    ? [
        {
          asset: content.profile.portrait,
          owner: "profile",
          isSocialImage: false,
          budgets: DOCUMENTARY_MEDIA_BUDGETS,
        },
      ]
    : []),
  ...content.projects.flatMap((project) =>
    project.evidence
      .filter((asset) => asset.status === "ready")
      .map((asset) => ({
        asset,
        owner: `project:${project.slug}`,
        isSocialImage: project.socialImageAssetId === asset.id,
        budgets: atlasAssetIds.has(asset.id) ? ATLAS_MEDIA_BUDGETS : undefined,
      })),
  ),
  ...content.moments.flatMap((moment) =>
    moment.assets
      .filter((asset) => asset.status === "ready")
      .map((asset) => ({
        asset,
        owner: `moment:${moment.id}`,
        isSocialImage: false,
        budgets: DOCUMENTARY_MEDIA_BUDGETS,
      })),
  ),
];
const brandAssets = content.projects.flatMap((project) => {
  if (!project.branding) return [];
  return [
    { asset: project.branding.mark, role: "mark" },
    ...(project.branding.wordmark
      ? [{ asset: project.branding.wordmark, role: "wordmark" }]
      : []),
  ].map(({ asset, role }) => ({ asset, owner: `project:${project.slug}:brand:${role}` }));
});

const includesVideo = readyAssets.some(({ asset }) => asset.mediaKind === "video");
const ffprobeExecutable = includesVideo ? await detectFfprobe() : null;
const probeVideo = ffprobeExecutable
  ? (file) => probeVideoWithFfprobe(file, ffprobeExecutable)
  : null;
const requireFfprobe = process.env.MEDIA_AUDIT_REQUIRE_FFPROBE === "1";
const failures = [];
const warnings = [];
const summaries = [];

for (const { asset, owner, isSocialImage, budgets } of readyAssets) {
  const result = await auditReadyAssetFiles({
    repositoryRoot,
    asset,
    owner,
    isSocialImage,
    budgets,
    probeVideo,
    requireFfprobe,
  });
  failures.push(...result.failures);
  warnings.push(...result.warnings);
  summaries.push(...result.summaries);
}

for (const { asset, owner } of brandAssets) {
  const result = await auditVisualFile({
    repositoryRoot,
    src: asset.src,
    width: asset.width,
    height: asset.height,
    declaredKind: asset.src.toLowerCase().endsWith(".svg") ? "svg" : "image",
    label: `${owner}/${asset.id}`,
    byteBudget: BRAND_MEDIA_BUDGET_BYTES,
  });
  failures.push(...result.failures);
  warnings.push(...result.warnings);
  if (result.summary) summaries.push(result.summary);
}

for (const summary of summaries) console.log(`✓ ${summary}`);
for (const warning of warnings) console.warn(`⚠ ${warning}`);

if (failures.length > 0) {
  console.error(`\nPublic media audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`\nPublic media audit passed for ${summaries.length} file(s).`);
}
