#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import sharp from "sharp";

const output = resolve(
  process.cwd(),
  "public/media/site/open-proving-ground-social.png",
);
const image = Buffer.from(`
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#f2f0e9" />
    <path d="M48 48H1152M48 582H1152" stroke="#171916" stroke-width="2" />
    <text x="48" y="88" fill="#171916" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">WSN</text>
    <text x="1152" y="88" text-anchor="end" fill="#3157ff" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="2">THE OPEN PROVING GROUND</text>

    <text x="48" y="238" fill="#0f110f" font-family="Arial, Helvetica, sans-serif" font-size="94" font-weight="700" letter-spacing="-5">Wildan</text>
    <text x="48" y="330" fill="#0f110f" font-family="Arial, Helvetica, sans-serif" font-size="94" font-weight="700" letter-spacing="-5">Syukri Niam</text>

    <path d="M716 160V452" stroke="#a8a79f" stroke-width="1" />
    <text x="764" y="224" fill="#171916" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">
      <tspan x="764" dy="0">Software Engineer</tspan>
      <tspan x="764" dy="44">building AI agents</tspan>
      <tspan x="764" dy="44">and Web3 systems.</tspan>
    </text>
    <text x="764" y="395" fill="#4c4d48" font-family="Arial, Helvetica, sans-serif" font-size="20">
      <tspan x="764" dy="0">Evidence-led case studies.</tspan>
      <tspan x="764" dy="31">Inspectable decisions.</tspan>
      <tspan x="764" dy="31">Documentary moments.</tspan>
    </text>

    <text x="48" y="548" fill="#3157ff" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="1.5">FRADIUM / NOVA AI / PAYGATE / QUORUM</text>
    <text x="1152" y="548" text-anchor="end" fill="#171916" font-family="Arial, Helvetica, sans-serif" font-size="17">wildanniam.dev</text>
  </svg>
`);

await mkdir(dirname(output), { recursive: true });
await sharp(image).png({ compressionLevel: 9 }).toFile(output);
console.log(`Generated ${output}`);
