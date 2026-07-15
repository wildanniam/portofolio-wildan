import { PfnMomentsGallery } from "@/components/pfn/pfn-moments-gallery";
import { PortfolioShell } from "@/components/portfolio/shell/portfolio-shell";
import { orderMomentsForDisplay } from "@/components/pfn/pfn-models";
import type { SiteShellSelection } from "@/content/queries";
import type { MomentRecord } from "@/content/types";

export function PersonalFieldNotesMoments({
  basePath,
  moments,
  shell,
}: {
  basePath: string;
  moments: MomentRecord[];
  shell: SiteShellSelection;
}) {
  return (
    <PortfolioShell basePath={basePath} currentPath="/moments" mainId="pfn-main" {...shell}>
      <main className="pfn-route" id="pfn-main" tabIndex={-1}>
        <header className="pfn-route-hero pfn-moments-hero">
          <p>Moments</p>
          <h1>The work around the work.</h1>
          <div>
            <p>Build rooms, public learning, research milestones, and team outcomes. A documentary record of the journey behind the systems.</p>
            <p>{moments.length} published frames</p>
          </div>
        </header>
        <PfnMomentsGallery moments={orderMomentsForDisplay(moments)} />
      </main>
    </PortfolioShell>
  );
}
