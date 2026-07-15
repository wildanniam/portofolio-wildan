import type { ReactNode } from "react";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { ProjectSummaryDto } from "@/content/dto";
import type { SiteShellSelection } from "@/content/queries";
import type { FullProjectRecord, MomentRecord } from "@/content/types";

import { ArtifactFragment } from "../media/artifact-fragment";
import { ProjectLogo } from "../media/project-logo";
import { ResponsiveMedia } from "../media/responsive-media";
import { PortfolioShell } from "../shell/portfolio-shell";
import {
  momentVisual,
  projectOpeningVisual,
  projectOutcome,
  projectPeriod,
  readyVisualEvidence,
} from "./project-models";

type AdjacentProjects = {
  previous?: ProjectSummaryDto;
  next?: ProjectSummaryDto;
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

function externalSources(project: FullProjectRecord) {
  const seen = new Set<string>();
  return project.claims.flatMap((claim) =>
    claim.sources.flatMap((source) => {
      if (source.kind !== "url" || seen.has(source.url)) return [];
      seen.add(source.url);
      return [{ href: source.url, label: source.label }];
    }),
  );
}

function ProjectExternalActions({ project }: { project: FullProjectRecord }) {
  return (
    <nav aria-label={`${project.title} external links`} className="v4-case-opening__actions">
      {project.links.live.status === "public" ? (
        <a className="v4-button v4-button--primary" href={project.links.live.url} rel="noreferrer" target="_blank">
          Open live project
          <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      ) : null}
      {project.links.source.status === "public" ? (
        <a className="v4-button v4-button--secondary" href={project.links.source.url} rel="noreferrer" target="_blank">
          View source
          <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      ) : null}
    </nav>
  );
}

export function ProjectCaseStudy({
  adjacent,
  basePath = "",
  documentaryMoment,
  narrative,
  project,
  shell,
}: {
  adjacent?: AdjacentProjects;
  basePath?: string;
  documentaryMoment?: MomentRecord;
  narrative: ReactNode;
  project: FullProjectRecord;
  shell: SiteShellSelection;
}) {
  const openingVisual = projectOpeningVisual(project);
  const evidence = readyVisualEvidence(project).filter(
    (asset) => asset.id !== openingVisual?.id,
  );
  const outcome = projectOutcome(project);
  const documentary = momentVisual(documentaryMoment);
  const sources = externalSources(project).slice(0, 4);

  return (
    <PortfolioShell
      basePath={basePath}
      currentPath={`/work/${project.slug}`}
      mainId="case-main"
      {...shell}
    >
      <main className="v4-case" data-project-case={project.slug} id="case-main" tabIndex={-1}>
        <section className="v4-case-opening portfolio-container">
          <div className="v4-case-opening__copy">
            <Link className="v4-case-opening__back" href={route(basePath, "/work")} prefetch={false}>
              <ArrowLeft aria-hidden="true" size={16} />
              Work index
            </Link>
            <div className="v4-case-opening__eyebrow">
              <span aria-hidden="true" className="v4-origin-mark" />
              {project.branding ? (
                <ProjectLogo asset={project.branding.mark} surface="light" />
              ) : null}
              <span>{project.title} / Case study</span>
            </div>
            <p className="v4-case-opening__state">
              {project.lifecycle} · {project.validationKinds.join(" / ")}
            </p>
            <h1>{project.editorial.caseOpening.question}</h1>
            <p className="v4-case-opening__answer">
              {project.editorial.caseOpening.answer}
            </p>
            <div className="v4-case-opening__signal" aria-hidden="true"><span /></div>
            <p className="v4-case-opening__role">{project.role.label}</p>
            {outcome ? <p className="v4-case-opening__outcome">{outcome.text}</p> : null}
            <ProjectExternalActions project={project} />
          </div>

          {openingVisual ? (
            <figure className="v4-case-opening__visual">
              <ResponsiveMedia
                asset={openingVisual}
                fit="contain"
                priority
                sizes="(max-width: 767px) calc(100vw - 40px), 52vw"
              />
              <figcaption>{openingVisual.caption}</figcaption>
            </figure>
          ) : null}

          <dl className="v4-case-opening__facts">
            <div><dt>Role</dt><dd>{project.role.label}</dd></div>
            <div><dt>Lifecycle</dt><dd>{project.lifecycle}</dd></div>
            <div><dt>Context</dt><dd>{project.origin.join(" / ")}</dd></div>
            <div><dt>Period</dt><dd>{projectPeriod(project)}</dd></div>
          </dl>
        </section>

        <section aria-labelledby="case-narrative-title" className="v4-case-story portfolio-container">
          <header className="v4-case-chapter-rule">
            <span>Chapter 01</span>
            <i aria-hidden="true" />
            <span>[ 01 — 04 ]</span>
          </header>
          <h2 id="case-narrative-title">From a research question to a working system.</h2>
          <div className="v4-case-story__narrative">{narrative}</div>
        </section>

        <section aria-labelledby="case-system-title" className="v4-case-system portfolio-container">
          <header>
            <p>System record</p>
            <h2 id="case-system-title">The path through the build.</h2>
          </header>
          <ol>
            {project.systemFlow.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <aside>
            <p>Contribution</p>
            <h3>{project.role.label}</h3>
            <ul>{project.role.scope.map((scope) => <li key={scope}>{scope}</li>)}</ul>
          </aside>
        </section>

        {evidence.length ? (
          <section aria-labelledby="case-evidence-title" className="v4-case-evidence portfolio-container">
            <header>
              <p>Evidence atlas</p>
              <h2 id="case-evidence-title">Product behavior, architecture, and proof.</h2>
            </header>
            <div className="v4-case-evidence__grid">
              {evidence.map((asset, index) => (
                <ArtifactFragment
                  asset={asset}
                  className={`v4-case-evidence__item v4-case-evidence__item--${(index % 3) + 1}`}
                  key={asset.id}
                  sizes="(max-width: 767px) calc(100vw - 40px), 44vw"
                />
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="case-boundary-title" className="v4-case-boundary portfolio-container">
          <div>
            <p>Current boundary</p>
            <h2 id="case-boundary-title">What the artifact proves—and what remains next.</h2>
          </div>
          <div>
            <h3>Limitations</h3>
            <ul>{project.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>Next iteration</h3>
            <ul>{project.next.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        {documentary && documentaryMoment ? (
          <section aria-labelledby="case-moment-title" className="v4-case-moment portfolio-container">
            <figure>
              <ResponsiveMedia
                asset={documentary}
                fit="cover"
                sizes="(max-width: 767px) calc(100vw - 40px), 48vw"
              />
              <figcaption>{documentary.caption}</figcaption>
            </figure>
            <div>
              <p>Moment / {documentaryMoment.category}</p>
              <h2 id="case-moment-title">{documentaryMoment.title}</h2>
              <p>{documentaryMoment.reflection}</p>
              <dl>
                <div><dt>Event</dt><dd>{documentaryMoment.event}</dd></div>
                <div><dt>Place</dt><dd>{documentaryMoment.place}</dd></div>
              </dl>
            </div>
          </section>
        ) : null}

        {sources.length ? (
          <section aria-label="Project sources" className="v4-case-sources portfolio-container">
            <p>Selected sources</p>
            <div>
              {sources.map((source) => (
                <a href={source.href} key={source.href} rel="noreferrer" target="_blank">
                  {source.label}<ArrowUpRight aria-hidden="true" size={16} />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <nav aria-label="Case study navigation" className="v4-case-navigation portfolio-container">
          {adjacent?.previous ? (
            <Link href={route(basePath, adjacent.previous.href)} prefetch={false}>
              <ArrowLeft aria-hidden="true" size={20} />
              <span>Previous case</span>
              <strong>{adjacent.previous.title}</strong>
            </Link>
          ) : <span />}
          {adjacent?.next ? (
            <Link href={route(basePath, adjacent.next.href)} prefetch={false}>
              <span>Next case</span>
              <strong>{adjacent.next.title}</strong>
              <ArrowRight aria-hidden="true" size={20} />
            </Link>
          ) : (
            <Link href={route(basePath, "/work")} prefetch={false}>
              <span>Continue exploring</span>
              <strong>Work index</strong>
              <ArrowRight aria-hidden="true" size={20} />
            </Link>
          )}
        </nav>
      </main>
    </PortfolioShell>
  );
}
