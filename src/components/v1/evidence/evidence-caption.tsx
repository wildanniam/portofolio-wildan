import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type EvidenceCaptionProps = ComponentPropsWithoutRef<"figcaption"> & {
  label: string;
  source?: ReactNode;
  supplement?: ReactNode;
};

export function EvidenceCaption({
  children,
  className,
  label,
  source,
  supplement,
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
      {supplement ? (
        <div className="opg-evidence-caption__supplement">{supplement}</div>
      ) : null}
    </figcaption>
  );
}
