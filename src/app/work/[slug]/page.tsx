import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PersonalFieldNotesProject } from "@/components/pfn/pfn-routes";
import { getProjectBySlug, getProjectCaseStudyMoment, getSiteShell, getWorkProjectSummaries } from "@/content/queries.server";
import { selectProjectSocialImage } from "@/content/queries";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getWorkProjectSummaries().map(({ slug }) => ({ slug }));
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
  const projects = getWorkProjectSummaries();
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[currentIndex + 1];
  return (
    <PersonalFieldNotesProject
      basePath=""
      documentaryMoment={getProjectCaseStudyMoment(project.slug)}
      nextProject={next ? getProjectBySlug(next.slug) : undefined}
      project={project}
      shell={getSiteShell()}
    />
  );
}
