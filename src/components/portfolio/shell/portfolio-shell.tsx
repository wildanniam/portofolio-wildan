import type { ReactNode } from "react";

import type { Navigation, Profile } from "@/content/types";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type PortfolioShellProps = {
  basePath?: string;
  children?: ReactNode;
  currentPath?: string;
  mainId?: string;
  navigation: Navigation;
  profile: Profile;
};

export function PortfolioShell({
  basePath = "",
  children,
  currentPath = "/",
  mainId = "portfolio-main",
  navigation,
  profile,
}: PortfolioShellProps) {
  return (
    <div className="portfolio-shell" data-portfolio-v3="true" data-portfolio-v4="true">
      <a className="portfolio-skip-link" href={`#${mainId}`}>
        Skip to main content
      </a>
      <SiteHeader
        basePath={basePath}
        currentPath={currentPath}
        navigation={navigation}
        profile={profile}
      />
      {children}
      <SiteFooter basePath={basePath} navigation={navigation} profile={profile} />
    </div>
  );
}
