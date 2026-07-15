import {
  readFileSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";

import { stringify } from "yaml";
import { describe, expect, it } from "vitest";

import {
  ContentSourceError,
  loadContentRepository,
  parseYamlSource,
} from "../../../src/content/repository.node";
import { ContentValidationError } from "../../../src/content/validate";
import {
  REPOSITORY_ROOT,
  createTemporaryRepository,
  makeMoment,
} from "./fixtures";

function sourceDiagnostics(action: () => unknown) {
  try {
    action();
  } catch (error) {
    if (error instanceof ContentSourceError) return error.diagnostics;
    throw error;
  }

  throw new Error("Expected the content source operation to fail.");
}

describe("filesystem content repository", () => {
  it("loads the real repository deterministically in canonical folder order", () => {
    const first = loadContentRepository({ repositoryRoot: REPOSITORY_ROOT });
    const second = loadContentRepository({ repositoryRoot: REPOSITORY_ROOT });

    expect(second).toEqual(first);
    expect(first.diagnostics).toEqual([]);
    const expectedSlugs = readdirSync(
      resolve(REPOSITORY_ROOT, "content/projects"),
      { withFileTypes: true },
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(first.content.projects.map((project) => project.slug)).toEqual(
      expectedSlugs,
    );
    expect(first.content.sources.projects).toEqual(
      [...first.content.sources.projects].sort((left, right) =>
        left.slug.localeCompare(right.slug),
      ),
    );
    expect(JSON.parse(JSON.stringify(first.content))).toEqual(first.content);
  });

  it.each([
    ["malformed", "project: [unterminated"],
    ["duplicate key", "slug: first\nslug: second\n"],
  ])("rejects %s YAML before schema validation", (_, source) => {
    const diagnostics = sourceDiagnostics(() =>
      parseYamlSource(source, "content/projects/test/project.yaml"),
    );

    expect(diagnostics).toEqual([
      expect.objectContaining({
        severity: "error",
        code: "source.yaml-invalid",
        path: expect.stringContaining("content/projects/test/project.yaml"),
      }),
    ]);
  });

  it("treats the research contract as a required site record", () => {
    const repository = createTemporaryRepository();

    try {
      rmSync(resolve(repository.root, "content/site/research.yaml"));

      const diagnostics = sourceDiagnostics(() =>
        loadContentRepository({ repositoryRoot: repository.root }),
      );
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          code: "source.file-unreadable",
          path: "content/site/research.yaml",
        }),
      );
    } finally {
      repository.cleanup();
    }
  });

  it("rejects a folder slug that disagrees with its project record", () => {
    const repository = createTemporaryRepository();

    try {
      renameSync(
        resolve(repository.root, "content/projects/fradium"),
        resolve(repository.root, "content/projects/not-fradium"),
      );

      expect(() =>
        loadContentRepository({ repositoryRoot: repository.root }),
      ).toThrow(ContentValidationError);

      try {
        loadContentRepository({ repositoryRoot: repository.root });
      } catch (error) {
        expect(error).toBeInstanceOf(ContentValidationError);
        if (!(error instanceof ContentValidationError)) return;
        expect(error.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
          expect.arrayContaining([
            "reference.project-source-metadata",
            "reference.source-project",
          ]),
        );
      }
    } finally {
      repository.cleanup();
    }
  });

  it("rejects a moment filename that disagrees with its record id", () => {
    const repository = createTemporaryRepository();

    try {
      const momentsDirectory = resolve(repository.root, "content/moments");
      mkdirSync(momentsDirectory, { recursive: true });
      writeFileSync(
        resolve(momentsDirectory, "wrong-name.yaml"),
        stringify(makeMoment({ id: "documented-moment" })),
        "utf8",
      );

      const diagnostics = sourceDiagnostics(() =>
        loadContentRepository({ repositoryRoot: repository.root }),
      );

      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          code: "source.moment-filename-mismatch",
          path: "content/moments/wrong-name.yaml",
          message: expect.stringContaining('record id "documented-moment"'),
        }),
      );
    } finally {
      repository.cleanup();
    }
  });

  it("rejects content files symlinked outside the canonical repository root", () => {
    const repository = createTemporaryRepository();
    const profilePath = resolve(
      repository.root,
      "content/site/profile.yaml",
    );
    const outsidePath = resolve(
      repository.root,
      "..",
      `${basename(repository.root)}-outside-profile.yaml`,
    );

    try {
      writeFileSync(outsidePath, readFileSync(profilePath, "utf8"), "utf8");
      rmSync(profilePath);
      symlinkSync(outsidePath, profilePath);

      const diagnostics = sourceDiagnostics(() =>
        loadContentRepository({ repositoryRoot: repository.root }),
      );
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          code: "source.file-boundary-invalid",
          path: "content/site/profile.yaml",
          message: expect.stringContaining("Symbolic-link"),
        }),
      );
    } finally {
      rmSync(outsidePath, { force: true });
      repository.cleanup();
    }
  });
});
