"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { HeroSceneFallback } from "@/components/observatory/hero-scene-fallback";

const CommandDeckScene = dynamic(
  () => import("@/components/observatory/command-deck-scene").then((mod) => mod.CommandDeckScene),
  {
    ssr: false,
    loading: () => null,
  }
);

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function useHeroWebGLEligibility(hostRef: React.RefObject<HTMLDivElement | null>) {
  const [eligible, setEligible] = React.useState(false);
  const [idle, setIdle] = React.useState(false);
  const [visible, setVisible] = React.useState(true);
  const [documentVisible, setDocumentVisible] = React.useState(true);

  React.useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(min-width: 1024px)"),
      window.matchMedia("(hover: hover) and (pointer: fine)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];

    const update = () => {
      const [desktop, precisePointer, reducedMotion] = mediaQueries;
      setEligible(desktop.matches && precisePointer.matches && !reducedMotion.matches && supportsWebGL());
    };

    update();
    mediaQueries.forEach((query) => query.addEventListener("change", update));
    return () => mediaQueries.forEach((query) => query.removeEventListener("change", update));
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setIdle(true), 720);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const node = hostRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { rootMargin: "180px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hostRef]);

  React.useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return {
    shouldMountWebGL: eligible && idle && visible && documentVisible,
    sceneActive: visible && documentVisible,
  };
}

export function HeroSceneLoader() {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const { shouldMountWebGL, sceneActive } = useHeroWebGLEligibility(hostRef);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {shouldMountWebGL ? (
        <MountedHeroScene sceneActive={sceneActive} />
      ) : (
        <HeroSceneFallback />
      )}
    </div>
  );
}

function MountedHeroScene({ sceneActive }: { sceneActive: boolean }) {
  const [sceneReady, setSceneReady] = React.useState(false);

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          sceneReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <HeroSceneFallback />
      </div>
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          sceneReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <CommandDeckScene active={sceneActive} onReady={() => setSceneReady(true)} />
      </div>
    </>
  );
}
