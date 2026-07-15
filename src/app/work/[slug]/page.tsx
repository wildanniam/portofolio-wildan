import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectCaseStudy } from "@/components/portfolio/project/project-case-study";
import { getAdjacentWorkProjectSummaries, getProjectBySlug, getProjectCaseStudyMoment, getProjectParams, getSiteShell } from "@/content/queries.server";
import { getProjectNarrative } from "@/content/project-narrative.server";
import { selectProjectSocialImage } from "@/content/queries";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjectParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Work record unavailable" };
  const socialImage = selectProjectSocialImage(project);
  return {
    title: project.title,
    description: project.editorial.metadata.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title} | Wildan Syukri Niam`,
      description: project.editorial.metadata.description,
      type: "article",
      url: `/work/${project.slug}`,
      ...(socialImage ? { images: [{ alt: socialImage.alt, height: socialImage.height, url: socialImage.src, width: socialImage.width }] } : {}),
    },
  };
}

export default async function WorkProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || project.caseStudyState !== "full") notFound();
  return (
    <ProjectCaseStudy
      adjacent={getAdjacentWorkProjectSummaries(project.slug)}
      basePath=""
      documentaryMoment={getProjectCaseStudyMoment(project.slug)}
      narrative={await getProjectNarrative(project.slug)}
      project={project}
      shell={getSiteShell()}
    />
  );
}
