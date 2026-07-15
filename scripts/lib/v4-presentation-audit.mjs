import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const SOURCE_EXTENSIONS = new Set([".css", ".ts", ".tsx"]);

const RULES = Object.freeze([
  {
    id: "negative-order",
    message: "V4 presentation must preserve semantic order; negative CSS order is forbidden.",
    pattern: /\border\s*:\s*-\d+(?:\.\d+)?\b/gi,
  },
  {
    id: "three-runtime",
    message: "V4 ships no Three.js or React Three Fiber runtime.",
    pattern:
      /\b(?:from\s+|import\s*(?:\(\s*)?)["'](?:three(?:\/[^"']*)?|@react-three\/[^"']+)["']/g,
  },
  {
    id: "canvas-runtime",
    message: "V4 ships no canvas surface or canvas-created runtime.",
    pattern: /<canvas\b|createElement\(\s*["']canvas["']/gi,
  },
  {
    id: "scroll-pin",
    message: "V4 motion may not pin content or intercept the reading flow.",
    pattern:
      /\bpin\s*:(?!\s*false\b)\s*(?:true|["'][^"']+["']|[A-Za-z_$][\w$]*)/g,
  },
  {
    id: "scroll-scrub",
    message: "V4 motion is bounded and may not use a scrubbed scroll timeline.",
    pattern: /\bscrub\s*:(?!\s*false\b)\s*[^,}\n]+/g,
  },
  {
    id: "infinite-repeat",
    message: "V4 motion may not run an infinite decorative loop.",
    pattern: /\brepeat\s*:\s*-1\b/g,
  },
  {
    id: "custom-cursor",
    message: "V4 keeps the native cursor; cursor hiding is forbidden.",
    pattern: /\bcursor\s*:\s*none\b/gi,
  },
  {
    id: "remote-visual",
    message: "V4 visible assets must resolve from the repository-owned media contract.",
    pattern:
      /\b(?:src|poster)\s*=\s*["']https?:\/\/|url\(\s*["']?https?:\/\//gi,
  },
  {
    id: "v3-presentation-import",
    message: "V4 modules may not import the legacy PFN presentation layer.",
    pattern:
      /\b(?:from\s+|import\s*\(\s*)["'][^"']*(?:components\/pfn|\/pfn\/)[^"']*["']/g,
  },
  {
    id: "artifact-cover",
    message: "Authentic product artifacts must use intrinsic containment, never cover cropping.",
    pattern:
      /<ArtifactFragment\b[^>]*\bfit\s*=\s*(?:["']cover["']|\{\s*["']cover["']\s*\})[^>]*>|\[data-artifact-id[^\]]*\][^{]*\{[^}]*object-fit\s*:\s*cover/gi,
  },
]);

function normalizePath(file) {
  return file.split(sep).join("/");
}

function extension(file) {
  const index = file.lastIndexOf(".");
  return index === -1 ? "" : file.slice(index);
}

function sourceFilesBelow(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && SOURCE_EXTENSIONS.has(extension(entry.name)))
    .map((entry) => resolve(entry.parentPath, entry.name))
    .sort();
}

function lineAt(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

export function auditV4PresentationSource(source, file = "source.tsx") {
  const violations = [];

  for (const rule of RULES) {
    for (const match of source.matchAll(rule.pattern)) {
      violations.push({
        file,
        line: lineAt(source, match.index ?? 0),
        message: rule.message,
        rule: rule.id,
      });
    }
  }

  if (
    source.includes("data-artifact-id") &&
    /<ResponsiveMedia\b[\s\S]{0,700}\bfit\s*=\s*(?:["']cover["']|\{\s*["']cover["']\s*\})/i.test(
      source,
    )
  ) {
    violations.push({
      file,
      line: lineAt(source, source.indexOf("data-artifact-id")),
      message: "Artifact primitives must keep ResponsiveMedia in contain mode.",
      rule: "artifact-cover",
    });
  }

  return violations;
}

export function auditV4PresentationTree({
  projectRoot = process.cwd(),
  roots = ["src/components/portfolio", "src/styles/portfolio"],
} = {}) {
  const violations = [];
  const files = roots.flatMap((root) => sourceFilesBelow(resolve(projectRoot, root)));

  for (const sourcePath of files) {
    const file = normalizePath(relative(projectRoot, sourcePath));
    violations.push(
      ...auditV4PresentationSource(readFileSync(sourcePath, "utf8"), file),
    );
  }

  return {
    files: files.map((file) => normalizePath(relative(projectRoot, file))),
    violations: violations.sort(
      (left, right) =>
        left.file.localeCompare(right.file) ||
        left.line - right.line ||
        left.rule.localeCompare(right.rule),
    ),
  };
}
