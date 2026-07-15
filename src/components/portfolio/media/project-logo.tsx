import Image from "next/image";

import type { BrandSurface, ProjectBrandAsset } from "@/content/types";

type ProjectLogoProps = {
  asset: ProjectBrandAsset;
  className?: string;
  priority?: boolean;
  surface?: BrandSurface;
};

export function ProjectLogo({
  asset,
  className = "",
  priority = false,
  surface,
}: ProjectLogoProps) {
  const decorative = asset.accessibility.mode === "decorative";
  const alt =
    asset.accessibility.mode === "informative" ? asset.accessibility.label : "";

  return (
    <span
      className={`project-logo ${className}`.trim()}
      data-brand-asset={asset.id}
      data-brand-surface={surface}
    >
      <Image
        alt={alt}
        aria-hidden={decorative || undefined}
        height={asset.height}
        loading={priority ? undefined : "lazy"}
        preload={priority}
        src={asset.src}
        style={{ height: "auto", maxWidth: "100%", width: asset.width }}
        unoptimized={asset.src.endsWith(".svg")}
        width={asset.width}
      />
    </span>
  );
}
