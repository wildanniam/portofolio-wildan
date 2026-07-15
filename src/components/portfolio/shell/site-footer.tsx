import Link from "next/link";

import type { Navigation, NavigationItem, Profile } from "@/content/types";

type SiteFooterProps = {
  basePath?: string;
  navigation: Navigation;
  profile: Pick<Profile, "identity" | "name">;
};

function isHttpHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function resolveHref(href: string, basePath: string) {
  if (!basePath || !href.startsWith("/")) return href;

  const normalizedBasePath = `/${basePath}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return href === "/" ? `${normalizedBasePath}/` : `${normalizedBasePath}${href}`;
}

function FooterLink({ basePath, item }: { basePath: string; item: NavigationItem }) {
  const href = resolveHref(item.href, basePath);

  return item.href.startsWith("/") ? (
    <Link href={href} prefetch={false}>
      {item.label}
    </Link>
  ) : (
    <a
      href={href}
      rel={isHttpHref(item.href) ? "noreferrer" : undefined}
      target={isHttpHref(item.href) ? "_blank" : undefined}
    >
      {item.label}
    </a>
  );
}

export function SiteFooter({ basePath = "", navigation, profile }: SiteFooterProps) {
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-footer__identity">
        <strong>{profile.name}</strong>
        <span>{profile.identity}</span>
      </div>

      <nav aria-label="Footer navigation" className="portfolio-footer__nav">
        {[...navigation.primary, ...(navigation.secondary ?? [])].map((item) => (
          <FooterLink basePath={basePath} item={item} key={item.id} />
        ))}
      </nav>

      <span className="portfolio-visually-hidden">© {new Date().getFullYear()} {profile.name}</span>
    </footer>
  );
}
