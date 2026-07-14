import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { HomepageSelection } from "@/content/queries";
import type { MomentRecord, ProjectRecord, VerifiedClaim } from "@/content/types";

import { PfnFooter } from "./pfn-footer";
import { PfnMedia } from "./pfn-media";
import {
  momentPrimaryImage,
  orderMomentsForDisplay,
  projectAtlasVariant,
  projectOutcome,
  projectPrimaryImage,
} from "./pfn-models";
import { PfnHeader } from "./pfn-shell";

type PersonalFieldNotesHomeProps = {
  selection: HomepageSelection;
  basePath?: string;
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

function ProjectAtlasItem({
  basePath,
  project,
}: {
  basePath: string;
  project: ProjectRecord;
}) {
  const image = projectPrimaryImage(project);
  const outcome = projectOutcome(project);
  const variant = projectAtlasVariant(project);

  return (
    <article className={`pfn-atlas-item pfn-atlas-item--${variant}`}>
      <div className="pfn-atlas-item__copy">
        <div className="pfn-atlas-item__identity">
          <p>{project.role.label}</p>
          <h3>
            <Link href={route(basePath, `/work/${project.slug}`)} prefetch={false}>{project.title}</Link>
          </h3>
          <p className="pfn-atlas-item__premise">{project.oneLiner}</p>
        </div>
        {outcome ? <p className="pfn-atlas-item__outcome">{outcome.text}</p> : null}
        <Link
          aria-label={`Open ${project.title} case study`}
          className="pfn-text-link"
          href={route(basePath, `/work/${project.slug}`)}
          prefetch={false}
        >
          Read the case study
          <ArrowUpRight aria-hidden="true" size={18} />
        </Link>
      </div>
      {image ? (
        <div className="pfn-atlas-item__media">
          <PfnMedia
            asset={image}
            sizes={
              variant === "feature" || variant === "landscape"
                ? "(max-width: 639px) 100vw, (max-width: 1023px) 58vw, 58vw"
                : "(max-width: 639px) 100vw, (max-width: 1023px) 42vw, 38vw"
            }
          />
        </div>
      ) : null}
    </article>
  );
}

function ProofItem({ claim, project }: { claim: VerifiedClaim; project?: ProjectRecord }) {
  if (!project) return null;

  return (
    <li>
      <span>{project.title}</span>
      <p>{claim.text}</p>
      <Link aria-label={`Read ${project.title} proof in context`} href={`/work/${project.slug}`} prefetch={false}>
        In context
        <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </li>
  );
}

function MomentTile({ basePath, moment }: { basePath: string; moment: MomentRecord }) {
  const image = momentPrimaryImage(moment);
  if (!image) return null;

  return (
    <article className={`pfn-mosaic-item pfn-mosaic-item--${moment.mode}`} id={moment.id}>
      <Link aria-label={`View ${moment.title} in Moments`} href={route(basePath, "/moments")} prefetch={false}>
        <span className="pfn-mosaic-item__media">
          <PfnMedia
            asset={image}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 38vw"
          />
        </span>
        <span className="pfn-mosaic-item__caption">
          <strong>{moment.title}</strong>
          <span>{moment.event}</span>
        </span>
      </Link>
    </article>
  );
}

export function PersonalFieldNotesHome({
  selection,
  basePath = "",
}: PersonalFieldNotesHomeProps) {
  const { currentlyBuilding, flagshipHighlightClaims, moments, profile, projects } = selection;
  const github = profile.github.status === "public" ? profile.github.url : undefined;
  const orderedMoments = orderMomentsForDisplay(moments);

  return (
    <div className="pfn-shell" data-portfolio-v3>
      <a className="pfn-skip-link" href="#pfn-main">Skip to content</a>
      <PfnHeader basePath={basePath} currentPath="/" />

      <main id="pfn-main">
        <section aria-labelledby="pfn-hero-title" className="pfn-hero">
          <div className="pfn-hero__identity">
            <span>Wildan Syukri Niam</span>
            <span>Software Engineer</span>
            <span>Bandung, Indonesia</span>
          </div>

          <div className="pfn-hero__statement">
            <h1 id="pfn-hero-title">
              <span>I build systems</span>
              <span>you can inspect.</span>
            </h1>
            <p>{profile.thesis}</p>
            <div className="pfn-hero__actions">
              <a className="pfn-button pfn-button--primary" href="#selected-work">
                Explore selected work
                <ArrowDownRight aria-hidden="true" size={19} />
              </a>
              {github ? (
                <a className="pfn-button pfn-button--quiet" href={github} rel="noreferrer" target="_blank">
                  GitHub
                  <ArrowUpRight aria-hidden="true" size={18} />
                </a>
              ) : null}
            </div>
          </div>

          {profile.portrait ? (
            <figure className="pfn-hero__portrait">
              <div className="pfn-hero__portrait-frame">
                <PfnMedia
                  asset={profile.portrait}
                  priority
                  sizes="(max-width: 639px) 76vw, (max-width: 1023px) 42vw, 31vw"
                />
              </div>
              <figcaption>Builder, team lead, and student researcher.</figcaption>
            </figure>
          ) : null}

          <p className="pfn-hero__aside">
            AI agents, Web3 infrastructure, and full-stack product systems built with visible boundaries.
          </p>
        </section>

        <section aria-label="Selected proof" className="pfn-proof-ribbon">
          <div className="pfn-proof-ribbon__heading">
            <span>Selected proof</span>
            <ArrowRight aria-hidden="true" size={18} />
          </div>
          <ol>
            {flagshipHighlightClaims.map(({ claim, projectSlug }) => (
              <ProofItem
                claim={claim}
                key={claim.id}
                project={projects.find((project) => project.slug === projectSlug)}
              />
            ))}
          </ol>
        </section>

        <section aria-labelledby="selected-work-heading" className="pfn-section pfn-atlas" id="selected-work">
          <header className="pfn-section-intro">
            <p>Selected work</p>
            <h2 id="selected-work-heading">Four ambitious systems. Four different trust problems.</h2>
            <div>
              <p>Start with the artifact. Open a case study for the decisions, team context, and evidence behind it.</p>
              <Link className="pfn-text-link" href={route(basePath, "/work")} prefetch={false}>
                View the full archive
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </header>
          <div className="pfn-atlas__grid">
            {projects.map((project) => (
              <ProjectAtlasItem basePath={basePath} key={project.slug} project={project} />
            ))}
          </div>
        </section>

        <section aria-labelledby="moments-title" className="pfn-section pfn-moments-home">
          <header className="pfn-section-intro pfn-section-intro--moments">
            <p>Moments</p>
            <h2 id="moments-title">The rooms, people, and outcomes around the code.</h2>
            <div>
              <p>A documentary layer of build sessions, public learning, research, and shared wins.</p>
              <Link className="pfn-text-link" href={route(basePath, "/moments")} prefetch={false}>
                Open the full gallery
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </header>
          <div className="pfn-mosaic">
            {orderedMoments.map((moment) => (
              <MomentTile basePath={basePath} key={moment.id} moment={moment} />
            ))}
          </div>
        </section>

        {currentlyBuilding[0] ? (
          <section aria-labelledby="currently-building" className="pfn-dispatch">
            <p>Current build</p>
            <div>
              <h2 id="currently-building">{currentlyBuilding[0].title}</h2>
              <p>{currentlyBuilding[0].summary}</p>
            </div>
            {currentlyBuilding[0].link.status === "public" ? (
              <a className="pfn-button pfn-button--inverse" href={currentlyBuilding[0].link.url} rel="noreferrer" target="_blank">
                Visit PayGate
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="pfn-close-title" className="pfn-close">
          <p>About the builder</p>
          <div>
            <h2 id="pfn-close-title">I like difficult systems with boundaries people can see.</h2>
            <p>{profile.positioning} I work best where product craft, technical depth, and a strong team have to meet.</p>
          </div>
          <div className="pfn-close__actions">
            <Link className="pfn-button pfn-button--primary" href={route(basePath, "/contact")} prefetch={false}>
              Start a conversation
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
            <Link className="pfn-text-link" href={route(basePath, "/about")} prefetch={false}>
              More about how I work
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </section>
      </main>

      <PfnFooter />
    </div>
  );
}
