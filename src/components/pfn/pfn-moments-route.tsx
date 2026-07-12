import { PfnMomentsGallery } from "@/components/pfn/pfn-moments-gallery";
import { PfnRouteFooter, PfnRouteHeader } from "@/components/pfn/pfn-routes";
import type { MomentRecord } from "@/content/types";

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
      <PfnRouteHeader basePath={basePath} />
      <main className="pfn-route" id="pfn-main">
        <header className="pfn-route-opening">
          <p className="pfn-eyebrow">Field notes / moments</p>
          <h1>The work around the work.</h1>
          <p>A growing record of rooms, build sessions, outcomes, and the people who made them matter.</p>
        </header>
        <PfnMomentsGallery moments={moments} />
      </main>
      <PfnRouteFooter />
    </div>
  );
}
