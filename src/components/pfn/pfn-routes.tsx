import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import type { ProjectSummaryDto } from "@/content/dto";
import type {
  FullProjectRecord,
  MomentRecord,
  Profile,
  ProjectRecord,
  ReadyImageAsset,
} from "@/content/types";

const categoryLabels = {
  build: "Build",
  win: "Win",
  learn: "Learn",
  give: "Give",
} as const;

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

function firstImage(record: { evidence?: ProjectRecord["evidence"]; assets?: MomentRecord["assets"] }) {
  const assets = record.evidence ?? record.assets ?? [];
  return assets.find(
    (asset): asset is ReadyImageAsset => asset.status === "ready" && asset.mediaKind === "image",
  );
}

function RouteHeader({ basePath }: { basePath: string }) {
  return (
    <header className="pfn-header">
      <Link className="pfn-wordmark" href={route(basePath, "")}>Wildan Niam</Link>
      <nav aria-label="Primary navigation" className="pfn-header__nav">
        <Link href={route(basePath, "/work")}>Work</Link>
        <Link href={route(basePath, "/moments")}>Moments</Link>
        <Link href={route(basePath, "/about")}>About</Link>
      </nav>
      <Link className="pfn-header__contact" href={route(basePath, "/contact")}>
        Let&apos;s build <ArrowUpRight aria-hidden="true" size={16} />
      </Link>
    </header>
  );
}

function RouteFooter() {
  return (
    <footer className="pfn-footer">
      <span>© {new Date().getFullYear()} Wildan Syukri Niam</span>
      <span>Personal field notes / software systems</span>
    </footer>
  );
}

function ProjectImage({ asset, priority = false }: { asset: ReadyImageAsset; priority?: boolean }) {
  return (
    <figure className="pfn-evidence-figure">
      <div className="pfn-evidence-figure__image">
        <Image
          alt={asset.alt}
          fill
          priority={priority}
          sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), 980px"
          src={asset.src}
          style={{ objectFit: asset.mediaKind === "svg" ? "contain" : "cover" }}
        />
      </div>
      <figcaption>{asset.caption}</figcaption>
    </figure>
  );
}

export function PersonalFieldNotesWork({
  basePath,
  projects,
}: {
  basePath: string;
  projects: ProjectSummaryDto[];
}) {
  return (
    <div className="pfn-shell" data-portfolio-v2>
      <a className="pfn-skip-link" href="#pfn-main">Skip to content</a>
      <RouteHeader basePath={basePath} />
      <main className="pfn-route" id="pfn-main">
        <header className="pfn-route-opening">
          <p className="pfn-eyebrow">Field notes / work index</p>
          <h1>Work with a trail behind it.</h1>
          <p>Flagship systems and smaller experiments, organized as durable records rather than a trophy wall.</p>
        </header>
        <section aria-labelledby="work-index-heading" className="pfn-work-index">
          <div className="pfn-work-index__heading">
            <span className="pfn-folio">All work</span>
            <h2 id="work-index-heading">Choose a system to inspect.</h2>
          </div>
          <ol>
            {projects.map((project, index) => {
              const image = firstImage({ evidence: project.evidence });
              return (
                <li key={project.slug}>
                  <Link href={route(basePath, `/work/${project.slug}`)}>
                    <span className="pfn-folio">{String(index + 1).padStart(2, "0")}</span>
                    <span className="pfn-work-index__title">
                      <strong>{project.title}</strong>
                      <small>{project.oneLiner}</small>
                    </span>
                    <span className="pfn-work-index__role">{project.role.label}</span>
                    {image ? (
                      <span className="pfn-work-index__image">
                        <Image alt="" fill sizes="160px" src={image.src} style={{ objectFit: "cover" }} />
                      </span>
                    ) : null}
                    <ArrowUpRight aria-hidden="true" size={20} />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
      <RouteFooter />
    </div>
  );
}

export function PersonalFieldNotesProject({
  basePath,
  narrative,
  nextProject,
  project,
}: {
  basePath: string;
  narrative: ReactNode;
  nextProject?: ProjectRecord;
  project: FullProjectRecord;
}) {
  const opening = firstImage({ evidence: project.evidence });
  const remainingEvidence = project.evidence.filter(
    (asset): asset is ReadyImageAsset => asset.status === "ready" && asset.mediaKind === "image" && asset.id !== opening?.id,
  );

  return (
    <div className="pfn-shell" data-portfolio-v2>
      <a className="pfn-skip-link" href="#pfn-main">Skip to content</a>
      <RouteHeader basePath={basePath} />
      <main className="pfn-case" id="pfn-main">
        <header className="pfn-case-opening">
          <Link className="pfn-back-link" href={route(basePath, "/work")}>
            <ArrowLeft aria-hidden="true" size={17} /> Back to work
          </Link>
          <div className="pfn-case-opening__folio">
            <span className="pfn-eyebrow">Project field notes</span>
            <span>{project.lifecycle} · {project.startedAt} — present</span>
          </div>
          <h1>{project.title}</h1>
          <p className="pfn-case-opening__premise">{project.oneLiner}</p>
          <dl className="pfn-case-facts">
            <div><dt>Role</dt><dd>{project.role.label}</dd></div>
            <div><dt>Context</dt><dd>{project.origin.join(" · ")}</dd></div>
            <div><dt>State</dt><dd>{project.lifecycle}</dd></div>
          </dl>
        </header>

        {opening ? <ProjectImage asset={opening} priority /> : null}

        <section className="pfn-case-split" aria-labelledby="case-problem">
          <span className="pfn-folio">01</span>
          <div>
            <p className="pfn-eyebrow">Problem and intended users</p>
            <h2 id="case-problem">{project.problem}</h2>
          </div>
          <ul>
            {project.intendedUsers.map((user) => <li key={user}>{user}</li>)}
          </ul>
        </section>

        <section className="pfn-case-split" aria-labelledby="case-role">
          <span className="pfn-folio">02</span>
          <div>
            <p className="pfn-eyebrow">My responsibility</p>
            <h2 id="case-role">A defined role inside a credited team.</h2>
            <p>{project.teamContext.summary}</p>
          </div>
          <ul>
            {project.role.scope.map((scope) => <li key={scope}>{scope}</li>)}
          </ul>
        </section>

        <section aria-labelledby="case-decisions" className="pfn-case-section">
          <div className="pfn-case-section__heading">
            <span className="pfn-folio">03</span>
            <div><p className="pfn-eyebrow">Decisions</p><h2 id="case-decisions">The choices that shaped the build.</h2></div>
          </div>
          <div className="pfn-decision-list">
            {project.decisions.map((decision, index) => (
              <article key={decision.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{decision.title}</h3>
                <p>{decision.rationale}</p>
                <small>{decision.consequence}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="pfn-case-flow" aria-labelledby="case-flow">
          <span className="pfn-folio">04</span>
          <div><p className="pfn-eyebrow">System flow</p><h2 id="case-flow">A working sequence, made inspectable.</h2></div>
          <ol>{project.systemFlow.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>

        <section aria-label="Long-form case study" className="pfn-prose">{narrative}</section>

        {remainingEvidence.length > 0 ? (
          <section aria-labelledby="case-evidence" className="pfn-case-evidence">
            <div className="pfn-case-section__heading">
              <span className="pfn-folio">05</span>
              <div><p className="pfn-eyebrow">Evidence and outcome</p><h2 id="case-evidence">Artifacts from the work.</h2></div>
            </div>
            <div className="pfn-evidence-grid">
              {remainingEvidence.map((asset) => <ProjectImage asset={asset} key={asset.id} />)}
            </div>
          </section>
        ) : null}

        <section className="pfn-case-reflection" aria-labelledby="case-reflection">
          <div><span className="pfn-folio">06</span><p className="pfn-eyebrow">Boundary and next step</p></div>
          <div>
            <h2 id="case-reflection">What remains honest about the work.</h2>
            <ul>{project.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>Next</h3>
            <ul>{project.next.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <nav aria-label={`${project.title} links`} className="pfn-case-links">
          {project.links.live.status === "public" ? <a href={project.links.live.url} rel="noreferrer" target="_blank">Open live project <ArrowUpRight aria-hidden="true" size={18} /></a> : null}
          {project.links.source.status === "public" ? <a href={project.links.source.url} rel="noreferrer" target="_blank">Open source <ArrowUpRight aria-hidden="true" size={18} /></a> : null}
        </nav>

        {nextProject ? (
          <Link className="pfn-next-project" href={route(basePath, `/work/${nextProject.slug}`)}>
            <span>Next field note</span><strong>{nextProject.title}</strong><ArrowRight aria-hidden="true" size={30} />
          </Link>
        ) : null}
      </main>
      <RouteFooter />
    </div>
  );
}

export function PersonalFieldNotesMoments({
  basePath,
  moments,
}: {
  basePath: string;
  moments: MomentRecord[];
}) {
  return (
    <div className="pfn-shell" data-portfolio-v2>
      <a className="pfn-skip-link" href="#pfn-main">Skip to content</a>
      <RouteHeader basePath={basePath} />
      <main className="pfn-route" id="pfn-main">
        <header className="pfn-route-opening">
          <p className="pfn-eyebrow">Field notes / moments</p>
          <h1>The work around the work.</h1>
          <p>A growing record of rooms, build sessions, outcomes, and the people who made them matter.</p>
        </header>
        <section aria-label="Moment categories" className="pfn-moment-key">
          {Object.entries(categoryLabels).map(([key, label]) => <span className={`pfn-category pfn-category--${key}`} key={key}>{label}</span>)}
        </section>
        <section className="pfn-moment-grid" aria-label="Documentary moments">
          {moments.map((moment) => {
            const asset = firstImage({ assets: moment.assets });
            if (!asset) return null;
            return (
              <article className="pfn-moment-record" key={moment.id}>
                <ProjectImage asset={asset} />
                <div className="pfn-moment-record__copy">
                  <span className={`pfn-category pfn-category--${moment.category}`}>{categoryLabels[moment.category]}</span>
                  <h2>{moment.title}</h2>
                  <p>{moment.caption}</p>
                  <dl><div><dt>Event</dt><dd>{moment.event}</dd></div><div><dt>When / where</dt><dd>{moment.date} · {moment.place}</dd></div></dl>
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <RouteFooter />
    </div>
  );
}

export function PersonalFieldNotesAbout({ basePath, profile }: { basePath: string; profile: Profile }) {
  return (
    <div className="pfn-shell" data-portfolio-v2>
      <a className="pfn-skip-link" href="#pfn-main">Skip to content</a>
      <RouteHeader basePath={basePath} />
      <main className="pfn-route" id="pfn-main">
        <header className="pfn-route-opening pfn-route-opening--about">
          <p className="pfn-eyebrow">Field notes / about</p>
          <h1>I learn by making the system visible.</h1>
          <p>{profile.positioning} {profile.thesis}</p>
        </header>
        <section className="pfn-about-grid">
          <div><span className="pfn-folio">01</span><h2>How I work</h2></div>
          <p>I like ambitious systems with real boundaries: an AI agent that should not overstep, a payment flow that needs a receipt, or a Web3 interaction that should be clear before it asks for a signature. I start by making the path observable, then build toward a product someone can inspect.</p>
          <dl><div><dt>Based in</dt><dd>{profile.location}</dd></div><div><dt>Studying</dt><dd>{profile.education}</dd></div><div><dt>Open to</dt><dd>{profile.availability}</dd></div></dl>
        </section>
      </main>
      <RouteFooter />
    </div>
  );
}

export function PersonalFieldNotesContact({ basePath, profile }: { basePath: string; profile: Profile }) {
  return (
    <div className="pfn-shell" data-portfolio-v2>
      <a className="pfn-skip-link" href="#pfn-main">Skip to content</a>
      <RouteHeader basePath={basePath} />
      <main className="pfn-contact" id="pfn-main">
        <p className="pfn-eyebrow">Field notes / contact</p>
        <h1>Make the next system more trustworthy.</h1>
        <p>{profile.availability}</p>
        <a className="pfn-contact__email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight aria-hidden="true" size={28} /></a>
        {profile.github.status === "public" ? <a className="pfn-action-link" href={profile.github.url} rel="noreferrer" target="_blank">Find the work on GitHub <ArrowUpRight aria-hidden="true" size={18} /></a> : null}
      </main>
      <RouteFooter />
    </div>
  );
}
