#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import sharp from "sharp";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(import.meta.dirname, "..");
const sourceRoot = process.env.MOMENT_SOURCE_DIR ?? join(homedir(), "Downloads");
const reviewRoot = resolve(repositoryRoot, ".quality-reports/moments-review");
const outputRoot = resolve(
  reviewRoot,
  process.env.MOMENT_REVIEW_OUTPUT ?? ".",
);
const srgbProfile = "/System/Library/ColorSync/Profiles/sRGB Profile.icc";

const reviewRelativePath = relative(reviewRoot, outputRoot);
if (
  reviewRelativePath.startsWith(`..${sep}`) ||
  reviewRelativePath === ".." ||
  isAbsolute(reviewRelativePath)
) {
  throw new Error(
    "MOMENT_REVIEW_OUTPUT must stay inside .quality-reports/moments-review.",
  );
}

const moments = [
  {
    id: "learning-in-public",
    label: "01 / Learning in public",
    source: "IMG_2331.heic",
    ratio: [3, 2],
    focalPoint: { x: 0.55, y: 0.34 },
    desktopWidth: 1440,
  },
  {
    id: "fradium-wchl-team",
    label: "02 / Fradium outcome",
    source: "PHOTO-2025-11-01-10-16-29 3.JPG",
    ratio: [3, 4],
    focalPoint: { x: 0.5, y: 0.52 },
    desktopWidth: 960,
    mobileWidth: 600,
  },
  {
    id: "self-healing-research",
    label: "03 / Research milestone",
    source: "IMG_5499.HEIC",
    ratio: [4, 5],
    focalPoint: { x: 0.5, y: 0.58 },
    desktopWidth: 1200,
    redactions: [
      // Student-identifying line on the laptop screen; the research title remains.
      {
        x: 0.32,
        y: 0.585,
        width: 0.16,
        height: 0.025,
        fill: "#f4f4f2",
      },
    ],
  },
  {
    id: "nova-lisk-team",
    label: "04 / Nova outcome",
    source: "IMG_7463 2.HEIC",
    ratio: [4, 3],
    focalPoint: { x: 0.51, y: 0.59 },
    desktopWidth: 1200,
    mobileWidth: 800,
  },
  {
    id: "specheal-refactory-team",
    label: "05 / SpecHeal outcome",
    source: "FullSizeRender 5.JPG",
    ratio: [4, 5],
    focalPoint: { x: 0.5, y: 0.68 },
    desktopWidth: 1200,
  },
  {
    id: "refactory-build-room",
    label: "06 / Building under pressure",
    source: "DSC02164.JPG",
    ratio: [3, 2],
    focalPoint: { x: 0.42, y: 0.56 },
    desktopWidth: 1440,
    mobileWidth: 800,
  },
  {
    id: "serambi-bank-indonesia",
    label: "07 / SERAMBI 2026",
    source: "IMG_0313 2.HEIC",
    ratio: [4, 5],
    focalPoint: { x: 0.5, y: 0.47 },
    zoom: 0.9,
    desktopWidth: 1200,
  },
  {
    id: "builder-portrait",
    label: "Portrait / About",
    source: "ab102d36-feaa-4abc-9e27-c697ae78e648 3.JPG",
    ratio: [4, 5],
    focalPoint: { x: 0.56, y: 0.5 },
    zoom: 0.72,
    desktopWidth: 1200,
  },
];

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function cropBox(width, height, ratio, focalPoint, zoom = 1) {
  const targetRatio = ratio[0] / ratio[1];
  let cropWidth;
  let cropHeight;

  if (width / height > targetRatio) {
    cropHeight = height;
    cropWidth = Math.round(height * targetRatio);
  } else {
    cropWidth = width;
    cropHeight = Math.round(width / targetRatio);
  }

  cropWidth = Math.max(1, Math.round(cropWidth * zoom));
  cropHeight = Math.max(1, Math.round(cropHeight * zoom));

  const left = clamp(
    Math.round(focalPoint.x * width - cropWidth / 2),
    0,
    width - cropWidth,
  );
  const top = clamp(
    Math.round(focalPoint.y * height - cropHeight / 2),
    0,
    height - cropHeight,
  );

  return { left, top, width: cropWidth, height: cropHeight };
}

async function convertToSrgbJpeg(sourcePath, destinationPath) {
  await execFileAsync("sips", [
    "-s",
    "format",
    "jpeg",
    "--matchTo",
    srgbProfile,
    sourcePath,
    "--out",
    destinationPath,
  ]);
}

async function redactImage(buffer, redactions = []) {
  if (redactions.length === 0) return buffer;

  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Cannot redact an image without dimensions.");
  }

  const composites = [];
  for (const region of redactions) {
    const left = clamp(Math.round(region.x * metadata.width), 0, metadata.width - 1);
    const top = clamp(Math.round(region.y * metadata.height), 0, metadata.height - 1);
    const width = clamp(
      Math.round(region.width * metadata.width),
      1,
      metadata.width - left,
    );
    const height = clamp(
      Math.round(region.height * metadata.height),
      1,
      metadata.height - top,
    );
    if (!region.fill) {
      throw new Error("Sensitive review regions require an irreversible fill.");
    }
    const patch = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: region.fill,
      },
    })
      .png()
      .toBuffer();
    composites.push({ input: patch, left, top });
  }

  return sharp(buffer).composite(composites).toBuffer();
}

export async function boundedWebp(
  buffer,
  destinationPath,
  width,
  maximumBytes,
) {
  let quality = 78;
  let encoded;

  do {
    encoded = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ effort: 6, quality, smartSubsample: true })
      .toBuffer();
    quality -= 3;
  } while (encoded.length > maximumBytes && quality >= 60);

  if (encoded.length > maximumBytes) {
    throw new Error(
      `${destinationPath} is ${encoded.length} bytes and exceeds the ${maximumBytes}-byte budget at the minimum review quality. Reduce dimensions or revise the crop.`,
    );
  }

  await writeFile(destinationPath, encoded);
  const metadata = await sharp(encoded).metadata();
  return {
    bytes: encoded.length,
    height: metadata.height,
    quality: quality + 3,
    width: metadata.width,
  };
}

async function prepareMoment(moment, temporaryRoot, derivativeRoot) {
  const sourcePath = join(sourceRoot, moment.source);
  const convertedPath = join(temporaryRoot, `${moment.id}.jpg`);
  await readFile(sourcePath);
  await convertToSrgbJpeg(sourcePath, convertedPath);

  const { data: upright, info: uprightInfo } = await sharp(convertedPath)
    .rotate()
    .jpeg({ quality: 96 })
    .toBuffer({ resolveWithObject: true });
  if (!uprightInfo.width || !uprightInfo.height) {
    throw new Error(`Missing dimensions for ${basename(sourcePath)}`);
  }

  const box = cropBox(
    uprightInfo.width,
    uprightInfo.height,
    moment.ratio,
    moment.focalPoint,
    moment.zoom,
  );
  const cropped = await sharp(upright).extract(box).toBuffer();
  const redacted = await redactImage(cropped, moment.redactions);
  const momentRoot = join(derivativeRoot, moment.id);
  await mkdir(momentRoot, { recursive: true });

  const desktop = await boundedWebp(
    redacted,
    join(momentRoot, "review.webp"),
    moment.desktopWidth,
    200 * 1024,
  );
  const mobile = await boundedWebp(
    redacted,
    join(momentRoot, "review-mobile.webp"),
    moment.mobileWidth ?? 720,
    140 * 1024,
  );

  return {
    id: moment.id,
    label: moment.label,
    source: moment.source,
    crop: box,
    focalPoint: moment.focalPoint,
    redactions: moment.redactions ?? [],
    desktop,
    mobile,
  };
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function makeReviewSheet(results, derivativeRoot) {
  const cellWidth = 560;
  const cellHeight = 760;
  const gap = 32;
  const columns = 2;
  const rows = Math.ceil(results.length / columns);
  const width = columns * cellWidth + (columns + 1) * gap;
  const height = rows * cellHeight + (rows + 1) * gap + 120;
  const composites = [];

  for (const [index, result] of results.entries()) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = gap + column * (cellWidth + gap);
    const top = 120 + gap + row * (cellHeight + gap);
    const imageBuffer = await sharp(
      join(derivativeRoot, result.id, "review.webp"),
    )
      .resize({ width: cellWidth, height: cellHeight - 76, fit: "contain" })
      .extend({
        top: 0,
        bottom: 76,
        left: 0,
        right: 0,
        background: "#f4f5f3",
      })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${cellWidth}" height="76"><style>text{font-family:Arial,sans-serif;fill:#111315}.label{font-size:20px;font-weight:700}.meta{font-size:14px;fill:#5f646b}</style><text class="label" x="0" y="30">${escapeXml(result.label)}</text><text class="meta" x="0" y="56">${result.desktop.width}×${result.desktop.height} · ${(result.desktop.bytes / 1024).toFixed(0)} KB · q${result.desktop.quality}</text></svg>`,
          ),
          top: cellHeight - 76,
          left: 0,
        },
      ])
      .webp({ quality: 82 })
      .toBuffer();
    composites.push({ input: imageBuffer, left, top });
  }

  const heading = Buffer.from(
    `<svg width="${width}" height="120"><style>text{font-family:Arial,sans-serif;fill:#111315}.title{font-size:34px;font-weight:700}.meta{font-size:16px;fill:#5f646b}</style><text class="title" x="${gap}" y="52">The Open Proving Ground / Moment crop review</text><text class="meta" x="${gap}" y="84">Private review derivative · sRGB · metadata stripped · redactions applied</text></svg>`,
  );

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#f4f5f3",
    },
  })
    .composite([{ input: heading, left: 0, top: 0 }, ...composites])
    .webp({ effort: 6, quality: 82 })
    .toFile(join(outputRoot, "moment-crop-review.webp"));
}

async function main() {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "portfolio-moments-"));
  const derivativeRoot = join(outputRoot, "derivatives");
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(derivativeRoot, { recursive: true });

  try {
    const results = [];
    for (const moment of moments) {
      results.push(await prepareMoment(moment, temporaryRoot, derivativeRoot));
    }
    await makeReviewSheet(results, derivativeRoot);
    await writeFile(
      join(outputRoot, "manifest.json"),
      `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
    );

    const sheet = await stat(join(outputRoot, "moment-crop-review.webp"));
    console.log(
      `Prepared ${results.length} review crops in ${outputRoot} (${Math.round(sheet.size / 1024)} KB sheet).`,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
