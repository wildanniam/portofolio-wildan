"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CLEAR_PROPS = "transform,opacity,visibility,willChange";

export function AtlasMotionRuntime() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const marker = markerRef.current;
      const atlas = marker?.parentElement;
      if (!atlas) return;

      const motionMedia = gsap.matchMedia();
      motionMedia.add("(prefers-reduced-motion: no-preference)", () => {
        const stages = Array.from(
          atlas.querySelectorAll<HTMLElement>("[data-atlas-stage]"),
        );
        const animatedTargets: HTMLElement[] = [];
        let completedStages = 0;

        if (stages.length === 0) return;

        atlas.dataset.atlasMotionState = "loading";

        stages.forEach((stage) => {
          const flowItems = Array.from(
            stage.querySelectorAll<HTMLElement>(".v4-stage__flow li"),
          );
          const artifacts = Array.from(
            stage.querySelectorAll<HTMLElement>(".v4-stage__artifact"),
          );
          const [primaryArtifact, ...supportArtifacts] = artifacts;
          const targets = [...flowItems, ...artifacts];
          animatedTargets.push(...targets);

          gsap.set(targets, { willChange: "transform,opacity" });
          gsap.set(flowItems, { autoAlpha: 0.35, x: -4 });
          if (primaryArtifact) {
            gsap.set(primaryArtifact, { autoAlpha: 0, y: 6 });
          }
          if (supportArtifacts.length) {
            gsap.set(supportArtifacts, { autoAlpha: 0, y: 8 });
          }

          const timeline = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.out" },
            onComplete: () => {
              gsap.set(targets, { clearProps: CLEAR_PROPS });
              completedStages += 1;
              if (completedStages === stages.length) {
                atlas.dataset.atlasMotionState = "settled";
              }
            },
          });

          timeline
            .to(flowItems, {
              autoAlpha: 1,
              duration: 0.16,
              stagger: 0.04,
              x: 0,
            })
            .to(
              primaryArtifact ?? [],
              { autoAlpha: 1, duration: 0.3, y: 0 },
              0.1,
            )
            .to(
              supportArtifacts,
              {
                autoAlpha: 1,
                duration: 0.32,
                stagger: 0.06,
                y: 0,
              },
              0.24,
            );

          ScrollTrigger.create({
            trigger: stage,
            start: "top 84%",
            once: true,
            onEnter: () => timeline.play(),
          });
        });

        atlas.dataset.atlasMotionState = "ready";

        return () => {
          gsap.set(animatedTargets, { clearProps: CLEAR_PROPS });
          atlas.dataset.atlasMotionState = "static";
        };
      });

      return () => motionMedia.revert();
    },
    { scope: markerRef },
  );

  return (
    <span
      aria-hidden="true"
      className="portfolio-visually-hidden"
      data-atlas-motion-controller
      ref={markerRef}
    />
  );
}
