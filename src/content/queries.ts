import type {
  ContentBundle,
  CurrentlyBuildingRecord,
  MomentRecord,
  Navigation,
  Profile,
  ProjectRecord,
} from "./types";

export type ContentVisibility = {
  includePreview?: boolean;
};

export type HomepageSelectionOptions = ContentVisibility & {
  asOf: string;
};

export type HomepageSelection = {
  profile: Profile;
  navigation: Navigation;
  projects: ProjectRecord[];
  moments: MomentRecord[];
  currentlyBuilding: CurrentlyBuildingRecord[];
};

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

  const projects = content.homepage.flagshipProjectSlugs.flatMap((slug) => {
    const project = visibleProjects.get(slug);
    return project ? [project] : [];
  });
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

  const filterNavigation = (navigation: Navigation): Navigation => ({
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
  });

  return {
    profile: content.profile,
    navigation: filterNavigation(content.navigation),
    projects,
    moments,
    currentlyBuilding,
  };
}

export function selectContactProfile(content: ContentBundle): Profile {
  return content.profile;
}
