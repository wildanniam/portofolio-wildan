import type {
  ContentBundle,
  CurrentlyBuildingRecord,
  HomepageProjectStage,
  MomentRecord,
  Navigation,
  Profile,
  ProjectRecord,
  ReadyAsset,
  ReadyImageAsset,
  Research,
  VerifiedClaim,
} from "./types";
import {
  hasMinimumMomentNarrative,
  MINIMUM_MOMENTS_FOR_NARRATIVE,
  orderMomentsForNarrative,
} from "./moment-policy";

export type ContentVisibility = {
  includePreview?: boolean;
};

export type HomepageSelectionOptions = ContentVisibility & {
  asOf: string;
};

export type HomepageSelection = {
  profile: Profile;
  research: Research;
  navigation: Navigation;
  projectStages: HomepageProjectStageSelection[];
  projects: ProjectRecord[];
  flagshipHighlightClaims: Array<{
    projectSlug: string;
    claim: VerifiedClaim;
  }>;
  moments: MomentRecord[];
  currentlyBuilding: CurrentlyBuildingRecord[];
};

export type HomepageProjectStageSelection = {
  stage: HomepageProjectStage;
  project: ProjectRecord;
  outcomeClaim: VerifiedClaim;
  artifacts: ReadyAsset[];
};

export type SiteShellSelection = {
  profile: Profile;
  navigation: Navigation;
};

export type AdjacentWorkProjects = {
  previous?: ProjectRecord;
  next?: ProjectRecord;
};

export const MINIMUM_PUBLISHED_MOMENTS_FOR_NARRATIVE =
  MINIMUM_MOMENTS_FOR_NARRATIVE;

function selectNavigation(
  navigation: Navigation,
  visibleProjects: ReadonlyMap<string, ProjectRecord>,
): Navigation {
  return {
    primary: navigation.primary.filter(
      (item) => !item.projectSlug || visibleProjects.has(item.projectSlug),
    ),
    ...(navigation.secondary
      ? {
          secondary: navigation.secondary.filter(
            (item) =>
              !item.projectSlug || visibleProjects.has(item.projectSlug),
          ),
        }
      : {}),
  };
}

export function isRoutableProject(
  project: ProjectRecord,
  visibility: ContentVisibility = {},
): boolean {
  return (
    project.publication === "published" ||
    (visibility.includePreview === true && project.publication === "preview")
  );
}

export function isRoutableMoment(
  moment: MomentRecord,
  visibility: ContentVisibility = {},
): boolean {
  return (
    moment.publication === "published" ||
    (visibility.includePreview === true && moment.publication === "preview")
  );
}

export function selectPublishedProjects(
  content: ContentBundle,
): ProjectRecord[] {
  return content.projects.filter(
    (project) => project.publication === "published",
  );
}

export function selectRoutableProjects(
  content: ContentBundle,
  visibility: ContentVisibility = {},
): ProjectRecord[] {
  return content.projects.filter((project) =>
    isRoutableProject(project, visibility),
  );
}

/**
 * Returns the project archive in a stable editorial order. Newer work appears
 * first; slugs make equal update dates deterministic across runtimes.
 */
export function selectWorkProjects(
  content: ContentBundle,
  visibility: ContentVisibility = {},
): ProjectRecord[] {
  return [...selectRoutableProjects(content, visibility)].sort(
    (left, right) =>
      right.lastUpdatedAt.localeCompare(left.lastUpdatedAt) ||
      left.slug.localeCompare(right.slug),
  );
}

/**
 * `previous` and `next` follow the stable order returned by
 * `selectWorkProjects`; hidden records never become adjacent destinations.
 */
export function selectAdjacentWorkProjects(
  content: ContentBundle,
  slug: string,
  visibility: ContentVisibility = {},
): AdjacentWorkProjects | undefined {
  const projects = selectWorkProjects(content, visibility);
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) return undefined;

  return {
    ...(projects[index - 1] ? { previous: projects[index - 1] } : {}),
    ...(projects[index + 1] ? { next: projects[index + 1] } : {}),
  };
}

export function selectProjectBySlug(
  content: ContentBundle,
  slug: string,
  visibility: ContentVisibility = {},
): ProjectRecord | undefined {
  return content.projects.find(
    (project) =>
      project.slug === slug && isRoutableProject(project, visibility),
  );
}

export function selectProjectSocialImage(
  project: ProjectRecord,
): ReadyImageAsset | undefined {
  if (!project.socialImageAssetId) return undefined;

  return project.evidence.find(
    (asset): asset is ReadyImageAsset =>
      asset.id === project.socialImageAssetId &&
      asset.status === "ready" &&
      asset.mediaKind === "image",
  );
}

export function selectProjectParams(
  content: ContentBundle,
  visibility: ContentVisibility = {},
): Array<{ slug: string }> {
  return selectRoutableProjects(content, visibility).map(({ slug }) => ({
    slug,
  }));
}

export function selectPublishedMoments(
  content: ContentBundle,
): MomentRecord[] {
  return content.moments.filter(
    (moment) => moment.publication === "published",
  );
}

export function selectRoutableMoments(
  content: ContentBundle,
  visibility: ContentVisibility = {},
): MomentRecord[] {
  return content.moments.filter((moment) =>
    isRoutableMoment(moment, visibility),
  );
}

/**
 * The public moments narrative stays withheld until it has enough distinct
 * published material to read as a sequence rather than an isolated claim.
 * An explicitly preview-visible route may use preview records, while draft
 * records never contribute. Duplicate narrative points remain in route order.
 */
export function selectMomentsNarrative(
  content: ContentBundle,
  visibility: ContentVisibility = {},
): MomentRecord[] | undefined {
  const moments = selectRoutableMoments(content, visibility);

  return hasMinimumMomentNarrative(moments)
    ? orderMomentsForNarrative(moments)
    : undefined;
}

export function selectSiteShell(
  content: ContentBundle,
  visibility: ContentVisibility = {},
): SiteShellSelection {
  const visibleProjects = new Map(
    selectRoutableProjects(content, visibility).map((project) => [
      project.slug,
      project,
    ]),
  );

  return {
    profile: content.profile,
    navigation: selectNavigation(content.navigation, visibleProjects),
  };
}

export function selectHomepage(
  content: ContentBundle,
  options: HomepageSelectionOptions,
): HomepageSelection {
  const visibleProjects = new Map(
    selectRoutableProjects(content, options).map((project) => [
      project.slug,
      project,
    ]),
  );
  const visibleMoments = new Map(
    selectRoutableMoments(content, options).map((moment) => [
      moment.id,
      moment,
    ]),
  );
  const buildingById = new Map(
    content.currentlyBuilding.items.map((item) => [item.id, item]),
  );

  const projectStages = content.homepage.projectStages.flatMap((stage) => {
    const project = visibleProjects.get(stage.projectSlug);
    if (!project) return [];

    const outcomeClaim = project.claims.find(
      (claim) => claim.id === stage.outcomeClaimId,
    );
    if (!outcomeClaim) return [];

    const artifacts = stage.artifactAssetIds.flatMap((assetId) => {
      const asset = project.evidence.find(
        (candidate): candidate is ReadyAsset =>
          candidate.id === assetId && candidate.status === "ready",
      );
      return asset ? [asset] : [];
    });

    return [{ stage, project, outcomeClaim, artifacts }];
  });
  const projects = projectStages.map(({ project }) => project);
  const flagshipHighlightClaims = projectStages.map(
    ({ project, outcomeClaim }) => ({
      projectSlug: project.slug,
      claim: outcomeClaim,
    }),
  );
  const moments = content.homepage.featuredMomentIds.flatMap((id) => {
    const moment = visibleMoments.get(id);
    return moment ? [moment] : [];
  });
  const currentlyBuilding = content.homepage.currentlyBuildingIds.flatMap(
    (id) => {
      const item = buildingById.get(id);
      if (!item) return [];
      if (item.expiresAt && item.expiresAt < options.asOf) return [];
      if (item.projectSlug && !visibleProjects.has(item.projectSlug)) return [];
      return [item];
    },
  );

  return {
    profile: content.profile,
    research: content.research,
    navigation: selectNavigation(content.navigation, visibleProjects),
    projectStages,
    projects,
    flagshipHighlightClaims,
    moments,
    currentlyBuilding,
  };
}

export function selectContactProfile(content: ContentBundle): Profile {
  return content.profile;
}
