import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function SiteContainer({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("opg-site-container", className)}
      data-foundation-component="site-container"
      {...props}
    />
  );
}
