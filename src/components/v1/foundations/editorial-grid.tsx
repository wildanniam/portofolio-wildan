import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function EditorialGrid({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("opg-editorial-grid", className)}
      data-foundation-component="editorial-grid"
      {...props}
    />
  );
}
