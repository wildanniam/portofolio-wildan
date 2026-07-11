import { SiteContainer } from "@/components/v1/foundations/site-container";
import type { MomentRecord } from "@/content/types";

import { MomentsSection } from "./moments-section";

type MomentsArchiveProps = {
  moments: MomentRecord[];
};

export function MomentsArchive({ moments }: MomentsArchiveProps) {
  return (
    <article className="opg-moments-page" data-moments-page>
      <SiteContainer>
        <header className="opg-route-opening">
          <h1 className="opg-route-opening__title">Moments.</h1>
          <p className="opg-route-opening__summary">
            A documentary sequence of the work, the rooms, and the people who
            shaped it.
          </p>
        </header>

        <MomentsSection
          heading="Inside the build."
          headingId="moments-archive-heading"
          intro="Projects take shape in competition rooms, classrooms, community events, and long sessions with a team. These are the records worth keeping."
          moments={moments}
          priorityFirstImage
        />
      </SiteContainer>
    </article>
  );
}
