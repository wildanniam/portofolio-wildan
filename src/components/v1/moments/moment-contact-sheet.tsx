import type { MomentRecord, ReadyImageAsset } from "@/content/types";

import { MomentFigure } from "./moment-figure";

type MomentContactSheetProps = {
  moment: MomentRecord;
  priorityFirstAsset?: boolean;
};

export function getReadyMomentAssets(moment: MomentRecord): ReadyImageAsset[] {
  return moment.assets.filter(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" && asset.mediaKind === "image",
  );
}

export function MomentContactSheet({
  moment,
  priorityFirstAsset = false,
}: MomentContactSheetProps) {
  const readyAssets = getReadyMomentAssets(moment);
  const presentedAssets =
    moment.mode === "contact-sheet" ? readyAssets : readyAssets.slice(0, 1);

  if (presentedAssets.length === 0) return null;

  return (
    <div
      aria-label={`Documentary media for ${moment.title}`}
      className="opg-moment-contact-sheet"
      data-asset-count={presentedAssets.length}
      role="group"
    >
      {presentedAssets.map((asset, assetIndex) => (
        <MomentFigure
          asset={asset}
          key={asset.id}
          moment={moment}
          priority={priorityFirstAsset && assetIndex === 0}
        />
      ))}
    </div>
  );
}
