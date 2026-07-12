import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type NarrativeBlockProps = PropsWithChildren<{ id?: string; label?: string }>;
type SourceLinkProps = PropsWithChildren<{ href?: string; title?: string }>;

function NarrativeBlock({ children, component, id, label }: NarrativeBlockProps & { component: string }) {
  return <section aria-label={label} data-case-study-component={component} id={id}>{children}</section>;
}

function createNarrativeBlock(component: string) {
  return function ApprovedNarrativeBlock(props: NarrativeBlockProps) {
    return <NarrativeBlock {...props} component={component} />;
  };
}

function isApprovedHref(href: string): boolean {
  if (/[\u0000-\u0020\\]/.test(href)) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (href.startsWith("#") && href.length > 1 && !href.slice(1).includes("#")) return true;
  if (/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+(?:\?[^\s]*)?$/i.test(href)) return true;
  try { return new URL(href).protocol === "https:"; } catch { return false; }
}

function ApprovedLink({ children, href, title }: Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href" | "title">) {
  if (!href || !isApprovedHref(href)) throw new TypeError("Case-study links require an approved static URL.");
  return <a data-case-study-component="SourceLink" href={href} title={title}>{children}</a>;
}

function SourceLink({ href, children, title }: SourceLinkProps) {
  return href ? <ApprovedLink href={href} title={title}>{children}</ApprovedLink> : <>{children}</>;
}

export const pfnMdxComponents = {
  a: ApprovedLink,
  NarrativeSection: createNarrativeBlock("NarrativeSection"),
  RoleAndCredits: createNarrativeBlock("RoleAndCredits"),
  ConstraintBlock: createNarrativeBlock("ConstraintBlock"),
  DecisionRecord: createNarrativeBlock("DecisionRecord"),
  SystemFlow: createNarrativeBlock("SystemFlow"),
  EvidenceSequence: createNarrativeBlock("EvidenceSequence"),
  OutcomeBlock: createNarrativeBlock("OutcomeBlock"),
  ProjectStatus: createNarrativeBlock("ProjectStatus"),
  NextIteration: createNarrativeBlock("NextIteration"),
  SourceLink,
} as const;
