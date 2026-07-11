import { ActionLink } from "@/components/v1/foundations/action-link";
import { EditorialGrid } from "@/components/v1/foundations/editorial-grid";
import { SiteContainer } from "@/components/v1/foundations/site-container";
import { ProjectExplorer } from "@/components/v1/explorer/project-explorer";
import {
  defaultProjectHref,
  type ProjectHrefResolver,
} from "@/components/v1/work/project-ledger";
import { toProjectExplorerDto } from "@/content/explorer-dto";
import type { LinkState } from "@/content/types";
import type { HomepageSelection } from "@/content/queries";

type PortfolioHomeSkeletonProps = {
  explorerFormAction: string;
  projectHref?: ProjectHrefResolver;
  selectedProjectSlug: string | undefined;
  selection: HomepageSelection;
};

type PublicProfileLink = {
  href: string;
  label: string;
};

function publicProfileLink(label: string, link: LinkState): PublicProfileLink | null {
  return link.status === "public" ? { href: link.url, label } : null;
}

export function PortfolioHomeSkeleton({
  explorerFormAction,
  projectHref,
  selectedProjectSlug,
  selection,
}: PortfolioHomeSkeletonProps) {
  const {
    currentlyBuilding,
    flagshipHighlightClaims,
    moments,
    profile,
    projects,
  } = selection;
  const resolveProjectHref = projectHref ?? defaultProjectHref;
  const highlightClaimByProject = new Map(
    flagshipHighlightClaims.map(({ claim, projectSlug }) => [projectSlug, claim]),
  );
  const explorerProjects = projects.flatMap((project) => {
    const highlightedClaim = highlightClaimByProject.get(project.slug);

    return highlightedClaim
      ? [
          toProjectExplorerDto(
            project,
            highlightedClaim,
            resolveProjectHref(project),
          ),
        ]
      : [];
  });
  const profileLinks = [
    publicProfileLink("GitHub", profile.github),
    publicProfileLink("LinkedIn", profile.linkedin),
    publicProfileLink("Resume", profile.resume),
  ].filter((link): link is PublicProfileLink => link !== null);
  const githubLink = profileLinks.find((link) => link.label === "GitHub");

  return (
    <article className="opg-home" data-portfolio-home-skeleton>
      <SiteContainer>
        <section aria-labelledby="portfolio-title" className="opg-home-opening">
          <EditorialGrid>
            <h1 className="opg-home-opening__title" id="portfolio-title">
              {profile.name}
            </h1>
            <p className="opg-home-opening__positioning">{profile.positioning}</p>
            <p className="opg-home-opening__thesis">{profile.thesis}</p>
            <nav aria-label="Introduction" className="opg-home-opening__actions">
              <ActionLink href="/work">Work</ActionLink>
              {githubLink ? (
                <ActionLink
                  direction="external"
                  href={githubLink.href}
                  target="_blank"
                >
                  GitHub
                </ActionLink>
              ) : null}
              <ActionLink href="/contact">Contact</ActionLink>
            </nav>
          </EditorialGrid>
        </section>

        <ProjectExplorer
          defaultSlug={selectedProjectSlug}
          formAction={explorerFormAction}
          id="flagship-work-explorer"
          projects={explorerProjects}
        />

        {moments.length > 0 ? (
          <section aria-labelledby="moments-heading" className="opg-home-section">
            <div className="opg-home-section__heading">
              <h2 id="moments-heading">Build moments</h2>
              <p>Selected documentary records from the work and the people around it.</p>
            </div>
            <ol className="opg-moment-ledger">
              {moments.map((moment) => (
                <li key={moment.id}>
                  <div>
                    <h3>{moment.title}</h3>
                    <p>{moment.caption}</p>
                  </div>
                  <p className="opg-moment-ledger__meta">
                    {moment.event}<br />
                    {moment.date}, {moment.place}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {currentlyBuilding.length > 0 ? (
          <section
            aria-labelledby="currently-building-heading"
            className="opg-home-section opg-currently-building"
          >
            <div className="opg-home-section__heading">
              <h2 id="currently-building-heading">Now building</h2>
            </div>
            <div className="opg-currently-building__items">
              {currentlyBuilding.map((item) => (
                <article key={item.id}>
                  <p className="opg-currently-building__date">
                    Started {item.startedAt}
                  </p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {item.link.status === "public" ? (
                    <ActionLink
                      direction="external"
                      href={item.link.url}
                      target="_blank"
                    >
                      Open project
                    </ActionLink>
                  ) : null}
                </article>
              ))}
            </div>
            <ActionLink className="opg-currently-building__archive" href="/work">
              Browse the archive
            </ActionLink>
          </section>
        ) : null}

        <section aria-labelledby="about-heading" className="opg-home-section opg-about-contact">
          <div className="opg-about-contact__copy">
            <h2 id="about-heading">Build with me.</h2>
            <p>{profile.availability}</p>
          </div>
          <dl className="opg-about-contact__facts">
            <div>
              <dt>Location</dt>
              <dd>{profile.location}</dd>
            </div>
            {profile.education ? (
              <div>
                <dt>Education</dt>
                <dd>{profile.education}</dd>
              </div>
            ) : null}
          </dl>
          <nav aria-label="Contact Wildan" className="opg-about-contact__links">
            <ActionLink href={`mailto:${profile.email}`}>Email</ActionLink>
            {profileLinks.map((link) => (
              <ActionLink
                direction="external"
                href={link.href}
                key={link.label}
                target="_blank"
              >
                {link.label}
              </ActionLink>
            ))}
          </nav>
        </section>
      </SiteContainer>
    </article>
  );
}
