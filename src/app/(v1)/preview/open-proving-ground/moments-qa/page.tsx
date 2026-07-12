import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteContainer } from "@/components/v1/foundations/site-container";
import { MomentsSection } from "@/components/v1/moments/moments-section";
import { SkipLink } from "@/components/v1/shell/skip-link";
import type { MomentRecord, ReadyImageAsset } from "@/content/types";

const PREVIEW_SITE = "/preview/open-proving-ground/site";

export const metadata: Metadata = {
  title: "Moments layout QA - Open Proving Ground",
  description:
    "A credential-gated layout fixture for Portfolio V1 Moments media modes.",
  robots: {
    follow: false,
    index: false,
  },
};

type FixtureAssetInput = Pick<
  ReadyImageAsset,
  "alt" | "crop" | "height" | "id" | "mobile" | "src" | "width"
>;

function createFixtureAsset({
  alt,
  crop,
  height,
  id,
  mobile,
  src,
  width,
}: FixtureAssetInput): ReadyImageAsset {
  return {
    alt,
    caption:
      "Existing project derivative reused only to verify the private Moments layout.",
    crop,
    evidenceFunctions: ["verification"],
    evidenceType: "moment",
    height,
    id,
    mediaKind: "image",
    mobile,
    provenance: {
      creator: "Portfolio V1 QA fixture",
      kind: "owned",
      rightsNote:
        "Existing project derivative reused only on this credential-gated layout QA route; it is not a documentary publication asset.",
    },
    slot: "layout-qa-fixture",
    src,
    status: "ready",
    width,
  };
}

const fradiumFixture = createFixtureAsset({
  alt: "Fradium product interface used as a private layout test fixture.",
  crop: { mode: "intrinsic" },
  height: 1024,
  id: "qa-fradium-lead",
  mobile: {
    crop: { mode: "intrinsic" },
    height: 496,
    src: "/media/projects/fradium/public-beta-mobile.webp",
    width: 800,
  },
  src: "/media/projects/fradium/public-beta.webp",
  width: 1440,
});

const paygateFixture = createFixtureAsset({
  alt: "PayGate product flow used as a private layout test fixture.",
  crop: { mode: "intrinsic" },
  height: 900,
  id: "qa-paygate-evidence",
  mobile: {
    crop: {
      aspectRatio: "4:3",
      focalPoint: { x: 0.5, y: 0.28 },
      mode: "focal",
    },
    height: 844,
    src: "/media/projects/paygate/product-flow-mobile.webp",
    width: 390,
  },
  src: "/media/projects/paygate/product-flow.webp",
  width: 1440,
});

const quorumFixture = createFixtureAsset({
  alt: "Quorum discovery surface used as a private layout test fixture.",
  crop: { mode: "intrinsic" },
  height: 1024,
  id: "qa-quorum-portrait",
  mobile: {
    crop: {
      aspectRatio: "4:3",
      focalPoint: { x: 0.5, y: 0.42 },
      mode: "focal",
    },
    height: 569,
    src: "/media/projects/quorum/discover-surface-mobile.webp",
    width: 800,
  },
  src: "/media/projects/quorum/discover-surface.webp",
  width: 1440,
});

const novaFixture = createFixtureAsset({
  alt: "Nova AI Wallet product overview used as a private layout test fixture.",
  crop: { mode: "intrinsic" },
  height: 900,
  id: "qa-nova-contact-one",
  mobile: {
    crop: { mode: "intrinsic" },
    height: 450,
    src: "/media/projects/nova-ai/product-overview-mobile.webp",
    width: 800,
  },
  src: "/media/projects/nova-ai/product-overview.webp",
  width: 1600,
});

const contactFradiumFixture = {
  ...fradiumFixture,
  id: "qa-fradium-contact-two",
};
const contactPaygateFixture = {
  ...paygateFixture,
  id: "qa-paygate-contact-three",
};

// These records exist only to exercise all four presentation modes. They are
// deliberately outside the content bundle and make no publication claims.
const layoutFixtures: MomentRecord[] = [
  {
    assets: [fradiumFixture],
    caption:
      "A wide lead composition with enough copy to verify spacing, measure, and reading order.",
    claimIds: [],
    claims: [],
    context: { kind: "journey", label: "Private layout fixture" },
    date: "2025-01-10",
    event: "Moments layout QA",
    id: "qa-lead-mode",
    category: "learn",
    mode: "lead",
    place: "Credential-gated test route",
    publication: "preview",
    reflection:
      "The fixture verifies presentation only. It does not approve this image for the documentary gallery.",
    title: "Lead mode across the full editorial width",
  },
  {
    assets: [paygateFixture],
    caption:
      "A product capture beside compact evidence copy, including a focal mobile crop below 640 pixels.",
    claimIds: [],
    claims: [],
    context: { kind: "project", projectSlugs: ["paygate"] },
    date: "2025-02-12",
    event: "Moments layout QA",
    id: "qa-evidence-mode",
    category: "build",
    mode: "evidence",
    place: "Credential-gated test route",
    publication: "preview",
    result: "Desktop split and mobile stack remain readable without overflow.",
    title: "Evidence mode with a responsive focal derivative",
  },
  {
    assets: [quorumFixture],
    caption:
      "An opposing split used to inspect the portrait rhythm and its stacked small-screen fallback.",
    claimIds: [],
    claims: [],
    context: { kind: "project", projectSlugs: ["quorum"] },
    date: "2025-03-14",
    event: "Moments layout QA",
    id: "qa-portrait-mode",
    category: "learn",
    mode: "portrait",
    place: "Credential-gated test route",
    publication: "preview",
    title: "Portrait mode balances image and narrative",
  },
  {
    assets: [novaFixture, contactFradiumFixture, contactPaygateFixture],
    caption:
      "Three existing project derivatives verify the two-column contact sheet and single-column mobile flow.",
    claimIds: [],
    claims: [],
    context: {
      kind: "project",
      projectSlugs: ["nova-ai", "fradium", "paygate"],
    },
    date: "2025-04-16",
    event: "Moments layout QA",
    id: "qa-contact-sheet-mode",
    category: "win",
    mode: "contact-sheet",
    place: "Credential-gated test route",
    publication: "preview",
    title: "Contact sheet moves from two columns to one",
  },
];

export default function MomentsLayoutQaPage() {
  if (process.env.PORTFOLIO_V1_PREVIEW !== "1") notFound();

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
            Private / Moments layout QA
          </span>
        </SiteContainer>
      </header>

      <main id="main-content" tabIndex={-1}>
        <article
          className="opg-moments-page"
          data-moments-layout-qa
          data-moments-page
        >
          <SiteContainer>
            <header className="opg-route-opening">
              <h1 className="opg-route-opening__title">Moments layout QA.</h1>
              <p className="opg-route-opening__summary">
                A private four-mode matrix. Every image below is an existing
                project derivative used as a fixture, not an approved Moments
                publication asset.
              </p>
            </header>

            <MomentsSection
              heading="Four-mode matrix."
              headingId="moments-layout-qa-heading"
              intro="Lead, evidence, portrait, and contact-sheet modes rendered together for responsive visual verification."
              moments={layoutFixtures}
              priorityFirstImage
            />
          </SiteContainer>
        </article>
      </main>

      <footer className="opg-foundation-footer">
        <SiteContainer className="opg-foundation-footer__inner">
          <p>
            Layout fixture only. Documentary photos remain blocked until their
            caption, credit, consent, and crop review is complete.
          </p>
          <code>Credential-protected / noindex</code>
        </SiteContainer>
      </footer>
    </>
  );
}
