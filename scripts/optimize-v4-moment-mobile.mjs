#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import sharp from "sharp";

const targetBytes = 26 * 1024;
const minimumQuality = 38;
const moments = [
  { id: "refactory-build-room", width: 720, height: 480 },
  { id: "fradium-wchl-team", width: 500, height: 667 },
  { id: "self-healing-research", width: 500, height: 624 },
  { id: "learning-in-public", width: 600, height: 400 },
  { id: "nova-lisk-team", width: 600, height: 450 },
  { id: "specheal-refactory-team", width: 500, height: 625 },
  { id: "serambi-bank-indonesia", width: 500, height: 625 },
];

async function encode({ height, id, width }) {
  const root = resolve("public/media/moments", id);
  const source = await readFile(resolve(root, "main.webp"));
  let quality = 76;
  let output;

  do {
    output = await sharp(source)
      .resize({ width, height, fit: "fill" })
      .webp({ effort: 6, quality, smartSubsample: true })
      .toBuffer();
    if (output.length <= targetBytes) break;
    quality -= 2;
  } while (quality >= minimumQuality);

  if (!output || output.length > targetBytes) {
    throw new Error(
      `${id} cannot meet ${targetBytes} bytes without dropping below quality ${minimumQuality}.`,
    );
  }

  await writeFile(resolve(root, "mobile.webp"), output);
  console.log(
    `${id}: ${width}x${height}, ${(output.length / 1024).toFixed(1)} KiB, q${quality}`,
  );
}

for (const moment of moments) {
  await encode(moment);
}
