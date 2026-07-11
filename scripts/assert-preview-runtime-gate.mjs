import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const port = Number(process.env.PREVIEW_GATE_PORT ?? "3106");
const origin = `http://127.0.0.1:${port}`;
const previewPath = "/preview/open-proving-ground/content/fradium";
const prerenderManifest = JSON.parse(
  readFileSync(resolve(projectRoot, ".next/prerender-manifest.json"), "utf8"),
);

if (!Object.hasOwn(prerenderManifest.routes, previewPath)) {
  throw new Error(
    "Runtime-gate verification requires the preview-enabled build produced by the content browser suite.",
  );
}

const nextBin = resolve(projectRoot, "node_modules/next/dist/bin/next");
const server = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      FORCE_COLOR: "0",
      NEXT_TELEMETRY_DISABLED: "1",
      PORTFOLIO_V1_PREVIEW: "0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let serverOutput = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    serverOutput = `${serverOutput}${chunk}`.slice(-8_000);
  });
}

let serverExit;
server.once("exit", (code, signal) => {
  serverExit = { code, signal };
});

const delay = (milliseconds) =>
  new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

async function waitUntilReady() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (serverExit) {
      throw new Error(
        `The runtime-gate server exited before readiness (${JSON.stringify(serverExit)}).\n${serverOutput}`,
      );
    }

    try {
      const response = await fetch(origin, {
        redirect: "manual",
        signal: AbortSignal.timeout(1_000),
      });
      if (response.status > 0) return;
    } catch {
      await delay(100);
    }
  }

  throw new Error(`The runtime-gate server did not become ready.\n${serverOutput}`);
}

async function stopServer() {
  if (serverExit) return;

  server.kill("SIGTERM");
  const deadline = Date.now() + 10_000;
  while (!serverExit && Date.now() < deadline) {
    await delay(50);
  }

  if (!serverExit) {
    server.kill("SIGKILL");
  }
}

try {
  await waitUntilReady();
  const response = await fetch(`${origin}${previewPath}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(5_000),
  });
  const body = await response.text();

  if (response.status !== 404) {
    throw new Error(`Expected runtime-disabled preview to return 404, received ${response.status}.`);
  }
  if (!body.includes('data-site-shell="v1"')) {
    throw new Error("Runtime-disabled preview did not return the semantic V1 private-preview shell.");
  }
  if (!response.headers.get("cache-control")?.includes("no-store")) {
    throw new Error("Runtime-disabled preview response is missing its no-store cache boundary.");
  }
  if (!response.headers.get("x-robots-tag")?.includes("noindex")) {
    throw new Error("Runtime-disabled preview response is missing its noindex boundary.");
  }

  console.log(
    "Preview runtime gate passed. A preview-enabled build becomes unavailable when started with preview disabled.",
  );
} finally {
  await stopServer();
}
