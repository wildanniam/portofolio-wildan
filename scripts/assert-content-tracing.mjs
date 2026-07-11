import { readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

const projectRoot = process.cwd();
const contentRoot = resolve(projectRoot, "content");
const appTraceRoot = resolve(projectRoot, ".next/server/app");
const contentRouteSuffix = [
  "(v1)",
  "preview",
  "open-proving-ground",
  "content",
  "[slug]",
  "page.js.nft.json",
].join("/");
const allowedContentTraceFragments = [
  "/(v1)/(site)/",
  "/(v1)/preview/open-proving-ground/content/[slug]/",
  "/(v1)/preview/open-proving-ground/moments/",
  "/(v1)/preview/open-proving-ground/moments-qa/",
  "/sitemap.xml/",
];

function filesBelow(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(entry.parentPath, entry.name))
    .sort();
}

function normalize(path) {
  return path.split(sep).join("/");
}

function contentFilesInTrace(tracePath) {
  const trace = JSON.parse(readFileSync(tracePath, "utf8"));
  if (!Array.isArray(trace.files)) {
    throw new TypeError(`${tracePath} does not contain an NFT files array.`);
  }

  return trace.files
    .map((file) => resolve(dirname(tracePath), file))
    .filter((file) => file === contentRoot || file.startsWith(`${contentRoot}${sep}`))
    .map((file) => normalize(relative(projectRoot, file)))
    .sort();
}

const tracePaths = filesBelow(appTraceRoot).filter((path) =>
  path.endsWith(".nft.json"),
);
const expectedContentFiles = filesBelow(contentRoot).map((path) =>
  normalize(relative(projectRoot, path)),
);
const contentRouteTrace = tracePaths.find((path) =>
  normalize(path).endsWith(contentRouteSuffix),
);

if (!contentRouteTrace) {
  throw new Error("The content compatibility route NFT was not generated.");
}

const tracedContentFiles = contentFilesInTrace(contentRouteTrace);
const missingFiles = expectedContentFiles.filter(
  (file) => !tracedContentFiles.includes(file),
);
if (missingFiles.length > 0) {
  throw new Error(
    `The content route trace is missing:\n${missingFiles.map((file) => `- ${file}`).join("\n")}`,
  );
}

const leakedRoutes = tracePaths.flatMap((tracePath) => {
  const normalizedTracePath = normalize(tracePath);
  if (
    tracePath === contentRouteTrace ||
    allowedContentTraceFragments.some((fragment) =>
      normalizedTracePath.includes(fragment),
    )
  ) {
    return [];
  }
  const leakedFiles = contentFilesInTrace(tracePath);
  return leakedFiles.length > 0
    ? [
        `${normalize(relative(projectRoot, tracePath))}:\n${leakedFiles
          .map((file) => `  - ${file}`)
          .join("\n")}`,
      ]
    : [];
});

if (leakedRoutes.length > 0) {
  throw new Error(
    `Repository content leaked into unrelated route traces:\n${leakedRoutes.join("\n")}`,
  );
}

console.log(
  `Content tracing passed. ${tracedContentFiles.length} source files are complete in the compatibility trace and limited to approved V1 consumers.`,
);
