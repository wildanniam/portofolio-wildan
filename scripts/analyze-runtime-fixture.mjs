#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { constants as zlibConstants, gzipSync } from "node:zlib";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const fixtureDirectory = join(
  repositoryRoot,
  "tests",
  "fixtures",
  "server-only-app",
);
const buildDirectory = join(fixtureDirectory, ".next");
const nextBinary = join(
  repositoryRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const nextPackagePath = join(
  repositoryRoot,
  "node_modules",
  "next",
  "package.json",
);
const reportPath = join(
  repositoryRoot,
  ".quality-reports",
  "runtime-fixture.json",
);

function fail(message) {
  throw new Error(message);
}

function readJson(path, label) {
  if (!existsSync(path)) {
    fail(`${label} is missing at ${path}.`);
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${label} is malformed: ${error.message}`);
  }
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function readGitCommit() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function normalizeManifestAsset(asset) {
  if (typeof asset !== "string" || asset.length === 0) {
    fail(`A build manifest contains an invalid asset path: ${String(asset)}.`);
  }

  const normalized = asset
    .split(/[?#]/, 1)[0]
    .replace(/^\/_next\//, "")
    .replace(/^\/+/, "");

  if (!normalized) {
    fail(`A build manifest contains an empty asset path: ${asset}.`);
  }

  return normalized;
}

function measureAsset(asset) {
  const normalized = normalizeManifestAsset(asset);
  const absolutePath = resolve(buildDirectory, normalized);
  const relativePath = relative(buildDirectory, absolutePath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    fail(`A manifest asset escapes the fixture build directory: ${asset}.`);
  }

  if (!existsSync(absolutePath)) {
    fail(`A manifest asset is missing from the fixture build: ${normalized}.`);
  }

  const source = readFileSync(absolutePath);

  return {
    path: normalized,
    rawBytes: source.byteLength,
    gzipBytes: gzipSync(source, {
      level: zlibConstants.Z_BEST_COMPRESSION,
    }).byteLength,
  };
}

function measureGroup(assets) {
  const files = uniqueSorted(assets).map(measureAsset);

  return {
    rawBytes: files.reduce((total, file) => total + file.rawBytes, 0),
    gzipBytes: files.reduce((total, file) => total + file.gzipBytes, 0),
    files,
  };
}

function parseClientReferenceManifest(path) {
  if (!existsSync(path)) {
    fail(`Client-reference manifest is missing at ${path}.`);
  }

  const source = readFileSync(path, "utf8");
  const marker = 'globalThis.__RSC_MANIFEST["/page"] = ';
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    fail('Client-reference manifest does not contain the expected "/page" entry.');
  }

  const jsonStart = markerIndex + marker.length;
  const jsonEnd = source.indexOf(";", jsonStart);

  if (jsonEnd === -1) {
    fail('Client-reference manifest has an unterminated "/page" entry.');
  }

  try {
    return JSON.parse(source.slice(jsonStart, jsonEnd));
  } catch (error) {
    fail(`Client-reference manifest contains malformed JSON: ${error.message}`);
  }
}

function selectEntryKey(entries, segment, { required = true } = {}) {
  const suffix = `/app/${segment}`;
  const matches = Object.keys(entries ?? {}).filter((key) =>
    key.replace(/ <module evaluation>$/, "").endsWith(suffix),
  );

  if (matches.length === 0 && !required) {
    return null;
  }

  if (matches.length !== 1) {
    fail(
      `Expected one ${segment} client entry, found ${matches.length}: ` +
        `${matches.join(", ") || "none"}.`,
    );
  }

  return matches[0];
}

function cssPaths(files) {
  return (files ?? []).map((file) => {
    if (typeof file === "string") return file;
    if (file && typeof file.path === "string") return file.path;
    fail(`Client-reference manifest contains an invalid CSS entry: ${String(file)}.`);
  });
}

function buildFixture() {
  if (!existsSync(nextBinary) || !existsSync(nextPackagePath)) {
    fail("The installed Next.js runtime is missing. Run npm ci before analysis.");
  }

  rmSync(buildDirectory, { force: true, recursive: true });

  const result = spawnSync(
    process.execPath,
    [nextBinary, "build", fixtureDirectory, "--turbopack"],
    {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        CI: "1",
        NEXT_TELEMETRY_DISABLED: "1",
        NODE_ENV: "production",
      },
      stdio: "inherit",
    },
  );

  if (result.error) {
    fail(`Unable to start the fixture build: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`The fixture build exited with status ${String(result.status)}.`);
  }
}

function createReport() {
  const buildManifest = readJson(
    join(buildDirectory, "build-manifest.json"),
    "Build manifest",
  );
  const appPathsManifest = readJson(
    join(buildDirectory, "server", "app-paths-manifest.json"),
    "App paths manifest",
  );
  const clientManifest = parseClientReferenceManifest(
    join(buildDirectory, "server", "app", "page_client-reference-manifest.js"),
  );
  const nextPackage = readJson(nextPackagePath, "Next.js package metadata");

  if (appPathsManifest["/page"] !== "app/page.js") {
    fail('Fixture app-paths manifest does not map "/page" to "app/page.js".');
  }

  if (
    !Array.isArray(buildManifest.rootMainFiles) ||
    buildManifest.rootMainFiles.length === 0
  ) {
    fail("Build manifest does not contain Next.js root runtime files.");
  }

  const entryJs = clientManifest.entryJSFiles;
  const entryCss = clientManifest.entryCSSFiles;

  if (!entryJs || typeof entryJs !== "object" || Array.isArray(entryJs)) {
    fail("Client-reference manifest does not contain entryJSFiles.");
  }

  if (!entryCss || typeof entryCss !== "object" || Array.isArray(entryCss)) {
    fail("Client-reference manifest does not contain entryCSSFiles.");
  }

  const layoutKey = selectEntryKey(entryJs, "layout");
  // A genuinely server-only page has no page entry in entryJSFiles. The layout
  // still carries the framework boundary chunk, which is the shared floor we
  // want to measure.
  const pageKey = selectEntryKey(entryJs, "page", { required: false });
  const runtimeAssets = uniqueSorted(buildManifest.rootMainFiles);
  const runtimeAssetSet = new Set(runtimeAssets.map(normalizeManifestAsset));
  const sharedAssets = uniqueSorted([
    ...(entryJs[layoutKey] ?? []),
    ...(pageKey ? (entryJs[pageKey] ?? []) : []),
  ]).filter((asset) => !runtimeAssetSet.has(normalizeManifestAsset(asset)));
  const cssAssets = uniqueSorted([
    ...cssPaths(entryCss[layoutKey]),
    ...cssPaths(pageKey ? entryCss[pageKey] : []),
  ]);

  const runtimeJavaScript = measureGroup(runtimeAssets);
  const sharedJavaScript = measureGroup(sharedAssets);
  const css = measureGroup(cssAssets);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    gitCommit: readGitCommit(),
    fixture: "tests/fixtures/server-only-app",
    command: "next build tests/fixtures/server-only-app --turbopack",
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    nextVersion: nextPackage.version,
    classification: {
      runtimeJavaScript: "Next build-manifest rootMainFiles",
      sharedJavaScript: "Fixture layout/page entry JS excluding runtime files",
      css: "Fixture layout/page entry CSS",
      polyfills: "Reported as excluded because modern module browsers do not request nomodule polyfills",
    },
    entries: {
      layout: layoutKey,
      page: pageKey,
      pageEntryExpected: false,
    },
    metrics: {
      runtimeJavaScript,
      sharedJavaScript,
      totalInitialJavaScript: {
        rawBytes: runtimeJavaScript.rawBytes + sharedJavaScript.rawBytes,
        gzipBytes: runtimeJavaScript.gzipBytes + sharedJavaScript.gzipBytes,
      },
      css,
    },
    excluded: {
      polyfillFiles: uniqueSorted(buildManifest.polyfillFiles ?? []),
    },
    enforcement: {
      enabled: false,
      reason: "This fixture records the installed framework floor and does not invent a budget.",
    },
  };
}

try {
  buildFixture();
  const report = createReport();
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`\nRuntime fixture report: ${relative(repositoryRoot, reportPath)}`);
  console.log(
    `  Runtime JavaScript: ${report.metrics.runtimeJavaScript.gzipBytes} gzip bytes`,
  );
  console.log(
    `  Shared JavaScript:  ${report.metrics.sharedJavaScript.gzipBytes} gzip bytes`,
  );
  console.log(`  CSS:                ${report.metrics.css.gzipBytes} gzip bytes`);
} catch (error) {
  console.error(`\nRuntime fixture analysis failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(buildDirectory, { force: true, recursive: true });
}
