import { loadContentBundle } from "../src/content/repository.node.ts";
import {
  auditReadyAssetFiles,
  detectFfprobe,
  probeVideoWithFfprobe,
} from "./lib/media-audit.mjs";

const repositoryRoot = process.cwd();
const content = loadContentBundle({ repositoryRoot });
const readyAssets = [
  ...content.projects.flatMap((project) =>
    project.evidence
      .filter((asset) => asset.status === "ready")
      .map((asset) => ({
        asset,
        owner: `project:${project.slug}`,
        isSocialImage: project.socialImageAssetId === asset.id,
      })),
  ),
  ...content.moments.flatMap((moment) =>
    moment.assets
      .filter((asset) => asset.status === "ready")
      .map((asset) => ({
        asset,
        owner: `moment:${moment.id}`,
        isSocialImage: false,
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

for (const { asset, owner, isSocialImage } of readyAssets) {
  const result = await auditReadyAssetFiles({
    repositoryRoot,
    asset,
    owner,
    isSocialImage,
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
