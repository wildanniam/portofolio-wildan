import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { ProjectSummaryDto, ReadyEvidenceDto } from "@/content/dto";
import type { SiteShellSelection } from "@/content/queries";
import type { ReadyImageAsset } from "@/content/types";

import { ProjectLogo } from "../media/project-logo";
import { ResponsiveMedia } from "../media/responsive-media";
import { PortfolioShell } from "../shell/portfolio-shell";

const flagshipOrder = ["fradium", "nova-ai", "paygate", "quorum"];

function orderProjects(projects: ProjectSummaryDto[]) {
  const rank = new Map(flagshipOrder.map((slug, index) => [slug, index]));
  return [...projects].sort(
    (left, right) =>
      (rank.get(left.slug) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(right.slug) ?? Number.MAX_SAFE_INTEGER) ||
      right.lastUpdatedAt.localeCompare(left.lastUpdatedAt),
  );
}

function isVisual(asset: ReadyEvidenceDto): asset is ReadyImageAsset {
  return asset.mediaKind === "image" || asset.mediaKind === "svg";
}

function archiveVisual(project: ProjectSummaryDto) {
  const visuals = project.evidence.filter(isVisual);
  return (
    visuals.find((asset) => asset.slot === "atlas-primary-surface") ??
    visuals.find((asset) =>
      asset.evidenceFunctions.includes("product-reality"),
    ) ??
    visuals[0]
  );
}

function projectYear(project: ProjectSummaryDto) {
  return project.endedAt
    ? `${project.startedAt}–${project.endedAt}`
    : `${project.startedAt}–present`;
}

export function WorkArchive({
  basePath = "",
  projects,
  shell,
}: {
  basePath?: string;
  projects: ProjectSummaryDto[];
  shell: SiteShellSelection;
}) {
  const ordered = orderProjects(projects);

  return (
    <PortfolioShell
      basePath={basePath}
      currentPath="/work"
      mainId="work-main"
      {...shell}
    >
      <main className="v4-route v4-work" id="work-main" tabIndex={-1}>
        <header className="v4-route-hero portfolio-container">
          <p className="v4-route-hero__index">
            <span aria-hidden="true" className="v4-origin-mark" />
            Work / System index
          </p>
          <div className="v4-route-hero__grid">
            <h1>
              Four systems. One practice of turning research into software.
            </h1>
            <div>
              <p>
                AI agents, on-chain infrastructure, and payment systems—each
                documented through the question, implementation, and evidence
                that shaped the build.
              </p>
              <p className="v4-route-hero__meta">
                {ordered.length} published case studies / Bandung, Indonesia
              </p>
            </div>
          </div>
        </header>

        <section aria-label="Published project archive" className="v4-work__index portfolio-container">
          {ordered.map((project, index) => {
            const visual = archiveVisual(project);
            return (
              <article className="v4-work-record" data-work-record={project.slug} key={project.slug}>
                <div className="v4-work-record__identity">
                  <span className="v4-work-record__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {project.branding ? (
                    <ProjectLogo
                      asset={project.branding.mark}
                      className="v4-work-record__mark"
                      surface="light"
                    />
                  ) : null}
                  <p>{project.role.label}</p>
                  <h2>{project.title}</h2>
                  <p className="v4-work-record__summary">
                    {project.editorial.archive.summary}
                  </p>
                  <dl>
                    <div>
                      <dt>State</dt>
                      <dd>{project.lifecycle}</dd>
                    </div>
                    <div>
                      <dt>Period</dt>
                      <dd>{projectYear(project)}</dd>
                    </div>
                    <div>
                      <dt>Context</dt>
                      <dd>{project.origin.join(" / ")}</dd>
                    </div>
                  </dl>
                  <Link className="v4-text-link" href={`${basePath}${project.href}`} prefetch={false}>
                    Read case study
                    <ArrowUpRight aria-hidden="true" size={17} />
                  </Link>
                </div>

                {visual ? (
                  <figure className="v4-work-record__visual">
                    <ResponsiveMedia
                      asset={visual}
                      fit="contain"
                      sizes="(max-width: 767px) calc(100vw - 40px), 46vw"
                    />
                    <figcaption>{visual.caption}</figcaption>
                  </figure>
                ) : null}
              </article>
            );
          })}
        </section>
      </main>
    </PortfolioShell>
  );
}
