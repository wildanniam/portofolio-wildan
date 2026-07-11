#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const analyzerPath = resolve(root, "scripts/analyze-bundle.mjs");
const previewEnvironment = {
  ...process.env,
  PORTFOLIO_V1_PREVIEW: "1",
  PORTFOLIO_V1_PREVIEW_TOKEN: randomBytes(32).toString("hex"),
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: previewEnvironment,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["run", "build"]);

for (const trigger of ["near", "intent"]) {
  run(process.execPath, [
    analyzerPath,
    "--profile",
    "v1",
    "--route",
    "/preview/open-proving-ground/site",
    "--budget-route",
    "/",
    "--viewport",
    "desktop",
    "--enhancement-trigger",
    trigger,
    "--output",
    `.quality-reports/bundle-v1-explorer-${trigger}.json`,
  ]);
}
