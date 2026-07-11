"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import {
  REDUCED_MOTION_QUERY,
  WIDE_MOTION_QUERY,
} from "./project-explorer-motion-policy";

type ProjectExplorerMotionProps = {
  explorerId: string;
};

type ExplorerSelectionDetail = {
  fromSlug: string;
  toSlug: string;
};

type ScrollVisual = {
  motionTarget: HTMLElement;
  overlay: HTMLElement;
  source: HTMLElement;
  secondary: HTMLElement[];
  timeline: gsap.core.Timeline;
};

gsap.registerPlugin(useGSAP, ScrollTrigger);

function selectionDetail(event: Event): ExplorerSelectionDetail | null {
  if (!(event instanceof CustomEvent)) return null;
  const detail = event.detail as Partial<ExplorerSelectionDetail> | undefined;
  return typeof detail?.fromSlug === "string" &&
    typeof detail.toSlug === "string"
    ? { fromSlug: detail.fromSlug, toSlug: detail.toSlug }
    : null;
}

function currentPanel(root: HTMLElement): HTMLElement | null {
  const activeSlug = root.dataset.activeProject;
  return (
    Array.from(
      root.querySelectorAll<HTMLElement>("[data-explorer-panel]"),
    ).find((panel) => panel.dataset.projectSlug === activeSlug) ?? null
  );
}

function leadVisual(panel: HTMLElement): HTMLImageElement | null {
  return panel.querySelector<HTMLImageElement>(
    '[data-lead="true"] .opg-evidence-contact-sheet__media img',
  );
}

function makeOverlay(
  root: HTMLElement,
  source: HTMLImageElement,
): { motionTarget: HTMLElement; overlay: HTMLElement } {
  const motionTarget = document.createElement("div");
  const overlay = document.createElement("div");
  const image = document.createElement("img");
  const sourceStyle = window.getComputedStyle(source);

  motionTarget.className = "opg-project-explorer__motion-shield";
  motionTarget.dataset.motionShield = "true";
  motionTarget.setAttribute("aria-hidden", "true");

  overlay.className = "opg-project-explorer__motion-overlay";
  overlay.dataset.motionOverlay = "true";
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("inert", "");
  overlay.inert = true;

  image.alt = "";
  image.decoding = "async";
  image.draggable = false;
  image.src = source.currentSrc || source.src;
  image.style.objectFit = sourceStyle.objectFit;
  image.style.objectPosition = sourceStyle.objectPosition;
  overlay.append(image);
  motionTarget.append(overlay);
  root.append(motionTarget);
  return { motionTarget, overlay };
}

function targetBounds(root: HTMLElement, sourceBounds: DOMRect) {
  const targetSurface =
    root.querySelector<HTMLElement>(".opg-project-explorer__panels") ?? root;
  const targetSurfaceBounds = targetSurface.getBoundingClientRect();
  const aspect = sourceBounds.width / sourceBounds.height;
  const maxHeight = Math.max(320, window.innerHeight - 144);
  const width = Math.min(targetSurfaceBounds.width, maxHeight * aspect);
  const height = width / aspect;

  return {
    height,
    left: targetSurfaceBounds.left + (targetSurfaceBounds.width - width) / 2,
    top: Math.max(48, (window.innerHeight - height) / 2),
    width,
  };
}

function motionPhase(progress: number): string {
  if (progress < 0.12) return "context";
  if (progress < 0.28) return "selection";
  if (progress < 0.62) return "expand";
  if (progress < 0.76) return "inspect";
  if (progress < 0.9) return "proof";
  return "release";
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothUnit(value: number): number {
  const clamped = clampUnit(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function mix(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

export function ProjectExplorerMotion({
  explorerId,
}: ProjectExplorerMotionProps) {
  const controllerRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const controller = controllerRef.current;
      const root = controller?.closest<HTMLElement>(".opg-project-explorer");
      if (!root || !contextSafe) return;

      let selectionTimeline: gsap.core.Timeline | null = null;
      let selectionTargets: HTMLElement[] = [];
      let scrollTrigger: ScrollTrigger | null = null;
      let scrollVisual: ScrollVisual | null = null;
      let pendingLead: {
        image: HTMLImageElement;
        onError: () => void;
        onLoad: () => void;
      } | null = null;
      let pendingLeadFrame: number | null = null;
      let pendingScrollClearFrame: number | null = null;

      const clearPendingLead = () => {
        if (pendingLead) {
          pendingLead.image.removeEventListener("error", pendingLead.onError);
          pendingLead.image.removeEventListener("load", pendingLead.onLoad);
          pendingLead = null;
        }
        if (pendingLeadFrame !== null) {
          window.cancelAnimationFrame(pendingLeadFrame);
          pendingLeadFrame = null;
        }
      };

      const clearSelectionStyles = () => {
        if (selectionTargets.length === 0) return;
        gsap.set(selectionTargets, {
          clearProps: "transform,willChange",
        });
        selectionTargets = [];
      };

      const cancelPendingScrollClear = () => {
        if (pendingScrollClearFrame === null) return;
        window.cancelAnimationFrame(pendingScrollClearFrame);
        pendingScrollClearFrame = null;
      };

      const clearScrollVisual = () => {
        cancelPendingScrollClear();
        if (!scrollVisual) return;

        scrollVisual.timeline.kill();
        gsap.set([scrollVisual.source, ...scrollVisual.secondary], {
          clearProps: "opacity,transform,visibility,willChange",
        });
        scrollVisual.motionTarget.remove();
        scrollVisual = null;
      };

      const createScrollVisual = () => {
        cancelPendingScrollClear();
        if (scrollVisual) return scrollVisual;
        const panel = currentPanel(root);
        if (!panel) return null;
        const source = leadVisual(panel);
        if (!source || !source.complete || source.naturalHeight <= 0) {
          return null;
        }

        const sourceFrame =
          source.closest<HTMLElement>(".opg-evidence-contact-sheet__media") ??
          source;
        const sourceBounds = sourceFrame.getBoundingClientRect();
        if (sourceBounds.width <= 0 || sourceBounds.height <= 0) return null;

        const { motionTarget, overlay } = makeOverlay(root, source);
        const secondary = Array.from(
          panel.querySelectorAll<HTMLElement>(
            '.opg-evidence-contact-sheet__item:not([data-lead="true"]) ' +
              ".opg-evidence-contact-sheet__media",
          ),
        );

        gsap.set(motionTarget, {
          autoAlpha: 0,
          height: sourceBounds.height,
          transformOrigin: "0 0",
          width: sourceBounds.width,
          x: sourceBounds.left,
          y: sourceBounds.top,
        });
        gsap.set([sourceFrame, ...secondary, motionTarget], {
          willChange: "transform, opacity",
        });

        const state = { progress: 0 };
        const render = () => {
          const progress = state.progress;
          const liveSourceBounds = sourceFrame.getBoundingClientRect();
          const target = targetBounds(root, liveSourceBounds);
          const selection = smoothUnit((progress - 0.12) / 0.16);
          const expansion = smoothUnit((progress - 0.24) / 0.38);
          const handoff = progress >= 0.24 ? 1 : 0;
          const inspection = smoothUnit((progress - 0.62) / 0.14);
          const proof = smoothUnit((progress - 0.76) / 0.14);
          const overlayAlpha = handoff * (1 - proof);
          const inspectScale = 1 + 0.008 * inspection * (1 - proof);
          const targetScaleX =
            (target.width / liveSourceBounds.width) * inspectScale;
          const targetScaleY =
            (target.height / liveSourceBounds.height) * inspectScale;
          const expandedScaleX = mix(1, targetScaleX, expansion);
          const expandedScaleY = mix(1, targetScaleY, expansion);
          const expandedX = mix(liveSourceBounds.left, target.left, expansion);
          const expandedY = mix(liveSourceBounds.top, target.top, expansion);
          const secondaryProgress = mix(selection, 0, proof);

          gsap.set(motionTarget, {
            autoAlpha: overlayAlpha,
            scaleX: mix(expandedScaleX, 1, proof),
            scaleY: mix(expandedScaleY, 1, proof),
            x: mix(expandedX, liveSourceBounds.left, proof),
            y: mix(expandedY, liveSourceBounds.top, proof),
          });
          gsap.set(sourceFrame, {
            opacity: Math.max(1 - handoff, proof),
          });
          gsap.set(secondary, {
            autoAlpha: mix(1, 0.58, secondaryProgress),
            y: mix(0, 8, secondaryProgress),
          });
        };
        const timeline = gsap.timeline({ paused: true });
        timeline
          .to(
            state,
            {
              duration: 1,
              ease: "none",
              onUpdate: render,
              progress: 1,
            },
            0,
          )
          .addLabel("context", 0)
          .addLabel("selection", 0.12)
          .addLabel("expand", 0.28)
          .addLabel("inspect", 0.62)
          .addLabel("proof", 0.76)
          .addLabel("release", 0.9);

        scrollVisual = {
          motionTarget,
          overlay,
          secondary,
          source: sourceFrame,
          timeline,
        };
        render();
        return scrollVisual;
      };

      const scheduleScrollVisualClear = () => {
        cancelPendingScrollClear();
        const visual = scrollVisual;
        if (!visual) return;

        pendingScrollClearFrame = window.requestAnimationFrame(() => {
          pendingScrollClearFrame = null;
          if (scrollVisual === visual) clearScrollVisual();
        });
      };

      const destroyScrollTrigger = () => {
        cancelPendingScrollClear();
        clearPendingLead();
        scrollTrigger?.kill();
        scrollTrigger = null;
        clearScrollVisual();
        delete root.dataset.motionMode;
        root.dataset.stickyActive = "false";
        root.dataset.motionPhase = "idle";
      };

      const setupScrollTrigger = () => {
        destroyScrollTrigger();
        const panel = currentPanel(root);
        if (!panel) {
          root.dataset.motionState = "ready-static";
          root.dataset.motionProfile = "desktop-static";
          root.dataset.stickyActive = "false";
          return;
        }
        const sheet = panel.querySelector<HTMLElement>(
          ".opg-evidence-contact-sheet",
        );
        const source = leadVisual(panel);
        if (!sheet || !source) {
          root.dataset.motionState = "ready-static";
          root.dataset.motionProfile = "desktop-static";
          root.dataset.stickyActive = "false";
          return;
        }

        if (source.complete && source.naturalHeight <= 0) {
          root.dataset.motionState = "ready-static";
          root.dataset.motionProfile = "desktop-static";
          root.dataset.stickyActive = "false";
          root.dataset.motionPhase = "idle";
          return;
        }

        if (!source.complete) {
          const expectedSlug = panel.dataset.projectSlug;
          const onLoad = () => {
            clearPendingLead();
            pendingLeadFrame = window.requestAnimationFrame(() => {
              pendingLeadFrame = null;
              if (currentPanel(root)?.dataset.projectSlug === expectedSlug) {
                setupScrollTrigger();
              }
            });
          };
          const onError = () => {
            clearPendingLead();
            if (currentPanel(root)?.dataset.projectSlug === expectedSlug) {
              root.dataset.motionState = "ready-static";
              root.dataset.motionProfile = "desktop-static";
              root.dataset.stickyActive = "false";
              root.dataset.motionPhase = "idle";
            }
          };

          pendingLead = { image: source, onError, onLoad };
          source.addEventListener("load", onLoad, { once: true });
          source.addEventListener("error", onError, { once: true });
          root.dataset.motionState = "loading-media";
          root.dataset.motionProfile = "desktop-static";
          root.dataset.stickyActive = "false";
          root.dataset.motionPhase = "idle";
          return;
        }

        root.dataset.motionMode = "sticky";
        root.dataset.motionPhase = "idle";
        root.dataset.motionProfile = "desktop-sticky";
        root.dataset.motionState = "ready-wide";
        root.dataset.stickyActive = "true";

        scrollTrigger = ScrollTrigger.create({
          end: "bottom 28%",
          id: `${explorerId}-evidence-sequence`,
          invalidateOnRefresh: true,
          onEnter: (self) => {
            createScrollVisual();
            root.dataset.motionPhase = motionPhase(self.progress);
            scrollVisual?.timeline.progress(self.progress);
          },
          onEnterBack: (self) => {
            createScrollVisual();
            root.dataset.motionPhase = motionPhase(self.progress);
            scrollVisual?.timeline.progress(self.progress);
          },
          onLeave: () => {
            root.dataset.motionPhase = "release";
            scrollVisual?.timeline.progress(1);
            scheduleScrollVisualClear();
          },
          onLeaveBack: () => {
            root.dataset.motionPhase = "idle";
            scrollVisual?.timeline.progress(0);
            clearScrollVisual();
          },
          onRefreshInit: clearScrollVisual,
          onUpdate: (self) => {
            if (!self.isActive) return;
            createScrollVisual();
            root.dataset.motionPhase = motionPhase(self.progress);
            scrollVisual?.timeline.progress(self.progress);
          },
          start: "top 72%",
          trigger: sheet,
        });
        ScrollTrigger.refresh();
      };

      const stopSelectionTimeline = () => {
        selectionTimeline?.kill();
        selectionTimeline = null;
        clearSelectionStyles();
        if (scrollVisual && scrollTrigger) {
          scrollVisual.timeline.progress(scrollTrigger.progress);
        }
      };

      const onBeforeSelect = contextSafe(() => {
        root.dataset.motionPhase = "selection";
        stopSelectionTimeline();
        clearScrollVisual();
      });

      const onSelect = contextSafe((event: Event) => {
        const detail = selectionDetail(event);
        if (!detail) return;

        stopSelectionTimeline();
        const panel = Array.from(
          root.querySelectorAll<HTMLElement>("[data-explorer-panel]"),
        ).find((candidate) => candidate.dataset.projectSlug === detail.toSlug);
        if (!panel) return;

        const allowWideMotion =
          window.matchMedia(WIDE_MOTION_QUERY).matches &&
          !window.matchMedia(REDUCED_MOTION_QUERY).matches;
        if (allowWideMotion) {
          const groups = Array.from(
            panel.querySelectorAll<HTMLElement>(
              ":scope > header, :scope > dl, :scope > .opg-project-explorer__claim, " +
                ":scope > nav",
            ),
          );
          selectionTargets = groups;
          selectionTimeline = gsap.timeline({
            defaults: {
              duration: 0.46,
              ease: "power3.inOut",
              overwrite: "auto",
            },
            onComplete: () => {
              clearSelectionStyles();
              if (!scrollTrigger?.isActive && !scrollVisual) {
                root.dataset.motionPhase = "idle";
              }
              selectionTimeline = null;
            },
          });
          selectionTimeline.fromTo(
            groups,
            { y: 10 },
            {
              clearProps: "transform,willChange",
              stagger: 0.035,
              willChange: "transform",
              y: 0,
            },
          );
        }

        if (allowWideMotion) {
          setupScrollTrigger();
        } else {
          destroyScrollTrigger();
          root.dataset.motionPhase = "idle";
        }
      });

      root.addEventListener("opg:explorer-before-select", onBeforeSelect);
      root.addEventListener("opg:explorer-select", onSelect);

      const media = gsap.matchMedia();
      media.add(
        {
          eligible: WIDE_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
        },
        (context) => {
          const conditions = context.conditions as
            | { eligible?: boolean; reduceMotion?: boolean }
            | undefined;
          if (!conditions?.eligible || conditions.reduceMotion) {
            root.dataset.motionState = conditions?.reduceMotion
              ? "static-reduced-motion"
              : "static-viewport";
            root.dataset.motionProfile = conditions?.reduceMotion
              ? "reduced-static"
              : window.innerWidth < 768
                ? "mobile-static"
                : "desktop-static";
            destroyScrollTrigger();
            return;
          }

          setupScrollTrigger();
          return destroyScrollTrigger;
        },
      );

      return () => {
        root.removeEventListener("opg:explorer-before-select", onBeforeSelect);
        root.removeEventListener("opg:explorer-select", onSelect);
        stopSelectionTimeline();
        media.revert();
        destroyScrollTrigger();
      };
    },
    { scope: controllerRef },
  );

  return (
    <span
      aria-hidden="true"
      data-explorer-motion-controller
      hidden
      ref={controllerRef}
    />
  );
}
