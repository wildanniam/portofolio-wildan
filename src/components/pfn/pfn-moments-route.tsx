import { PfnMomentsGallery } from "@/components/pfn/pfn-moments-gallery";
import { PfnRouteFooter, PfnRouteHeader } from "@/components/pfn/pfn-routes";
import { orderMomentsForDisplay } from "@/components/pfn/pfn-models";
import type { MomentRecord } from "@/content/types";

export function PersonalFieldNotesMoments({
  basePath,
  moments,
}: {
  basePath: string;
  moments: MomentRecord[];
}) {
  return (
    <div className="pfn-shell" data-portfolio-v3>
      <a className="pfn-skip-link" href="#pfn-main">Skip to content</a>
      <PfnRouteHeader basePath={basePath} currentPath="/moments" />
      <main className="pfn-route" id="pfn-main">
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
      <PfnRouteFooter />
    </div>
  );
}
