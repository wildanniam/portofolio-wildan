import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PortfolioShell } from "@/components/portfolio/shell/portfolio-shell";
import type { ProjectSummaryDto } from "@/content/dto";
import type { SiteShellSelection } from "@/content/queries";
import type {
  FullProjectRecord,
  MomentRecord,
  ProjectRecord,
  ReadyImageAsset,
} from "@/content/types";

import { PfnMedia } from "./pfn-media";
import {
  momentPrimaryImage,
  projectOutcome,
  projectPeriod,
  projectPrimaryImage,
  readyImages,
} from "./pfn-models";

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

function summaryImage(project: ProjectSummaryDto): ReadyImageAsset | undefined {
  return project.evidence.find(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" && asset.mediaKind === "image",
  );
}

const flagshipOrder = ["fradium", "nova-ai", "paygate", "quorum"];

function orderArchive(projects: ProjectSummaryDto[]) {
  const rank = new Map(flagshipOrder.map((slug, index) => [slug, index]));
  return [...projects].sort(
    (left, right) =>
      (rank.get(left.slug) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(right.slug) ?? Number.MAX_SAFE_INTEGER) ||
      right.lastUpdatedAt.localeCompare(left.lastUpdatedAt),
  );
}

export function PersonalFieldNotesWork({
  basePath,
  projects,
  shell,
}: {
  basePath: string;
  projects: ProjectSummaryDto[];
  shell: SiteShellSelection;
}) {
  const orderedProjects = orderArchive(projects);

  return (
    <PortfolioShell basePath={basePath} currentPath="/work" mainId="pfn-main" {...shell}>
      <main className="pfn-route" id="pfn-main" tabIndex={-1}>
        <header className="pfn-route-hero">
          <p>Work archive</p>
          <h1>Systems with a trail behind them.</h1>
          <div>
            <p>Flagship builds and smaller experiments, organized by what was made and what can be inspected next.</p>
            <p>{orderedProjects.length} published records</p>
          </div>
        </header>

        <section aria-labelledby="work-index-heading" className="pfn-work-archive">
          <h2 className="pfn-visually-hidden" id="work-index-heading">Published project archive</h2>
          <ol>
            {orderedProjects.map((project) => {
              const image = summaryImage(project);
              const isFlagship = flagshipOrder.includes(project.slug);
              return (
                <li className={isFlagship ? "pfn-work-record pfn-work-record--flagship" : "pfn-work-record"} key={project.slug}>
                  <Link aria-label={`Open ${project.title} project record`} href={route(basePath, `/work/${project.slug}`)} prefetch={false}>
                    <span className="pfn-work-record__meta">
                      <span>{project.role.label}</span>
                      <span>{project.lifecycle}</span>
                      <span>{project.startedAt}</span>
                    </span>
                    <span className="pfn-work-record__title">
                      <strong>{project.title}</strong>
                      <span>{project.oneLiner}</span>
                    </span>
                    {image ? (
                      <span className="pfn-work-record__media">
                        <PfnMedia asset={image} decorative sizes="(max-width: 639px) 100vw, 34vw" />
                      </span>
                    ) : (
                      <span aria-hidden="true" className="pfn-work-record__monogram">{project.title.slice(0, 2)}</span>
                    )}
                    <span className="pfn-work-record__open">
                      Inspect project
                      <ArrowUpRight aria-hidden="true" size={18} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </PortfolioShell>
  );
}

function ProjectFigure({
  asset,
  priority = false,
}: {
  asset: ReadyImageAsset;
  priority?: boolean;
}) {
  return (
    <figure className="pfn-case-figure">
      <div className="pfn-case-figure__media">
        <PfnMedia
          asset={asset}
          priority={priority}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 92vw, 86vw"
        />
      </div>
      <figcaption>{asset.caption}</figcaption>
    </figure>
  );
}

export function PersonalFieldNotesProject({
  basePath,
  documentaryMoment,
  nextProject,
  project,
  shell,
}: {
  basePath: string;
  documentaryMoment?: MomentRecord;
  nextProject?: ProjectRecord;
  project: FullProjectRecord;
  shell: SiteShellSelection;
}) {
  const primaryImage = projectPrimaryImage(project);
  const outcome = projectOutcome(project);
  const outcomeSources = outcome?.sources.filter((source) => source.kind === "url") ?? [];
  const projectImages = readyImages(project.evidence).filter((asset) => asset.id !== primaryImage?.id);
  const documentaryImage = documentaryMoment ? momentPrimaryImage(documentaryMoment) : undefined;

  return (
    <PortfolioShell
      basePath={basePath}
      currentPath={`/work/${project.slug}`}
      mainId="pfn-main"
      {...shell}
    >
      <main className="pfn-case" id="pfn-main" tabIndex={-1}>
        <header className="pfn-case-hero">
          <Link className="pfn-back-link" href={route(basePath, "/work")} prefetch={false}>
            <ArrowLeft aria-hidden="true" size={17} />
            Back to work
          </Link>
          <div className="pfn-case-hero__kicker">
            <span>{project.role.label}</span>
            <span>{projectPeriod(project)}</span>
          </div>
          <h1>{project.title}</h1>
          <p className="pfn-case-hero__premise">{project.oneLiner}</p>
          <dl className="pfn-case-facts">
            <div><dt>State</dt><dd>{project.lifecycle}</dd></div>
            <div><dt>Context</dt><dd>{project.origin.join(" / ")}</dd></div>
            <div><dt>Validation</dt><dd>{project.validationKinds.join(" / ")}</dd></div>
          </dl>
          <nav aria-label={`${project.title} external links`} className="pfn-case-hero__actions">
            {project.links.live.status === "public" ? (
              <a className="pfn-button pfn-button--primary" href={project.links.live.url} rel="noreferrer" target="_blank">
                Open live project
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
            ) : null}
            {project.links.source.status === "public" ? (
              <a className="pfn-button pfn-button--quiet" href={project.links.source.url} rel="noreferrer" target="_blank">
                View source
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
            ) : null}
          </nav>
        </header>

        {primaryImage ? <ProjectFigure asset={primaryImage} priority /> : null}

        {outcome ? (
          <section aria-labelledby="case-outcome" className="pfn-case-outcome">
            <p>Outcome</p>
            <div>
              <h2 id="case-outcome">{outcome.text}</h2>
              <p>{outcome.scope}</p>
            </div>
            {outcomeSources.length > 0 ? (
              <div className="pfn-case-outcome__sources">
                {outcomeSources.slice(0, 2).map((source) => (
                  <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
                    {source.label}
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="case-problem" className="pfn-case-chapter pfn-case-chapter--problem">
          <p>Problem</p>
          <div>
            <h2 id="case-problem">The product question.</h2>
            <p className="pfn-case-chapter__lead">{project.problem}</p>
          </div>
          <div>
            <h3>Intended users</h3>
            <ul>{project.intendedUsers.map((user) => <li key={user}>{user}</li>)}</ul>
          </div>
        </section>

        <section aria-labelledby="case-role" className="pfn-case-chapter pfn-case-chapter--role">
          <p>Contribution</p>
          <div>
            <h2 id="case-role">{project.role.label}</h2>
            <p className="pfn-case-chapter__lead">{project.teamContext.summary}</p>
          </div>
          <ul className="pfn-scope-list">
            {project.role.scope.map((scope) => <li key={scope}>{scope}</li>)}
          </ul>
        </section>

        <section aria-labelledby="case-decisions" className="pfn-case-decisions">
          <header>
            <p>Decisions</p>
            <h2 id="case-decisions">Choices that shaped the build.</h2>
          </header>
          <div>
            {project.decisions.slice(0, 3).map((decision, index) => (
              <article key={decision.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{decision.title}</h3>
                <p>{decision.rationale}</p>
                <p>{decision.consequence}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="case-flow" className="pfn-case-flow">
          <header>
            <p>System flow</p>
            <h2 id="case-flow">From intent to visible evidence.</h2>
          </header>
          <ol>
            {project.systemFlow.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {projectImages.length > 0 || documentaryImage ? (
          <section aria-labelledby="case-evidence" className="pfn-case-gallery">
            <header>
              <p>Evidence</p>
              <h2 id="case-evidence">Product and team, in frame.</h2>
            </header>
            <div className="pfn-case-gallery__grid">
              {projectImages.slice(0, 2).map((asset) => <ProjectFigure asset={asset} key={asset.id} />)}
              {documentaryImage && documentaryMoment ? (
                <figure className="pfn-case-figure pfn-case-figure--documentary">
                  <div className="pfn-case-figure__media">
                    <PfnMedia asset={documentaryImage} sizes="(max-width: 639px) 100vw, 44vw" />
                  </div>
                  <figcaption>{documentaryMoment.caption}</figcaption>
                </figure>
              ) : null}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="case-reflection" className="pfn-case-reflection">
          <p>Reflection</p>
          <div>
            <h2 id="case-reflection">What remains, and what comes next.</h2>
            <h3>Current boundary</h3>
            <ul>{project.limitations.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>Next improvements</h3>
            <ul>{project.next.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>Technology</h3>
            <p className="pfn-tech-list">{project.technologies.join(" / ")}</p>
          </div>
        </section>

        {nextProject ? (
          <Link className="pfn-next-project" href={route(basePath, `/work/${nextProject.slug}`)} prefetch={false}>
            <span>Next project</span>
            <strong>{nextProject.title}</strong>
            <ArrowRight aria-hidden="true" size={32} />
          </Link>
        ) : (
          <Link className="pfn-next-project" href={route(basePath, "/work")} prefetch={false}>
            <span>Continue exploring</span>
            <strong>Work archive</strong>
            <ArrowRight aria-hidden="true" size={32} />
          </Link>
        )}
      </main>
    </PortfolioShell>
  );
}

export function PersonalFieldNotesAbout({ basePath, shell }: { basePath: string; shell: SiteShellSelection }) {
  const { profile } = shell;
  return (
    <PortfolioShell basePath={basePath} currentPath="/about" mainId="pfn-main" {...shell}>
      <main className="pfn-route" id="pfn-main" tabIndex={-1}>
        <header className="pfn-route-hero pfn-about-hero">
          <p>About</p>
          <h1>I make ambitious systems easier to see.</h1>
          <div><p>{profile.positioning}</p><p>{profile.location}</p></div>
        </header>

        <section className="pfn-about-story">
          {profile.portrait ? (
            <figure>
              <div><PfnMedia asset={profile.portrait} priority sizes="(max-width: 639px) 100vw, 38vw" /></div>
              <figcaption>{profile.portrait.caption}</figcaption>
            </figure>
          ) : null}
          <div className="pfn-about-story__copy">
            <p className="pfn-about-story__lead">{profile.thesis}</p>
            <p>I am a Software Engineering student at Telkom University who learns by building systems with real constraints. My favorite projects sit where product behavior and technical architecture have to agree: an AI agent that should help without taking custody, a payment flow that needs a receipt, or a Web3 action that should be understandable before someone signs it.</p>
            <p>I usually work across the stack, but I do not treat full-stack work as a claim that one person did everything. The strongest hackathon projects here were team efforts. I like leading the product direction, connecting specialist contributions, and making the final path coherent enough for a user, teammate, or reviewer to inspect.</p>
            <p>That working habit also shapes my research into LLM-assisted self-healing test automation. Before asking an intelligent system to act, I want the failure, decision boundary, and recovery evidence to be visible. The same principle appears in Fradium, Nova, PayGate, and Quorum in different forms.</p>
            <p>This portfolio is a living record of that practice. Some projects are hackathon artifacts, some are research, and PayGate is an active product build. I present each one with its actual state, the role I held, the people around it, and the proof that survives after the demo.</p>
          </div>
          <dl className="pfn-about-facts">
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
            <div><dt>Studying</dt><dd>{profile.education}</dd></div>
            <div><dt>Open to</dt><dd>{profile.availability}</dd></div>
          </dl>
        </section>

        <section className="pfn-about-principles">
          <p>Working principles</p>
          <ol>
            <li><strong>Make the boundary visible.</strong><span>Users should know what the system did, what it did not do, and where their decision still matters.</span></li>
            <li><strong>Keep evidence close.</strong><span>Product behavior, source, transactions, tests, and team outcomes become more useful when their context stays attached.</span></li>
            <li><strong>Build with the team in frame.</strong><span>Leadership means making the shared build coherent while keeping specialist contributions clear.</span></li>
          </ol>
        </section>
      </main>
    </PortfolioShell>
  );
}

export function PersonalFieldNotesContact({ basePath, shell }: { basePath: string; shell: SiteShellSelection }) {
  const { profile } = shell;
  return (
    <PortfolioShell basePath={basePath} currentPath="/contact" mainId="pfn-main" {...shell}>
      <main className="pfn-contact" id="pfn-main" tabIndex={-1}>
        <p>Contact</p>
        <h1>Let&apos;s build something worth inspecting.</h1>
        <div className="pfn-contact__copy">
          <p>{profile.availability}</p>
          <p>Tell me what you are building, what makes it difficult, and where a strong software engineer can help.</p>
        </div>
        <a className="pfn-contact__email" href={`mailto:${profile.email}`}>
          <span>{profile.email}</span>
          <ArrowUpRight aria-hidden="true" size={32} />
        </a>
        {profile.github.status === "public" ? (
          <a className="pfn-text-link" href={profile.github.url} rel="noreferrer" target="_blank">
            Inspect my GitHub
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        ) : null}
        <p className="pfn-contact__location">{profile.location}</p>
      </main>
    </PortfolioShell>
  );
}
