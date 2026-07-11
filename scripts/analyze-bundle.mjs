#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { constants as zlibConstants, gzipSync } from "node:zlib";

import { chromium } from "@playwright/test";

import {
  DEFAULT_METRIC_LABELS,
  analyzeResponseOutcomes,
  appManifestKeyToRoutePattern,
  classifyNetworkFailures,
  evaluateBudget,
  formatMetric,
  routeMatchesPattern,
  selectRouteBudget,
} from "./lib/bundle-budget.mjs";

const DEFAULT_BUILD_DIR = ".next";
const DEFAULT_BUDGET_CONFIG = "quality/budgets.json";
const DEFAULT_OUTPUT = ".quality-reports/bundle.json";
const PRE_INTENT_OBSERVATION_WINDOW_MS = 3_000;
const POST_TRIGGER_SETTLE_WINDOW_MS = 3_000;
const ENHANCEMENT_TRIGGER_VALUES = new Set(["near", "intent"]);

function printHelp() {
  console.log(`Usage: node scripts/analyze-bundle.mjs [options]

Options:
  --route <path>       Public route to inspect (default: /)
  --budget-route <path> Canonical public route whose budget applies
  --profile <name>     Budget profile (default: quality config activeProfile)
  --build-dir <path>   Existing Next production build (default: .next)
  --config <path>      Budget config (default: quality/budgets.json)
  --output <path>      JSON report destination (default: .quality-reports/bundle.json)
  --viewport <name>    Named viewport from quality/budgets.json (default: profile default)
  --enhancement-trigger <near|intent>
                       After the unchanged pre-intent window, trigger the real
                       explorer and measure only additional build JavaScript
  --no-network         Skip the production cold-navigation probe
  --no-enforce         Write the report without returning a failing exit code
  --help               Show this help
`);
}

export function parseArgs(argv) {
  const options = {
    route: "/",
    budgetRoute: undefined,
    profile: undefined,
    buildDir: DEFAULT_BUILD_DIR,
    config: DEFAULT_BUDGET_CONFIG,
    output: DEFAULT_OUTPUT,
    viewport: undefined,
    enhancementTrigger: undefined,
    network: true,
    enforce: true,
    help: false,
  };

  const valueOptions = new Map([
    ["--route", "route"],
    ["--budget-route", "budgetRoute"],
    ["--profile", "profile"],
    ["--build-dir", "buildDir"],
    ["--config", "config"],
    ["--output", "output"],
    ["--viewport", "viewport"],
    ["--enhancement-trigger", "enhancementTrigger"],
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--no-enforce") {
      options.enforce = false;
      continue;
    }

    if (argument === "--no-network") {
      options.network = false;
      continue;
    }

    const equalsIndex = argument.indexOf("=");
    const flag = equalsIndex === -1 ? argument : argument.slice(0, equalsIndex);
    const property = valueOptions.get(flag);

    if (!property) {
      throw new Error(`Unknown option: ${argument}`);
    }

    const inlineValue =
      equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1);
    const value = inlineValue ?? argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`${flag} requires a value.`);
    }

    options[property] = value;
    if (inlineValue === undefined) index += 1;
  }

  if (
    options.enhancementTrigger !== undefined &&
    !ENHANCEMENT_TRIGGER_VALUES.has(options.enhancementTrigger)
  ) {
    throw new Error(
      `--enhancement-trigger must be near or intent, received ${options.enhancementTrigger}.`,
    );
  }

  return options;
}

function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function childExitDescription(child) {
  if (child.exitCode !== null) return `code ${child.exitCode}`;
  if (child.signalCode !== null) return `signal ${child.signalCode}`;
  return "an unknown status";
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read JSON at ${filePath}: ${error.message}`);
  }
}

function normalizePublicRoute(route) {
  const pathname = new URL(route, "http://portfolio.local").pathname;

  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function routeSpecificity(routePattern) {
  return routePattern.split("/").reduce((score, segment) => {
    if (!segment) return score;
    if (/^\[\[\.\.\./.test(segment)) return score;
    if (/^\[\.\.\./.test(segment)) return score + 1;
    if (/^\[/.test(segment)) return score + 2;
    return score + 4;
  }, 0);
}

function selectAppManifestEntry(appPaths, publicRoute) {
  const exactKey = publicRoute === "/" ? "/page" : `${publicRoute}/page`;

  if (appPaths[exactKey]) {
    return { manifestKey: exactKey, modulePath: appPaths[exactKey] };
  }

  const matches = Object.entries(appPaths)
    .filter(([manifestKey]) => manifestKey.endsWith("/page"))
    .map(([manifestKey, modulePath]) => ({
      manifestKey,
      modulePath,
      routePattern: appManifestKeyToRoutePattern(manifestKey),
    }))
    .filter(({ routePattern }) =>
      routeMatchesPattern(publicRoute, routePattern),
    )
    .sort(
      (a, b) =>
        routeSpecificity(b.routePattern) - routeSpecificity(a.routePattern),
    );

  if (matches.length === 0) {
    throw new Error(
      `No App Router page manifest entry matches ${publicRoute}.`,
    );
  }

  return matches[0];
}

function readClientReferenceManifest(filePath, manifestKey) {
  let source;

  try {
    source = readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(
      `Unable to read client-reference manifest at ${filePath}: ${error.message}`,
    );
  }

  const marker = `globalThis.__RSC_MANIFEST[${JSON.stringify(manifestKey)}] = `;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(
      `Client-reference manifest ${filePath} does not contain ${manifestKey}.`,
    );
  }

  const jsonStart = markerIndex + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let jsonEnd = -1;

  for (let index = jsonStart; index < source.length; index += 1) {
    const character = source[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === "{" || character === "[") depth += 1;
    if (character === "}" || character === "]") {
      depth -= 1;
      if (depth === 0) {
        jsonEnd = index + 1;
        break;
      }
    }
  }

  if (jsonEnd === -1 || depth !== 0 || inString) {
    throw new Error(
      `Client-reference manifest ${filePath} has malformed JSON.`,
    );
  }

  try {
    return JSON.parse(source.slice(jsonStart, jsonEnd));
  } catch (error) {
    throw new Error(
      `Client-reference manifest ${filePath} has invalid JSON: ${error.message}`,
    );
  }
}

function resolveWithin(baseDirectory, candidatePath, label) {
  if (typeof candidatePath !== "string" || candidatePath.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }

  const absoluteBase = resolve(baseDirectory);
  const absolutePath = resolve(absoluteBase, candidatePath);
  const relativePath = relative(absoluteBase, absolutePath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new Error(`${label} escapes ${absoluteBase}: ${candidatePath}.`);
  }

  return absolutePath;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function flattenEntryFiles(entries) {
  return uniqueSorted(
    Object.values(entries ?? {}).flatMap((files) => files ?? []),
  );
}

function flattenCssFiles(entries) {
  return uniqueSorted(
    Object.values(entries ?? {}).flatMap((files) =>
      (files ?? []).map((file) =>
        typeof file === "string" ? file : file.path,
      ),
    ),
  );
}

function normalizeBuildAssetPath(assetPath) {
  let pathname = assetPath;

  if (/^https?:\/\//.test(pathname)) {
    pathname = new URL(pathname).pathname;
  }

  pathname = pathname.split(/[?#]/, 1)[0];
  pathname = pathname.replace(/^\/_next\//, "").replace(/^\/+/, "");

  if (!pathname) {
    throw new Error(`Invalid empty build asset path from ${assetPath}.`);
  }

  return pathname;
}

function gzipAsset(buildDir, assetPath) {
  const normalizedPath = normalizeBuildAssetPath(assetPath);
  const absoluteBuildDir = resolve(buildDir);
  const absolutePath = resolve(absoluteBuildDir, normalizedPath);
  const relativePath = relative(absoluteBuildDir, absolutePath);

  if (
    relativePath.startsWith(`..${sep}`) ||
    relativePath === ".." ||
    isAbsolute(relativePath)
  ) {
    throw new Error(`Asset escapes the build directory: ${assetPath}.`);
  }

  if (!existsSync(absolutePath)) {
    throw new Error(
      `Build asset declared by a manifest is missing: ${absolutePath}.`,
    );
  }

  return {
    path: normalizedPath,
    gzipBytes: gzipSync(readFileSync(absolutePath), {
      level: zlibConstants.Z_BEST_COMPRESSION,
    }).byteLength,
  };
}

function measureAssetGroup(buildDir, files) {
  const measuredFiles = uniqueSorted(files).map((file) =>
    gzipAsset(buildDir, file),
  );

  return {
    gzipBytes: measuredFiles.reduce((sum, file) => sum + file.gzipBytes, 0),
    files: measuredFiles,
  };
}

function measureHashedAssetGroup(buildDir, files) {
  const measuredFiles = uniqueSorted(files).map((file) => {
    const measured = gzipAsset(buildDir, file);
    const absolutePath = resolve(buildDir, measured.path);

    return {
      ...measured,
      sha256: createHash("sha256")
        .update(readFileSync(absolutePath))
        .digest("hex"),
    };
  });

  return {
    gzipBytes: measuredFiles.reduce((sum, file) => sum + file.gzipBytes, 0),
    files: measuredFiles,
  };
}

export function buildAssetSetRelationship(
  candidateFiles,
  referenceFiles,
  referenceAvailable = true,
) {
  const candidates = uniqueSorted(candidateFiles);

  if (!referenceAvailable) {
    return {
      referenceAvailable: false,
      isSubset: null,
      intersectionFiles: [],
      outsideReferenceFiles: candidates,
    };
  }

  const references = new Set(referenceFiles);
  const intersectionFiles = candidates.filter((file) => references.has(file));
  const outsideReferenceFiles = candidates.filter(
    (file) => !references.has(file),
  );

  return {
    referenceAvailable: true,
    isSubset: outsideReferenceFiles.length === 0,
    intersectionFiles,
    outsideReferenceFiles,
  };
}

export function partitionPostTriggerBuildAssets(
  coldNavigationFiles,
  observedPostTriggerFiles,
) {
  const coldSet = new Set(uniqueSorted(coldNavigationFiles));
  const observedFiles = uniqueSorted(observedPostTriggerFiles);
  const additionalFiles = observedFiles.filter((file) => !coldSet.has(file));
  const alreadyColdFiles = observedFiles.filter((file) => coldSet.has(file));

  return {
    additionalFiles,
    alreadyColdFiles,
    coldRelationship: {
      partitionMethod: "observed-post-trigger-minus-cold-navigation",
      disjointByConstruction: true,
      alreadyColdFiles,
    },
  };
}

export function selectEnhancementBudgetLimit(limits) {
  if (!limits || typeof limits !== "object" || Array.isArray(limits)) {
    return null;
  }

  for (const sourceMetric of [
    "lazyExplorerJavaScriptGzipBytes",
    "lazyJavaScriptGzipBytes",
  ]) {
    if (Object.hasOwn(limits, sourceMetric)) {
      return {
        conceptualMetric: "lazyExplorerJavaScriptGzipBytes",
        sourceMetric,
        limit: limits[sourceMetric],
      };
    }
  }

  return null;
}

export function enhancementBudgetLimits(javaScriptGzipBytes) {
  if (!Number.isFinite(javaScriptGzipBytes) || javaScriptGzipBytes < 0) {
    throw new TypeError(
      "enhancement JavaScript limit must be a finite, non-negative number.",
    );
  }

  return {
    postTriggerAdditionalJavaScriptGzipBytes: javaScriptGzipBytes,
    postTriggerUnexpectedFailedRequestCount: 0,
    postTriggerHttpErrorResponseCount: 0,
    postTriggerPageErrorCount: 0,
    postTriggerEnhancementStateMismatchCount: 0,
  };
}

export function evaluateExplorerEnhancementReadiness(
  state,
  expectsMotionController,
) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new TypeError("enhancement state must be an object.");
  }
  if (typeof state.motionState !== "string") {
    throw new TypeError("enhancement state.motionState must be a string.");
  }
  if (!Number.isInteger(state.controllerCount) || state.controllerCount < 0) {
    throw new TypeError(
      "enhancement state.controllerCount must be a non-negative integer.",
    );
  }
  if (typeof expectsMotionController !== "boolean") {
    throw new TypeError("expectsMotionController must be a boolean.");
  }

  const expectedState = expectsMotionController ? "ready-wide" : "static-*";
  const stateMatches = expectsMotionController
    ? state.motionState === "ready-wide"
    : state.motionState.startsWith("static-");
  const expectedControllerCount = expectsMotionController ? 1 : 0;
  const passed =
    stateMatches && state.controllerCount === expectedControllerCount;

  return {
    passed,
    mismatchCount: passed ? 0 : 1,
    expectedState,
    expectedControllerCount,
  };
}

function selectRouteEntryKeys(entryFiles, modulePath) {
  const sourceModule = modulePath.replace(/\.js$/, "").replaceAll("\\", "/");
  const sourceSuffix = `/src/${sourceModule}`;
  const keys = Object.keys(entryFiles ?? {});
  const exactMatches = keys.filter((key) =>
    key.replace(/ <module evaluation>$/, "").endsWith(sourceSuffix),
  );

  if (exactMatches.length > 0) return exactMatches;

  const pageLikeMatches = keys.filter((key) =>
    /\/src\/app\/(?:.*\/)?page$/.test(key.replace(/ <module evaluation>$/, "")),
  );

  if (pageLikeMatches.length === 1) return pageLikeMatches;
  if (pageLikeMatches.length === 0) return [];

  throw new Error(
    `Unable to identify one route page entry for ${modulePath}. ` +
      `Candidates: ${pageLikeMatches.join(", ")}.`,
  );
}

function readLazyFiles(buildDir, modulePath) {
  const routeOutputBase = modulePath.replace(/\.js$/, "");
  const manifestPath = resolveWithin(
    join(buildDir, "server"),
    join(routeOutputBase, "react-loadable-manifest.json"),
    "React-loadable manifest path",
  );

  if (!existsSync(manifestPath)) {
    return { available: false, files: [] };
  }

  const manifest = readJson(manifestPath);
  return {
    available: true,
    files: uniqueSorted(
      Object.values(manifest).flatMap((entry) => entry.files ?? []),
    ),
  };
}

function readGitCommit(cwd) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function readGitDirty(cwd) {
  try {
    return (
      execFileSync("git", ["status", "--porcelain"], {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim().length > 0
    );
  } catch {
    return null;
  }
}

async function waitForServer(
  url,
  child,
  getStartupError,
  hasReportedReady,
  requestHeaders,
  timeoutMs = 90_000,
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const startupError = getStartupError();
    if (startupError) {
      throw new Error(
        `Production server could not start: ${startupError.message}`,
      );
    }

    if (hasExited(child)) {
      throw new Error(
        `Production server exited before readiness with ${childExitDescription(child)}.`,
      );
    }

    try {
      const response = await fetch(url, {
        redirect: "manual",
        ...(requestHeaders ? { headers: requestHeaders } : {}),
      });
      if (hasReportedReady() && response.status < 500) return;
    } catch {
      // The production server is still starting.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw new Error(`Production server did not become ready at ${url}.`);
}

function previewCredentials(origin) {
  const token = process.env.PORTFOLIO_V1_PREVIEW_TOKEN?.trim();
  if (!token) return undefined;
  if (token.length < 32) {
    throw new Error(
      "PORTFOLIO_V1_PREVIEW_TOKEN must contain at least 32 characters.",
    );
  }

  return {
    username: "preview",
    password: token,
    origin,
    send: "always",
  };
}

function previewRequestHeaders(credentials) {
  if (!credentials) return undefined;

  return {
    Authorization: `Basic ${Buffer.from(
      `${credentials.username}:${credentials.password}`,
    ).toString("base64")}`,
  };
}

async function terminateProcess(child) {
  if (!child.pid || hasExited(child)) return;

  const exited = once(child, "exit").then(() => true);
  const signalProcess = (signal) => {
    try {
      if (process.platform === "win32") child.kill(signal);
      else process.kill(-child.pid, signal);
    } catch {
      // The child may have exited between measurement and cleanup.
    }
  };

  signalProcess("SIGTERM");
  let timeoutId;
  const timedOut = new Promise((resolveWait) => {
    timeoutId = setTimeout(() => resolveWait(false), 10_000);
    timeoutId.unref?.();
  });

  const didExit = await Promise.race([exited, timedOut]);
  clearTimeout(timeoutId);
  if (!didExit) {
    signalProcess("SIGKILL");
    await once(child, "exit").catch(() => undefined);
  }
}

function registerSignalCleanup(cleanup) {
  let handlingSignal = false;
  const handlers = new Map();

  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ]) {
    const handler = () => {
      if (handlingSignal) return;
      handlingSignal = true;
      void cleanup().finally(() => process.exit(exitCode));
    };
    handlers.set(signal, handler);
    process.once(signal, handler);
  }

  return () => {
    for (const [signal, handler] of handlers) {
      process.removeListener(signal, handler);
    }
  };
}

function localBuildAsset(url, origin) {
  const parsed = new URL(url);
  if (
    parsed.origin !== origin ||
    !parsed.pathname.startsWith("/_next/static/")
  ) {
    return null;
  }

  return parsed.pathname.replace(/^\/_next\//, "");
}

async function responseTransferBytes(response) {
  const contentLength = Number(response.headers()["content-length"]);
  if (Number.isFinite(contentLength) && contentLength >= 0)
    return contentLength;

  try {
    return (await response.body()).byteLength;
  } catch (error) {
    throw new Error(
      `Unable to measure transfer bytes for ${response.url()}: ${error.message}`,
    );
  }
}

async function triggerExplorerEnhancement(page, trigger) {
  const explorerSelector = "[data-project-explorer]";
  const explorer = page.locator(explorerSelector).first();
  if ((await explorer.count()) === 0) {
    throw new Error(
      `--enhancement-trigger=${trigger} requires ${explorerSelector} on the measured route.`,
    );
  }

  const enhancedRoot = explorer.locator('[data-enhanced="true"]').first();
  await enhancedRoot
    .waitFor({ state: "attached", timeout: 5_000 })
    .catch(() => {
      throw new Error(
        `The explorer did not expose its enhanced state before the ${trigger} trigger.`,
      );
    });

  if (trigger === "near") {
    await explorer.evaluate((element) => {
      element.scrollIntoView({ block: "center", inline: "nearest" });
    });

    return {
      kind: trigger,
      selector: explorerSelector,
      action: "scroll-into-view",
    };
  }

  const previewSelector =
    '[data-project-explorer] [data-explorer-preview][aria-pressed="false"]';
  const preview = page.locator(previewSelector).first();
  if ((await preview.count()) === 0) {
    throw new Error(
      `--enhancement-trigger=intent requires a non-active ${previewSelector} control.`,
    );
  }

  const focusResult = await preview.evaluate((element) => {
    let preventScrollRequested = true;

    try {
      element.focus({ preventScroll: true });
    } catch {
      preventScrollRequested = false;
      element.focus();
    }

    return {
      focused: document.activeElement === element,
      preventScrollRequested,
      projectSlug: element instanceof HTMLButtonElement ? element.value : null,
    };
  });

  if (!focusResult.focused) {
    throw new Error("The explorer intent target could not receive focus.");
  }

  return {
    kind: trigger,
    selector: previewSelector,
    action: "focus-first-non-active-preview",
    preventScrollRequested: focusResult.preventScrollRequested,
    projectSlug: focusResult.projectSlug,
  };
}

async function measureColdNavigation(
  buildDir,
  publicRoute,
  viewport,
  enhancementTrigger,
) {
  const chromePath = chromium.executablePath();
  if (!existsSync(chromePath)) {
    throw new Error(
      "Playwright Chromium is missing. Run `npx playwright install chromium` once, then retry.",
    );
  }

  const port = Number(process.env.QUALITY_ANALYZE_PORT ?? 3102);
  if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
    throw new Error(`Invalid QUALITY_ANALYZE_PORT: ${String(port)}.`);
  }

  const origin = `http://127.0.0.1:${port}`;
  const url = new URL(publicRoute, origin).href;
  const isProtectedPreview = new URL(url).pathname.startsWith("/preview/");
  const credentials = isProtectedPreview
    ? previewCredentials(origin)
    : undefined;
  const requestHeaders = previewRequestHeaders(credentials);
  if (isProtectedPreview && !credentials) {
    throw new Error(
      "A protected preview probe requires PORTFOLIO_V1_PREVIEW_TOKEN.",
    );
  }
  if (isProtectedPreview && process.env.PORTFOLIO_V1_PREVIEW !== "1") {
    throw new Error(
      "A protected preview probe requires PORTFOLIO_V1_PREVIEW=1.",
    );
  }
  let startupError = null;
  let serverReportedReady = false;
  const server = spawn(
    "npm",
    ["run", "start", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      detached: process.platform !== "win32",
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.once("error", (error) => {
    startupError = error;
  });
  server.stdout.on("data", (chunk) => {
    const output = chunk.toString();
    if (/Ready in|Local:\s+http:\/\//.test(output)) serverReportedReady = true;
    process.stdout.write(chunk);
  });
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  let browser;
  let cleanupPromise;
  const cleanupOwnedResources = () => {
    cleanupPromise ??= (async () => {
      if (browser) await browser.close().catch(() => undefined);
      await terminateProcess(server);
    })();
    return cleanupPromise;
  };
  const removeSignalCleanup = registerSignalCleanup(cleanupOwnedResources);
  try {
    await waitForServer(
      url,
      server,
      () => startupError,
      () => serverReportedReady,
      requestHeaders,
    );
    browser = await chromium.launch({ headless: true });
    const browserVersion = browser.version();
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor,
      hasTouch: viewport.hasTouch,
      isMobile: viewport.isMobile,
      reducedMotion: "no-preference",
      serviceWorkers: "block",
      ...(credentials ? { httpCredentials: credentials } : {}),
    });
    await context.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      window.__PORTFOLIO_QUALITY_WEBGL_CONTEXTS__ = 0;
      HTMLCanvasElement.prototype.getContext = function getContext(
        type,
        ...args
      ) {
        if (type === "webgl" || type === "webgl2") {
          window.__PORTFOLIO_QUALITY_WEBGL_CONTEXTS__ += 1;
        }
        return originalGetContext.call(this, type, ...args);
      };
    });

    const page = await context.newPage();
    const requests = [];
    const responses = [];
    const failedRequestObjects = new Set();
    const failedRequests = [];
    const pageErrors = [];
    page.on("request", (request) => requests.push(request));
    page.on("response", (response) => responses.push(response));
    page.on("requestfailed", (request) => {
      failedRequestObjects.add(request);
      failedRequests.push({
        url: request.url(),
        resourceType: request.resourceType(),
        errorText: request.failure()?.errorText ?? "unknown",
      });
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const navigation = await page.goto(url, {
      waitUntil: "load",
      timeout: 60_000,
    });
    if (!navigation || navigation.status() >= 400) {
      throw new Error(
        `Cold navigation to ${url} returned ${navigation?.status() ?? "no response"}.`,
      );
    }

    // The preserved V5 scene mounts after a 720 ms idle delay. A fixed
    // pre-intent window makes any automatically requested enhancement count as
    // initial cost, even when Next labels its chunk lazy.
    await page.waitForTimeout(PRE_INTENT_OBSERVATION_WINDOW_MS);

    const coldWebglContextRequests = await page.evaluate(
      () => window.__PORTFOLIO_QUALITY_WEBGL_CONTEXTS__ ?? 0,
    );
    const coldResponses = [...responses];
    const coldFailedRequestObjects = new Set(failedRequestObjects);
    const coldFailedRequests = [...failedRequests];
    const coldPageErrors = [...pageErrors];

    let enhancementTriggerMeasurement = null;
    if (enhancementTrigger) {
      const requestBoundary = requests.length;
      const responseBoundary = responses.length;
      const failedRequestBoundary = failedRequests.length;
      const pageErrorBoundary = pageErrors.length;
      const coldRequestedBuildJavaScriptFiles = uniqueSorted(
        requests
          .slice(0, requestBoundary)
          .filter((request) => request.resourceType() === "script")
          .map((request) => localBuildAsset(request.url(), origin))
          .filter(Boolean),
      );
      const action = await triggerExplorerEnhancement(page, enhancementTrigger);

      await page.waitForTimeout(POST_TRIGGER_SETTLE_WINDOW_MS);

      const finalState = await page.evaluate(() => {
        const root = document.querySelector(
          "#flagship-work-explorer-interactive",
        );
        return {
          motionState: root?.getAttribute("data-motion-state") ?? "missing",
          controllerCount: document.querySelectorAll(
            "[data-explorer-motion-controller]",
          ).length,
        };
      });
      const expectsMotionController =
        viewport.width >= 1120 &&
        viewport.height >= 760 &&
        !viewport.hasTouch;
      const readiness = evaluateExplorerEnhancementReadiness(
        finalState,
        expectsMotionController,
      );

      const postTriggerResponses = responses.slice(responseBoundary);
      const postTriggerFailedRequestObjects = new Set(
        [...failedRequestObjects].filter(
          (request) => !coldFailedRequestObjects.has(request),
        ),
      );
      const postTriggerOutcomes = analyzeResponseOutcomes(
        postTriggerResponses,
        postTriggerFailedRequestObjects,
      );
      const postTriggerBuildJavaScriptFiles = uniqueSorted(
        requests
          .slice(requestBoundary)
          .filter((request) => request.resourceType() === "script")
          .map((request) => localBuildAsset(request.url(), origin))
          .filter(Boolean),
      );

      enhancementTriggerMeasurement = {
        ...action,
        settleWindowMs: POST_TRIGGER_SETTLE_WINDOW_MS,
        finalState: {
          ...finalState,
          ...readiness,
        },
        coldRequestedBuildJavaScriptFiles,
        observedBuildJavaScriptFiles: postTriggerBuildJavaScriptFiles,
        failedRequests: failedRequests.slice(failedRequestBoundary),
        httpErrorResponses: postTriggerOutcomes.httpErrorResponses,
        pageErrors: pageErrors.slice(pageErrorBoundary),
      };
    }

    const responseOutcomes = analyzeResponseOutcomes(
      coldResponses,
      coldFailedRequestObjects,
    );
    const successfulResponses = responseOutcomes.uniqueResponses;
    const httpErrorResponses = responseOutcomes.httpErrorResponses;
    const scriptResponses = successfulResponses.filter(
      (response) => response.request().resourceType() === "script",
    );
    const requestedJavaScriptFiles = uniqueSorted(
      scriptResponses
        .map((response) => localBuildAsset(response.url(), origin))
        .filter(Boolean),
    );
    const nonBuildJavaScriptResponses = scriptResponses.filter(
      (response) => !localBuildAsset(response.url(), origin),
    );
    const requestedCssFiles = uniqueSorted(
      successfulResponses
        .filter(
          (response) => response.request().resourceType() === "stylesheet",
        )
        .map((response) => localBuildAsset(response.url(), origin))
        .filter(Boolean),
    );
    const mediaResponses = successfulResponses.filter((response) =>
      ["image", "media"].includes(response.request().resourceType()),
    );
    const fontResponses = successfulResponses.filter(
      (response) => response.request().resourceType() === "font",
    );
    const media = await Promise.all(
      mediaResponses.map(async (response) => ({
        url: response.url(),
        resourceType: response.request().resourceType(),
        transferBytes: await responseTransferBytes(response),
      })),
    );
    const fonts = await Promise.all(
      fontResponses.map(async (response) => ({
        url: response.url(),
        transferBytes: await responseTransferBytes(response),
      })),
    );
    const nonBuildJavaScript = await Promise.all(
      nonBuildJavaScriptResponses.map(async (response) => ({
        url: response.url(),
        transferBytes: await responseTransferBytes(response),
      })),
    );

    await context.close();
    return {
      url,
      browserVersion,
      viewport,
      reducedMotion: "no-preference",
      observationWindowMs: PRE_INTENT_OBSERVATION_WINDOW_MS,
      javascript: measureAssetGroup(buildDir, requestedJavaScriptFiles),
      nonBuildJavaScript: {
        transferBytes: nonBuildJavaScript.reduce(
          (sum, item) => sum + item.transferBytes,
          0,
        ),
        files: nonBuildJavaScript,
      },
      css: measureAssetGroup(buildDir, requestedCssFiles),
      media: {
        transferBytes: media.reduce((sum, item) => sum + item.transferBytes, 0),
        largestImageTransferBytes: media
          .filter((item) => item.resourceType === "image")
          .reduce((largest, item) => Math.max(largest, item.transferBytes), 0),
        files: media,
      },
      fonts: {
        transferBytes: fonts.reduce((sum, item) => sum + item.transferBytes, 0),
        files: fonts,
      },
      webglContextRequests: coldWebglContextRequests,
      failedRequests: coldFailedRequests,
      httpErrorResponses,
      pageErrors: coldPageErrors,
      ...(enhancementTriggerMeasurement
        ? { enhancementTrigger: enhancementTriggerMeasurement }
        : {}),
    };
  } finally {
    removeSignalCleanup();
    await cleanupOwnedResources();
  }
}

function printMetrics(metrics) {
  console.log("\nMeasured production assets");

  for (const [metric, label] of Object.entries(DEFAULT_METRIC_LABELS)) {
    if (metrics[metric] === undefined) continue;
    console.log(
      `  ${label.padEnd(36)} ${formatMetric(metric, metrics[metric])}`,
    );
  }
}

function printBudgetResult(profileName, selection, evaluation) {
  console.log(`\nBudget profile: ${profileName}`);

  if (!selection) {
    console.log("  FAIL  No route budget matched this route.");
    return;
  }

  console.log(`  Matched route budget: ${selection.pattern}`);
  for (const check of evaluation.checks) {
    const status = check.passed ? "PASS" : "FAIL";
    const actual =
      check.actual === null
        ? "missing"
        : formatMetric(check.metric, check.actual);
    const limit = formatMetric(check.metric, check.limit);
    console.log(
      `  ${status}  ${check.label.padEnd(36)} ${actual.padStart(12)} / ${limit}`,
    );
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (options.enhancementTrigger && !options.network) {
    throw new Error(
      "--enhancement-trigger cannot be combined with --no-network.",
    );
  }

  if (!options.network && options.enforce) {
    throw new Error(
      "--no-network may only be used together with --no-enforce.",
    );
  }

  const cwd = process.cwd();
  const buildDir = resolve(cwd, options.buildDir);
  const configPath = resolve(cwd, options.config);
  const outputPath = resolve(cwd, options.output);
  const publicRoute = normalizePublicRoute(options.route);
  const budgetRoute = normalizePublicRoute(options.budgetRoute ?? publicRoute);
  const budgetConfig = readJson(configPath);
  const profileName =
    options.profile ??
    process.env.QUALITY_PROFILE ??
    budgetConfig.activeProfile;
  const profile = budgetConfig.profiles?.[profileName];

  if (!profile) {
    throw new Error(`Unknown budget profile: ${profileName}.`);
  }

  const viewportName = options.viewport ?? profile.defaultViewport ?? "desktop";
  const viewport = budgetConfig.viewports?.[viewportName];
  if (!viewport) {
    throw new Error(`Unknown bundle viewport: ${viewportName}.`);
  }

  for (const field of ["width", "height", "deviceScaleFactor"]) {
    if (!Number.isFinite(viewport[field]) || viewport[field] <= 0) {
      throw new Error(`Invalid ${viewportName} viewport ${field}.`);
    }
  }
  if (
    typeof viewport.hasTouch !== "boolean" ||
    typeof viewport.isMobile !== "boolean"
  ) {
    throw new Error(
      `Viewport ${viewportName} must define hasTouch and isMobile.`,
    );
  }
  const budgetSelection = selectRouteBudget(profile.routes, budgetRoute);

  const buildManifestPath = join(buildDir, "build-manifest.json");
  const appPathsManifestPath = join(
    buildDir,
    "server",
    "app-paths-manifest.json",
  );

  if (!existsSync(buildManifestPath) || !existsSync(appPathsManifestPath)) {
    throw new Error(
      `No complete Next production build found at ${buildDir}. Run npm run build before analysis.`,
    );
  }

  const buildManifest = readJson(buildManifestPath);
  const appPaths = readJson(appPathsManifestPath);
  const routeEntry = selectAppManifestEntry(appPaths, publicRoute);
  if (
    typeof routeEntry.modulePath !== "string" ||
    !routeEntry.modulePath.endsWith(".js")
  ) {
    throw new Error(
      `Invalid App Router module path for ${routeEntry.manifestKey}: ${String(
        routeEntry.modulePath,
      )}.`,
    );
  }
  const routeOutputBase = routeEntry.modulePath.replace(/\.js$/, "");
  const clientReferencePath = resolveWithin(
    join(buildDir, "server"),
    `${routeOutputBase}_client-reference-manifest.js`,
    "Client-reference manifest path",
  );
  const clientReference = readClientReferenceManifest(
    clientReferencePath,
    routeEntry.manifestKey,
  );

  const rootRuntimeFiles = uniqueSorted(buildManifest.rootMainFiles ?? []);
  const allEntryFiles = flattenEntryFiles(clientReference.entryJSFiles);
  const routeEntryKeys = selectRouteEntryKeys(
    clientReference.entryJSFiles,
    routeEntry.modulePath,
  );
  const routeEntryFiles = uniqueSorted(
    routeEntryKeys.flatMap((key) => clientReference.entryJSFiles[key] ?? []),
  );
  const nonRouteEntryFiles = uniqueSorted(
    Object.entries(clientReference.entryJSFiles ?? {})
      .filter(([key]) => !routeEntryKeys.includes(key))
      .flatMap(([, files]) => files ?? []),
  );
  const nonRouteEntrySet = new Set(nonRouteEntryFiles);
  const runtimeSet = new Set(rootRuntimeFiles);
  const routeOwnedFiles = routeEntryFiles.filter(
    (file) => !nonRouteEntrySet.has(file) && !runtimeSet.has(file),
  );
  const initialFiles = uniqueSorted([...rootRuntimeFiles, ...allEntryFiles]);
  const routeOwnedSet = new Set(routeOwnedFiles);
  const sharedFiles = initialFiles.filter((file) => !routeOwnedSet.has(file));
  const initialSet = new Set(initialFiles);
  const lazyManifest = readLazyFiles(buildDir, routeEntry.modulePath);
  const lazyFiles = lazyManifest.files.filter(
    (file) => !initialSet.has(file) && file.endsWith(".js"),
  );
  const cssFiles = flattenCssFiles(clientReference.entryCSSFiles);

  const groups = {
    manifestInitialJavaScript: measureAssetGroup(buildDir, initialFiles),
    runtimeJavaScript: measureAssetGroup(buildDir, rootRuntimeFiles),
    sharedJavaScript: measureAssetGroup(buildDir, sharedFiles),
    routeOwnedJavaScript: measureAssetGroup(buildDir, routeOwnedFiles),
    lazyJavaScript: measureAssetGroup(buildDir, lazyFiles),
    css: measureAssetGroup(buildDir, cssFiles),
  };

  const network = options.network
    ? await measureColdNavigation(
        buildDir,
        publicRoute,
        viewport,
        options.enhancementTrigger,
      )
    : null;
  const networkOrigin = `http://127.0.0.1:${Number(
    process.env.QUALITY_ANALYZE_PORT ?? 3102,
  )}`;
  const networkFailures = classifyNetworkFailures(
    network?.failedRequests ?? [],
    networkOrigin,
    budgetSelection?.budget.allowedFailedRequests ?? [],
  );
  if (network) network.failurePolicy = networkFailures;
  const enhancementNetworkFailures = classifyNetworkFailures(
    network?.enhancementTrigger?.failedRequests ?? [],
    networkOrigin,
    budgetSelection?.budget.allowedFailedRequests ?? [],
  );
  if (network?.enhancementTrigger) {
    network.enhancementTrigger.failurePolicy = enhancementNetworkFailures;
  }
  const preIntentAdditionalFiles = network
    ? network.javascript.files
        .map((file) => file.path)
        .filter((file) => !initialSet.has(file))
    : [];
  groups.coldNavigationJavaScript =
    network?.javascript ?? groups.manifestInitialJavaScript;
  groups.preIntentAdditionalJavaScript = measureAssetGroup(
    buildDir,
    preIntentAdditionalFiles,
  );
  groups.coldNavigationCss = network?.css ?? groups.css;

  let enhancementTriggerRelationships = null;
  if (network?.enhancementTrigger) {
    const coldNavigationFiles =
      network.enhancementTrigger.coldRequestedBuildJavaScriptFiles;
    const postTriggerPartition = partitionPostTriggerBuildAssets(
      coldNavigationFiles,
      network.enhancementTrigger.observedBuildJavaScriptFiles.filter((file) =>
        file.endsWith(".js"),
      ),
    );
    const postTriggerAdditionalFiles = postTriggerPartition.additionalFiles;
    network.enhancementTrigger.observedAlreadyColdFiles =
      postTriggerPartition.alreadyColdFiles;

    groups.postTriggerAdditionalJavaScript = measureHashedAssetGroup(
      buildDir,
      postTriggerAdditionalFiles,
    );
    enhancementTriggerRelationships = {
      coldNavigation: postTriggerPartition.coldRelationship,
      manifestInitialJavaScript: buildAssetSetRelationship(
        postTriggerAdditionalFiles,
        initialFiles,
      ),
      dynamicLazyJavaScript: buildAssetSetRelationship(
        postTriggerAdditionalFiles,
        lazyFiles,
        lazyManifest.available,
      ),
    };
  }

  const metrics = {
    totalInitialJavaScriptGzipBytes: groups.coldNavigationJavaScript.gzipBytes,
    manifestInitialJavaScriptGzipBytes:
      groups.manifestInitialJavaScript.gzipBytes,
    runtimeJavaScriptGzipBytes: groups.runtimeJavaScript.gzipBytes,
    sharedJavaScriptGzipBytes: groups.sharedJavaScript.gzipBytes,
    routeOwnedJavaScriptGzipBytes: groups.routeOwnedJavaScript.gzipBytes,
    lazyJavaScriptGzipBytes: groups.lazyJavaScript.gzipBytes,
    preIntentAdditionalJavaScriptGzipBytes:
      groups.preIntentAdditionalJavaScript.gzipBytes,
    nonBuildJavaScriptTransferBytes:
      network?.nonBuildJavaScript.transferBytes ?? 0,
    cssGzipBytes: groups.coldNavigationCss.gzipBytes,
    initialMediaTransferBytes: network?.media.transferBytes ?? 0,
    largestImageTransferBytes: network?.media.largestImageTransferBytes ?? 0,
    webglContextRequests: network?.webglContextRequests ?? 0,
    initialFontTransferBytes: network?.fonts.transferBytes ?? 0,
    unexpectedFailedRequestCount: networkFailures.unexpected.length,
    httpErrorResponseCount: network?.httpErrorResponses.length ?? 0,
    pageErrorCount: network?.pageErrors.length ?? 0,
    ...(groups.postTriggerAdditionalJavaScript
      ? {
          postTriggerAdditionalJavaScriptGzipBytes:
            groups.postTriggerAdditionalJavaScript.gzipBytes,
          postTriggerUnexpectedFailedRequestCount:
            enhancementNetworkFailures.unexpected.length,
          postTriggerHttpErrorResponseCount:
            network?.enhancementTrigger?.httpErrorResponses.length ?? 0,
          postTriggerPageErrorCount:
            network?.enhancementTrigger?.pageErrors.length ?? 0,
          postTriggerEnhancementStateMismatchCount:
            network?.enhancementTrigger?.finalState.mismatchCount ?? 1,
        }
      : {}),
  };

  const effectiveLimits = budgetSelection
    ? {
        ...budgetSelection.budget.limits,
        ...(budgetSelection.budget.viewportLimits?.[viewportName] ?? {}),
      }
    : null;
  let budgetEvaluation = budgetSelection
    ? evaluateBudget(metrics, effectiveLimits)
    : { passed: false, checks: [], reason: "route-budget-missing" };
  if (options.enhancementTrigger) {
    const enhancementLimit = selectEnhancementBudgetLimit(effectiveLimits);
    if (!enhancementLimit) {
      throw new Error(
        "An enhancement trigger requires a lazyExplorerJavaScriptGzipBytes " +
          "or lazyJavaScriptGzipBytes route limit.",
      );
    }

    const enhancementEvaluation = evaluateBudget(
      metrics,
      enhancementBudgetLimits(enhancementLimit.limit),
    );
    budgetEvaluation = {
      ...budgetEvaluation,
      passed: budgetEvaluation.passed && enhancementEvaluation.passed,
      checks: [
        ...budgetEvaluation.checks,
        ...enhancementEvaluation.checks.map((check) => ({
          ...check,
          conceptualBudgetMetric: enhancementLimit.conceptualMetric,
          sourceLimitMetric: enhancementLimit.sourceMetric,
        })),
      ],
      enhancementTrigger: {
        requested: options.enhancementTrigger,
        enforcedMetrics: enhancementEvaluation.checks.map(
          (check) => check.metric,
        ),
        conceptualBudgetMetric: enhancementLimit.conceptualMetric,
        sourceLimitMetric: enhancementLimit.sourceMetric,
        limit: enhancementLimit.limit,
        passed: enhancementEvaluation.passed,
      },
    };
  }

  const buildIdPath = join(buildDir, "BUILD_ID");
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    gitCommit: readGitCommit(cwd),
    gitDirty: readGitDirty(cwd),
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    build: {
      directory: relative(cwd, buildDir) || ".",
      id: existsSync(buildIdPath)
        ? readFileSync(buildIdPath, "utf8").trim()
        : null,
    },
    route: {
      publicPath: publicRoute,
      budgetPath: budgetRoute,
      manifestKey: routeEntry.manifestKey,
      modulePath: routeEntry.modulePath,
      clientEntryKeys: routeEntryKeys,
    },
    measurement: {
      networkEnabled: options.network,
      gzipLevel: zlibConstants.Z_BEST_COMPRESSION,
      coldNavigation: network,
      viewportName,
      ...(network?.enhancementTrigger
        ? {
            enhancementTrigger: {
              kind: network.enhancementTrigger.kind,
              settleWindowMs: network.enhancementTrigger.settleWindowMs,
              assetRelationships: enhancementTriggerRelationships,
            },
          }
        : {}),
    },
    budget: {
      config: relative(cwd, configPath),
      profile: profileName,
      profileStatus: profile.status,
      matchedRoutePattern: budgetSelection?.pattern ?? null,
      viewport: viewportName,
      enforced: options.enforce,
      ...budgetEvaluation,
    },
    metrics,
    assets: groups,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Bundle analysis for ${publicRoute}`);
  console.log(`Build: ${relative(cwd, buildDir) || "."}`);
  printMetrics(metrics);
  printBudgetResult(profileName, budgetSelection, budgetEvaluation);
  console.log(`\nReport: ${relative(cwd, outputPath)}`);

  if (options.enforce && !budgetEvaluation.passed) {
    process.exitCode = 1;
  }
}

const isDirectInvocation =
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectInvocation) {
  main().catch((error) => {
    console.error(`Bundle analysis failed: ${error.message}`);
    process.exitCode = 1;
  });
}
