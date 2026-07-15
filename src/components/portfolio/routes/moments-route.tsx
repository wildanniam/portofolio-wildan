import type { SiteShellSelection } from "@/content/queries";
import type { MomentRecord } from "@/content/types";

import { MomentsArchive } from "../moments/moments-archive";
import { PortfolioShell } from "../shell/portfolio-shell";

export function MomentsRoute({
  basePath = "",
  moments,
  shell,
}: {
  basePath?: string;
  moments: MomentRecord[];
  shell: SiteShellSelection;
}) {
  return (
    <PortfolioShell basePath={basePath} currentPath="/moments" mainId="moments-main" {...shell}>
      <main className="v4-route v4-moments-route portfolio-container" id="moments-main" tabIndex={-1}>
        <header className="v4-route-hero v4-moments__hero">
          <p className="v4-route-hero__index"><span aria-hidden="true" className="v4-origin-mark" />Moments / Field notes</p>
          <div className="v4-route-hero__grid">
            <h1>The rooms, people, and outcomes <em>around the code.</em></h1>
            <div>
              <p>A documentary layer of build sessions, public learning, research milestones, and shared wins.</p>
              <p className="v4-route-hero__meta">{moments.length} published frames / ongoing archive</p>
            </div>
          </div>
        </header>
        <MomentsArchive moments={moments} />
      </main>
    </PortfolioShell>
  );
}
