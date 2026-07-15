import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { CurrentlyBuildingRecord, Profile } from "@/content/types";

type CurrentDispatchProps = {
  basePath?: string;
  item?: CurrentlyBuildingRecord;
  profile: Profile;
};

function route(basePath: string, pathname: string) {
  return `${basePath}${pathname}` || "/";
}

export function CurrentDispatch({
  basePath = "",
  item,
  profile,
}: CurrentDispatchProps) {
  return (
    <div className="v4-closing portfolio-container">
      {item ? (
        <section aria-labelledby="current-dispatch-title" className="v4-dispatch">
          <div>
            <p className="v4-kicker">Currently building</p>
            <span>Live dispatch</span>
          </div>
          <div>
            <h2 id="current-dispatch-title">{item.title}</h2>
            <p>{item.summary}</p>
          </div>
          {item.link.status === "public" ? (
            <a className="v4-button v4-button--paper" href={item.link.url} rel="noreferrer" target="_blank">
              Visit the build
              <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          ) : null}
        </section>
      ) : null}

      <section aria-labelledby="v4-close-title" className="v4-close">
        <p className="v4-kicker">Researching / Building / Shipping</p>
        <div>
          <h2 id="v4-close-title">Looking for the next difficult system worth making real.</h2>
          <p>{profile.availability}</p>
        </div>
        <div className="v4-close__actions">
          <Link className="v4-button v4-button--primary" href={route(basePath, "/contact")} prefetch={false}>
            Start a conversation
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
          <Link className="v4-text-link" href={route(basePath, "/about")} prefetch={false}>
            How I work
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
