import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ResponsiveMedia } from "@/components/portfolio/media/responsive-media";
import type { Profile } from "@/content/types";

type ResearchBuildHeroProps = {
  basePath?: string;
  profile: Profile;
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

export function ResearchBuildHero({
  basePath = "",
  profile,
}: ResearchBuildHeroProps) {
  return (
    <section
      aria-labelledby="research-build-hero-title"
      className="v4-hero portfolio-container"
      data-v4-hero
    >
      <div className="v4-hero__statement">
        <p className="v4-kicker v4-hero__kicker">
          <span aria-hidden="true" className="v4-origin-mark" />
          {profile.identity}
        </p>
        <h1 id="research-build-hero-title">
          <span>{profile.headline.lead}</span>
          <span>
            I build software that <br aria-hidden="true" className="v4-mobile-break" />
            <em>lets them act.</em>
            <i aria-hidden="true" className="v4-signal-origin" />
          </span>
        </h1>
        <p className="v4-hero__support">{profile.headline.supporting}</p>
        <div className="v4-hero__actions">
          <a className="v4-button v4-button--primary" href="#project-atlas">
            Explore the work
            <ArrowDownRight aria-hidden="true" size={18} />
          </a>
          <a className="v4-button v4-button--secondary" href="#research-coordinates">
            Read the research
            <ArrowDownRight aria-hidden="true" size={18} />
          </a>
        </div>
      </div>

      {profile.portrait ? (
        <figure className="v4-hero__portrait">
          <ResponsiveMedia
            asset={profile.portrait}
            className="v4-hero__portrait-media"
            fit="cover"
            priority
            sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 42vw, 390px"
          />
          <figcaption>
            <span>Builder, team lead, and student researcher.</span>
            <span>{profile.location}</span>
            {profile.github.status === "public" ? (
              <a href={profile.github.url} rel="noreferrer" target="_blank">
                GitHub
                <ArrowUpRight aria-hidden="true" size={13} />
              </a>
            ) : (
              <Link href={route(basePath, "/about")} prefetch={false}>
                About Wildan
              </Link>
            )}
          </figcaption>
        </figure>
      ) : null}
    </section>
  );
}
