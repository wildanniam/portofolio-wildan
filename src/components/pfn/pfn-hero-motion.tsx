"use client";

import type { PropsWithChildren } from "react";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export function PfnHeroMotion({ children }: PropsWithChildren) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const connection = (navigator as Navigator & {
        connection?: { saveData?: boolean };
      }).connection;
      if (reduceMotion || connection?.saveData) return;

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      timeline
        .from("[data-pfn-hero-copy]", { autoAlpha: 0, duration: 0.52, y: 24 })
        .from(
          "[data-pfn-hero-portrait]",
          { autoAlpha: 0, duration: 0.48, scale: 0.985, y: 18 },
          "<0.16",
        )
        .from("[data-pfn-hero-status]", { autoAlpha: 0, duration: 0.22, y: 8 }, "<0.2");
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
