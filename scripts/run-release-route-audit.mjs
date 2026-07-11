#!/usr/bin/env node

import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

const root = process.cwd();
const port = Number(process.env.RELEASE_AUDIT_PORT ?? "3105");
if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
  throw new TypeError(`Invalid RELEASE_AUDIT_PORT: ${String(port)}.`);
}

const origin = `http://127.0.0.1:${port}`;
const token = randomBytes(32).toString("hex");
const nextBin = resolve(root, "node_modules/next/dist/bin/next");
const auditScript = resolve(root, "scripts/audit-release-routes.mjs");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = new Set();

function run(command, args, { env = process.env, stdio = "inherit" } = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      stdio,
    });
    children.add(child);
    child.once("error", (error) => {
      children.delete(child);
      rejectRun(error);
    });
    child.once("exit", (code, signal) => {
      children.delete(child);
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(
        new Error(
          `${command} exited with ${code ?? `signal ${String(signal)}`}.`,
        ),
      );
    });
  });
}

const delay = (milliseconds) =>
  new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

async function waitForServer(server, output, getStartError) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const startError = getStartError();
    if (startError) throw startError;
    if (hasExited(server)) {
      throw new Error(
        `Release-audit server exited before readiness.\n${output()}`,
      );
    }
    try {
      const response = await fetch(origin, {
        redirect: "manual",
        signal: AbortSignal.timeout(2_000),
      });
      if (response.status < 500) return;
    } catch {
      // The owned production server is still starting.
    }
    await delay(200);
  }
  throw new Error(`Release-audit server did not become ready.\n${output()}`);
}

async function stopServer(server) {
  if (hasExited(server)) return;
  server.kill("SIGTERM");
  const deadline = Date.now() + 10_000;
  while (!hasExited(server) && Date.now() < deadline) await delay(50);
  if (!hasExited(server)) server.kill("SIGKILL");
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    for (const child of children) child.kill(signal);
  });
}

const releaseEnvironment = {
  ...process.env,
  FORCE_COLOR: "0",
  NEXT_TELEMETRY_DISABLED: "1",
  PORTFOLIO_V1_PREVIEW: "1",
  PORTFOLIO_V1_PREVIEW_TOKEN: token,
};

await run(npmCommand, ["run", "build"], { env: releaseEnvironment });

const server = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    env: releaseEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
children.add(server);
/** @type {Error | undefined} */
let serverStartError;
server.once("error", (error) => {
  serverStartError = error;
});
let serverOutput = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    serverOutput = `${serverOutput}${chunk}`.slice(-12_000);
  });
}

try {
  await waitForServer(
    server,
    () => serverOutput,
    () => serverStartError,
  );
  await run(
    process.execPath,
    [
      auditScript,
      "--strict",
      "--origin",
      origin,
      "--preview-token",
      token,
      ...process.argv.slice(2),
    ],
    { env: releaseEnvironment },
  );
} finally {
  await stopServer(server);
  children.delete(server);
}
