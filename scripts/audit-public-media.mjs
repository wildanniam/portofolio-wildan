import { loadContentBundle } from "../src/content/repository.node.ts";
import {
  auditReadyAssetFiles,
  detectFfprobe,
  DOCUMENTARY_MEDIA_BUDGETS,
  probeVideoWithFfprobe,
} from "./lib/media-audit.mjs";

const repositoryRoot = process.cwd();
const content = loadContentBundle({ repositoryRoot });
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
        budgets: undefined,
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

for (const summary of summaries) console.log(`✓ ${summary}`);
for (const warning of warnings) console.warn(`⚠ ${warning}`);

if (failures.length > 0) {
  console.error(`\nPublic media audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`\nPublic media audit passed for ${summaries.length} file(s).`);
}
