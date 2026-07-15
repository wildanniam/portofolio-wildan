import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { HomepageProjectStageSelection } from "@/content/queries";

import { AtlasMotionLoader } from "./atlas-motion-loader";
import { ProjectStage } from "./project-stage";

type ProjectAtlasProps = {
  basePath?: string;
  stages: HomepageProjectStageSelection[];
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

export function ProjectAtlas({ basePath = "", stages }: ProjectAtlasProps) {
  return (
    <section
      aria-labelledby="project-atlas-title"
      className="v4-atlas portfolio-container"
      data-atlas-motion-state="static"
      data-project-atlas
      id="project-atlas"
    >
      <header className="v4-atlas__intro">
        <div>
          <p className="v4-kicker">Selected systems</p>
          <h2 id="project-atlas-title">Questions worth building answers for.</h2>
        </div>
        <div>
          <p>
            Four systems across AI agents, trust, on-chain intelligence, and
            agentic payments. Each starts with a question and ends with a working artifact.
          </p>
          <Link className="v4-text-link" href={route(basePath, "/work")} prefetch={false}>
            Open the full archive
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <span aria-hidden="true">[ 01 — 04 ]</span>
      </header>

      <div className="v4-atlas__grid">
        {stages.map((stage, index) => (
          <ProjectStage
            basePath={basePath}
            index={index}
            key={stage.project.slug}
            selection={stage}
          />
        ))}
      </div>
      <AtlasMotionLoader />
    </section>
  );
}
