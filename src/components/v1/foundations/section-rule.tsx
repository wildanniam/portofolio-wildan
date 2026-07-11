import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type SectionRuleProps = ComponentPropsWithoutRef<"div"> & {
  index?: string;
};

export function SectionRule({
  className,
  index,
  ...props
}: SectionRuleProps) {
  return (
    <div
      className={cn("opg-section-rule", className)}
      data-foundation-component="section-rule"
      {...props}
    >
      {index ? (
        <span aria-hidden="true" className="opg-section-rule__index">
          {index}
        </span>
      ) : null}
      <hr />
    </div>
  );
}
