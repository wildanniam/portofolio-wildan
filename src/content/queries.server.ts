import "server-only";

import { toProjectSummaryDto } from "./dto";
import {
  selectAdjacentWorkProjects,
  selectContactProfile,
  selectHomepage,
  selectMomentsNarrative,
  selectProjectBySlug,
  selectProjectParams,
  selectPublishedMoments,
  selectPublishedProjects,
  selectRoutableProjects,
  selectSiteShell,
  selectWorkProjects,
} from "./queries";
import { getContentBundle } from "./repository.server";

export type PreviewQueryOptions = {
  preview?: boolean;
  asOf?: string;
};

function visibilityFor(options: PreviewQueryOptions = {}) {
  return {
    includePreview:
      options.preview === true && process.env.PORTFOLIO_V1_PREVIEW === "1",
  };
}

export function getHomepage(options: PreviewQueryOptions = {}) {
  return selectHomepage(getContentBundle(), {
    ...visibilityFor(options),
    asOf: options.asOf ?? new Date().toISOString().slice(0, 10),
  });
}

export function getSiteShell(options: PreviewQueryOptions = {}) {
  return selectSiteShell(getContentBundle(), visibilityFor(options));
}

export function getPublishedProjects() {
  return selectPublishedProjects(getContentBundle());
}

export function getRoutableProjectSummaries(
  options: PreviewQueryOptions = {},
) {
  return selectRoutableProjects(
    getContentBundle(),
    visibilityFor(options),
  ).map(toProjectSummaryDto);
}

export function getWorkProjectSummaries(
  options: PreviewQueryOptions = {},
) {
  return selectWorkProjects(
    getContentBundle(),
    visibilityFor(options),
  ).map(toProjectSummaryDto);
}

export function getAdjacentWorkProjectSummaries(
  slug: string,
  options: PreviewQueryOptions = {},
) {
  const adjacent = selectAdjacentWorkProjects(
    getContentBundle(),
    slug,
    visibilityFor(options),
  );

  if (!adjacent) return undefined;

  return {
    ...(adjacent.previous
      ? { previous: toProjectSummaryDto(adjacent.previous) }
      : {}),
    ...(adjacent.next ? { next: toProjectSummaryDto(adjacent.next) } : {}),
  };
}

export function getProjectBySlug(
  slug: string,
  options: PreviewQueryOptions = {},
) {
  return selectProjectBySlug(
    getContentBundle(),
    slug,
    visibilityFor(options),
  );
}

export function getProjectParams(options: PreviewQueryOptions = {}) {
  return selectProjectParams(getContentBundle(), visibilityFor(options));
}

export function getPublishedMoments() {
  return selectPublishedMoments(getContentBundle());
}

export function getMomentsNarrative(options: PreviewQueryOptions = {}) {
  return selectMomentsNarrative(
    getContentBundle(),
    visibilityFor(options),
  );
}

export function getContactProfile() {
  return selectContactProfile(getContentBundle());
}
