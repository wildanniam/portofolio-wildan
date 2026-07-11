import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MetadataItem = {
  label: string;
  value: ReactNode;
};

type MetadataLineProps = Omit<ComponentPropsWithoutRef<"dl">, "children"> & {
  items: readonly MetadataItem[];
};

export function MetadataLine({
  className,
  items,
  ...props
}: MetadataLineProps) {
  return (
    <dl
      className={cn("opg-metadata-line", className)}
      data-foundation-component="metadata-line"
      {...props}
    >
      {items.map((item) => (
        <div className="opg-metadata-line__item" key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
