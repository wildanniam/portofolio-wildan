import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { Navigation, NavigationItem, Profile } from "@/content/types";

import { MobileNavigation } from "./mobile-navigation";

type SiteHeaderProps = {
  basePath?: string;
  currentPath: string;
  navigation: Navigation;
  profile: Pick<Profile, "identity" | "name" | "researchDirection">;
};

function isHttpHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function isCurrent(currentPath: string, href: string) {
  if (!href.startsWith("/")) return false;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function resolveHref(href: string, basePath: string) {
  if (!basePath || !href.startsWith("/")) return href;

  const normalizedBasePath = `/${basePath}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return href === "/" ? `${normalizedBasePath}/` : `${normalizedBasePath}${href}`;
}

function HeaderLink({
  basePath,
  className,
  currentPath,
  item,
}: {
  basePath: string;
  className: string;
  currentPath: string;
  item: NavigationItem;
}) {
  const href = resolveHref(item.href, basePath);
  const content = (
    <>
      {item.label}
      {isHttpHref(item.href) ? (
        <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.7} />
      ) : null}
    </>
  );

  return item.href.startsWith("/") ? (
    <Link
      aria-current={isCurrent(currentPath, item.href) ? "page" : undefined}
      className={className}
      href={href}
      prefetch={false}
    >
      {content}
    </Link>
  ) : (
    <a
      className={className}
      href={href}
      rel={isHttpHref(item.href) ? "noreferrer" : undefined}
      target={isHttpHref(item.href) ? "_blank" : undefined}
    >
      {content}
    </a>
  );
}

export function SiteHeader({
  basePath = "",
  currentPath,
  navigation,
  profile,
}: SiteHeaderProps) {
  const homeHref = resolveHref("/", basePath);
  const nameParts = profile.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? profile.name;
  const lastName = nameParts.at(-1) ?? "";

  return (
    <header className="portfolio-header">
      <Link
        aria-label={`${profile.name}, home`}
        className="portfolio-wordmark"
        href={homeHref}
        prefetch={false}
      >
        <span>{firstName}</span>
        <span>{lastName}</span>
      </Link>

      <nav aria-label="Primary navigation" className="portfolio-header__nav">
        {navigation.primary.map((item) => (
          <HeaderLink
            basePath={basePath}
            className="portfolio-header__link"
            currentPath={currentPath}
            item={item}
            key={item.id}
          />
        ))}
      </nav>

      {navigation.secondary?.length ? (
        <nav aria-label="Secondary navigation" className="portfolio-header__utilities">
          {navigation.secondary.map((item) => (
            <HeaderLink
              basePath={basePath}
              className="portfolio-header__link portfolio-header__external"
              currentPath={currentPath}
              item={item}
              key={item.id}
            />
          ))}
        </nav>
      ) : null}

      <MobileNavigation
        basePath={basePath}
        currentPath={currentPath}
        navigation={navigation}
        profile={profile}
      />
    </header>
  );
}
