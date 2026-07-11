import { EvidenceCaption } from "@/components/v1/evidence/evidence-caption";
import type { MomentRecord, ReadyImageAsset } from "@/content/types";

type MomentCaptionProps = {
  asset: ReadyImageAsset;
  moment: MomentRecord;
};

function assetCredit(asset: ReadyImageAsset): string {
  const { provenance } = asset;

  if (provenance.kind === "documentary-photo") {
    return `Photo credit / ${provenance.credit}`;
  }

  if (provenance.kind === "third-party") {
    return provenance.attribution
      ? `Credit / ${provenance.attribution}`
      : `Credit / ${provenance.creator}`;
  }

  return `Visual / ${provenance.creator}`;
}

export function MomentCaption({ asset, moment }: MomentCaptionProps) {
  return (
    <EvidenceCaption
      className="opg-moment-caption"
      label={`${moment.event} / ${moment.place}`}
      source={assetCredit(asset)}
    >
      {asset.caption}
    </EvidenceCaption>
  );
}
