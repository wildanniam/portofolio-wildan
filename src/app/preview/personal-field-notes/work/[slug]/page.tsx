import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProjectNarrative } from "@/components/v1/case-study/project-narrative.server";
import { PersonalFieldNotesProject } from "@/components/pfn/pfn-routes";
import { getProjectBySlug, getWorkProjectSummaries } from "@/content/queries.server";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  return project
    ? { title: `${project.title} — Personal Field Notes`, description: project.oneLiner, robots: { index: false, follow: false } }
    : { title: "Work record unavailable", robots: { index: false, follow: false } };
}

export default async function PersonalFieldNotesProjectPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || project.caseStudyState !== "full") notFound();

  const archive = getWorkProjectSummaries();
  const currentIndex = archive.findIndex((item) => item.slug === project.slug);
  const next = archive[currentIndex + 1];

  return (
    <PersonalFieldNotesProject
      basePath="/preview/personal-field-notes"
      narrative={await getProjectNarrative(project.slug)}
      nextProject={next ? getProjectBySlug(next.slug) : undefined}
      project={project}
    />
  );
}
