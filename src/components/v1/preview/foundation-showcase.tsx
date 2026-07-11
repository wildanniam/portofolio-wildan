import Image from "next/image";

import { EvidenceCaption } from "@/components/v1/evidence/evidence-caption";
import { EvidenceFigure } from "@/components/v1/evidence/evidence-figure";
import { ActionLink } from "@/components/v1/foundations/action-link";
import { EditorialGrid } from "@/components/v1/foundations/editorial-grid";
import { MetadataLine } from "@/components/v1/foundations/metadata-line";
import { SectionRule } from "@/components/v1/foundations/section-rule";
import { SiteContainer } from "@/components/v1/foundations/site-container";
import fradiumHomepage from "../../../../docs/portfolio-v1/flagship-evidence-audit/live-screens/fradium-home-1440x1024.png";

const gridCells = Array.from({ length: 12 }, (_, index) => index + 1);

const tokens = [
  { name: "Canvas", role: "Editorial ground", value: "#F4F5F3" },
  { name: "Ink", role: "Primary hierarchy", value: "#111315" },
  { name: "Cobalt", role: "Action and focus", value: "#2448D8" },
] as const;

export function FoundationShowcase() {
  return (
    <>
      <header className="opg-foundation-rail">
        <SiteContainer className="opg-foundation-rail__inner">
          <span className="opg-foundation-mark">WSN</span>
          <span className="opg-foundation-rail__context">
            The Open Proving Ground
          </span>
          <span className="opg-foundation-rail__folio">F–01 / Foundations</span>
        </SiteContainer>
      </header>

      <main className="opg-foundation-main" data-foundation-page>
        <SiteContainer>
          <section aria-labelledby="foundation-title" className="opg-opening">
            <EditorialGrid>
              <h1 className="opg-opening__title" id="foundation-title">
                <span>Wildan</span>
                <span>Syukri Niam.</span>
              </h1>

              <p className="opg-opening__folio-note">
                <strong>V1 checkpoint</strong>
                A quiet frame for loud evidence.
              </p>
            </EditorialGrid>

            <EditorialGrid className="opg-opening__lower">
              <p className="opg-opening__thesis">
                Software engineer building AI agents and Web3 systems—and
                showing the decisions, artifacts, and people behind the work.
              </p>

              <nav aria-label="Foundation preview" className="opg-opening__actions">
                <ActionLink href="#evidence">Inspect the evidence frame</ActionLink>
                <ActionLink href="#primitives">Review the system</ActionLink>
              </nav>

              <MetadataLine
                className="opg-opening__metadata"
                items={[
                  { label: "Focus", value: "AI agents · Web3 systems" },
                  { label: "Format", value: "Evidence-first editorial archive" },
                  { label: "Status", value: "Foundation checkpoint · July 2026" },
                ]}
              />
            </EditorialGrid>
          </section>

          <section
            aria-labelledby="evidence-heading"
            className="opg-foundation-section"
            id="evidence"
          >
            <SectionRule index="01" />
            <EditorialGrid>
              <h2 className="opg-foundation-section__heading" id="evidence-heading">
                The work is the spectacle.
              </h2>
              <p className="opg-foundation-section__intro">
                Product screens, system diagrams, verified outcomes, and real
                moments carry the visual weight. Interface chrome stays precise.
              </p>
            </EditorialGrid>

            <EditorialGrid className="opg-evidence-specimen">
              <EvidenceFigure
                caption={
                  <EvidenceCaption
                    label="Fradium / Product evidence"
                    source="fradium.io · Public capture · 11 July 2026"
                  >
                    This public homepage capture verifies a rendered product
                    surface. Its authored mobile crop preserves the core UI; it
                    does not claim production security or adoption.
                  </EvidenceCaption>
                }
                className="opg-evidence-specimen__figure"
                media={
                  <Image
                    alt="Fradium homepage presenting blockchain transaction protection, fraud detection, escrow, and paylink surfaces"
                    className="opg-product-image"
                    loading="eager"
                    sizes="(min-width: 1280px) 58vw, (min-width: 768px) 92vw, 100vw"
                    src={fradiumHomepage}
                  />
                }
                ratio="product"
                tone="matte"
              />

              <div className="opg-evidence-specimen__copy">
                <blockquote>
                  “Proof should be inspectable, not implied by decoration.”
                </blockquote>
                <p>
                  The final portfolio will apply this frame to Fradium, NovaAI,
                  PayGate, and Quorum. Each flagship gets an honest role,
                  lifecycle, decisions, and attributable evidence—not a generic
                  project card.
                </p>
              </div>
            </EditorialGrid>
          </section>

          <section
            aria-labelledby="primitives-heading"
            className="opg-foundation-section"
            id="primitives"
          >
            <SectionRule index="02" />
            <EditorialGrid>
              <h2
                className="opg-foundation-section__heading"
                id="primitives-heading"
              >
                One system, many kinds of proof.
              </h2>
              <p className="opg-foundation-section__intro">
                Shared typography, rules, captions, and grid logic make future
                additions coherent without forcing every story into one template.
              </p>
            </EditorialGrid>

            <EditorialGrid className="opg-primitives">
              <dl className="opg-primitives__ledger opg-token-ledger">
                {tokens.map((token) => (
                  <div className="opg-token-ledger__row" key={token.name}>
                    <dt>{token.name}</dt>
                    <dd>{token.role}</dd>
                    <dd className="opg-token-ledger__value">{token.value}</dd>
                  </div>
                ))}
              </dl>

              <div
                aria-label="Responsive editorial grid specimen"
                className="opg-primitives__grid opg-grid-specimen"
                data-grid-specimen
                role="img"
              >
                {gridCells.map((cell) => (
                  <span aria-hidden="true" key={cell}>
                    <small>{String(cell).padStart(2, "0")}</small>
                  </span>
                ))}
              </div>
            </EditorialGrid>
          </section>
        </SiteContainer>
      </main>

      <footer className="opg-foundation-footer">
        <SiteContainer className="opg-foundation-footer__inner">
          <p>
            This private checkpoint validates the visual grammar only. It is not
            linked from the current portfolio and is excluded from indexing.
          </p>
          <code>PORTFOLIO_V1_PREVIEW=1</code>
        </SiteContainer>
      </footer>
    </>
  );
}
