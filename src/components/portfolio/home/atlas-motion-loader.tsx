"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

export function AtlasMotionLoader() {
  const [Runtime, setRuntime] = useState<ComponentType | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atlas = document.querySelector<HTMLElement>("[data-project-atlas]");
    if (!atlas || media.matches) return;

    let cancelled = false;
    const load = () => {
      void import(
        /* webpackChunkName: "atlas-motion-runtime" */ "./atlas-motion-runtime"
      ).then((module) => {
        if (!cancelled && !media.matches) {
          setRuntime(() => module.AtlasMotionRuntime);
        }
      });
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(atlas);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return Runtime ? <Runtime /> : null;
}
