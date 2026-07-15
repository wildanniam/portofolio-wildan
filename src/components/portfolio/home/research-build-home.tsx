import type { HomepageSelection } from "@/content/queries";
import { PortfolioShell } from "@/components/portfolio/shell/portfolio-shell";

import { CurrentDispatch } from "./current-dispatch";
import { MomentsPreview } from "./moments-preview";
import { ProjectAtlas } from "./project-atlas";
import { ResearchBuildHero } from "./research-build-hero";
import { ResearchCoordinates } from "./research-coordinates";

type ResearchBuildHomeProps = {
  basePath?: string;
  selection: HomepageSelection;
};

export function ResearchBuildHome({
  basePath = "",
  selection,
}: ResearchBuildHomeProps) {
  return (
    <PortfolioShell
      basePath={basePath}
      currentPath="/"
      mainId="portfolio-main"
      navigation={selection.navigation}
      profile={selection.profile}
    >
      <main id="portfolio-main" tabIndex={-1}>
        <ResearchBuildHero basePath={basePath} profile={selection.profile} />
        <ResearchCoordinates
          basePath={basePath}
          projects={selection.projects}
          research={selection.research}
        />
        <ProjectAtlas basePath={basePath} stages={selection.projectStages} />
        <MomentsPreview basePath={basePath} moments={selection.featuredMoments} />
        <CurrentDispatch
          basePath={basePath}
          item={selection.currentlyBuilding[0]}
          profile={selection.profile}
        />
      </main>
    </PortfolioShell>
  );
}
