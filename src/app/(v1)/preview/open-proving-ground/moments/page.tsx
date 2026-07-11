import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteContainer } from "@/components/v1/foundations/site-container";
import { MomentsArchive } from "@/components/v1/moments/moments-archive";
import { SkipLink } from "@/components/v1/shell/skip-link";
import { getMomentsNarrative } from "@/content/queries.server";

const PREVIEW_SITE = "/preview/open-proving-ground/site";

export const metadata: Metadata = {
  title: "Moments - Open Proving Ground",
  description: "A private documentary gallery proof for Portfolio V1.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function MomentsPreviewPage() {
  if (process.env.PORTFOLIO_V1_PREVIEW !== "1") notFound();

  const moments = getMomentsNarrative({ preview: true });
  if (!moments) notFound();

  return (
    <>
      <SkipLink />
      <header className="opg-foundation-rail">
        <SiteContainer className="opg-foundation-rail__inner">
          <a className="opg-foundation-mark" href={PREVIEW_SITE}>
            WSN
          </a>
          <span className="opg-foundation-rail__context">
            The Open Proving Ground
          </span>
          <span className="opg-foundation-rail__folio">
            Private / Moments proof
          </span>
        </SiteContainer>
      </header>

      <main id="main-content" tabIndex={-1}>
        <MomentsArchive moments={moments} />
      </main>

      <footer className="opg-foundation-footer">
        <SiteContainer className="opg-foundation-footer__inner">
          <p>
            Private documentary proof. Publication still requires caption,
            credit, consent, and crop approval.
          </p>
          <code>Credential-protected preview</code>
        </SiteContainer>
      </footer>
    </>
  );
}
