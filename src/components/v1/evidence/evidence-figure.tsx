import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type EvidenceFigureProps = Omit<ComponentPropsWithoutRef<"figure">, "children"> & {
  caption: ReactNode;
  media: ReactNode;
  ratio?: "product" | "documentary" | "portrait" | "square" | "intrinsic";
  tone?: "surface" | "matte";
};

export function EvidenceFigure({
  caption,
  className,
  media,
  ratio = "product",
  tone = "surface",
  ...props
}: EvidenceFigureProps) {
  return (
    <figure
      className={cn("opg-evidence-figure", className)}
      data-foundation-component="evidence-figure"
      {...props}
    >
      <div
        className="opg-evidence-figure__media"
        data-ratio={ratio}
        data-tone={tone}
      >
        {media}
      </div>
      {caption}
    </figure>
  );
}
