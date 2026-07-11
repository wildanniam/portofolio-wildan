import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectBriefPage } from "@/components/v1/case-study/project-brief-page";
import { ProjectPage } from "@/components/v1/case-study/project-page";
import { getProjectNarrative } from "@/components/v1/case-study/project-narrative.server";
import { getProjectBySlug, getProjectParams } from "@/content/queries.server";
import type { ReadyImageAsset } from "@/content/types";

type WorkProjectPageProps = {
  params: Promise<{ slug: string }>;
};

// Keep the visibility query as the publication gate while allowing the closest
// V1 not-found boundary to render for unknown or non-public slugs. Next's strict
// no-fallback path bypasses that boundary when the public params list is empty.
export const dynamicParams = true;

export function generateStaticParams() {
  return getProjectParams();
}

export async function generateMetadata({
  params,
}: WorkProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Work record unavailable",
    };
  }

  const socialImage = project.evidence.find(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" &&
      (asset.mediaKind === "image" || asset.mediaKind === "svg"),
  );

  return {
    title: project.title,
    description: project.oneLiner,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    openGraph: {
      title: `${project.title} — Wildan Syukri Niam`,
      description: project.oneLiner,
      type: "article",
      url: `/work/${project.slug}`,
      ...(socialImage
        ? {
            images: [
              {
                alt: socialImage.alt,
                height: socialImage.height,
                url: socialImage.src,
                width: socialImage.width,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title: `${project.title} — Wildan Syukri Niam`,
      description: project.oneLiner,
      ...(socialImage ? { images: [socialImage.src] } : {}),
    },
  };
}

export default async function WorkProjectPage({
  params,
}: WorkProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  if (project.caseStudyState === "brief") {
    return <ProjectBriefPage project={project} />;
  }

  return (
    <ProjectPage
      narrative={await getProjectNarrative(project.slug)}
      project={project}
    />
  );
}
