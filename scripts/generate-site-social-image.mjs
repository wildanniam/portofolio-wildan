#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import sharp from "sharp";

const output = resolve(
  process.cwd(),
  "public/media/site/personal-field-notes-social.webp",
);
const source = resolve(
  process.cwd(),
  "public/media/moments/refactory-build-room/main.webp",
);

await mkdir(dirname(output), { recursive: true });
await sharp(source)
  .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
  .webp({ effort: 6, quality: 78, smartSubsample: true })
  .toFile(output);
console.log(`Prepared authentic social derivative at ${output}`);
