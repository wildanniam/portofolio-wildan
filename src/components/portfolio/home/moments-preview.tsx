import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ResponsiveMedia } from "@/components/portfolio/media/responsive-media";
import type { HomepageFeaturedMomentSelection } from "@/content/queries";

type MomentsPreviewProps = {
  basePath?: string;
  moments: HomepageFeaturedMomentSelection[];
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

export function MomentsPreview({ basePath = "", moments }: MomentsPreviewProps) {
  return (
    <section aria-labelledby="moments-preview-title" className="v4-moments portfolio-container">
      <header className="v4-moments__intro">
        <div>
          <p className="v4-kicker">Field notes</p>
          <h2 id="moments-preview-title">The rooms around the work.</h2>
        </div>
        <div>
          <p>Build sessions, shared wins, research, and the people who made the work real.</p>
          <Link className="v4-text-link" href={route(basePath, "/moments")} prefetch={false}>
            Open the full gallery
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </header>

      <div className="v4-moments__grid">
        {moments.map(({ asset, featured, moment }) => (
          <article
            className={`v4-moment v4-moment--${featured.role}`}
            key={moment.id}
          >
            <Link href={route(basePath, "/moments")} prefetch={false}>
              <ResponsiveMedia
                asset={asset}
                className="v4-moment__media"
                fit="cover"
                sizes={
                  featured.role === "lead"
                    ? "(max-width: 767px) calc(100vw - 40px), 58vw"
                    : "(max-width: 767px) 32vw, 20vw"
                }
              />
              <span className="v4-moment__caption">
                <span>{moment.category}</span>
                <strong>{moment.title}</strong>
                <span>{moment.place}</span>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
