import { describe, expect, it } from "vitest";

import {
  ALLOWED_CASE_STUDY_COMPONENTS,
  CASE_STUDY_H2_HEADINGS,
  CaseStudyMdxPolicyError,
  assertValidCaseStudyMdx,
  validateCaseStudyMdx,
} from "../../../src/content/mdx-policy";

const validSections: Record<(typeof CASE_STUDY_H2_HEADINGS)[number], string> = {
  "Problem and stakes":
    "People needed a trustworthy signal before confirming a transaction.",
  "My role and the team":
    "I led the build with a multidisciplinary team and credit every collaborator.",
  Constraint:
    "The prototype had to remain legible under a short hackathon deadline.",
  Decision:
    "We kept the decision boundary explicit and documented the trade-off.",
  "System behavior":
    "The request passes through validation before the final outcome is shown.",
  "Evidence sequence":
    "The case study pairs product reality, system reasoning, and verification.",
  "Outcome and validation":
    "The result is described beside a source rather than as an unsupported claim.",
  "Where it stands":
    "The build remains an honest student project with a clearly stated lifecycle.",
  "What I'd improve next":
    "I would harden the verification path and run a broader usability study.",
};

function makeValidCaseStudy(
  additions: Partial<
    Record<(typeof CASE_STUDY_H2_HEADINGS)[number], string>
  > = {},
): string {
  return CASE_STUDY_H2_HEADINGS.map(
    (heading) =>
      `## ${heading}\n\n${validSections[heading]}${additions[heading] ?? ""}`,
  ).join("\n\n");
}

function codesFor(source: string): string[] {
  return validateCaseStudyMdx(source).diagnostics.map(
    (diagnostic) => diagnostic.code,
  );
}

describe("case-study MDX restricted DSL", () => {
  it("accepts the exact narrative structure, static prose, safe URLs, tables, and the full component allowlist", () => {
    const componentExamples = ALLOWED_CASE_STUDY_COMPONENTS.map((component) => {
      if (component === "SourceLink") {
        return `<${component} href="https://example.com/evidence">External evidence</${component}>`;
      }

      return `<${component} label="Static content">\nApproved narrative.\n</${component}>`;
    }).join("\n\n");
    const source = makeValidCaseStudy({
      "Problem and stakes": `\n\n### Supporting context\n\nParagraph with **strong**, *emphasis*, and \`inline code\`.\n\n- One\n- Two\n\n1. First\n2. Second\n\n> A sourced observation.\n\n[HTTPS](https://example.com/path) · [email](mailto:wildan@example.com) · [work](/work/fradium) · [details](#details)\n\n\`\`\`ts\nconst staticExample = true;\n\`\`\`\n\n<table>\n<thead>\n<tr>\n<th>\nGate\n</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>\nVerified\n</td>\n</tr>\n</tbody>\n</table>\n\nParagraph with <strong>explicit semantic emphasis</strong>.\n\n${componentExamples}`,
    });

    expect(validateCaseStudyMdx(source)).toEqual({
      valid: true,
      diagnostics: [],
    });
    expect(() => assertValidCaseStudyMdx(source)).not.toThrow();
  });

  it.each([
    ['import Unsafe from "./unsafe"', "import"],
    ["export const unsafe = true", "export"],
  ])("rejects %s declarations without evaluating them", (declaration) => {
    const source = `${declaration}\n\n${makeValidCaseStudy()}`;

    expect(codesFor(source)).toContain("mdx.esm-forbidden");
  });

  it.each([
    ["inline", "Text {globalThis.__mdxWasRun = true}"],
    ["flow", "\n\n{globalThis.__mdxWasRun = true}\n"],
  ])("rejects %s JavaScript expressions without running them", (_, expression) => {
    const globalObject = globalThis as typeof globalThis & {
      __mdxWasRun?: boolean;
    };
    delete globalObject.__mdxWasRun;
    const source = makeValidCaseStudy({
      Decision: `\n\n${expression}`,
    });

    expect(codesFor(source)).toContain("mdx.expression-forbidden");
    expect(globalObject.__mdxWasRun).toBeUndefined();
  });

  it.each([
    ["raw HTML", "<div>Bypass</div>", "mdx.html-forbidden"],
    ["script HTML", "<script>unsafe()</script>", "mdx.html-forbidden"],
    ["Markdown image", "![Screenshot](/screen.png)", "mdx.image-forbidden"],
    ["img element", '<img src="/screen.png" />', "mdx.image-forbidden"],
    ["unbound evidence figure", '<EvidenceFigure assetId="proof" />', "jsx.element-unknown"],
    ["unknown component", "<UnreviewedWidget />", "jsx.element-unknown"],
  ])("rejects %s", (_, construct, expectedCode) => {
    const source = makeValidCaseStudy({
      "Evidence sequence": `\n\n${construct}`,
    });

    expect(codesFor(source)).toContain(expectedCode);
  });

  it.each([
    ["Markdown H1", "# Project opening"],
    ["Markdown H4", "#### Too deep"],
    ["JSX H1", "<h1>Project opening</h1>"],
    ["JSX H6", "<h6>Too deep</h6>"],
  ])("rejects %s headings", (_, heading) => {
    const source = makeValidCaseStudy({
      Constraint: `\n\n${heading}`,
    });

    expect(codesFor(source)).toContain("heading.depth-forbidden");
  });

  it.each([
    ["expression prop", '<SystemFlow items={["request", "result"]} />'],
    ["expression string prop", '<SourceLink href={"/evidence"} />'],
    ["spread prop", "<OutcomeBlock {...outcome} />"],
  ])("rejects JSX %s", (_, component) => {
    const source = makeValidCaseStudy({
      "System behavior": `\n\n${component}`,
    });

    expect(codesFor(source)).toContain(
      "jsx.attribute-expression-forbidden",
    );
  });

  it.each([
    ["javascript scheme", "javascript:alert(1)", "href"],
    ["HTTP", "http://example.com", "href"],
    ["data scheme", "data:text/html,unsafe", "href"],
    ["document-relative", "evidence/source", "href"],
    ["protocol-relative", "//example.com/source", "href"],
    ["bare fragment", "#", "href"],
    ["mailto media source", "mailto:wildan@example.com", "src"],
    ["hash media source", "#poster", "src"],
  ])("rejects a %s URL", (_, url, attribute) => {
    const component =
      attribute === "src"
        ? `<EvidenceFigure src="${url}" alt="Evidence" />`
        : `<SourceLink href="${url}" label="Evidence" />`;
    const source = makeValidCaseStudy({
      "Evidence sequence": `\n\n${component}`,
    });
    const result = validateCaseStudyMdx(source);

    expect(
      result.diagnostics.some((diagnostic) =>
        diagnostic.code.startsWith("url."),
      ),
    ).toBe(true);
  });

  it.each([
    ["native link", "<a>Evidence</a>"],
    ["source component", "<SourceLink>Evidence</SourceLink>"],
  ])("requires href on a %s", (_, component) => {
    const source = makeValidCaseStudy({
      "Evidence sequence": `\n\n${component}`,
    });

    expect(codesFor(source)).toContain("url.href-required");
  });

  it.each([
    [
      "unsupported narrative prop",
      '<OutcomeBlock tone="loud">Outcome</OutcomeBlock>',
      "jsx.component-prop-forbidden",
    ],
    [
      "empty narrative component",
      '<DecisionRecord label="Choice" />',
      "jsx.component-children-required",
    ],
  ])("rejects %s", (_, component, expectedCode) => {
    const source = makeValidCaseStudy({
      "Evidence sequence": `\n\n${component}`,
    });

    expect(codesFor(source)).toContain(expectedCode);
  });

  it("rejects narrative block components inside paragraph text", () => {
    const source = makeValidCaseStudy({
      Decision:
        "\n\nThe inline decision <DecisionRecord>must remain a block.</DecisionRecord> cannot split a paragraph.",
    });

    expect(codesFor(source)).toContain("jsx.block-in-inline-context");
  });

  it("rejects a missing narrative H2", () => {
    const source = makeValidCaseStudy().replace(
      /## Constraint\n\n[^#]+?(?=\n\n## Decision)/,
      "",
    );
    const result = validateCaseStudyMdx(source);

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "heading.h2-missing",
        message: "Required H2 heading `Constraint` is missing.",
      }),
    );
  });

  it("rejects narrative H2 chapters without content", () => {
    const headingsOnly = CASE_STUDY_H2_HEADINGS.map(
      (heading) => `## ${heading}`,
    ).join("\n\n");
    const result = validateCaseStudyMdx(headingsOnly);

    expect(result.valid).toBe(false);
    expect(
      result.diagnostics.filter(
        (diagnostic) => diagnostic.code === "heading.section-empty",
      ),
    ).toHaveLength(CASE_STUDY_H2_HEADINGS.length);
  });

  it("rejects duplicate, unexpected, and case-mismatched H2 headings", () => {
    const duplicate = makeValidCaseStudy({
      Constraint: "\n\n## Constraint\n\nDuplicated chapter.",
    });
    const unexpected = makeValidCaseStudy({
      Constraint: "\n\n## Architecture\n\nUnexpected chapter.",
    });
    const caseMismatch = makeValidCaseStudy().replace(
      "## System behavior",
      "## System Behavior",
    );

    expect(codesFor(duplicate)).toContain("heading.h2-duplicate");
    expect(codesFor(unexpected)).toContain("heading.h2-unexpected");
    expect(codesFor(caseMismatch)).toEqual(
      expect.arrayContaining([
        "heading.h2-unexpected",
        "heading.h2-missing",
      ]),
    );
  });

  it("requires the approved narrative H2 order", () => {
    const source = makeValidCaseStudy()
      .replace("## Constraint", "## __TEMP__")
      .replace("## Decision", "## Constraint")
      .replace("## __TEMP__", "## Decision");

    expect(codesFor(source)).toContain("heading.h2-order");
  });

  it("requires narrative headings to use Markdown rather than unsafe JSX nesting", () => {
    const source = makeValidCaseStudy().replace(
      "## Problem and stakes",
      "<h2>\nProblem and stakes\n</h2>",
    );

    expect(codesFor(source)).toEqual(
      expect.arrayContaining(["mdx.html-forbidden", "heading.h2-missing"]),
    );
  });

  it("rejects Markdown constructs outside the native DSL", () => {
    const source = makeValidCaseStudy({
      Decision: "\n\n---",
    });

    expect(codesFor(source)).toContain("mdx.node-forbidden");
  });

  it("normalizes parser failures into positioned diagnostics", () => {
    const result = validateCaseStudyMdx("<!-- raw HTML comment -->");

    expect(result).toEqual({
      valid: false,
      diagnostics: [
        expect.objectContaining({
          code: "mdx.parse-error",
          position: {
            start: { line: 1, column: 2, offset: 1 },
            end: { line: 1, column: 2, offset: 1 },
          },
        }),
      ],
    });
  });

  it("returns diagnostics deterministically in source order with exact positions", () => {
    const source = `# Forbidden\n\n${makeValidCaseStudy({
      Decision: "\n\n<Unknown />",
    })}`;
    const first = validateCaseStudyMdx(source).diagnostics;
    const second = validateCaseStudyMdx(source).diagnostics;

    expect(second).toEqual(first);
    expect(first[0]).toEqual(
      expect.objectContaining({
        code: "heading.depth-forbidden",
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 12, offset: 11 },
        },
      }),
    );

    const offsets = first.map((diagnostic) => diagnostic.position.start.offset);
    expect(offsets).toEqual([...offsets].sort((left, right) => left - right));
  });

  it("throws one typed error containing the deterministic diagnostics", () => {
    const source = makeValidCaseStudy().replace(
      "## Where it stands",
      "## Current status",
    );

    expect(() => assertValidCaseStudyMdx(source)).toThrow(
      CaseStudyMdxPolicyError,
    );

    try {
      assertValidCaseStudyMdx(source);
      throw new Error("Expected assertValidCaseStudyMdx to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(CaseStudyMdxPolicyError);
      const policyError = error as CaseStudyMdxPolicyError;
      expect(policyError.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
        expect.arrayContaining([
          "heading.h2-unexpected",
          "heading.h2-missing",
        ]),
      );
      expect(policyError.message).toContain("Case-study MDX violates");
      expect(policyError.message).toContain("heading.h2-unexpected");
    }
  });
});
