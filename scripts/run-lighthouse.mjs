import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { createServer, request as httpRequest } from "node:http";
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
const profileName = process.env.LIGHTHOUSE_PROFILE ?? config.activeProfile;
const targetUrl = process.env.LIGHTHOUSE_URL ?? config.url;
const profile = config.profiles[profileName];

if (!profile) {
  throw new Error(
    `Unknown Lighthouse budget profile: ${String(profileName)}`,
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
  requestHeaders,
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

function readPreviewAuth() {
  const token = process.env.PORTFOLIO_V1_PREVIEW_TOKEN?.trim();
  if (!token) return undefined;
  if (token.length < 32) {
    throw new Error(
      "PORTFOLIO_V1_PREVIEW_TOKEN must contain at least 32 characters.",
    );
  }

  const encodedCredentials = Buffer.from(`preview:${token}`).toString("base64");
  return {
    token,
    encodedCredentials,
    authorization: `Basic ${encodedCredentials}`,
  };
}

function parseOwnedPort(value, label) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
    throw new Error(`Invalid ${label}: ${String(value)}.`);
  }

  return port;
}

const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "proxy-connection",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

function withoutHopByHopHeaders(headers) {
  const result = { ...headers };
  for (const header of HOP_BY_HOP_HEADERS) delete result[header];
  return result;
}

async function startAuthenticatedPreviewProxy({
  listenPort,
  upstreamPort,
  authorization,
}) {
  const proxyOrigin = `http://127.0.0.1:${listenPort}`;
  const proxy = createServer((incoming, outgoing) => {
    let incomingUrl;
    try {
      incomingUrl = new URL(incoming.url ?? "", proxyOrigin);
    } catch {
      outgoing.writeHead(400).end("Invalid request URL.");
      return;
    }

    if (incomingUrl.origin !== proxyOrigin) {
      outgoing.writeHead(400).end("Absolute proxy requests are not supported.");
      return;
    }

    const headers = withoutHopByHopHeaders(incoming.headers);
    headers.host = `127.0.0.1:${listenPort}`;
    headers.authorization = authorization;
    headers["x-forwarded-for"] = "127.0.0.1";
    headers["x-forwarded-host"] = `127.0.0.1:${listenPort}`;
    headers["x-forwarded-proto"] = "http";

    const upstream = httpRequest(
      {
        hostname: "127.0.0.1",
        port: upstreamPort,
        method: incoming.method,
        path: `${incomingUrl.pathname}${incomingUrl.search}`,
        headers,
      },
      (response) => {
        outgoing.writeHead(
          response.statusCode ?? 502,
          withoutHopByHopHeaders(response.headers),
        );
        response.on("aborted", () => outgoing.destroy());
        response.on("error", (error) => outgoing.destroy(error));
        response.pipe(outgoing);
      },
    );

    upstream.on("error", (error) => {
      if (!outgoing.headersSent) {
        outgoing.writeHead(502).end("Preview upstream unavailable.");
      } else {
        outgoing.destroy(error);
      }
    });
    incoming.on("aborted", () => upstream.destroy());
    incoming.on("error", (error) => upstream.destroy(error));
    incoming.pipe(upstream);
  });

  proxy.on("clientError", (_error, socket) => {
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
  });

  await new Promise((resolveStart, rejectStart) => {
    const handleError = (error) => {
      proxy.removeListener("listening", handleListening);
      rejectStart(error);
    };
    const handleListening = () => {
      proxy.removeListener("error", handleError);
      resolveStart();
    };

    proxy.once("error", handleError);
    proxy.once("listening", handleListening);
    proxy.listen(listenPort, "127.0.0.1");
  });

  return proxy;
}

async function stopHttpServer(server) {
  if (!server?.listening) return;

  await new Promise((resolveStop) => {
    server.close(() => resolveStop());
    server.closeAllConnections?.();
  });
}

function assertReportDoesNotContainSecrets(source, secrets, outputPath) {
  const leaked = secrets.some(
    (secret) => typeof secret === "string" && secret.length > 0 && source.includes(secret),
  );
  if (!leaked) return;

  rmSync(outputPath, { force: true });
  throw new Error(
    "Lighthouse report contained protected preview credentials and was deleted.",
  );
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

const lighthouseUrl = new URL(targetUrl);
if (
  lighthouseUrl.protocol !== "http:" ||
  lighthouseUrl.hostname !== "127.0.0.1" ||
  !lighthouseUrl.port ||
  lighthouseUrl.username ||
  lighthouseUrl.password
) {
  throw new Error(
    "Lighthouse URL must use an explicit credential-free http://127.0.0.1 port owned by this command.",
  );
}

const isProtectedPreview = lighthouseUrl.pathname.startsWith("/preview/");
const previewAuth = isProtectedPreview ? readPreviewAuth() : undefined;
const lighthousePort = parseOwnedPort(lighthouseUrl.port, "Lighthouse URL port");
const upstreamPort = isProtectedPreview
  ? parseOwnedPort(
      process.env.LIGHTHOUSE_UPSTREAM_PORT ?? "3106",
      "LIGHTHOUSE_UPSTREAM_PORT",
    )
  : lighthousePort;
if (isProtectedPreview && upstreamPort === lighthousePort) {
  throw new Error(
    "LIGHTHOUSE_UPSTREAM_PORT must differ from the protected preview proxy port.",
  );
}
const upstreamOrigin = `http://127.0.0.1:${upstreamPort}`;
const upstreamTargetUrl = new URL(
  `${lighthouseUrl.pathname}${lighthouseUrl.search}`,
  upstreamOrigin,
).href;

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });
const requestHeaders = previewAuth
  ? { Authorization: previewAuth.authorization }
  : undefined;
if (isProtectedPreview && !previewAuth) {
  throw new Error(
    "A protected preview probe requires PORTFOLIO_V1_PREVIEW_TOKEN.",
  );
}
if (
  isProtectedPreview &&
  process.env.PORTFOLIO_V1_PREVIEW !== "1"
) {
  throw new Error(
    "A protected preview probe requires PORTFOLIO_V1_PREVIEW=1.",
  );
}

let server = null;
let previewProxy = null;
let cleanupPromise;
const cleanupOwnedResources = () => {
  cleanupPromise ??= (async () => {
    await Promise.all(
      [...activeChildren].map((child) => terminate(child)),
    );
    await stopHttpServer(previewProxy);
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
      String(upstreamPort),
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
    upstreamTargetUrl,
    server,
    () => serverStartupError,
    () => serverReportedReady,
    requestHeaders,
  );

  if (isProtectedPreview) {
    previewProxy = await startAuthenticatedPreviewProxy({
      listenPort: lighthousePort,
      upstreamPort,
      authorization: previewAuth.authorization,
    });
    const proxyResponse = await fetch(targetUrl, { redirect: "manual" });
    if (proxyResponse.status >= 400) {
      throw new Error(
        `Protected preview proxy returned ${proxyResponse.status} for ${targetUrl}.`,
      );
    }
  }

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
    const lighthouseArguments = [
      lighthouseCli,
      targetUrl,
      "--quiet",
      "--output=json",
      `--output-path=${outputPath}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --disable-dev-shm-usage",
    ];
    const lighthouseEnvironment = { ...process.env };
    delete lighthouseEnvironment.PORTFOLIO_V1_PREVIEW_TOKEN;
    const commandResult = await run(
      process.execPath,
      lighthouseArguments,
      {
        allowFailure: true,
        env: lighthouseEnvironment,
      },
    );

    if (!existsSync(outputPath)) {
      throw new Error(
        `Lighthouse attempt ${attemptIndex} exited without a JSON report.`,
      );
    }

    const reportSource = readFileSync(outputPath, "utf8");
    assertReportDoesNotContainSecrets(
      reportSource,
      [
        previewAuth?.token,
        previewAuth?.encodedCredentials,
        previewAuth?.authorization,
      ],
      outputPath,
    );
    const report = JSON.parse(reportSource);
    writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
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
    profile: profileName,
    url: targetUrl,
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
