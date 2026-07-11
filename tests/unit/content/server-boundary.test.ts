import { readFileSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { caseStudyMdxComponents } from "../../../src/components/v1/case-study/mdx-components";
import { ALLOWED_CASE_STUDY_COMPONENTS } from "../../../src/content/mdx-policy";
import { REPOSITORY_ROOT } from "./fixtures";

function source(relativePath: string): string {
  return readFileSync(resolve(REPOSITORY_ROOT, relativePath), "utf8");
}

function sourceFilesBelow(relativeDirectory: string): string[] {
  const root = resolve(REPOSITORY_ROOT, relativeDirectory);
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && [".ts", ".tsx"].includes(extname(entry.name)),
    )
    .map((entry) => resolve(entry.parentPath, entry.name))
    .sort();
}

describe("static server/client content boundaries", () => {
  it("marks both filesystem repository access and server queries as server-only", () => {
    const repositoryServer = source("src/content/repository.server.ts");
    const queriesServer = source("src/content/queries.server.ts");

    expect(repositoryServer).toMatch(/^import "server-only";/);
    expect(repositoryServer).toContain(
      'from "./repository.node"',
    );
    expect(queriesServer).toMatch(/^import "server-only";/);
    expect(queriesServer).toContain('from "./repository.server"');
    expect(queriesServer).not.toContain('from "./repository.node"');
  });

  it("keeps pure selector and DTO modules free of Node, YAML, React, and server repository imports", () => {
    for (const relativePath of [
      "src/content/queries.ts",
      "src/content/dto.ts",
    ]) {
      const moduleSource = source(relativePath);
      expect(moduleSource, relativePath).not.toMatch(
        /from ["'](?:node:|yaml|react|server-only)/,
      );
      expect(moduleSource, relativePath).not.toMatch(
        /from ["']\.\/repository\.(?:node|server)["']/,
      );
    }
  });

  it("prevents app and component modules from importing the Node content repository", () => {
    const presentationFiles = [
      ...sourceFilesBelow("src/app"),
      ...sourceFilesBelow("src/components"),
    ];
    const bypasses = presentationFiles.flatMap((absolutePath) => {
      const moduleSource = readFileSync(absolutePath, "utf8");
      if (!/(?:content\/|content\\)repository\.node|from ["'][^"']*repository\.node["']/.test(moduleSource)) {
        return [];
      }
      return [absolutePath.replace(`${REPOSITORY_ROOT}/`, "")];
    });

    expect(bypasses).toEqual([]);
  });

  it("keeps the validated MDX component allowlist aligned with the fixed runtime map", () => {
    expect(
      Object.keys(caseStudyMdxComponents)
        .filter((name) => name !== "a")
        .sort(),
    ).toEqual([...ALLOWED_CASE_STUDY_COMPONENTS].sort());

    const providerSource = source("src/mdx-components.tsx");
    expect(providerSource.indexOf("...caseStudyMdxComponents")).toBeGreaterThan(
      providerSource.indexOf("...components"),
    );
  });

  it("renders every allowed SourceLink field through the fixed runtime component", () => {
    const markup = renderToStaticMarkup(
      createElement(
        caseStudyMdxComponents.SourceLink,
        {
          href: "https://example.com/evidence",
          title: "External evidence",
        },
        "Read evidence",
      ),
    );

    expect(markup).toContain('href="https://example.com/evidence"');
    expect(markup).toContain('title="External evidence"');
    expect(markup).toContain("Read evidence");
  });
});
