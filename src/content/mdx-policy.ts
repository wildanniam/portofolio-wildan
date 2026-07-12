import { createProcessor } from "@mdx-js/mdx";

export const CASE_STUDY_H2_HEADINGS = [
  "Problem and stakes",
  "My role and the team",
  "Constraint",
  "Decision",
  "System behavior",
  "Evidence sequence",
  "Outcome and validation",
  "Where it stands",
  "What I'd improve next",
] as const;

export const ALLOWED_CASE_STUDY_COMPONENTS = [
  "NarrativeSection",
  "RoleAndCredits",
  "ConstraintBlock",
  "DecisionRecord",
  "SystemFlow",
  "EvidenceSequence",
  "OutcomeBlock",
  "ProjectStatus",
  "NextIteration",
  "SourceLink",
] as const;

export const ALLOWED_CASE_STUDY_NATIVE_ELEMENTS = [
  "h2",
  "h3",
  "p",
  "ol",
  "ul",
  "li",
  "blockquote",
  "strong",
  "em",
  "code",
  "pre",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

export type MdxPolicyPoint = {
  line: number;
  column: number;
  offset: number;
};

export type MdxPolicyPosition = {
  start: MdxPolicyPoint;
  end: MdxPolicyPoint;
};

export type MdxPolicyDiagnostic = {
  code: string;
  message: string;
  position: MdxPolicyPosition;
};

export type MdxPolicyResult = {
  valid: boolean;
  diagnostics: readonly MdxPolicyDiagnostic[];
};

type AstPoint = {
  line?: unknown;
  column?: unknown;
  offset?: unknown;
};

type AstPosition = {
  start?: AstPoint;
  end?: AstPoint;
};

type AstNode = {
  type: string;
  children?: unknown;
  position?: AstPosition;
  depth?: unknown;
  name?: unknown;
  attributes?: unknown;
  url?: unknown;
  value?: unknown;
};

type HeadingEntry = {
  text: string | null;
  position: MdxPolicyPosition;
};

const allowedComponentNames = new Set<string>(ALLOWED_CASE_STUDY_COMPONENTS);
const allowedJsxNativeElementNames = new Set([
  "a",
  "strong",
  "em",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);
const expectedHeadingNames = new Set<string>(CASE_STUDY_H2_HEADINGS);

const allowedAstNodeTypes = new Set([
  "root",
  "text",
  "paragraph",
  "heading",
  "list",
  "listItem",
  "blockquote",
  "strong",
  "emphasis",
  "inlineCode",
  "code",
  "link",
  // These are emitted only when a future parser configuration enables GFM.
  // Keeping them in the policy preserves the architecture's semantic-table DSL.
  "table",
  "tableRow",
  "tableCell",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
]);

const expressionNodeTypes = new Set([
  "mdxFlowExpression",
  "mdxTextExpression",
]);

const imageNodeTypes = new Set(["image", "imageReference"]);
const urlAttributePattern = /(?:href|src|url)$/i;
const mediaUrlAttributePattern = /(?:src|poster)$/i;
const forbiddenAttributePattern = /^(?:on[A-Z]|on[a-z]|style$|dangerouslySetInnerHTML$)/;
const headingElementPattern = /^h([1-6])$/;
const unsafeUrlCharacterPattern = /[\u0000-\u0020\\]/;
const componentAttributeAllowlist = new Map<string, ReadonlySet<string>>([
  ["SourceLink", new Set(["href", "title"])],
  ...ALLOWED_CASE_STUDY_COMPONENTS.filter(
    (name) => name !== "SourceLink",
  ).map((name) => [name, new Set(["id", "label"])] as const),
]);
const inlineNativeElementNames = new Set(["a", "strong", "em", "code"]);
const phrasingOnlyJsxElementNames = new Set(["strong", "em", "code"]);

export class CaseStudyMdxPolicyError extends Error {
  readonly diagnostics: readonly MdxPolicyDiagnostic[];

  constructor(diagnostics: readonly MdxPolicyDiagnostic[]) {
    const details = diagnostics
      .map(
        (diagnostic) =>
          `- [${diagnostic.code}] ${diagnostic.position.start.line}:${diagnostic.position.start.column} ${diagnostic.message}`,
      )
      .join("\n");

    super(`Case-study MDX violates the restricted content policy:\n${details}`);
    this.name = "CaseStudyMdxPolicyError";
    this.diagnostics = diagnostics;
  }
}

export function validateCaseStudyMdx(source: string): MdxPolicyResult {
  let tree: AstNode;

  try {
    // Parsing is the security boundary here: this module never compiles, runs,
    // imports, or evaluates author-provided MDX.
    tree = createProcessor({ format: "mdx" }).parse(source) as AstNode;
  } catch (error) {
    const diagnostic = diagnosticFromParseError(error, source);

    return {
      valid: false,
      diagnostics: [diagnostic],
    };
  }

  const diagnostics: MdxPolicyDiagnostic[] = [];
  const h2Headings: HeadingEntry[] = [];
  const eofPosition = positionAtEnd(source);

  visit(tree, (node, parent) => {
    const nodePosition = positionForNode(node, source);

    if (node.type === "mdxjsEsm") {
      diagnostics.push({
        code: "mdx.esm-forbidden",
        message: "Imports and exports are not allowed in case-study MDX.",
        position: nodePosition,
      });
      return;
    }

    if (expressionNodeTypes.has(node.type)) {
      diagnostics.push({
        code: "mdx.expression-forbidden",
        message: "Inline and flow JavaScript expressions are not allowed.",
        position: nodePosition,
      });
      return;
    }

    if (node.type === "html") {
      diagnostics.push({
        code: "mdx.html-forbidden",
        message: "Raw HTML is not allowed in case-study MDX.",
        position: nodePosition,
      });
      return;
    }

    if (imageNodeTypes.has(node.type)) {
      diagnostics.push({
        code: "mdx.image-forbidden",
        message:
          "Markdown images are not allowed; use an approved evidence component.",
        position: nodePosition,
      });
      return;
    }

    if (!allowedAstNodeTypes.has(node.type)) {
      diagnostics.push({
        code: "mdx.node-forbidden",
        message: `The Markdown construct \`${node.type}\` is outside the restricted case-study DSL.`,
        position: nodePosition,
      });
      return;
    }

    if (node.type === "heading") {
      validateMarkdownHeading(node, nodePosition, diagnostics, h2Headings);
      return;
    }

    if (node.type === "link") {
      validateUrl(node.url, "href", nodePosition, diagnostics);
      return;
    }

    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      validateJsxElement(
        node,
        parent,
        nodePosition,
        source,
        diagnostics,
      );
    }
  });

  validateRequiredHeadings(h2Headings, eofPosition, diagnostics);
  validateNonEmptySections(h2Headings, source, diagnostics);

  const sortedDiagnostics = diagnostics.toSorted(compareDiagnostics);

  return {
    valid: sortedDiagnostics.length === 0,
    diagnostics: sortedDiagnostics,
  };
}

export function assertValidCaseStudyMdx(source: string): void {
  const result = validateCaseStudyMdx(source);

  if (!result.valid) {
    throw new CaseStudyMdxPolicyError(result.diagnostics);
  }
}

function validateMarkdownHeading(
  node: AstNode,
  position: MdxPolicyPosition,
  diagnostics: MdxPolicyDiagnostic[],
  h2Headings: HeadingEntry[],
): void {
  if (node.depth !== 2 && node.depth !== 3) {
    diagnostics.push({
      code: "heading.depth-forbidden",
      message: "Only H2 and H3 headings are allowed in case-study MDX.",
      position,
    });
    return;
  }

  if (node.depth === 2) {
    h2Headings.push({
      text: extractStaticText(node),
      position,
    });
  }
}

function validateJsxElement(
  node: AstNode,
  parent: AstNode | undefined,
  position: MdxPolicyPosition,
  source: string,
  diagnostics: MdxPolicyDiagnostic[],
): void {
  const name = typeof node.name === "string" ? node.name : null;
  const headingMatch = name?.match(headingElementPattern);

  if (
    node.type === "mdxJsxTextElement" &&
    parent?.type === "paragraph" &&
    name !== null &&
    name !== "SourceLink" &&
    ((allowedComponentNames.has(name) && name !== "SourceLink") ||
      (allowedJsxNativeElementNames.has(name) &&
        !inlineNativeElementNames.has(name)))
  ) {
    diagnostics.push({
      code: "jsx.block-in-inline-context",
      message: `Block element \`<${name}>\` cannot appear inside paragraph text.`,
      position,
    });
  }

  if (
    node.type === "mdxJsxFlowElement" &&
    name !== null &&
    phrasingOnlyJsxElementNames.has(name)
  ) {
    diagnostics.push({
      code: "jsx.inline-in-flow-context",
      message: `Inline element \`<${name}>\` must stay inside paragraph text.`,
      position,
    });
  }

  if (name === "img") {
    diagnostics.push({
      code: "mdx.image-forbidden",
      message: "The img element is not allowed; use an approved evidence component.",
      position,
    });
  } else if (headingMatch && headingMatch[1] !== "2" && headingMatch[1] !== "3") {
    diagnostics.push({
      code: "heading.depth-forbidden",
      message: "Only H2 and H3 headings are allowed in case-study MDX.",
      position,
    });
  } else if (name === null) {
    diagnostics.push({
      code: "jsx.element-unknown",
      message: "JSX fragments are outside the restricted case-study DSL.",
      position,
    });
  } else if (
    !allowedJsxNativeElementNames.has(name) &&
    !allowedComponentNames.has(name)
  ) {
    const isHtmlLike = /^[a-z]/.test(name);

    diagnostics.push({
      code: isHtmlLike ? "mdx.html-forbidden" : "jsx.element-unknown",
      message: isHtmlLike
        ? `Raw HTML element \`<${name}>\` is not allowed.`
        : `Portfolio component \`<${name}>\` is not in the allowlist.`,
      position,
    });
  }

  validateJsxAttributes(node, source, diagnostics);

  if (name !== null && allowedComponentNames.has(name)) {
    validatePortfolioComponent(node, name, position, source, diagnostics);
  }

  if (
    (name === "a" || name === "SourceLink") &&
    !hasJsxAttribute(node, "href")
  ) {
    diagnostics.push({
      code: "url.href-required",
      message: `The \`${name}\` element requires a static href.`,
      position,
    });
  }
}

function validatePortfolioComponent(
  node: AstNode,
  name: string,
  position: MdxPolicyPosition,
  source: string,
  diagnostics: MdxPolicyDiagnostic[],
): void {
  const allowedAttributes = componentAttributeAllowlist.get(name) ?? new Set();
  const attributes = Array.isArray(node.attributes)
    ? node.attributes.filter(isRecord)
    : [];

  for (const attribute of attributes) {
    if (
      attribute.type === "mdxJsxAttribute" &&
      typeof attribute.name === "string" &&
      !allowedAttributes.has(attribute.name)
    ) {
      diagnostics.push({
        code: "jsx.component-prop-forbidden",
        message: `Portfolio component \`${name}\` does not accept \`${attribute.name}\`.`,
        position: positionForNode(attribute as AstNode, source),
      });
    }
  }

  const hasChildren =
    Array.isArray(node.children) && node.children.length > 0;
  if (!hasChildren) {
    diagnostics.push({
      code: "jsx.component-children-required",
      message: `Portfolio component \`${name}\` requires static narrative children.`,
      position,
    });
  }
}

function hasJsxAttribute(node: AstNode, expectedName: string): boolean {
  return (
    Array.isArray(node.attributes) &&
    node.attributes.some(
      (attribute) =>
        isRecord(attribute) &&
        attribute.type === "mdxJsxAttribute" &&
        attribute.name === expectedName,
    )
  );
}

function validateJsxAttributes(
  node: AstNode,
  source: string,
  diagnostics: MdxPolicyDiagnostic[],
): void {
  if (!Array.isArray(node.attributes)) {
    return;
  }

  for (const attributeValue of node.attributes) {
    if (!isRecord(attributeValue)) {
      diagnostics.push({
        code: "jsx.attribute-forbidden",
        message: "Malformed JSX attributes are not allowed.",
        position: positionForNode(node, source),
      });
      continue;
    }

    const attribute = attributeValue as AstNode;
    const position = positionForNode(attribute, source);

    if (attribute.type === "mdxJsxExpressionAttribute") {
      diagnostics.push({
        code: "jsx.attribute-expression-forbidden",
        message: "JSX spread and expression attributes are not allowed.",
        position,
      });
      continue;
    }

    if (attribute.type !== "mdxJsxAttribute") {
      diagnostics.push({
        code: "jsx.attribute-forbidden",
        message: `JSX attribute construct \`${attribute.type}\` is not allowed.`,
        position,
      });
      continue;
    }

    const name = typeof attribute.name === "string" ? attribute.name : null;

    if (name === null) {
      diagnostics.push({
        code: "jsx.attribute-forbidden",
        message: "Namespaced or computed JSX attribute names are not allowed.",
        position,
      });
      continue;
    }

    if (forbiddenAttributePattern.test(name)) {
      diagnostics.push({
        code: "jsx.attribute-forbidden",
        message: `JSX attribute \`${name}\` is outside the restricted content DSL.`,
        position,
      });
    }

    if (isRecord(attribute.value)) {
      diagnostics.push({
        code: "jsx.attribute-expression-forbidden",
        message: `JSX prop \`${name}\` must be a static string, not an expression.`,
        position,
      });
      continue;
    }

    if (urlAttributePattern.test(name) || name === "poster") {
      validateUrl(attribute.value, name, position, diagnostics);
    }
  }
}

function validateUrl(
  value: unknown,
  attributeName: string,
  position: MdxPolicyPosition,
  diagnostics: MdxPolicyDiagnostic[],
): void {
  if (typeof value !== "string") {
    diagnostics.push({
      code: "url.invalid",
      message: `URL field \`${attributeName}\` must be a static string.`,
      position,
    });
    return;
  }

  const kind = classifyAllowedUrl(value);
  const isMediaUrl = mediaUrlAttributePattern.test(attributeName);
  const isAllowedForField =
    kind === "https" ||
    kind === "root-relative" ||
    (!isMediaUrl && (kind === "mailto" || kind === "hash"));

  if (!isAllowedForField) {
    diagnostics.push({
      code: value === "#" ? "url.empty-fragment" : "url.scheme-forbidden",
      message:
        value === "#"
          ? "A bare `#` href is not a valid destination."
          : `URL \`${value}\` must use HTTPS, mailto, a root-relative path, or a non-empty hash as appropriate.`,
      position,
    });
  }
}

function classifyAllowedUrl(
  value: string,
): "https" | "mailto" | "root-relative" | "hash" | "invalid" {
  if (value.length === 0 || unsafeUrlCharacterPattern.test(value)) {
    return "invalid";
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return "root-relative";
  }

  if (value.startsWith("#") && value.length > 1 && !value.slice(1).includes("#")) {
    return "hash";
  }

  if (/^mailto:/i.test(value)) {
    const address = value.slice(value.indexOf(":") + 1).split("?", 1)[0];
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)
      ? "mailto"
      : "invalid";
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? "https" : "invalid";
  } catch {
    return "invalid";
  }
}

function validateRequiredHeadings(
  headings: HeadingEntry[],
  eofPosition: MdxPolicyPosition,
  diagnostics: MdxPolicyDiagnostic[],
): void {
  const occurrences = new Map<string, HeadingEntry[]>();

  for (const heading of headings) {
    if (heading.text === null || !expectedHeadingNames.has(heading.text)) {
      diagnostics.push({
        code: "heading.h2-unexpected",
        message: `H2 heading must exactly match one of: ${CASE_STUDY_H2_HEADINGS.join(
          "; ",
        )}.`,
        position: heading.position,
      });
      continue;
    }

    const entries = occurrences.get(heading.text) ?? [];
    entries.push(heading);
    occurrences.set(heading.text, entries);

    if (entries.length > 1) {
      diagnostics.push({
        code: "heading.h2-duplicate",
        message: `H2 heading \`${heading.text}\` must appear exactly once.`,
        position: heading.position,
      });
    }
  }

  for (const expectedHeading of CASE_STUDY_H2_HEADINGS) {
    if (!occurrences.has(expectedHeading)) {
      diagnostics.push({
        code: "heading.h2-missing",
        message: `Required H2 heading \`${expectedHeading}\` is missing.`,
        position: eofPosition,
      });
    }
  }

  const knownHeadingSequence = headings
    .map((heading) => heading.text)
    .filter(
      (heading): heading is string =>
        heading !== null && expectedHeadingNames.has(heading),
    );
  const hasEveryHeadingExactlyOnce = CASE_STUDY_H2_HEADINGS.every(
    (heading) => occurrences.get(heading)?.length === 1,
  );

  if (
    hasEveryHeadingExactlyOnce &&
    knownHeadingSequence.length === CASE_STUDY_H2_HEADINGS.length &&
    knownHeadingSequence.some(
      (heading, index) => heading !== CASE_STUDY_H2_HEADINGS[index],
    )
  ) {
    const firstMismatchIndex = knownHeadingSequence.findIndex(
      (heading, index) => heading !== CASE_STUDY_H2_HEADINGS[index],
    );
    const mismatchedHeading = headings.find(
      (heading) => heading.text === knownHeadingSequence[firstMismatchIndex],
    );

    diagnostics.push({
      code: "heading.h2-order",
      message: "The nine narrative H2 headings must follow the approved case-study order.",
      position: mismatchedHeading?.position ?? eofPosition,
    });
  }
}

function validateNonEmptySections(
  headings: HeadingEntry[],
  source: string,
  diagnostics: MdxPolicyDiagnostic[],
): void {
  for (const [index, heading] of headings.entries()) {
    if (heading.text === null || !expectedHeadingNames.has(heading.text)) {
      continue;
    }

    const sectionStart = heading.position.end.offset;
    const sectionEnd = headings[index + 1]?.position.start.offset ?? source.length;
    if (source.slice(sectionStart, sectionEnd).trim().length > 0) {
      continue;
    }

    diagnostics.push({
      code: "heading.section-empty",
      message: `H2 chapter \`${heading.text}\` requires narrative content.`,
      position: heading.position,
    });
  }
}

function extractStaticText(node: AstNode): string | null {
  if (node.type === "text" || node.type === "inlineCode") {
    return typeof node.value === "string" ? node.value : null;
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  let result = "";

  for (const childValue of node.children) {
    if (!isAstNode(childValue)) {
      return null;
    }

    const childText = extractStaticText(childValue);

    if (childText === null) {
      return null;
    }

    result += childText;
  }

  return result;
}

function visit(
  node: AstNode,
  visitor: (node: AstNode, parent: AstNode | undefined) => void,
  parent?: AstNode,
): void {
  visitor(node, parent);

  if (!Array.isArray(node.children)) {
    return;
  }

  for (const child of node.children) {
    if (isAstNode(child)) {
      visit(child, visitor, node);
    }
  }
}

function isAstNode(value: unknown): value is AstNode {
  return isRecord(value) && typeof value.type === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function diagnosticFromParseError(
  error: unknown,
  source: string,
): MdxPolicyDiagnostic {
  const errorRecord = isRecord(error) ? error : {};
  const place = isRecord(errorRecord.place) ? errorRecord.place : {};
  const start = pointFromUnknown(place, source, positionAtEnd(source).start);
  const reason =
    typeof errorRecord.reason === "string"
      ? errorRecord.reason
      : error instanceof Error
        ? error.message
        : "Unknown MDX parse error.";

  return {
    code: "mdx.parse-error",
    message: `MDX could not be parsed: ${reason}`,
    position: { start, end: start },
  };
}

function positionForNode(node: AstNode, source: string): MdxPolicyPosition {
  const fallback = positionAtEnd(source);
  const position = isRecord(node.position) ? node.position : {};
  const start = pointFromUnknown(position.start, source, fallback.start);
  const end = pointFromUnknown(position.end, source, start);

  return { start, end };
}

function pointFromUnknown(
  value: unknown,
  source: string,
  fallback: MdxPolicyPoint,
): MdxPolicyPoint {
  if (!isRecord(value)) {
    return fallback;
  }

  const line = positiveIntegerOr(value.line, fallback.line);
  const column = positiveIntegerOr(value.column, fallback.column);
  const offset = nonNegativeIntegerOr(
    value.offset,
    offsetForLineAndColumn(source, line, column),
  );

  return { line, column, offset };
}

function positiveIntegerOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : fallback;
}

function nonNegativeIntegerOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : fallback;
}

function positionAtEnd(source: string): MdxPolicyPosition {
  let line = 1;
  let column = 1;

  for (const character of source) {
    if (character === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  const point = { line, column, offset: source.length };
  return { start: point, end: point };
}

function offsetForLineAndColumn(
  source: string,
  targetLine: number,
  targetColumn: number,
): number {
  let line = 1;
  let column = 1;

  for (let offset = 0; offset < source.length; offset += 1) {
    if (line === targetLine && column === targetColumn) {
      return offset;
    }

    if (source[offset] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return source.length;
}

function compareDiagnostics(
  left: MdxPolicyDiagnostic,
  right: MdxPolicyDiagnostic,
): number {
  return (
    left.position.start.offset - right.position.start.offset ||
    left.position.end.offset - right.position.end.offset ||
    left.code.localeCompare(right.code) ||
    left.message.localeCompare(right.message)
  );
}
