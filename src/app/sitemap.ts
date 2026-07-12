import type { MetadataRoute } from "next";

import {
  getMomentsNarrative,
  getPublishedProjects,
} from "@/content/queries.server";
import { absoluteSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteSiteUrl("/") },
    { url: absoluteSiteUrl("/work") },
    { url: absoluteSiteUrl("/about") },
    { url: absoluteSiteUrl("/contact") },
  ];
  const projectRoutes: MetadataRoute.Sitemap = getPublishedProjects().map(
    (project) => ({
      url: absoluteSiteUrl(`/work/${project.slug}`),
      lastModified: project.lastUpdatedAt,
    }),
  );
  const momentRoutes: MetadataRoute.Sitemap = getMomentsNarrative()
    ? [{ url: absoluteSiteUrl("/moments") }]
    : [];

  return [...staticRoutes, ...projectRoutes, ...momentRoutes];
}
