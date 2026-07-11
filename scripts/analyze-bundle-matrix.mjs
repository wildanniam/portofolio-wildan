#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const configPath = resolve(root, "quality/budgets.json");
const analyzerPath = resolve(root, "scripts/analyze-bundle.mjs");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const profileName = process.env.QUALITY_PROFILE ?? config.activeProfile;
const profile = config.profiles?.[profileName];

if (!profile) {
  throw new Error(`Unknown bundle profile: ${String(profileName)}.`);
}

if (!Array.isArray(profile.samples) || profile.samples.length === 0) {
  throw new Error(`Bundle profile ${profileName} must define route samples.`);
}

const sampleViewports = profile.sampleViewports ?? [profile.defaultViewport ?? "desktop"];
if (!Array.isArray(sampleViewports) || sampleViewports.length === 0) {
  throw new Error(`Bundle profile ${profileName} must define sampleViewports.`);
}
for (const viewport of sampleViewports) {
  if (typeof viewport !== "string" || !config.viewports?.[viewport]) {
    throw new Error(`Invalid viewport sample in ${profileName}: ${String(viewport)}.`);
  }
}

let sampleIndex = 0;
sampleLoop:
for (const route of profile.samples) {
  if (typeof route !== "string" || !route.startsWith("/")) {
    throw new Error(`Invalid route sample in ${profileName}: ${String(route)}.`);
  }

  for (const viewport of sampleViewports) {
    const slug = route === "/" ? "root" : route.slice(1).replaceAll("/", "-");
    const output =
      sampleIndex === 0
        ? ".quality-reports/bundle.json"
        : `.quality-reports/bundle-${slug}-${viewport}.json`;
    sampleIndex += 1;
    const result = spawnSync(
      process.execPath,
      [
        analyzerPath,
        "--profile",
        profileName,
        "--route",
        route,
        "--viewport",
        viewport,
        "--output",
        output,
      ],
      {
        cwd: root,
        env: process.env,
        stdio: "inherit",
      },
    );

    if (result.error) throw result.error;
    if (result.status !== 0) {
      process.exitCode = result.status ?? 1;
      break sampleLoop;
    }
  }
}
