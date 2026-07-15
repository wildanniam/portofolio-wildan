import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { ProjectRecord, Research } from "@/content/types";

type ResearchCoordinatesProps = {
  basePath?: string;
  projects: ProjectRecord[];
  research: Research;
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

export function ResearchCoordinates({
  basePath = "",
  projects,
  research,
}: ResearchCoordinatesProps) {
  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));

  return (
    <section
      aria-labelledby="research-coordinates-title"
      className="v4-coordinates portfolio-container"
      data-research-coordinates
      id="research-coordinates"
    >
      <header className="v4-section-rule">
        <h2 id="research-coordinates-title">{research.title}</h2>
        <p>{research.intro}</p>
        <span aria-hidden="true">[ FIELD MAP 01 ]</span>
      </header>

      <ol className="v4-coordinates__rail">
        {research.territories.map((territory, index) => (
          <li className="v4-coordinate" key={territory.id}>
            <span aria-hidden="true" className="v4-coordinate__node" />
            <p className="v4-coordinate__index">{String(index + 1).padStart(2, "0")}</p>
            <h3>{territory.name}</h3>
            <p className="v4-coordinate__summary">{territory.summary}</p>
            <ul aria-label={`Projects connected to ${territory.name}`}>
              {territory.projectSlugs.map((slug) => {
                const project = projectBySlug.get(slug);
                if (!project) return null;
                return (
                  <li key={slug}>
                    <Link href={route(basePath, `/work/${slug}`)} prefetch={false}>
                      {project.title}
                      <ArrowUpRight aria-hidden="true" size={12} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
