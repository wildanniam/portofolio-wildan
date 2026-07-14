#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { auditReleaseRoutes } from "./lib/release-route-audit.mjs";

const DEFAULT_ORIGIN = "http://127.0.0.1:3105";
const DEFAULT_OUTPUT = ".quality-reports/release/routes-and-metadata.json";
const DEFAULT_SITE_ORIGIN = "https://portofolio-wildan-zeta.vercel.app";
const flagshipSlugs = ["fradium", "nova-ai", "paygate", "quorum"];

function auditProfile(name) {
  const staticPublicRoutes = ["/work", "/about", "/contact", "/moments"].map((path) => ({
    classification: "public",
    expectedStatus: 200,
    path,
  }));
  const flagshipRoutes = flagshipSlugs.map((slug) => `/work/${slug}`);

  if (name === "release") {
    const publicRoutes = [
      "/",
      ...staticPublicRoutes.map((route) => route.path),
      ...flagshipRoutes,
    ];
    return {
      deferredChecks: [],
      expectedSitemapPaths: publicRoutes,
      forbiddenSitemapPrefixes: ["/preview/"],
      routes: [
        ...publicRoutes.map((path) => ({
          classification: "public",
          expectedStatus: 200,
          path,
        })),
      ],
    };
  }

  throw new TypeError(
    `Unknown audit profile ${JSON.stringify(name)}. Use release.`,
  );
}

function parseArguments(argv) {
  const options = {
    origin: process.env.RELEASE_AUDIT_ORIGIN ?? DEFAULT_ORIGIN,
    output: DEFAULT_OUTPUT,
    profile: process.env.RELEASE_AUDIT_PROFILE ?? "release",
    siteOrigin: process.env.RELEASE_AUDIT_SITE_ORIGIN ?? DEFAULT_SITE_ORIGIN,
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--strict") {
      options.strict = true;
      continue;
    }
    if (
      [
        "--origin",
        "--output",
        "--profile",
        "--site-origin",
      ].includes(argument)
    ) {
      const value = argv[index + 1];
      if (!value) throw new TypeError(`${argument} requires a value.`);
      if (argument === "--origin") options.origin = value;
      if (argument === "--output") options.output = value;
      if (argument === "--profile") options.profile = value;
      if (argument === "--site-origin") options.siteOrigin = value;
      index += 1;
      continue;
    }
    throw new TypeError(`Unknown argument: ${argument}`);
  }

  return options;
}

const options = parseArguments(process.argv.slice(2));
const profile = auditProfile(options.profile);
const report = await auditReleaseRoutes({
  expectedSitemapPaths: profile.expectedSitemapPaths,
  forbiddenSitemapPrefixes: profile.forbiddenSitemapPrefixes,
  origin: options.origin,
  routes: profile.routes,
  siteOrigin: options.siteOrigin,
});
const outputReport = {
  ...report,
  auditProfile: options.profile,
  deferredChecks: profile.deferredChecks,
};
const outputPath = resolve(process.cwd(), options.output);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(outputReport, null, 2)}\n`, "utf8");

for (const route of report.routes) {
  const state = route.findings.length === 0 ? "PASS" : "CHECK";
  console.log(
    `${state.padEnd(5)} ${String(route.status).padEnd(3)} ${route.classification.padEnd(9)} ${route.path}`,
  );
}
for (const entry of report.findings) {
  console.warn(
    `${entry.severity.toUpperCase()} ${entry.code} ${entry.path}: ${entry.message}`,
  );
}
console.log(
  `Release route audit (${options.profile}): ${report.summary.routes} routes, ${report.summary.internalLinks} internal links, ${report.summary.openGraphImages} Open Graph images, ${report.summary.errors} errors, ${report.summary.warnings} warnings.`,
);
for (const deferredCheck of profile.deferredChecks) {
  console.log(`DEFERRED ${deferredCheck}`);
}
console.log(`Report: ${outputPath}`);

if (options.strict && !report.summary.passed) process.exitCode = 1;
