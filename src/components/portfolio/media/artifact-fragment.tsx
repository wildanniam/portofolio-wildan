import { ResponsiveMedia } from "./responsive-media";

import type { ReadyImageAsset } from "@/content/types";

type ArtifactFragmentProps = {
  asset: ReadyImageAsset;
  className?: string;
  priority?: boolean;
  sizes: string;
};

export function ArtifactFragment({
  asset,
  className = "",
  priority = false,
  sizes,
}: ArtifactFragmentProps) {
  return (
    <figure
      className={`artifact-fragment ${className}`.trim()}
      data-artifact-id={asset.id}
      data-evidence-type={asset.evidenceType}
      data-slot={asset.slot}
    >
      <ResponsiveMedia
        asset={asset}
        className="artifact-fragment__media"
        fit="contain"
        priority={priority}
        sizes={sizes}
      />
      <figcaption className="artifact-fragment__caption">
        <span>{asset.caption}</span>
        {asset.longDescription ? (
          <details className="artifact-fragment__description">
            <summary>Detailed image description</summary>
            <p>{asset.longDescription}</p>
          </details>
        ) : null}
      </figcaption>
    </figure>
  );
}
