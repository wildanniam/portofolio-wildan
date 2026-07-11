"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";

import {
  evaluateMotionEligibility,
  REDUCED_MOTION_QUERY,
  WIDE_MOTION_QUERY,
} from "./project-explorer-motion-policy";

type ProjectExplorerMotionProps = {
  explorerId: string;
};

type MotionComponent = ComponentType<ProjectExplorerMotionProps>;

type ExplorerSelectionDetail = {
  fromSlug: string;
  toSlug: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    addEventListener?: EventTarget["addEventListener"];
    removeEventListener?: EventTarget["removeEventListener"];
    saveData?: boolean;
  };
};

function projectEntries<T extends HTMLElement>(
  root: HTMLElement,
  selector: string,
): Map<string, T> {
  return new Map(
    Array.from(root.querySelectorAll<T>(selector)).flatMap((element) => {
      const slug = element.dataset.projectSlug ??
        (element instanceof HTMLButtonElement ? element.value : undefined);
      return slug ? [[slug, element] as const] : [];
    }),
  );
}

function selectedProjectUrl(form: HTMLFormElement, slug: string): URL {
  const url = new URL(form.getAttribute("action") || window.location.href, window.location.href);
  if (url.origin !== window.location.origin) {
    throw new TypeError("Project explorer form action must remain same-origin.");
  }

  url.searchParams.set("project", slug);
  return url;
}

function motionSuppressionReason(): string | null {
  const connection = (navigator as NavigatorWithConnection).connection;
  const eligibility = evaluateMotionEligibility({
    height: window.innerHeight,
    pointerFine: window.matchMedia("(pointer: fine)").matches,
    reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
    saveData: Boolean(connection?.saveData),
    width: window.innerWidth,
  });
  return eligibility.reason;
}

function staticMotionProfile(reason: string): string {
  if (reason === "reduced-motion") return "reduced-static";
  if (reason === "save-data") return "save-data-static";
  if (window.innerWidth < 768) return "mobile-static";
  return "desktop-static";
}

export function ProjectExplorerEnhancer({
  explorerId,
}: ProjectExplorerMotionProps) {
  const [Motion, setMotion] = useState<MotionComponent | null>(null);
  const loadedMotionRef = useRef<MotionComponent | null>(null);

  useEffect(() => {
    const root = document.getElementById(`${explorerId}-interactive`);
    if (!root) return;

    const form = root.querySelector<HTMLFormElement>("[data-explorer-form]");
    const status = root.querySelector<HTMLElement>("[data-explorer-status]");
    if (!form || !status) return;

    const buttons = projectEntries<HTMLButtonElement>(
      root,
      "[data-explorer-preview]",
    );
    const panels = projectEntries<HTMLElement>(root, "[data-explorer-panel]");
    const rows = projectEntries<HTMLElement>(root, ".opg-project-explorer__row");
    const initialSlug = root.dataset.activeProject;
    let active = true;
    let nearby = false;
    let loadPromise: Promise<void> | null = null;

    root.dataset.enhanced = "true";
    root.dataset.stickyActive = "false";

    const applyStaticMotionState = (reason: string) => {
      root.dataset.motionState = `static-${reason}`;
      root.dataset.motionProfile = staticMotionProfile(reason);
      root.dataset.stickyActive = "false";
      if (reason === "reduced-motion") {
        root
          .querySelectorAll<HTMLElement>("[data-motion-entering]")
          .forEach((panel) => panel.removeAttribute("data-motion-entering"));
      }
    };

    const requestMotion = () => {
      if (loadedMotionRef.current || loadPromise) return;

      const suppression = motionSuppressionReason();
      if (suppression) {
        applyStaticMotionState(suppression);
        return;
      }

      root.dataset.motionState = "loading";
      loadPromise = import("./project-explorer-motion")
        .then((module) => {
          if (!active) return;
          const suppression = motionSuppressionReason();
          if (suppression) {
            applyStaticMotionState(suppression);
            return;
          }
          loadedMotionRef.current = module.ProjectExplorerMotion;
          setMotion(() => module.ProjectExplorerMotion);
        })
        .catch(() => {
          if (active) {
            loadedMotionRef.current = null;
            root.dataset.motionProfile = "desktop-static";
            root.dataset.motionState = "failed";
            root.dataset.stickyActive = "false";
          }
        })
        .finally(() => {
          loadPromise = null;
        });
    };

    const announceSelection = (panel: HTMLElement) => {
      const title = panel.dataset.projectTitle ?? "selected project";
      status.textContent = `Showing evidence for ${title}.`;
    };

    const selectProject = (
      toSlug: string,
      options: { announce: boolean; pushHistory: boolean },
    ) => {
      const nextButton = buttons.get(toSlug);
      const nextPanel = panels.get(toSlug);
      if (!nextButton || !nextPanel) return;

      const fromSlug = root.dataset.activeProject ?? initialSlug ?? toSlug;
      if (fromSlug === toSlug) {
        if (options.announce) announceSelection(nextPanel);
        return;
      }

      const detail: ExplorerSelectionDetail = { fromSlug, toSlug };
      root.dispatchEvent(
        new CustomEvent<ExplorerSelectionDetail>("opg:explorer-before-select", {
          detail,
        }),
      );

      for (const [slug, button] of buttons) {
        const selected = slug === toSlug;
        button.setAttribute("aria-pressed", String(selected));
        const label = button.querySelector<HTMLElement>(
          "[data-explorer-preview-label]",
        );
        if (label) label.textContent = selected ? "Previewing" : "Preview";
      }

      for (const [slug, row] of rows) {
        row.dataset.active = String(slug === toSlug);
      }

      for (const [slug, panel] of panels) {
        panel.hidden = slug !== toSlug;
        panel.removeAttribute("data-motion-entering");
      }

      root.dataset.activeProject = toSlug;
      if (
        !window.matchMedia(REDUCED_MOTION_QUERY).matches &&
        !root.dataset.motionState?.startsWith("ready")
      ) {
        nextPanel.dataset.motionEntering = "true";
      }

      if (options.pushHistory) {
        const url = selectedProjectUrl(form, toSlug);
        window.history.pushState(
          window.history.state,
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      }

      if (options.announce) announceSelection(nextPanel);
      root.dispatchEvent(
        new CustomEvent<ExplorerSelectionDetail>("opg:explorer-select", {
          detail,
        }),
      );
    };

    const onSubmit = (event: SubmitEvent) => {
      const fallbackSubmitter =
        document.activeElement instanceof HTMLButtonElement
          ? document.activeElement
          : null;
      const submitter =
        event.submitter instanceof HTMLButtonElement
          ? event.submitter
          : fallbackSubmitter;
      if (!submitter?.matches("[data-explorer-preview]")) return;

      event.preventDefault();
      selectProject(submitter.value, { announce: true, pushHistory: true });
      requestMotion();
    };

    const onPopState = () => {
      const requested = new URL(window.location.href).searchParams.get("project");
      const slug = requested && panels.has(requested) ? requested : initialSlug;
      if (slug) {
        selectProject(slug, { announce: true, pushHistory: false });
      }
    };

    const onExplicitIntent = () => requestMotion();
    const onEligibilityChange = () => {
      const suppression = motionSuppressionReason();
      if (suppression) {
        applyStaticMotionState(suppression);
        if (loadedMotionRef.current) {
          loadedMotionRef.current = null;
          setMotion(null);
        }
        return;
      }
      if (nearby) requestMotion();
    };
    const connection = (navigator as NavigatorWithConnection).connection;
    const wideQuery = window.matchMedia(WIDE_MOTION_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    wideQuery.addEventListener("change", onEligibilityChange);
    reducedMotionQuery.addEventListener("change", onEligibilityChange);
    connection?.addEventListener?.("change", onEligibilityChange);
    form.addEventListener("submit", onSubmit);
    form.addEventListener("focusin", onExplicitIntent, { once: true });
    form.addEventListener("pointerenter", onExplicitIntent, { once: true });
    window.addEventListener("popstate", onPopState);

    const observer = new IntersectionObserver(
      (entries) => {
        nearby = entries.some((entry) => entry.isIntersecting);
        if (nearby) requestMotion();
      },
      { rootMargin: "0px" },
    );
    observer.observe(root);

    const clearEnteringState = (event: AnimationEvent) => {
      const panel = event.target;
      if (panel instanceof HTMLElement) {
        panel.removeAttribute("data-motion-entering");
      }
    };
    root.addEventListener("animationend", clearEnteringState);

    return () => {
      active = false;
      observer.disconnect();
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("focusin", onExplicitIntent);
      form.removeEventListener("pointerenter", onExplicitIntent);
      root.removeEventListener("animationend", clearEnteringState);
      wideQuery.removeEventListener("change", onEligibilityChange);
      reducedMotionQuery.removeEventListener("change", onEligibilityChange);
      connection?.removeEventListener?.("change", onEligibilityChange);
      window.removeEventListener("popstate", onPopState);
      loadedMotionRef.current = null;
      delete root.dataset.enhanced;
      delete root.dataset.motionProfile;
      delete root.dataset.motionState;
      delete root.dataset.stickyActive;
    };
  }, [explorerId]);

  return Motion ? <Motion explorerId={explorerId} /> : null;
}
