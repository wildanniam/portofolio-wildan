import type { CSSProperties } from "react";

import Image from "next/image";

import type { ReadyImageAsset } from "@/content/types";

type ResponsiveMediaProps = {
  asset: ReadyImageAsset;
  className?: string;
  decorative?: boolean;
  fit?: "contain" | "cover";
  priority?: boolean;
  sizes: string;
};

function focalPosition(crop: ReadyImageAsset["crop"]) {
  return crop.mode === "focal"
    ? `${crop.focalPoint.x * 100}% ${crop.focalPoint.y * 100}%`
    : "50% 50%";
}

function cropRatio(
  crop: ReadyImageAsset["crop"],
  width: number,
  height: number,
) {
  return crop.mode === "focal"
    ? crop.aspectRatio.replace(":", " / ")
    : `${width} / ${height}`;
}

export function ResponsiveMedia({
  asset,
  className = "",
  decorative = false,
  fit = "contain",
  priority = false,
  sizes,
}: ResponsiveMediaProps) {
  const mobilePosition = asset.mobile
    ? focalPosition(asset.mobile.crop)
    : focalPosition(asset.crop);
  const mobileRatio = asset.mobile
    ? cropRatio(asset.mobile.crop, asset.mobile.width, asset.mobile.height)
    : cropRatio(asset.crop, asset.width, asset.height);
  const style = {
    "--portfolio-media-ratio": cropRatio(asset.crop, asset.width, asset.height),
    "--portfolio-media-ratio-mobile": mobileRatio,
    "--portfolio-media-position": focalPosition(asset.crop),
    "--portfolio-media-position-mobile": mobilePosition,
  } as CSSProperties;

  return (
    <picture
      className={`responsive-media ${className}`.trim()}
      data-fit={fit}
      style={style}
    >
      {asset.mobile ? (
        <source
          height={asset.mobile.height}
          media="(max-width: 639px)"
          srcSet={asset.mobile.src}
          width={asset.mobile.width}
        />
      ) : null}
      <Image
        alt={decorative ? "" : asset.alt}
        height={asset.height}
        loading={priority ? undefined : "lazy"}
        preload={priority}
        sizes={sizes}
        src={asset.src}
        unoptimized={asset.mediaKind === "svg"}
        width={asset.width}
      />
    </picture>
  );
}
