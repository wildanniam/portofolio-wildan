import { EvidenceCaption } from "@/components/v1/evidence/evidence-caption";
import { EvidenceFigure } from "@/components/v1/evidence/evidence-figure";
import { EvidenceMedia } from "@/components/v1/evidence/evidence-media";
import type { FullProjectRecord, ReadyAsset } from "@/content/types";

type ProjectEvidenceProps = {
  asset: ReadyAsset;
  priority?: boolean;
  project: FullProjectRecord;
};

type EvidenceAction = {
  href: string;
  label: string;
};

export type ProjectEvidencePartition = {
  opening?: ReadyAsset;
  sequence: ReadyAsset[];
};

function humanize(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function isReadyAsset(
  asset: FullProjectRecord["evidence"][number],
): asset is ReadyAsset {
  return asset.status === "ready";
}

function isPublicHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function evidenceActions(
  asset: ReadyAsset,
  project: FullProjectRecord,
): EvidenceAction[] {
  const actions: EvidenceAction[] = [];
  const usesProductReality = asset.evidenceFunctions.includes("product-reality");
  const usesSourceEvidence =
    asset.evidenceFunctions.includes("system-reasoning") ||
    asset.evidenceFunctions.includes("verification");

  if (
    (usesProductReality || asset.evidenceType === "deployment") &&
    project.links.live.status === "public"
  ) {
    actions.push({
      href: project.links.live.url,
      label: project.lifecycle === "beta" ? "Open live beta" : "Open live build",
    });
  }

  if (usesSourceEvidence && project.links.source.status === "public") {
    actions.push({ href: project.links.source.url, label: "Inspect source" });
  }

  if (
    asset.provenance.kind === "third-party" &&
    isPublicHttpUrl(asset.provenance.source)
  ) {
    actions.push({
      href: asset.provenance.source,
      label: "Original source",
    });
  }

  return actions.filter(
    (action, index) =>
      actions.findIndex((candidate) => candidate.href === action.href) === index,
  );
}

function EvidenceActions({ actions }: { actions: readonly EvidenceAction[] }) {
  if (actions.length === 0) return null;

  return (
    <>
      {actions.map((action) => (
        <a
          href={action.href}
          key={action.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {action.label} <span aria-hidden="true">↗</span>
          <span className="opg-visually-hidden"> (opens in a new tab)</span>
        </a>
      ))}
    </>
  );
}

function evidenceSupplement(asset: ReadyAsset) {
  if (
    (asset.mediaKind === "image" || asset.mediaKind === "svg") &&
    asset.longDescription
  ) {
    return (
      <details>
        <summary>Detailed image description</summary>
        <p>{asset.longDescription}</p>
      </details>
    );
  }

  if (asset.mediaKind === "video") {
    return (
      <details>
        <summary>Recorded steps</summary>
        <ol>
          {asset.transcriptOrSteps.map((step, index) => (
            <li key={`${index}-${step}`}>{step}</li>
          ))}
        </ol>
      </details>
    );
  }

  return null;
}

function ProjectEvidence({
  asset,
  priority = false,
  project,
}: ProjectEvidenceProps) {
  const functions = asset.evidenceFunctions.map(humanize).join(" + ");
  const label = `${functions} / ${humanize(asset.evidenceType)}`;
  const actions = evidenceActions(asset, project);
  const supplement = evidenceSupplement(asset);

  return (
    <EvidenceFigure
      className="opg-case-evidence__figure"
      data-evidence-id={asset.id}
      data-evidence-kind={asset.mediaKind}
      media={<EvidenceMedia asset={asset} priority={priority} />}
      ratio="intrinsic"
      tone={
        asset.mediaKind === "image" || asset.mediaKind === "video"
          ? "matte"
          : "surface"
      }
      caption={
        <EvidenceCaption
          label={label}
          source={
            actions.length > 0 ? <EvidenceActions actions={actions} /> : undefined
          }
          supplement={supplement}
        >
          {asset.caption}
        </EvidenceCaption>
      }
    />
  );
}

export function partitionProjectEvidence(
  evidence: FullProjectRecord["evidence"],
): ProjectEvidencePartition {
  const ready = evidence.filter(isReadyAsset);
  const opening = ready.find((asset) =>
    asset.evidenceFunctions.includes("product-reality"),
  );

  return {
    ...(opening ? { opening } : {}),
    sequence: opening
      ? ready.filter((asset) => asset.id !== opening.id)
      : ready,
  };
}

export function ProjectOpeningEvidence({
  asset,
  project,
}: {
  asset: ReadyAsset;
  project: FullProjectRecord;
}) {
  return (
    <section
      aria-label={`${project.title} product evidence`}
      className="opg-project-evidence-lead"
      data-project-opening-evidence
    >
      <ProjectEvidence
        asset={asset}
        priority
        project={project}
      />
    </section>
  );
}

export function ProjectEvidenceSequence({
  project,
  sequence,
}: {
  project: FullProjectRecord;
  sequence: readonly ReadyAsset[];
}) {
  if (sequence.length === 0) return null;

  const headingId = `${project.slug}-evidence-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="opg-project-evidence-sequence"
      data-project-evidence-sequence
    >
      <header className="opg-project-evidence-sequence__heading">
        <div>
          <h2 id={headingId}>Evidence record</h2>
          <p>What shipped, how it works, and what can be verified.</p>
        </div>
      </header>

      <ol className="opg-project-evidence-sequence__list">
        {sequence.map((asset) => (
          <li key={asset.id}>
            <ProjectEvidence
              asset={asset}
              project={project}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
