import type { CSSProperties } from "react";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ArtifactFragment } from "@/components/portfolio/media/artifact-fragment";
import { ProjectLogo } from "@/components/portfolio/media/project-logo";
import type { HomepageProjectStageSelection } from "@/content/queries";
import type { ReadyImageAsset } from "@/content/types";

type ProjectStageProps = {
  basePath?: string;
  index: number;
  selection: HomepageProjectStageSelection;
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

function isReadyVisual(asset: HomepageProjectStageSelection["artifacts"][number]): asset is ReadyImageAsset {
  return asset.mediaKind === "image" || asset.mediaKind === "svg";
}

export function ProjectStage({
  basePath = "",
  index,
  selection,
}: ProjectStageProps) {
  const { artifacts, outcomeClaim, project, stage } = selection;
  const visuals = artifacts.filter(isReadyVisual);
  const palette = project.branding?.palette;
  const style = palette
    ? ({
        "--stage-accent": palette.accent,
        "--stage-surface": palette.surface,
        "--stage-foreground": palette.foreground,
      } as CSSProperties)
    : undefined;

  return (
    <article
      className={`v4-stage v4-stage--${stage.variant}`}
      data-atlas-stage={project.slug}
      data-stage-variant={stage.variant}
      style={style}
    >
      <header className="v4-stage__header" data-stage-region="header">
        <div className="v4-stage__identity">
          <span className="v4-stage__number">{String(index + 1).padStart(2, "0")}</span>
          {project.branding ? (
            <span className="v4-stage__mark">
              <ProjectLogo
                asset={project.branding.mark}
                surface="dark"
              />
            </span>
          ) : null}
          <div>
            <h3>{project.title}</h3>
            <p>{project.role.label}</p>
          </div>
        </div>
        <dl className="v4-stage__premise">
          <div>
            <dt>Question</dt>
            <dd>{stage.question}</dd>
          </div>
          <div>
            <dt>System response</dt>
            <dd>{stage.answer}</dd>
          </div>
        </dl>
      </header>

      <figure
        aria-label={`${project.title} product artifacts: ${visuals.map((asset) => asset.caption).join(" ")}`}
        className="v4-stage__scene"
        data-project-scene={project.slug}
        data-stage-region="figure"
      >
        <div className="v4-stage__scene-grid">
          {visuals.map((asset, artifactIndex) => (
            <ArtifactFragment
              asset={asset}
              className={`v4-stage__artifact v4-stage__artifact--${artifactIndex + 1}`}
              key={asset.id}
              sizes={
                stage.variant.startsWith("wide")
                  ? "(max-width: 767px) calc(100vw - 72px), 31vw"
                  : "(max-width: 767px) calc(100vw - 72px), 22vw"
              }
            />
          ))}
        </div>
        <figcaption className="portfolio-visually-hidden">
          Authentic product surfaces from {project.title}, shown at their intrinsic proportions.
        </figcaption>
      </figure>

      <footer className="v4-stage__footer" data-stage-region="footer">
        <ol aria-label={`${project.title} system flow`} className="v4-stage__flow">
          {stage.flowLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ol>
        <div className="v4-stage__outcome">
          <span>Outcome</span>
          <p>{outcomeClaim.text}</p>
        </div>
        <Link
          aria-label={`Read the ${project.title} case study`}
          className="v4-text-link"
          data-stage-action
          href={route(basePath, `/work/${project.slug}`)}
          prefetch={false}
        >
          Read case study
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </footer>
    </article>
  );
}
