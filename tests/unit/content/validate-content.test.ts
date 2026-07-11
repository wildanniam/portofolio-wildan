import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { runContentValidation } from "../../../src/content/validate-content";
import { loadContentBundle } from "../../../src/content/repository.node";
import {
  REPOSITORY_ROOT,
  createTemporaryRepository,
} from "./fixtures";

function captureOutput() {
  const logs: string[] = [];
  const errors: string[] = [];

  return {
    logs,
    errors,
    output: {
      log: (message: string) => logs.push(message),
      error: (message: string) => errors.push(message),
    },
  };
}

describe("validate:content CLI boundary", () => {
  it("accepts an injected valid repository root and reports deterministic counts", () => {
    const capture = captureOutput();

    expect(
      runContentValidation(capture.output, {
        repositoryRoot: REPOSITORY_ROOT,
      }),
    ).toBe(0);
    expect(capture.errors).toEqual([]);
    const content = loadContentBundle({ repositoryRoot: REPOSITORY_ROOT });
    const counts = {
      published: content.projects.filter(
        (project) => project.publication === "published",
      ).length,
      preview: content.projects.filter(
        (project) => project.publication === "preview",
      ).length,
      draft: content.projects.filter((project) => project.publication === "draft")
        .length,
    };
    expect(capture.logs).toEqual([
      `Content validation passed. ${content.projects.length} projects (${counts.published} published, ${counts.preview} preview, ${counts.draft} draft) ${content.moments.length} moments 0 warnings`,
    ]);
  });

  it("returns failure for an injected broken repository and prints sorted diagnostics", () => {
    const repository = createTemporaryRepository();

    try {
      writeFileSync(
        resolve(repository.root, "content/site/profile.yaml"),
        "name: Wildan\nname: Duplicate\n",
        "utf8",
      );
      const first = captureOutput();
      const second = captureOutput();

      expect(
        runContentValidation(first.output, {
          repositoryRoot: repository.root,
        }),
      ).toBe(1);
      expect(
        runContentValidation(second.output, {
          repositoryRoot: repository.root,
        }),
      ).toBe(1);
      expect(second.errors).toEqual(first.errors);
      expect(first.logs).toEqual([]);
      expect(first.errors[0]).toBe("Content validation failed.");
      expect(first.errors[1]).toMatch(
        /^\[error] source\.yaml-invalid content\/site\/profile\.yaml(?:\:\d+\:\d+)? —/,
      );
    } finally {
      repository.cleanup();
    }
  });
});
