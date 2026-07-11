import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type EvidenceCaptionProps = ComponentPropsWithoutRef<"figcaption"> & {
  label: string;
  source?: string;
};

export function EvidenceCaption({
  children,
  className,
  label,
  source,
  ...props
}: EvidenceCaptionProps) {
  return (
    <figcaption
      className={cn("opg-evidence-caption", className)}
      data-foundation-component="evidence-caption"
      {...props}
    >
      <span className="opg-evidence-caption__label">{label}</span>
      <span className="opg-evidence-caption__copy">{children}</span>
      {source ? (
        <span className="opg-evidence-caption__source">{source}</span>
      ) : null}
    </figcaption>
  );
}
