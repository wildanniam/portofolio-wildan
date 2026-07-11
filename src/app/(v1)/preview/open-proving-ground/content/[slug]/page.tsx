import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ActionLink } from "@/components/v1/foundations/action-link";
import { EditorialGrid } from "@/components/v1/foundations/editorial-grid";
import { MetadataLine } from "@/components/v1/foundations/metadata-line";
import { SectionRule } from "@/components/v1/foundations/section-rule";
import { SiteContainer } from "@/components/v1/foundations/site-container";
import { getProjectBySlug, getProjectParams } from "@/content/queries.server";
import type { LinkState, ProjectRecord } from "@/content/types";

const PREVIEW_ROOT = "/preview/open-proving-ground";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

type PublicProjectLink = {
  href: string;
  label: string;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectParams({ preview: true });
}

function getPreviewProject(slug: string): ProjectRecord | undefined {
  if (process.env.PORTFOLIO_V1_PREVIEW !== "1") return undefined;

  return getProjectBySlug(slug, { preview: true });
}

function humanize(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function projectPeriod(project: ProjectRecord): string {
  if (project.endedAt) return `${project.startedAt}—${project.endedAt}`;
  if (project.lifecycle === "active" || project.lifecycle === "beta") {
    return `${project.startedAt}—present`;
  }
  return project.startedAt;
}

function collectPublicLinks(project: ProjectRecord): PublicProjectLink[] {
  const candidates: Array<[string, LinkState | undefined]> = [
    ["Live project", project.links.live],
    ["Source repository", project.links.source],
    ["Documentation", project.links.docs],
    ["Demo", project.links.demo],
  ];

  return candidates.flatMap(([label, link]) =>
    link?.status === "public" ? [{ href: link.url, label }] : [],
  );
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getPreviewProject(slug);

  if (!project) {
    return {
      title: "Private preview unavailable",
      robots: {
        follow: false,
        index: false,
      },
    };
  }

  return {
    title: `${project.title} — Open Proving Ground`,
    description: project.oneLiner,
    robots: {
      follow: false,
      index: false,
    },
  };
}

export default async function ContentCompatibilityPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;
  const project = getPreviewProject(slug);

  if (!project) notFound();

  const publicLinks = collectPublicLinks(project);
  let narrativeContent: ReactNode;

  if (project.caseStudyState === "full") {
    const { default: Narrative } = await import(
      `@content/projects/${slug}/case-study.mdx`
    );
    narrativeContent = <Narrative />;
  } else {
    narrativeContent = (
      <>
        <p>{project.context}</p>
        <p>{project.outcome}</p>
      </>
    );
  }

  return (
    <>
      <header className="opg-foundation-rail">
        <SiteContainer className="opg-foundation-rail__inner">
          <a className="opg-foundation-mark" href={PREVIEW_ROOT}>
            WSN
          </a>
          <span className="opg-foundation-rail__context">
            The Open Proving Ground
          </span>
          <span className="opg-foundation-rail__folio">
            Private / Content proof
          </span>
        </SiteContainer>
      </header>

      <main className="opg-foundation-main" data-content-compatibility-page>
        <SiteContainer>
          <article aria-labelledby="project-title">
            <header className="opg-opening" data-project-opening>
              <EditorialGrid>
                <h1 className="opg-opening__title" id="project-title">
                  <span>{project.title}</span>
                </h1>

                <p className="opg-opening__folio-note">
                  <strong>{project.publication} record</strong>
                  {project.role.label}
                </p>
              </EditorialGrid>

              <EditorialGrid className="opg-opening__lower">
                <p className="opg-opening__thesis">{project.oneLiner}</p>

                <nav
                  aria-label={`${project.title} project links`}
                  className="opg-opening__actions"
                >
                  {publicLinks.map((link) => (
                    <ActionLink
                      direction="external"
                      href={link.href}
                      key={link.label}
                      target="_blank"
                    >
                      {link.label}
                    </ActionLink>
                  ))}
                </nav>

                <MetadataLine
                  className="opg-opening__metadata"
                  items={[
                    {
                      label: "Lifecycle",
                      value: humanize(project.lifecycle),
                    },
                    { label: "Period", value: projectPeriod(project) },
                    { label: "Role", value: project.role.label },
                  ]}
                />
              </EditorialGrid>
            </header>

            <section
              aria-labelledby="project-facts-heading"
              className="opg-foundation-section"
              data-project-facts
            >
              <SectionRule index="01" />
              <EditorialGrid>
                <h2
                  className="opg-foundation-section__heading"
                  id="project-facts-heading"
                >
                  Project facts.
                </h2>
                <p className="opg-foundation-section__intro">
                  {project.caseStudyState === "full"
                    ? project.problem
                    : project.context}
                </p>
              </EditorialGrid>

              <MetadataLine
                className="mt-12"
                items={[
                  {
                    label: "Context",
                    value: project.origin.map(humanize).join(" · "),
                  },
                  {
                    label: "Validation",
                    value:
                      project.validationKinds.length > 0
                        ? project.validationKinds.map(humanize).join(" · ")
                        : "Repository-backed build",
                  },
                  {
                    label: "Scope",
                    value: project.role.scope.join(" "),
                  },
                  {
                    label: "Stack",
                    value: project.technologies.join(" · "),
                  },
                  {
                    label: "Verified",
                    value: project.lastVerifiedAt,
                  },
                ]}
              />
            </section>

            <section
              aria-label="Case-study narrative"
              className="opg-foundation-section"
              data-project-narrative
            >
              <SectionRule index="02" />
              <EditorialGrid>
                <p
                  className="opg-foundation-section__heading"
                >
                  Case-study narrative.
                </p>
                <p className="opg-foundation-section__intro">
                  Authored as a constrained, server-rendered record. Planned
                  media stays absent until a reviewed public asset exists.
                </p>
              </EditorialGrid>

              <div className="mt-12 max-w-[68ch] border-t border-[var(--rule)] pt-8 text-[var(--text)] [&_a]:font-semibold [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:m-0 [&_blockquote]:border-l [&_blockquote]:border-[var(--rule-strong)] [&_blockquote]:pl-5 [&_blockquote]:text-xl [&_blockquote]:font-semibold [&_blockquote]:leading-relaxed [&_h2]:mt-16 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:tracking-[-0.03em] [&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mt-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-5 [&_p]:leading-7 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
                {narrativeContent}
              </div>
            </section>
          </article>
        </SiteContainer>
      </main>

      <footer className="opg-foundation-footer">
        <SiteContainer className="opg-foundation-footer__inner">
          <p>
            Private compatibility route. Content remains server-rendered and is
            excluded from indexing.
          </p>
          <ActionLink direction="back" href={PREVIEW_ROOT}>
            Back to foundations
          </ActionLink>
        </SiteContainer>
      </footer>
    </>
  );
}
