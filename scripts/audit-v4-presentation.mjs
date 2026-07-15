#!/usr/bin/env node

import { auditV4PresentationTree } from "./lib/v4-presentation-audit.mjs";

const result = auditV4PresentationTree();

for (const violation of result.violations) {
  console.error(
    `${violation.file}:${violation.line} [${violation.rule}] ${violation.message}`,
  );
}

if (result.violations.length > 0) {
  console.error(
    `V4 presentation audit failed with ${result.violations.length} violation(s) across ${result.files.length} file(s).`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `V4 presentation audit passed across ${result.files.length} source file(s).`,
  );
}
