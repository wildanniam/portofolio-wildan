import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { basename, extname, isAbsolute, relative, resolve, sep } from "node:path";

import { parseDocument } from "yaml";

import {
  CaseStudyMdxPolicyError,
  assertValidCaseStudyMdx,
} from "./mdx-policy";
import type {
  ContentBundle,
  ContentDiagnostic,
  ContentValidationResult,
} from "./types";
import {
  ContentValidationError,
  sortContentDiagnostics,
  validateContentBundle,
} from "./validate";

const SITE_RECORDS = {
  assetLicenseManifest: "asset-licenses.yaml",
  currentlyBuilding: "currently-building.yaml",
  homepage: "homepage.yaml",
  navigation: "navigation.yaml",
  profile: "profile.yaml",
} as const;

export type ContentRepositoryOptions = {
  repositoryRoot?: string;
  contentDirectory?: string;
};

export class ContentSourceError extends Error {
  readonly diagnostics: ContentDiagnostic[];

  constructor(diagnostics: readonly ContentDiagnostic[]) {
    const sorted = sortContentDiagnostics(diagnostics);
    super(
      sorted
        .map(
          (diagnostic) =>
            `${diagnostic.path}: [${diagnostic.code}] ${diagnostic.message}`,
        )
        .join("\n"),
    );
    this.name = "ContentSourceError";
    this.diagnostics = sorted;
  }
}

type RepositoryPaths = {
  repositoryRoot: string;
  contentDirectory: string;
};

function normalizeRepositoryPath(path: string): string {
  return path.split(sep).join("/");
}

function isWithinDirectory(parent: string, candidate: string): boolean {
  const childPath = relative(parent, candidate);
  return (
    childPath === "" ||
    (!childPath.startsWith(`..${sep}`) && childPath !== ".." && !isAbsolute(childPath))
  );
}

function resolveRepositoryPaths(
  options: ContentRepositoryOptions,
): RepositoryPaths {
  const requestedRepositoryRoot = resolve(
    /* turbopackIgnore: true */ options.repositoryRoot ?? process.cwd(),
  );
  let repositoryRoot: string;

  try {
    repositoryRoot = realpathSync(
      /* turbopackIgnore: true */ requestedRepositoryRoot,
    );
    if (!lstatSync(/* turbopackIgnore: true */ repositoryRoot).isDirectory()) {
      throw new TypeError("Repository root is not a directory.");
    }
  } catch (error) {
    throw new ContentSourceError([
      {
        severity: "error",
        code: "source.repository-root-unreadable",
        path: "$repository",
        message:
          error instanceof Error
            ? error.message
            : "The repository root could not be resolved.",
      },
    ]);
  }

  const requestedContentDirectory = resolve(
    /* turbopackIgnore: true */ requestedRepositoryRoot,
    options.contentDirectory ?? "content",
  );
  let contentDirectory: string;

  try {
    contentDirectory = realpathSync(
      /* turbopackIgnore: true */ requestedContentDirectory,
    );
    if (!lstatSync(/* turbopackIgnore: true */ contentDirectory).isDirectory()) {
      throw new TypeError("Content root is not a directory.");
    }
  } catch (error) {
    throw new ContentSourceError([
      {
        severity: "error",
        code: "source.content-root-unreadable",
        path: "$repository.content",
        message:
          error instanceof Error
            ? error.message
            : "The content directory could not be resolved.",
      },
    ]);
  }

  if (!isWithinDirectory(repositoryRoot, contentDirectory)) {
    throw new ContentSourceError([
      {
        severity: "error",
        code: "source.content-root-outside-repository",
        path: "$repository",
        message: "The content directory must stay inside the repository root.",
      },
    ]);
  }

  return { repositoryRoot, contentDirectory };
}

function toRepositoryPath(
  repositoryRoot: string,
  absolutePath: string,
): string {
  return normalizeRepositoryPath(relative(repositoryRoot, absolutePath));
}

export function parseYamlSource(source: string, sourcePath: string): unknown {
  const document = parseDocument(source, {
    prettyErrors: false,
    schema: "core",
    strict: true,
    uniqueKeys: true,
  });
  const parserMessages = [...document.errors, ...document.warnings];

  if (parserMessages.length > 0) {
    throw new ContentSourceError(
      parserMessages.map((message) => {
        const line = message.linePos?.[0];
        return {
          severity: "error" as const,
          code: "source.yaml-invalid",
          path: line
            ? `${sourcePath}:${line.line}:${line.col}`
            : sourcePath,
          message: message.message,
        };
      }),
    );
  }

  try {
    return document.toJS({ maxAliasCount: 0 });
  } catch (error) {
    throw new ContentSourceError([
      {
        severity: "error",
        code: "source.yaml-conversion-failed",
        path: sourcePath,
        message:
          error instanceof Error ? error.message : "YAML conversion failed.",
      },
    ]);
  }
}

function readRequiredTextFile(
  absolutePath: string,
  repositoryRoot: string,
): string {
  const repositoryPath = toRepositoryPath(repositoryRoot, absolutePath);

  try {
    const fileStatus = lstatSync(/* turbopackIgnore: true */ absolutePath);
    if (fileStatus.isSymbolicLink()) {
      throw new TypeError("Symbolic-link content files are not allowed.");
    }
    if (!fileStatus.isFile()) {
      throw new TypeError("Content source must be a regular file.");
    }

    const realPath = realpathSync(
      /* turbopackIgnore: true */ absolutePath,
    );
    if (!isWithinDirectory(repositoryRoot, realPath)) {
      throw new TypeError("Content source resolves outside the repository root.");
    }

    return readFileSync(/* turbopackIgnore: true */ realPath, "utf8");
  } catch (error) {
    throw new ContentSourceError([
      {
        severity: "error",
        code:
          error instanceof TypeError
            ? "source.file-boundary-invalid"
            : "source.file-unreadable",
        path: repositoryPath,
        message:
          error instanceof Error ? error.message : "The file could not be read.",
      },
    ]);
  }
}

function readYamlFile(absolutePath: string, repositoryRoot: string): unknown {
  const repositoryPath = toRepositoryPath(repositoryRoot, absolutePath);
  return parseYamlSource(
    readRequiredTextFile(absolutePath, repositoryRoot),
    repositoryPath,
  );
}

function listDirectories(absolutePath: string, repositoryRoot: string): string[] {
  try {
    return readdirSync(/* turbopackIgnore: true */ absolutePath, {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .toSorted();
  } catch (error) {
    throw new ContentSourceError([
      {
        severity: "error",
        code: "source.directory-unreadable",
        path: toRepositoryPath(repositoryRoot, absolutePath),
        message:
          error instanceof Error
            ? error.message
            : "The directory could not be read.",
      },
    ]);
  }
}

function listYamlFiles(absolutePath: string, repositoryRoot: string): string[] {
  if (!existsSync(/* turbopackIgnore: true */ absolutePath)) return [];

  try {
    return readdirSync(/* turbopackIgnore: true */ absolutePath, {
      withFileTypes: true,
    })
      .filter(
        (entry) =>
          entry.isFile() && /\.(?:yaml|yml)$/i.test(entry.name),
      )
      .map((entry) => resolve(absolutePath, entry.name))
      .toSorted();
  } catch (error) {
    throw new ContentSourceError([
      {
        severity: "error",
        code: "source.directory-unreadable",
        path: toRepositoryPath(repositoryRoot, absolutePath),
        message:
          error instanceof Error
            ? error.message
            : "The directory could not be read.",
      },
    ]);
  }
}

function createFilePresence(repositoryRoot: string) {
  return (repositoryPath: string): boolean => {
    const absolutePath = resolve(
      /* turbopackIgnore: true */ repositoryRoot,
      repositoryPath,
    );
    if (!isWithinDirectory(repositoryRoot, absolutePath)) return false;

    try {
      const fileStatus = lstatSync(/* turbopackIgnore: true */ absolutePath);
      return (
        fileStatus.isFile() &&
        !fileStatus.isSymbolicLink() &&
        isWithinDirectory(
          repositoryRoot,
          realpathSync(/* turbopackIgnore: true */ absolutePath),
        )
      );
    } catch {
      return false;
    }
  };
}

function validateNarrativeSources(
  content: ContentBundle,
  repositoryRoot: string,
  momentPaths: readonly string[],
): void {
  const sourceBySlug = new Map(
    content.sources.projects.map((source) => [source.slug, source]),
  );
  const diagnostics: ContentDiagnostic[] = [];

  for (const project of content.projects) {
    const source = sourceBySlug.get(project.slug);

    if (project.caseStudyState === "full" && !source?.caseStudyMdxPath) {
      diagnostics.push({
        severity: "error",
        code: "source.full-case-study-missing",
        path: source?.recordPath ?? `content/projects/${project.slug}`,
        message: `Full case study "${project.slug}" requires case-study.mdx.`,
      });
      continue;
    }

    if (!source?.caseStudyMdxPath) continue;

    const absolutePath = resolve(repositoryRoot, source.caseStudyMdxPath);
    const mdxSource = readRequiredTextFile(absolutePath, repositoryRoot);

    try {
      assertValidCaseStudyMdx(mdxSource);
    } catch (error) {
      if (error instanceof CaseStudyMdxPolicyError) {
        diagnostics.push(
          ...error.diagnostics.map((diagnostic) => ({
            severity: "error" as const,
            code: diagnostic.code,
            path: `${source.caseStudyMdxPath}:${diagnostic.position.start.line}:${diagnostic.position.start.column}`,
            message: diagnostic.message,
          })),
        );
        continue;
      }
      throw error;
    }
  }

  content.moments.forEach((moment, index) => {
    const sourcePath = momentPaths[index];
    if (!sourcePath) return;
    const fileName = basename(sourcePath, extname(sourcePath));
    if (fileName !== moment.id) {
      diagnostics.push({
        severity: "error",
        code: "source.moment-filename-mismatch",
        path: toRepositoryPath(repositoryRoot, sourcePath),
        message: `Moment filename "${fileName}" must match record id "${moment.id}".`,
      });
    }
  });

  if (diagnostics.length > 0) throw new ContentSourceError(diagnostics);
}

/**
 * The one Node/filesystem implementation behind both build validation and the
 * server-only repository wrapper. UI modules must never import this module.
 */
export function loadContentRepository(
  options: ContentRepositoryOptions = {},
): ContentValidationResult {
  const { repositoryRoot, contentDirectory } = resolveRepositoryPaths(options);
  const projectsDirectory = resolve(contentDirectory, "projects");
  const momentsDirectory = resolve(contentDirectory, "moments");
  const siteDirectory = resolve(contentDirectory, "site");

  const projectSources = listDirectories(
    projectsDirectory,
    repositoryRoot,
  ).map((directoryName) => {
    const directory = resolve(projectsDirectory, directoryName);
    const recordPath = resolve(directory, "project.yaml");
    const caseStudyPath = resolve(directory, "case-study.mdx");

    return {
      record: readYamlFile(recordPath, repositoryRoot),
      source: {
        slug: directoryName,
        recordPath: toRepositoryPath(repositoryRoot, recordPath),
        ...(existsSync(/* turbopackIgnore: true */ caseStudyPath)
          ? {
              caseStudyMdxPath: toRepositoryPath(
                repositoryRoot,
                caseStudyPath,
              ),
            }
          : {}),
      },
    };
  });

  const momentPaths = listYamlFiles(momentsDirectory, repositoryRoot);
  const input = {
    projects: projectSources.map(({ record }) => record),
    moments: momentPaths.map((path) => readYamlFile(path, repositoryRoot)),
    profile: readYamlFile(
      resolve(siteDirectory, SITE_RECORDS.profile),
      repositoryRoot,
    ),
    navigation: readYamlFile(
      resolve(siteDirectory, SITE_RECORDS.navigation),
      repositoryRoot,
    ),
    homepage: readYamlFile(
      resolve(siteDirectory, SITE_RECORDS.homepage),
      repositoryRoot,
    ),
    currentlyBuilding: readYamlFile(
      resolve(siteDirectory, SITE_RECORDS.currentlyBuilding),
      repositoryRoot,
    ),
    assetLicenseManifest: readYamlFile(
      resolve(siteDirectory, SITE_RECORDS.assetLicenseManifest),
      repositoryRoot,
    ),
    sources: {
      projects: projectSources.map(({ source }) => source),
    },
  };

  try {
    const result = validateContentBundle(
      input,
      createFilePresence(repositoryRoot),
    );
    validateNarrativeSources(result.content, repositoryRoot, momentPaths);
    return result;
  } catch (error) {
    if (
      error instanceof ContentValidationError ||
      error instanceof ContentSourceError
    ) {
      throw error;
    }

    throw new ContentSourceError([
      {
        severity: "error",
        code: "source.repository-load-failed",
        path: toRepositoryPath(repositoryRoot, contentDirectory),
        message:
          error instanceof Error
            ? error.message
            : "The content repository could not be loaded.",
      },
    ]);
  }
}

export function loadContentBundle(
  options: ContentRepositoryOptions = {},
): ContentBundle {
  return loadContentRepository(options).content;
}

export function contentRootFor(
  options: ContentRepositoryOptions = {},
): string {
  return resolveRepositoryPaths(options).contentDirectory;
}
