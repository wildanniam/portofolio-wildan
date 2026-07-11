import { ActionLink } from "@/components/v1/foundations/action-link";
import type { MomentRecord } from "@/content/types";
import { cn } from "@/lib/utils";

import {
  getReadyMomentAssets,
  MomentContactSheet,
} from "./moment-contact-sheet";

type MomentsSectionProps = {
  archiveHref?: string;
  className?: string;
  heading: string;
  headingId?: string;
  intro: string;
  moments: MomentRecord[];
  priorityFirstImage?: boolean;
  variant?: "archive" | "home";
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function formatMomentDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00.000Z`));
}

function formatProjectSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) =>
      part.toLowerCase() === "ai"
        ? "AI"
        : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
    )
    .join(" ");
}

function contextMetadata(moment: MomentRecord): {
  label: string;
  value: string;
} {
  if (moment.context.kind === "journey") {
    return { label: "Journey", value: moment.context.label };
  }

  return {
    label: moment.context.projectSlugs.length === 1 ? "Project" : "Projects",
    value: moment.context.projectSlugs.map(formatProjectSlug).join(" / "),
  };
}

function MomentStory({
  compact,
  index,
  moment,
  priorityFirstAsset,
}: {
  compact: boolean;
  index: number;
  moment: MomentRecord;
  priorityFirstAsset: boolean;
}) {
  const context = contextMetadata(moment);
  const readyAssets = getReadyMomentAssets(moment);
  const repeatsAssetCaption = readyAssets.some(
    (asset) => asset.caption === moment.caption,
  );
  const titleId = `moment-${moment.id}-title`;

  return (
    <article aria-labelledby={titleId} className="opg-moment-story">
      <header className="opg-moment-story__copy">
        <p className="opg-moment-story__folio">
          <span aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>{moment.event}</span>
        </p>
        <h3 id={titleId}>{moment.title}</h3>

        <dl className="opg-moment-story__metadata">
          <div>
            <dt>Date</dt>
            <dd>
              <time dateTime={moment.date}>{formatMomentDate(moment.date)}</time>
            </dd>
          </div>
          <div>
            <dt>Place</dt>
            <dd>{moment.place}</dd>
          </div>
          <div>
            <dt>{context.label}</dt>
            <dd>{context.value}</dd>
          </div>
        </dl>

        {!repeatsAssetCaption ? (
          <p className="opg-moment-story__caption">{moment.caption}</p>
        ) : null}
        {moment.result ? (
          <p className="opg-moment-story__result">
            <span>Outcome</span>
            <span>{moment.result}</span>
          </p>
        ) : null}
        {!compact && moment.reflection ? (
          <p className="opg-moment-story__reflection">{moment.reflection}</p>
        ) : null}
      </header>

      {readyAssets.length > 0 ? (
        <div className="opg-moment-story__media">
          <MomentContactSheet
            moment={moment}
            priorityFirstAsset={priorityFirstAsset}
          />
        </div>
      ) : null}
    </article>
  );
}

export function MomentsSection({
  archiveHref,
  className,
  heading,
  headingId = "moments-heading",
  intro,
  moments,
  priorityFirstImage = false,
  variant = "archive",
}: MomentsSectionProps) {
  const presentedMoments =
    variant === "home"
      ? moments.filter((moment) => getReadyMomentAssets(moment).length > 0)
      : moments;
  if (presentedMoments.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "opg-moments-section",
        `opg-moments-section--${variant}`,
        className,
      )}
      data-moments-section={variant}
    >
      <div className="opg-moments-section__heading">
        <div>
          <h2 id={headingId}>{heading}</h2>
          <p>{intro}</p>
        </div>
        {archiveHref ? (
          <ActionLink className="opg-moments-section__archive" href={archiveHref}>
            View all moments
          </ActionLink>
        ) : null}
      </div>

      <ol className="opg-moments-sequence">
        {presentedMoments.map((moment, index) => (
          <li data-mode={moment.mode} key={moment.id}>
            <MomentStory
              compact={variant === "home"}
              index={index}
              moment={moment}
              priorityFirstAsset={priorityFirstImage && index === 0}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
