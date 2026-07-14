import type { CSSProperties } from "react";

import Image from "next/image";

import type { ReadyImageAsset } from "@/content/types";

type PfnMediaProps = {
  asset: ReadyImageAsset;
  className?: string;
  priority?: boolean;
  sizes: string;
  decorative?: boolean;
  fit?: "cover" | "contain";
};

function focalPosition(crop: ReadyImageAsset["crop"]) {
  return crop.mode === "focal"
    ? `${crop.focalPoint.x * 100}% ${crop.focalPoint.y * 100}%`
    : "50% 50%";
}

export function PfnMedia({
  asset,
  className = "",
  decorative = false,
  fit = "cover",
  priority = false,
  sizes,
}: PfnMediaProps) {
  const mobilePosition = asset.mobile
    ? focalPosition(asset.mobile.crop)
    : focalPosition(asset.crop);
  const style = {
    "--pfn-media-position": focalPosition(asset.crop),
    "--pfn-media-position-mobile": mobilePosition,
    "--pfn-media-fit": fit,
  } as CSSProperties;

  return (
    <picture className={`pfn-media ${className}`.trim()} style={style}>
      {asset.mobile ? (
        <source media="(max-width: 639px)" srcSet={asset.mobile.src} />
      ) : null}
      <Image
        alt={decorative ? "" : asset.alt}
        fetchPriority={priority ? "high" : undefined}
        fill
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        src={asset.src}
      />
    </picture>
  );
}
