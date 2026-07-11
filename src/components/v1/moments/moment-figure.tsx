import { EvidenceFigure } from "@/components/v1/evidence/evidence-figure";
import { EvidenceMedia } from "@/components/v1/evidence/evidence-media";
import type { MomentRecord, ReadyImageAsset } from "@/content/types";

import { MomentCaption } from "./moment-caption";

type MomentFigureProps = {
  asset: ReadyImageAsset;
  moment: MomentRecord;
  priority?: boolean;
};

export function MomentFigure({
  asset,
  moment,
  priority = false,
}: MomentFigureProps) {
  return (
    <EvidenceFigure
      caption={<MomentCaption asset={asset} moment={moment} />}
      className="opg-moment-figure"
      data-moment-asset-id={asset.id}
      data-moment-id={moment.id}
      media={<EvidenceMedia asset={asset} priority={priority} />}
      ratio="intrinsic"
      tone="surface"
    />
  );
}
