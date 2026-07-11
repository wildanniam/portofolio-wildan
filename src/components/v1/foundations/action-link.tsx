import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type ActionLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  direction?: "forward" | "external" | "back";
  href: string;
};

const marks: Record<NonNullable<ActionLinkProps["direction"]>, string> = {
  back: "←",
  external: "↗",
  forward: "→",
};

export function ActionLink({
  children,
  className,
  direction = "forward",
  rel,
  target,
  ...props
}: ActionLinkProps) {
  const safeRel =
    target === "_blank"
      ? Array.from(
          new Set(`${rel ?? ""} noopener noreferrer`.trim().split(/\s+/)),
        ).join(" ")
      : rel;

  return (
    <a
      className={cn("opg-action-link", className)}
      data-direction={direction}
      data-foundation-component="action-link"
      rel={safeRel}
      target={target}
      {...props}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="opg-action-link__mark">
        {marks[direction]}
      </span>
    </a>
  );
}
