import { notFound } from "next/navigation";

import { SiteContainer } from "@/components/v1/foundations/site-container";
import { getMomentsNarrative } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

const publishedMetadata = createPublicPageMetadata({
  title: "Moments",
  description:
    "Documentary moments from the projects, competitions, and people around Wildan Syukri Niam's work.",
  pathname: "/moments",
});

export function generateMetadata() {
  return getMomentsNarrative()
    ? publishedMetadata
    : {
        title: "Moments unavailable",
      };
}

export default function MomentsPage() {
  const moments = getMomentsNarrative();

  if (!moments) notFound();

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

        <ol className="opg-moment-ledger opg-moment-ledger--route">
          {moments.map((moment) => (
            <li key={moment.id}>
              <div>
                <h2>{moment.title}</h2>
                <p>{moment.caption}</p>
                {moment.reflection ? <p>{moment.reflection}</p> : null}
              </div>
              <p className="opg-moment-ledger__meta">
                {moment.event}
                <br />
                {moment.date}, {moment.place}
              </p>
            </li>
          ))}
        </ol>
      </SiteContainer>
    </article>
  );
}
