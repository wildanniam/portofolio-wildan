import { ActionLink } from "@/components/v1/foundations/action-link";
import { EditorialGrid } from "@/components/v1/foundations/editorial-grid";
import { SiteContainer } from "@/components/v1/foundations/site-container";

import {
  ProjectLedger,
  type ProjectHrefResolver,
  type ProjectLedgerItem,
} from "./project-ledger";

type WorkArchiveProps = {
  legacyWorkHref?: string;
  projectHref?: ProjectHrefResolver;
  projects: readonly ProjectLedgerItem[];
};

export function WorkArchive({
  legacyWorkHref = "/#work",
  projectHref,
  projects,
}: WorkArchiveProps) {
  return (
    <article className="opg-work-archive" data-work-archive>
      <SiteContainer>
        <header className="opg-route-opening">
          <EditorialGrid>
            <h1 className="opg-route-opening__title">Work.</h1>
            <p className="opg-route-opening__summary">
              Build records across AI agents, Web3 systems, and product experiments.
            </p>
          </EditorialGrid>
        </header>

        {projects.length > 0 ? (
          <section aria-labelledby="work-archive-heading" className="opg-route-section">
            <div className="opg-route-section__heading">
              <h2 id="work-archive-heading">Project archive</h2>
              <p>
                Each record names the role, context, and evidence boundary behind
                the work.
              </p>
            </div>
            <ProjectLedger projectHref={projectHref} projects={projects} />
          </section>
        ) : (
          <section
            aria-labelledby="work-archive-heading"
            className="opg-route-section opg-work-empty"
          >
            <div className="opg-route-section__heading">
              <h2 id="work-archive-heading">Case studies are being prepared.</h2>
              <p>
                The new archive opens when its evidence is ready. The current
                project selection remains available on the portfolio home.
              </p>
            </div>
            <ActionLink href={legacyWorkHref}>View current work</ActionLink>
          </section>
        )}
      </SiteContainer>
    </article>
  );
}
