import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

import sharp from "sharp";

const repositoryRoot = resolve(import.meta.dirname, "..");
const projectsRoot = resolve(
  process.env.PORTFOLIO_SOURCE_PROJECTS_ROOT ?? resolve(repositoryRoot, ".."),
);
const publicRoot = resolve(repositoryRoot, "public");

const repositories = {
  fradium: {
    root: resolve(projectsRoot, "fradium"),
    revision: "370cd9724f501d440fc9618cf9c9f4b6b9c6cc9e",
  },
  nova: {
    root: resolve(projectsRoot, "nova-wallet"),
    revision: "38b03a80c9c4d85c767013188df2b77f0eda20b8",
  },
  paygate: {
    root: resolve(projectsRoot, "paygate"),
    revision: "69fe93085c5816e3943cb4e16846ab231c50f1da",
  },
  quorum: {
    root: resolve(projectsRoot, "Quorum"),
    revision: "c0b81665368381dd3f7ae323ef88b221f05ff2fe",
  },
};

function verifyRevision(name) {
  const repository = repositories[name];
  const revision = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repository.root,
    encoding: "utf8",
  }).trim();

  if (revision !== repository.revision) {
    throw new Error(
      `${name} source revision changed: expected ${repository.revision}, received ${revision}. ` +
        "Review and update provenance before regenerating portfolio assets.",
    );
  }
}

function source(name, path) {
  return resolve(repositories[name].root, path);
}

function destination(path) {
  const absolute = resolve(publicRoot, path);
  if (!absolute.startsWith(`${publicRoot}/`)) {
    throw new Error(`Output escapes public directory: ${path}`);
  }
  return absolute;
}

async function ensureParent(path) {
  await mkdir(dirname(path), { recursive: true });
}

async function writeSvg({ from, to, stripFigmaBackdrop = false }) {
  let input = await readFile(from, "utf8");
  if (stripFigmaBackdrop) {
    const foreignObjects = input.match(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi) ?? [];
    if (foreignObjects.length !== 1) {
      throw new Error(
        `Expected exactly one Figma backdrop foreignObject in ${from}, received ${foreignObjects.length}.`,
      );
    }
    input = input.replace(foreignObjects[0], "");
  }
  if (/\b(?:href|src)=["']https?:\/\//i.test(input)) {
    throw new Error(`External SVG resource is not allowed: ${from}`);
  }
  if (/data:image\//i.test(input)) {
    throw new Error(`Embedded raster data is not allowed in Atlas SVG: ${from}`);
  }

  await ensureParent(to);
  await writeFile(to, input.trim().concat("\n"), "utf8");
}

async function writeRaster({ from, to, extract, width, quality = 82 }) {
  let pipeline = sharp(from, { failOn: "warning" }).rotate();
  if (extract) pipeline = pipeline.extract(extract);
  if (width) {
    pipeline = pipeline.resize({
      width,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  await ensureParent(to);
  await pipeline
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(to);
}

const jobs = [
  {
    type: "svg",
    from: source("fradium", "src/frontend/public/logo.svg"),
    to: destination("media/projects/fradium/brand/mark.svg"),
  },
  {
    type: "svg",
    from: source("fradium", "src/frontend/public/assets/logo-fradium.svg"),
    to: destination("media/projects/fradium/brand/wordmark.svg"),
  },
  {
    type: "raster",
    from: source("nova", "public/navbar/navbar-icon.png"),
    to: destination("media/projects/nova-ai/brand/mark.png"),
    preserveFormat: true,
  },
  {
    type: "raster",
    from: source("nova", "public/nova-logo.webp"),
    to: destination("media/projects/nova-ai/brand/wordmark.webp"),
    width: 320,
    quality: 78,
  },
  {
    type: "svg",
    from: source("paygate", "frontend/public/brand/paygate-mark.svg"),
    to: destination("media/projects/paygate/brand/mark.svg"),
  },
  {
    type: "svg",
    from: source("quorum", "public/figma/landing/quorum-mark.svg"),
    to: destination("media/projects/quorum/brand/mark.svg"),
  },
  {
    type: "svg",
    from: source("quorum", "public/figma/landing/quorum-logo.svg"),
    to: destination("media/projects/quorum/brand/wordmark.svg"),
  },
  {
    type: "svg",
    from: source("quorum", "public/figma/landing/feature-split-rail.svg"),
    to: destination("media/projects/quorum/atlas/settlement-rail.svg"),
    stripFigmaBackdrop: true,
  },
  {
    type: "raster",
    from: source("fradium", "docs/images/extension-analyze-result.png"),
    to: destination("media/projects/fradium/atlas/wallet-result.webp"),
    width: 420,
  },
  {
    type: "raster",
    from: source("fradium", "docs/images/extension-analyze-result.png"),
    to: destination("media/projects/fradium/atlas/wallet-result-mobile.webp"),
    width: 320,
  },
  {
    type: "raster",
    from: source("fradium", "docs/images/analyze-address.png"),
    to: destination("media/projects/fradium/atlas/send-verdict.webp"),
    extract: { left: 1840, top: 270, width: 1660, height: 2500 },
    width: 480,
  },
  {
    type: "raster",
    from: source("nova", "public/landing-page/let-nova-handle-the-complexity.png"),
    to: destination("media/projects/nova-ai/atlas/workspace.webp"),
    width: 720,
  },
  {
    type: "raster",
    from: source("nova", "public/landing-page/let-nova-handle-the-complexity.png"),
    to: destination("media/projects/nova-ai/atlas/workspace-mobile.webp"),
    width: 350,
  },
  {
    type: "raster",
    from: source("nova", "public/card-assets/one-intent-multiple-actions.png"),
    to: destination("media/projects/nova-ai/atlas/intent.webp"),
    width: 354,
  },
  {
    type: "raster",
    from: source("paygate", "output/scf-report/assets/03-product-request-receipt-final.png"),
    to: destination("media/projects/paygate/atlas/request-receipt.webp"),
    extract: { left: 520, top: 150, width: 860, height: 600 },
    width: 720,
  },
  {
    type: "raster",
    from: source("paygate", "output/scf-report/assets/03-product-request-receipt-final.png"),
    to: destination("media/projects/paygate/atlas/request-receipt-mobile.webp"),
    extract: { left: 520, top: 150, width: 860, height: 600 },
    width: 350,
  },
  {
    type: "raster",
    from: source("paygate", "output/scf-report/assets/02-product-transform-flow-final.png"),
    to: destination("media/projects/paygate/atlas/transform-flow.webp"),
    width: 720,
  },
  {
    type: "raster",
    from: source("quorum", "output/playwright/product-ui-audit-current/pass-receipt-desktop.png"),
    to: destination("media/projects/quorum/atlas/pass-receipt.webp"),
    extract: { left: 31, top: 180, width: 390, height: 1150 },
    width: 390,
  },
  {
    type: "raster",
    from: source("quorum", "output/playwright/product-ui-audit-current/pass-receipt-desktop.png"),
    to: destination("media/projects/quorum/atlas/pass-receipt-mobile.webp"),
    extract: { left: 31, top: 180, width: 390, height: 1150 },
    width: 320,
  },
  {
    type: "raster",
    from: source("quorum", "output/playwright/product-ui-audit-current/collaborator-ledger-desktop.png"),
    to: destination("media/projects/quorum/atlas/settlement-flow.webp"),
    extract: { left: 20, top: 110, width: 1240, height: 980 },
    width: 720,
  },
];

for (const name of Object.keys(repositories)) verifyRevision(name);

for (const job of jobs) {
  if (job.type === "svg") {
    await writeSvg(job);
    continue;
  }

  if (job.preserveFormat) {
    const bytes = await readFile(job.from);
    await ensureParent(job.to);
    await writeFile(job.to, bytes);
    continue;
  }

  await writeRaster(job);
}

const outputs = await Promise.all(
  jobs.map(async ({ to }) => {
    const bytes = await readFile(to);
    return {
      path: `/${to.slice(publicRoot.length + 1)}`,
      bytes: (await stat(to)).size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }),
);

console.log(JSON.stringify({ revisions: repositories, outputs }, null, 2));
