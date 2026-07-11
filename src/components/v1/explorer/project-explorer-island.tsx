import type { CSSProperties } from "react";

import type {
  ExplorerDocumentMediaDto,
  ExplorerImageMediaDto,
  ExplorerMediaDto,
  ExplorerProjectDto,
  ExplorerVideoMediaDto,
} from "@/content/explorer-dto";

import { ProjectExplorerEnhancer } from "./project-explorer-enhancer";

type ProjectExplorerIslandProps = {
  defaultSlug?: string;
  explorerId: string;
  formAction: string;
  projects: readonly ExplorerProjectDto[];
};

type ExplorerMediaStyle = CSSProperties & {
  "--opg-media-aspect": string;
  "--opg-media-position": string;
  "--opg-media-mobile-aspect"?: string;
  "--opg-media-mobile-position"?: string;
};

function humanize(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function projectPeriod(project: ExplorerProjectDto): string {
  if (project.endedAt) return `${project.startedAt} - ${project.endedAt}`;
  if (project.lifecycle === "active" || project.lifecycle === "beta") {
    return `${project.startedAt} - Present`;
  }
  return project.startedAt;
}

function cropPresentation(
  crop: ExplorerMediaDto["crop"],
  width: number,
  height: number,
): { aspect: string; position: string } {
  return crop.mode === "focal"
    ? {
        aspect: crop.aspectRatio.replace(":", " / "),
        position: `${crop.focalPoint.x * 100}% ${crop.focalPoint.y * 100}%`,
      }
    : { aspect: `${width} / ${height}`, position: "50% 50%" };
}

function mediaStyle(media: ExplorerMediaDto): ExplorerMediaStyle {
  const desktop = cropPresentation(media.crop, media.width, media.height);
  const mobile = media.mobile
    ? cropPresentation(
        media.mobile.crop,
        media.mobile.width,
        media.mobile.height,
      )
    : undefined;

  return {
    "--opg-media-aspect": desktop.aspect,
    "--opg-media-position": desktop.position,
    ...(mobile
      ? {
          "--opg-media-mobile-aspect": mobile.aspect,
          "--opg-media-mobile-position": mobile.position,
        }
      : {}),
  };
}

function isImageMedia(
  media: ExplorerMediaDto,
): media is ExplorerImageMediaDto {
  return media.mediaKind === "image" || media.mediaKind === "svg";
}

function isVideoMedia(
  media: ExplorerMediaDto,
): media is ExplorerVideoMediaDto {
  return media.mediaKind === "video";
}

function isDocumentMedia(
  media: ExplorerMediaDto,
): media is ExplorerDocumentMediaDto {
  return media.mediaKind === "document";
}

function SvgMediaRenderer({ media }: { media: ExplorerImageMediaDto }) {
  const instructionId = `${media.id}-explorer-diagram-scroll-instruction`;

  return (
    <div className="opg-evidence-contact-sheet__diagram-shell">
      <p
        className="opg-evidence-contact-sheet__diagram-instruction"
        id={instructionId}
      >
        Scroll horizontally to inspect the full diagram.
      </p>
      <div
        aria-describedby={instructionId}
        aria-label={`${media.alt} - scrollable diagram`}
        className="opg-evidence-contact-sheet__diagram-viewport"
        role="region"
        tabIndex={0}
      >
        <picture>
          <img
            alt={media.alt}
            data-crop={media.crop.mode}
            decoding="async"
            height={media.height}
            loading="lazy"
            src={media.src}
            style={mediaStyle(media)}
            width={media.width}
          />
        </picture>
      </div>
      <a
        className="opg-evidence-contact-sheet__diagram-link"
        href={media.src}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open full diagram <span aria-hidden="true">↗</span>
        <span className="opg-visually-hidden"> (opens in a new tab)</span>
      </a>
    </div>
  );
}

function MediaRenderer({ media }: { media: ExplorerMediaDto }) {
  if (isImageMedia(media)) {
    if (media.mediaKind === "svg") {
      return <SvgMediaRenderer media={media} />;
    }

    return (
      <picture>
        {media.mobile ? (
          <source
            height={media.mobile.height}
            media="(max-width: 639px)"
            srcSet={media.mobile.src}
            width={media.mobile.width}
          />
        ) : null}
        <img
          alt={media.alt}
          data-crop={media.crop.mode}
          data-has-mobile={media.mobile ? "true" : undefined}
          data-mobile-crop={media.mobile?.crop.mode}
          decoding="async"
          height={media.height}
          loading="lazy"
          src={media.src}
          style={mediaStyle(media)}
          width={media.width}
        />
      </picture>
    );
  }

  if (isVideoMedia(media)) {
    return (
      <video
        aria-label={media.posterAlt}
        controls
        data-has-mobile={media.mobile ? "true" : undefined}
        height={media.height}
        playsInline
        poster={media.poster}
        preload={media.controls === "visible" ? "metadata" : "none"}
        style={mediaStyle(media)}
        width={media.width}
      >
        {media.mobile ? (
          <source media="(max-width: 639px)" src={media.mobile.src} />
        ) : null}
        <source src={media.src} />
        <a href={media.src}>Open the recorded product evidence</a>
      </video>
    );
  }

  if (isDocumentMedia(media)) return (
    <a
      className="opg-evidence-contact-sheet__document"
      href={media.src}
      rel="noopener noreferrer"
      target="_blank"
    >
      <strong>{media.title}</strong>
      <span>{media.textAlternative}</span>
      {media.pageCount ? <span>{media.pageCount} pages</span> : null}
      <span>
        Open document <span aria-hidden="true">↗</span>
        <span className="opg-visually-hidden"> (opens in a new tab)</span>
      </span>
    </a>
  );

  return null;
}

function MediaSupplement({ media }: { media: ExplorerMediaDto }) {
  if (isImageMedia(media) && media.longDescription) {
    return (
      <details className="opg-evidence-contact-sheet__supplement">
        <summary>Detailed image description</summary>
        <p>{media.longDescription}</p>
      </details>
    );
  }

  if (isVideoMedia(media)) {
    return (
      <details className="opg-evidence-contact-sheet__supplement">
        <summary>Recorded steps</summary>
        <ol>
          {media.transcriptOrSteps.map((step, index) => (
            <li key={`${index}-${step}`}>{step}</li>
          ))}
        </ol>
      </details>
    );
  }

  return null;
}

function EvidenceContactSheet({
  media,
  projectTitle,
}: {
  media: readonly ExplorerMediaDto[];
  projectTitle: string;
}) {
  if (media.length === 0) return null;

  return (
    <section
      aria-label={`${projectTitle} evidence contact sheet`}
      className="opg-evidence-contact-sheet"
    >
      <ol>
        {media.map((item, index) => (
          <li
            className="opg-evidence-contact-sheet__item"
            data-lead={index === 0 ? "true" : undefined}
            key={item.id}
          >
            <figure>
              <div
                className="opg-evidence-contact-sheet__media"
                data-evidence-type={item.evidenceType}
              >
                <MediaRenderer media={item} />
              </div>
              <figcaption>
                <span className="opg-evidence-contact-sheet__label">
                  {item.evidenceFunctions.map(humanize).join(" + ")} /{" "}
                  {humanize(item.evidenceType)}
                </span>
                <span>{item.caption}</span>
                <MediaSupplement media={item} />
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProjectPanel({
  hidden,
  panelId,
  project,
}: {
  hidden: boolean;
  panelId: string;
  project: ExplorerProjectDto;
}) {
  const titleId = `${panelId}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="opg-project-explorer__panel"
      data-explorer-panel
      data-project-slug={project.slug}
      data-project-title={project.title}
      hidden={hidden}
      id={panelId}
      tabIndex={-1}
    >
      <header className="opg-project-explorer__panel-heading">
        <p>Evidence preview</p>
        <h3 id={titleId}>{project.title}</h3>
        <p>{project.oneLiner}</p>
      </header>

      <dl className="opg-project-explorer__facts">
        <div>
          <dt>Role</dt>
          <dd>{project.role.label}</dd>
        </div>
        <div>
          <dt>Context</dt>
          <dd>{project.origin.map(humanize).join(", ")}</dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd>{projectPeriod(project)}</dd>
        </div>
      </dl>

      <div aria-label="Highlighted evidence" className="opg-project-explorer__claim">
        <p>{project.highlightedClaim.text}</p>
      </div>

      {project.media.length > 0 ? (
        <EvidenceContactSheet media={project.media} projectTitle={project.title} />
      ) : null}

      <nav
        aria-label={`${project.title} actions`}
        className="opg-project-explorer__actions"
      >
        <a className="opg-project-explorer__case-study-link" href={project.href}>
          Read case study <span aria-hidden="true">→</span>
        </a>
        {project.actions.map((action) => (
          <a
            href={action.href}
            key={action.kind}
            rel="noopener noreferrer"
            target="_blank"
          >
            {action.label} <span aria-hidden="true">↗</span>
            <span className="opg-visually-hidden"> (opens in a new tab)</span>
          </a>
        ))}
      </nav>
    </article>
  );
}

export function ProjectExplorerIsland({
  defaultSlug,
  explorerId,
  formAction,
  projects,
}: ProjectExplorerIslandProps) {
  const activeProject =
    projects.find((project) => project.slug === defaultSlug) ?? projects[0];
  const panelId = `${explorerId}-panel`;

  if (!activeProject) return null;

  return (
    <div
      className="opg-project-explorer"
      data-active-project={activeProject.slug}
      data-enhanced="false"
      data-motion-state="idle"
      id={`${explorerId}-interactive`}
    >
      <div className="opg-project-explorer__layout">
        <form
          action={formAction}
          aria-label="Project evidence previews"
          className="opg-project-explorer__index-group"
          data-explorer-form
          method="get"
          role="group"
        >
          <ol
            aria-label="Flagship projects"
            className="opg-project-explorer__index"
          >
            {projects.map((project, index) => {
              const isActive = project.slug === activeProject.slug;
              const projectLinkId = `${explorerId}-${project.slug}-project`;
              const projectPanelId = `${panelId}-${project.slug}`;

              return (
                <li
                  className="opg-project-explorer__row"
                  data-active={isActive ? "true" : "false"}
                  data-project-slug={project.slug}
                  key={project.slug}
                >
                  <span
                    aria-hidden="true"
                    className="opg-project-explorer__number"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <a
                    className="opg-project-explorer__project-link"
                    href={project.href}
                    id={projectLinkId}
                  >
                    {project.title}
                  </a>
                  <button
                    aria-controls={projectPanelId}
                    aria-label={`Preview evidence for ${project.title}`}
                    aria-pressed={isActive}
                    className="opg-project-explorer__preview-button"
                    data-explorer-preview
                    formAction={`${formAction.replace(/#.*$/, "")}#${projectPanelId}`}
                    name="project"
                    type="submit"
                    value={project.slug}
                  >
                    <span data-explorer-preview-label>
                      {isActive ? "Previewing" : "Preview"}
                    </span>
                  </button>
                  <p>{project.oneLiner}</p>
                </li>
              );
            })}
          </ol>
        </form>

        <div
          className="opg-project-explorer__panels"
          data-explorer-panels
          id={panelId}
          tabIndex={-1}
        >
          {projects.map((project) => (
            <ProjectPanel
              hidden={project.slug !== activeProject.slug}
              key={project.slug}
              panelId={`${panelId}-${project.slug}`}
              project={project}
            />
          ))}
        </div>
      </div>
      <p
        aria-atomic="true"
        aria-live="polite"
        className="opg-visually-hidden"
        data-explorer-status
        role="status"
      />
      <ProjectExplorerEnhancer explorerId={explorerId} />
    </div>
  );
}
