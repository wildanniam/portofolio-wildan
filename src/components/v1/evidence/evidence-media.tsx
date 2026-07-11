import type { CSSProperties } from "react";

import type {
  CropPolicy,
  ReadyAsset,
  ReadyDocumentAsset,
  ReadyImageAsset,
  ReadyVideoAsset,
} from "@/content/types";

type EvidenceMediaProps = {
  asset: ReadyAsset;
  priority?: boolean;
};

type EvidenceMediaStyle = CSSProperties & {
  "--opg-evidence-aspect": string;
  "--opg-evidence-position": string;
  "--opg-evidence-mobile-aspect"?: string;
  "--opg-evidence-mobile-position"?: string;
};

function isImageAsset(asset: ReadyAsset): asset is ReadyImageAsset {
  return asset.mediaKind === "image" || asset.mediaKind === "svg";
}

function isVideoAsset(asset: ReadyAsset): asset is ReadyVideoAsset {
  return asset.mediaKind === "video";
}

function isDocumentAsset(asset: ReadyAsset): asset is ReadyDocumentAsset {
  return asset.mediaKind === "document";
}

function cropPresentation(
  crop: CropPolicy,
  width: number,
  height: number,
): { aspect: string; position: string } {
  if (crop.mode === "focal") {
    const position = (value: number) =>
      `${Number((value * 100).toFixed(4))}%`;
    return {
      aspect: crop.aspectRatio.replace(":", " / "),
      position: `${position(crop.focalPoint.x)} ${position(crop.focalPoint.y)}`,
    };
  }

  return {
    aspect: `${width} / ${height}`,
    position: "50% 50%",
  };
}

function mediaStyle(asset: ReadyAsset): EvidenceMediaStyle {
  const desktop = cropPresentation(asset.crop, asset.width, asset.height);
  const mobile = asset.mobile
    ? cropPresentation(
        asset.mobile.crop,
        asset.mobile.width,
        asset.mobile.height,
      )
    : undefined;

  return {
    "--opg-evidence-aspect": desktop.aspect,
    "--opg-evidence-position": desktop.position,
    ...(mobile
      ? {
          "--opg-evidence-mobile-aspect": mobile.aspect,
          "--opg-evidence-mobile-position": mobile.position,
        }
      : {}),
  };
}

function RasterEvidence({
  asset,
  priority,
}: {
  asset: ReadyImageAsset;
  priority: boolean;
}) {
  return (
    <picture className="opg-case-evidence-media__picture">
      {asset.mobile ? (
        <source
          height={asset.mobile.height}
          media="(max-width: 639px)"
          srcSet={asset.mobile.src}
          width={asset.mobile.width}
        />
      ) : null}
      <img
        alt={asset.alt}
        className="opg-case-evidence-media__asset"
        data-crop={asset.crop.mode}
        data-has-mobile={asset.mobile ? "true" : undefined}
        data-mobile-crop={asset.mobile?.crop.mode}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        height={asset.height}
        loading={priority ? "eager" : "lazy"}
        src={asset.src}
        style={mediaStyle(asset)}
        width={asset.width}
      />
    </picture>
  );
}

function SvgEvidence({
  asset,
  priority,
}: {
  asset: ReadyImageAsset;
  priority: boolean;
}) {
  const instructionId = `${asset.id}-diagram-scroll-instruction`;

  return (
    <div className="opg-case-evidence-media__diagram-shell">
      <p
        className="opg-case-evidence-media__diagram-instruction"
        id={instructionId}
      >
        Scroll horizontally to inspect the full diagram.
      </p>
      <div
        aria-describedby={instructionId}
        aria-label={`${asset.alt} - scrollable diagram`}
        className="opg-case-evidence-media__diagram-viewport"
        role="region"
        tabIndex={0}
      >
        <picture className="opg-case-evidence-media__picture">
          {asset.mobile ? (
            <source
              height={asset.mobile.height}
              media="(max-width: 639px)"
              srcSet={asset.mobile.src}
              width={asset.mobile.width}
            />
          ) : null}
          <img
            alt={asset.alt}
            className="opg-case-evidence-media__asset opg-case-evidence-media__asset--svg"
            data-crop={asset.crop.mode}
            data-has-mobile={asset.mobile ? "true" : undefined}
            decoding="async"
            fetchPriority={priority ? "high" : undefined}
            height={asset.height}
            loading={priority ? "eager" : "lazy"}
            src={asset.src}
            style={mediaStyle(asset)}
            width={asset.width}
          />
        </picture>
      </div>
    </div>
  );
}

function VideoEvidence({ asset }: { asset: ReadyVideoAsset }) {
  return (
    <video
      aria-label={asset.posterAlt}
      className="opg-case-evidence-media__asset"
      controls
      data-crop={asset.crop.mode}
      data-has-mobile={asset.mobile ? "true" : undefined}
      data-mobile-crop={asset.mobile?.crop.mode}
      height={asset.height}
      playsInline
      poster={asset.poster}
      preload={asset.controls === "visible" ? "metadata" : "none"}
      style={mediaStyle(asset)}
      width={asset.width}
    >
      {asset.mobile ? (
        <source media="(max-width: 639px)" src={asset.mobile.src} />
      ) : null}
      <source src={asset.src} />
      <a href={asset.src}>Open the recorded evidence</a>
    </video>
  );
}

function DocumentEvidence({ asset }: { asset: ReadyDocumentAsset }) {
  return (
    <div className="opg-case-evidence-media__document">
      <p className="opg-case-evidence-media__document-type">
        {asset.pageCount
          ? `Document / ${asset.pageCount} pages`
          : "Document"}
      </p>
      <p className="opg-case-evidence-media__document-title">{asset.title}</p>
      <p>{asset.textAlternative}</p>
      <a href={asset.src} rel="noopener noreferrer" target="_blank">
        Open document <span aria-hidden="true">↗</span>
        <span className="opg-visually-hidden"> (opens in a new tab)</span>
      </a>
    </div>
  );
}

export function EvidenceMedia({
  asset,
  priority = false,
}: EvidenceMediaProps) {
  if (isImageAsset(asset)) {
    return asset.mediaKind === "svg" ? (
      <SvgEvidence asset={asset} priority={priority} />
    ) : (
      <RasterEvidence asset={asset} priority={priority} />
    );
  }

  if (isVideoAsset(asset)) return <VideoEvidence asset={asset} />;
  if (isDocumentAsset(asset)) return <DocumentEvidence asset={asset} />;

  return null;
}
