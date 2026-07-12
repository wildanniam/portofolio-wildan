#!/usr/bin/env node

import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import sharp from "sharp";

const root = process.cwd();
const screenshotDirectory = resolve(
  root,
  ".quality-reports/content/screenshots",
);
const outputDirectory = resolve(root, ".quality-reports/release");

const surfaces = [
  {
    label: "Homepage",
    desktop: "desktop-home.png",
    mobile: "mobile-home.png",
  },
  {
    label: "Fradium",
    desktop: "desktop-case-study.png",
    mobile: "mobile-case-study.png",
  },
  {
    label: "Nova AI",
    desktop: "nova-ai-desktop.png",
    mobile: "nova-ai-mobile.png",
  },
  {
    label: "PayGate",
    desktop: "paygate-desktop.png",
    mobile: "paygate-mobile.png",
  },
  {
    label: "Quorum",
    desktop: "quorum-desktop.png",
    mobile: "quorum-mobile.png",
  },
  {
    label: "Moments layout fixture",
    desktop: "moments-layout-qa-1440.png",
    mobile: "moments-layout-qa-390.png",
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function labelSvg(label, width, height) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f4f0e8" />
      <text x="14" y="22" fill="#171916" font-family="Arial, sans-serif" font-size="14" font-weight="700">${escapeXml(label)}</text>
    </svg>
  `);
}

async function makeTile({ file, height, label, width }) {
  const labelHeight = 34;
  const image = await sharp(resolve(screenshotDirectory, file))
    .resize({ fit: "cover", height, position: "top", width })
    .webp({ quality: 82 })
    .toBuffer();

  return sharp({
    create: {
      background: "#d7d1c5",
      channels: 4,
      height: height + labelHeight + 2,
      width: width + 2,
    },
  })
    .composite([
      { input: labelSvg(label, width, labelHeight), left: 1, top: 1 },
      { input: image, left: 1, top: labelHeight + 1 },
    ])
    .webp({ quality: 84 })
    .toBuffer();
}

async function createSheet({ fileKey, output, tileHeight, tileWidth }) {
  const columns = 3;
  const rows = 2;
  const gap = 22;
  const padding = 28;
  const labelHeight = 36;
  const tiles = await Promise.all(
    surfaces.map((surface) =>
      makeTile({
        file: surface[fileKey],
        height: tileHeight,
        label: surface.label,
        width: tileWidth,
      }),
    ),
  );
  const framedWidth = tileWidth + 2;
  const framedHeight = tileHeight + labelHeight;
  const width = padding * 2 + columns * framedWidth + (columns - 1) * gap;
  const height = padding * 2 + rows * framedHeight + (rows - 1) * gap;

  await sharp({
    create: { background: "#ece8df", channels: 4, height, width },
  })
    .composite(
      tiles.map((input, index) => ({
        input,
        left: padding + (index % columns) * (framedWidth + gap),
        top: padding + Math.floor(index / columns) * (framedHeight + gap),
      })),
    )
    .webp({ quality: 84 })
    .toFile(resolve(outputDirectory, output));
}

mkdirSync(outputDirectory, { recursive: true });
await Promise.all([
  createSheet({
    fileKey: "desktop",
    output: "approval-desktop.webp",
    tileHeight: 300,
    tileWidth: 480,
  }),
  createSheet({
    fileKey: "mobile",
    output: "approval-mobile.webp",
    tileHeight: 563,
    tileWidth: 260,
  }),
]);

console.log(
  `Release approval sheets: ${resolve(outputDirectory, "approval-desktop.webp")} and ${resolve(outputDirectory, "approval-mobile.webp")}`,
);
