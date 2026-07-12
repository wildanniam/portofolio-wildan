#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  collectExternalLinks,
  probeExternalLink,
  summarizeExternalLinkResults,
} from "./lib/external-link-audit.mjs";

function parseArguments(argv) {
  const options = {
    output: ".quality-reports/release/external-links.json",
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--strict") {
      options.strict = true;
      continue;
    }
    if (argument === "--output") {
      const value = argv[index + 1];
      if (!value) throw new TypeError("--output requires a path.");
      options.output = value;
      index += 1;
      continue;
    }
    throw new TypeError(`Unknown argument: ${argument}`);
  }

  return options;
}

const options = parseArguments(process.argv.slice(2));
const sources = collectExternalLinks();
const results = new Array(sources.length);
let nextSourceIndex = 0;

async function auditNextSource() {
  while (nextSourceIndex < sources.length) {
    const index = nextSourceIndex;
    nextSourceIndex += 1;
    const source = sources[index];
    const result = await probeExternalLink(source.url);
    results[index] = { ...source, ...result };
  }
}

await Promise.all(
  Array.from({ length: Math.min(5, sources.length) }, () => auditNextSource()),
);

for (const result of results) {
  const detail = result.status ? `HTTP ${result.status}` : result.error;
  console.log(
    `${result.classification.padEnd(13)} ${result.url} ${detail ?? ""}`,
  );
}

const summary = summarizeExternalLinkResults(results);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  ...summary,
  links: results,
};
const outputPath = resolve(process.cwd(), options.output);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  `External link audit: ${summary.counts.reachable} reachable, ${summary.counts["manual-review"]} manual, ${summary.counts.failure} failed.`,
);
console.log(`Report: ${outputPath}`);

if (options.strict && summary.counts.failure > 0) process.exitCode = 1;
