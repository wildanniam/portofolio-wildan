import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { PfnHeroMotion } from "@/components/pfn/pfn-hero-motion";
import type { HomepageSelection } from "@/content/queries";
import type { MomentRecord, ProjectRecord, ReadyImageAsset } from "@/content/types";

type PersonalFieldNotesHomeProps = {
  selection: HomepageSelection;
  basePath?: string;
};

const categoryLabels = {
  build: "Build",
  win: "Win",
  learn: "Learn",
  give: "Give",
} as const;

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

function findProjectImage(project: ProjectRecord): ReadyImageAsset | undefined {
  const preferred = project.socialImageAssetId;
  const evidence = project.evidence.find(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" &&
      asset.mediaKind === "image" &&
      (asset.id === preferred || !preferred),
  );

  return evidence;
}

function findMomentImage(moment: MomentRecord): ReadyImageAsset | undefined {
  return moment.assets.find(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" && asset.mediaKind === "image",
  );
}

function ProjectOverviewItem({
  index,
  project,
  href,
}: {
  index: number;
  project: ProjectRecord;
  href: string;
}) {
  const image = findProjectImage(project);

  return (
    <article className="pfn-project-item">
      <div className="pfn-project-item__topline">
        <span className="pfn-folio">{String(index + 1).padStart(2, "0")}</span>
        <span className="pfn-project-item__context">
          {project.origin.includes("hackathon") ? "Hackathon artifact" : "Independent build"}
        </span>
      </div>
      <div className="pfn-project-item__content">
        <div>
          <h3>{project.title}</h3>
          <p className="pfn-project-item__premise">{project.oneLiner}</p>
          <p className="pfn-project-item__role">{project.role.label}</p>
        </div>
        <Link className="pfn-project-item__link" href={href}>
          Read field notes <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} />
        </Link>
      </div>
      {image ? (
        <figure className="pfn-project-item__media">
          <Image
            alt={image.alt}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 42vw"
            src={image.src}
            style={{ objectFit: "cover" }}
          />
        </figure>
      ) : null}
    </article>
  );
}

function MomentTile({ moment }: { moment: MomentRecord }) {
  const image = findMomentImage(moment);
  if (!image) return null;

  return (
    <figure className="pfn-moment-tile">
      <div className="pfn-moment-tile__image">
        <Image
          alt={image.alt}
          fill
          sizes="(max-width: 639px) 70vw, 30vw"
          src={image.src}
          style={{ objectFit: "cover" }}
        />
      </div>
      <figcaption>
        <span className={`pfn-category pfn-category--${moment.category}`}>
          {categoryLabels[moment.category]}
        </span>
        <strong>{moment.title}</strong>
        <span>{moment.event}</span>
      </figcaption>
    </figure>
  );
}

export function PersonalFieldNotesHome({
  selection,
  basePath = "",
}: PersonalFieldNotesHomeProps) {
  const { currentlyBuilding, flagshipHighlightClaims, moments, profile, projects } = selection;
  const heroPortrait = profile.portrait;
  const github = profile.github.status === "public" ? profile.github.url : undefined;

  return (
    <div className="pfn-shell" data-portfolio-v2>
      <a className="pfn-skip-link" href="#pfn-main">
        Skip to content
      </a>
      <header className="pfn-header">
        <Link className="pfn-wordmark" href={route(basePath, "")}>Wildan Niam</Link>
        <nav aria-label="Primary navigation" className="pfn-header__nav">
          <a href="#selected-work">Work</a>
          <Link href={route(basePath, "/moments")}>Moments</Link>
          <Link href={route(basePath, "/about")}>About</Link>
        </nav>
        <Link className="pfn-header__contact" href={route(basePath, "/contact")}>
          Let&apos;s build <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </header>

      <main id="pfn-main">
        <section aria-labelledby="pfn-hero-title" className="pfn-hero">
          <div className="pfn-hero__marker">
            <span>Field notes / 01</span>
            <span>Bandung, ID</span>
          </div>
          <PfnHeroMotion>
            <div className="pfn-hero__grid">
              <div className="pfn-hero__copy" data-pfn-hero-copy>
                <p className="pfn-eyebrow">Software engineer · student builder</p>
                <h1 id="pfn-hero-title">Building is how I learn.</h1>
                <p className="pfn-hero__thesis">{profile.thesis}</p>
                <div className="pfn-hero__actions">
                  <a className="pfn-action-link pfn-action-link--solid" href="#selected-work">
                    Explore selected work <ArrowDownRight aria-hidden="true" size={19} />
                  </a>
                  {github ? (
                    <a className="pfn-action-link" href={github} rel="noreferrer" target="_blank">
                      GitHub <ArrowUpRight aria-hidden="true" size={18} />
                    </a>
                  ) : null}
                </div>
              </div>
              {heroPortrait ? (
                <figure className="pfn-hero__portrait" data-pfn-hero-portrait>
                  <Image
                    alt={heroPortrait.alt}
                    fill
                    priority
                    sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 42vw, 32vw"
                    src={heroPortrait.src}
                    style={{ objectFit: "cover" }}
                  />
                  <figcaption>Working across AI, Web3, and trustworthy product systems.</figcaption>
                </figure>
              ) : null}
            </div>
            <p className="pfn-hero__status" data-pfn-hero-status>
              Currently building <strong>PayGate</strong> — machine-paid API infrastructure on Stellar testnet.
            </p>
          </PfnHeroMotion>
        </section>

        <section aria-labelledby="selected-work-heading" className="pfn-section pfn-selected-work" id="selected-work">
          <div className="pfn-section-heading">
            <span className="pfn-folio">02</span>
            <div>
              <p className="pfn-eyebrow">Selected work</p>
              <h2 id="selected-work-heading">Four systems, each with a different question.</h2>
            </div>
            <p>Start broad. Follow the work that earns your curiosity.</p>
          </div>
          <div className="pfn-project-grid">
            {projects.map((project, index) => (
              <ProjectOverviewItem
                href={route(basePath, `/work/${project.slug}`)}
                index={index}
                key={project.slug}
                project={project}
              />
            ))}
          </div>
          <Link className="pfn-section-link" href={route(basePath, "/work")}>
            View the complete work index <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </section>

        <section aria-labelledby="proof-index" className="pfn-section pfn-achievements">
          <div className="pfn-section-heading pfn-section-heading--compact">
            <span className="pfn-folio">03</span>
            <div>
              <p className="pfn-eyebrow">Proof index</p>
              <h2 id="proof-index">Results, kept in context.</h2>
            </div>
          </div>
          <ol className="pfn-achievement-list">
            {flagshipHighlightClaims.map(({ claim, projectSlug }) => {
              const project = projects.find((item) => item.slug === projectSlug);
              return (
                <li key={claim.id}>
                  <span>{project?.title}</span>
                  <p>{claim.text}</p>
                  <Link href={route(basePath, `/work/${projectSlug}`)}>Read the context</Link>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="moments-title" className="pfn-section pfn-moments">
          <div className="pfn-section-heading pfn-section-heading--compact">
            <span className="pfn-folio">04</span>
            <div>
              <p className="pfn-eyebrow">The work around the work</p>
              <h2 id="moments-title">Builds, rooms, and shared wins.</h2>
            </div>
            <Link className="pfn-section-link" href={route(basePath, "/moments")}>
              Open photo archive <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <div className="pfn-moments-strip" role="list">
            {moments.map((moment) => (
              <div key={moment.id} role="listitem">
                <MomentTile moment={moment} />
              </div>
            ))}
          </div>
        </section>

        {currentlyBuilding[0] ? (
          <section aria-labelledby="currently-building" className="pfn-section pfn-now-building">
            <span className="pfn-folio">05</span>
            <div>
              <p className="pfn-eyebrow">Currently building</p>
              <h2 id="currently-building">{currentlyBuilding[0].title}</h2>
              <p>{currentlyBuilding[0].summary}</p>
              {currentlyBuilding[0].link.status === "public" ? (
                <a className="pfn-action-link pfn-action-link--solid" href={currentlyBuilding[0].link.url} rel="noreferrer" target="_blank">
                  Visit the active build <ArrowUpRight aria-hidden="true" size={18} />
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="pfn-close-title" className="pfn-close">
          <span className="pfn-folio">06</span>
          <div>
            <p className="pfn-eyebrow">An open field note</p>
            <h2 id="pfn-close-title">Let&apos;s make an ambitious system easier to trust.</h2>
          </div>
          <div className="pfn-close__details">
            <p>{profile.availability}</p>
            <p>{profile.location} · {profile.education}</p>
            <Link className="pfn-action-link pfn-action-link--solid" href={route(basePath, "/contact")}>
              Start a conversation <ArrowUpRight aria-hidden="true" size={19} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="pfn-footer">
        <span>© {new Date().getFullYear()} Wildan Syukri Niam</span>
        <span>Personal field notes / software systems</span>
      </footer>
    </div>
  );
}
