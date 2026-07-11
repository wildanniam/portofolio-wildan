import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectBriefPage } from "@/components/v1/case-study/project-brief-page";
import { getProjectNarrative } from "@/components/v1/case-study/project-narrative.server";
import { ProjectPage } from "@/components/v1/case-study/project-page";
import { SiteContainer } from "@/components/v1/foundations/site-container";
import { SkipLink } from "@/components/v1/shell/skip-link";
import { getProjectBySlug, getProjectParams } from "@/content/queries.server";
import type { ProjectRecord } from "@/content/types";

const PREVIEW_ROOT = "/preview/open-proving-ground";
const PREVIEW_SITE = `${PREVIEW_ROOT}/site`;

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectParams({ preview: true });
}

function getPreviewProject(slug: string): ProjectRecord | undefined {
  if (process.env.PORTFOLIO_V1_PREVIEW !== "1") return undefined;

  return getProjectBySlug(slug, { preview: true });
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
    title: `${project.title} - Open Proving Ground`,
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

  return (
    <>
      <SkipLink />
      <header className="opg-foundation-rail">
        <SiteContainer className="opg-foundation-rail__inner">
          <a className="opg-foundation-mark" href={PREVIEW_SITE}>
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

      <main id="main-content" tabIndex={-1}>
        {project.caseStudyState === "brief" ? (
          <ProjectBriefPage backHref={PREVIEW_SITE} preview project={project} />
        ) : (
          <ProjectPage
            backHref={PREVIEW_SITE}
            narrative={await getProjectNarrative(project.slug)}
            preview
            project={project}
          />
        )}
      </main>

      <footer className="opg-foundation-footer">
        <SiteContainer className="opg-foundation-footer__inner">
          <p>
            Private compatibility route. Content remains server-rendered and is
            excluded from indexing.
          </p>
          <code>Credential-protected preview</code>
        </SiteContainer>
      </footer>
    </>
  );
}
