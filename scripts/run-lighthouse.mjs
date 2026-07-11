import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const configPath = resolve(root, "quality/lighthouse-budgets.json");
const outputDirectory = resolve(root, ".quality-reports/lighthouse");
const lighthousePackagePath = resolve(
  root,
  "tools/lighthouse/node_modules/lighthouse/package.json",
);
const config = JSON.parse(readFileSync(configPath, "utf8"));
const profile = config.profiles[config.activeProfile];

if (!profile) {
  throw new Error(
    `Unknown Lighthouse budget profile: ${String(config.activeProfile)}`,
  );
}

if (!Number.isInteger(config.numberOfRuns) || config.numberOfRuns < 1) {
  throw new Error("Lighthouse numberOfRuns must be a positive integer.");
}

if (
  !Number.isInteger(config.maxRejectedAttempts) ||
  config.maxRejectedAttempts < 0
) {
  throw new Error("Lighthouse maxRejectedAttempts must be a non-negative integer.");
}

if (
  !Array.isArray(config.retriableRuntimeErrorCodes) ||
  config.retriableRuntimeErrorCodes.some((code) => typeof code !== "string")
) {
  throw new Error("Lighthouse retriableRuntimeErrorCodes must be a string array.");
}

if (!existsSync(lighthousePackagePath)) {
  throw new Error(
    "The isolated Lighthouse tool is missing. Run `npm ci --prefix tools/lighthouse`.",
  );
}

const lighthousePackage = JSON.parse(readFileSync(lighthousePackagePath, "utf8"));
if (lighthousePackage.version !== config.toolVersion) {
  throw new Error(
    `Lighthouse config expects ${config.toolVersion}, installed ${String(
      lighthousePackage.version,
    )}.`,
  );
}

const lighthouseBin = lighthousePackage.bin?.lighthouse;
if (typeof lighthouseBin !== "string") {
  throw new Error("Installed Lighthouse package does not expose its CLI path.");
}
const lighthouseCli = resolve(dirname(lighthousePackagePath), lighthouseBin);
const activeChildren = new Set();

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const { allowFailure = false, ...spawnOptions } = options;
    const child = spawn(command, args, {
      cwd: root,
      detached: process.platform !== "win32",
      env: process.env,
      stdio: "inherit",
      ...spawnOptions,
    });
    activeChildren.add(child);

    child.once("error", (error) => {
      activeChildren.delete(child);
      rejectRun(error);
    });
    child.once("exit", (code, signal) => {
      activeChildren.delete(child);
      if (code === 0 || allowFailure) {
        resolveRun({ code, signal });
        return;
      }

      rejectRun(
        new Error(
          `${command} exited with ${code ?? `signal ${String(signal)}`}`,
        ),
      );
    });
  });
}

function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function childExitDescription(child) {
  if (child.exitCode !== null) return `code ${child.exitCode}`;
  if (child.signalCode !== null) return `signal ${child.signalCode}`;
  return "an unknown status";
}

async function waitForServer(
  url,
  child,
  getStartupError,
  hasReportedReady,
  timeoutMs = 90_000,
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const startupError = getStartupError();
    if (startupError) {
      throw new Error(`Production server could not start: ${startupError.message}`);
    }

    if (hasExited(child)) {
      throw new Error(
        `Production server exited before readiness with ${childExitDescription(child)}.`,
      );
    }

    try {
      const response = await fetch(url, { redirect: "manual" });
      if (hasReportedReady() && response.status < 500) return;
    } catch {
      // The production server is still starting.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw new Error(`Production server did not become ready at ${url}.`);
}

async function terminate(child) {
  if (!child.pid || hasExited(child)) return;

  const exited = once(child, "exit").then(() => true);

  const signalProcess = (signal) => {
    try {
      if (process.platform === "win32") child.kill(signal);
      else process.kill(-child.pid, signal);
    } catch {
      // The child may have exited between the readiness check and cleanup.
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

function readGitCommit() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function metricFromReport(report) {
  return {
    performanceScore: report.categories.performance.score,
    accessibilityScore: report.categories.accessibility.score,
    bestPracticesScore: report.categories["best-practices"].score,
    seoScore: report.categories.seo.score,
    largestContentfulPaintMs:
      report.audits["largest-contentful-paint"].numericValue,
    cumulativeLayoutShift:
      report.audits["cumulative-layout-shift"].numericValue,
    totalBlockingTimeMs: report.audits["total-blocking-time"].numericValue,
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function browserVersionFromUserAgent(userAgent) {
  return userAgent?.match(/(?:HeadlessChrome|Chrome)\/([\d.]+)/)?.[1] ?? null;
}

function evaluate(metrics) {
  const checks = [];

  for (const [metric, limit] of Object.entries(profile.minimum)) {
    checks.push({
      metric,
      actual: metrics[metric],
      limit,
      comparison: "minimum",
      passed: metrics[metric] >= limit,
    });
  }

  for (const [metric, limit] of Object.entries(profile.maximum)) {
    checks.push({
      metric,
      actual: metrics[metric],
      limit,
      comparison: "maximum",
      passed: metrics[metric] <= limit,
    });
  }

  return { passed: checks.every((check) => check.passed), checks };
}

const lighthouseUrl = new URL(config.url);
if (
  lighthouseUrl.protocol !== "http:" ||
  lighthouseUrl.hostname !== "127.0.0.1" ||
  !lighthouseUrl.port
) {
  throw new Error(
    "Lighthouse URL must use an explicit http://127.0.0.1 port owned by this command.",
  );
}

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

let server = null;
let cleanupPromise;
const cleanupOwnedResources = () => {
  cleanupPromise ??= (async () => {
    await Promise.all(
      [...activeChildren].map((child) => terminate(child)),
    );
    if (server) await terminate(server);
  })();
  return cleanupPromise;
};
const removeSignalCleanup = registerSignalCleanup(cleanupOwnedResources);

try {
  await run("npm", ["run", "build"]);

  let serverStartupError = null;
  let serverReportedReady = false;
  server = spawn(
    "npm",
    [
      "run",
      "start",
      "--",
      "--hostname",
      "127.0.0.1",
      "--port",
      lighthouseUrl.port,
    ],
    {
      cwd: root,
      detached: process.platform !== "win32",
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.once("error", (error) => {
    serverStartupError = error;
  });
  server.stdout.on("data", (chunk) => {
    const output = chunk.toString();
    if (/Ready in|Local:\s+http:\/\//.test(output)) serverReportedReady = true;
    process.stdout.write(chunk);
  });
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  await waitForServer(
    config.url,
    server,
    () => serverStartupError,
    () => serverReportedReady,
  );

  const runs = [];
  const attempts = [];
  const retriableRuntimeErrorCodes = new Set(
    config.retriableRuntimeErrorCodes,
  );
  let lighthouseProvenance = null;
  let rejectedAttempts = 0;
  let attemptIndex = 0;

  while (runs.length < config.numberOfRuns) {
    attemptIndex += 1;
    const outputPath = resolve(outputDirectory, `attempt-${attemptIndex}.json`);
    const commandResult = await run(
      process.execPath,
      [
        lighthouseCli,
        config.url,
        "--quiet",
        "--output=json",
        `--output-path=${outputPath}`,
        "--only-categories=performance,accessibility,best-practices,seo",
        "--chrome-flags=--headless=new --disable-dev-shm-usage",
      ],
      {
        allowFailure: true,
      },
    );

    if (!existsSync(outputPath)) {
      throw new Error(
        `Lighthouse attempt ${attemptIndex} exited without a JSON report.`,
      );
    }

    const report = JSON.parse(readFileSync(outputPath, "utf8"));
    if (report.runtimeError) {
      const rejectedAttempt = {
        attemptIndex,
        status: "rejected",
        output: `attempt-${attemptIndex}.json`,
        exitCode: commandResult.code,
        signal: commandResult.signal,
        runtimeError: {
          code: report.runtimeError.code ?? null,
          message: report.runtimeError.message ?? "Unknown Lighthouse runtime error",
        },
      };
      attempts.push(rejectedAttempt);
      writeFileSync(
        resolve(outputDirectory, "attempts.json"),
        `${JSON.stringify(attempts, null, 2)}\n`,
      );

      const retriable = retriableRuntimeErrorCodes.has(
        report.runtimeError.code,
      );
      if (!retriable || rejectedAttempts >= config.maxRejectedAttempts) {
        throw new Error(
          `Lighthouse attempt ${attemptIndex} failed: ${report.runtimeError.message}`,
        );
      }

      rejectedAttempts += 1;
      continue;
    }

    if (commandResult.code !== 0) {
      throw new Error(
        `Lighthouse attempt ${attemptIndex} exited with ${commandResult.code}.`,
      );
    }

    const runIndex = runs.length + 1;
    runs.push(metricFromReport(report));
    attempts.push({
      attemptIndex,
      runIndex,
      status: "accepted",
      output: `attempt-${attemptIndex}.json`,
      exitCode: commandResult.code,
      signal: commandResult.signal,
    });
    writeFileSync(
      resolve(outputDirectory, "attempts.json"),
      `${JSON.stringify(attempts, null, 2)}\n`,
    );
    lighthouseProvenance ??= {
      benchmarkIndex: report.environment?.benchmarkIndex ?? null,
      hostUserAgent: report.environment?.hostUserAgent ?? null,
      networkUserAgent: report.environment?.networkUserAgent ?? null,
      formFactor: report.configSettings?.formFactor ?? null,
      screenEmulation: report.configSettings?.screenEmulation ?? null,
      throttling: report.configSettings?.throttling ?? null,
      throttlingMethod: report.configSettings?.throttlingMethod ?? null,
    };
  }

  const medians = Object.fromEntries(
    Object.keys(runs[0]).map((metric) => [
      metric,
      median(runs.map((runResult) => runResult[metric])),
    ]),
  );
  const evaluation = evaluate(medians);
  const summary = {
    generatedAt: new Date().toISOString(),
    gitCommit: readGitCommit(),
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    chromeVersion: browserVersionFromUserAgent(
      lighthouseProvenance?.hostUserAgent,
    ),
    toolVersion: config.toolVersion,
    profile: config.activeProfile,
    url: config.url,
    attempts,
    runs,
    medians,
    provenance: lighthouseProvenance,
    evaluation,
  };

  writeFileSync(
    resolve(outputDirectory, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (!evaluation.passed) {
    process.exitCode = 1;
  }
} finally {
  removeSignalCleanup();
  await cleanupOwnedResources();
}
