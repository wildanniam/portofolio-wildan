import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
  ContentSourceError,
  loadContentRepository,
} from "./repository.node";
import type { ContentRepositoryOptions } from "./repository.node";
import type { ContentDiagnostic } from "./types";
import { ContentValidationError } from "./validate";

type ValidationOutput = {
  log(message: string): void;
  error(message: string): void;
};

function formatDiagnostic(diagnostic: ContentDiagnostic): string {
  return `[${diagnostic.severity}] ${diagnostic.code} ${diagnostic.path} — ${diagnostic.message}`;
}

function diagnosticsFrom(error: unknown): ContentDiagnostic[] | undefined {
  if (
    error instanceof ContentValidationError ||
    error instanceof ContentSourceError
  ) {
    return error.diagnostics;
  }
  return undefined;
}

export function runContentValidation(
  output: ValidationOutput = console,
  repositoryOptions: ContentRepositoryOptions = {},
): number {
  try {
    const { content, diagnostics } = loadContentRepository(repositoryOptions);
    const publicationCounts = {
      draft: content.projects.filter(
        (project) => project.publication === "draft",
      ).length,
      preview: content.projects.filter(
        (project) => project.publication === "preview",
      ).length,
      published: content.projects.filter(
        (project) => project.publication === "published",
      ).length,
    };

    output.log(
      [
        "Content validation passed.",
        `${content.projects.length} projects (${publicationCounts.published} published, ${publicationCounts.preview} preview, ${publicationCounts.draft} draft)`,
        `${content.moments.length} moments`,
        `${diagnostics.length} warnings`,
      ].join(" "),
    );
    return 0;
  } catch (error) {
    const diagnostics = diagnosticsFrom(error);
    output.error("Content validation failed.");

    if (diagnostics) {
      diagnostics.forEach((diagnostic) =>
        output.error(formatDiagnostic(diagnostic)),
      );
    } else {
      output.error(
        error instanceof Error ? error.message : "Unknown content validation error.",
      );
    }
    return 1;
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;

if (invokedPath === import.meta.url) {
  process.exitCode = runContentValidation();
}
