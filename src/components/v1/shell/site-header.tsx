import { SiteContainer } from "@/components/v1/foundations/site-container";
import type { Navigation, NavigationItem } from "@/content/types";

type SiteHeaderProps = {
  navigation: Navigation;
};

function NavigationAnchor({ item }: { item: NavigationItem }) {
  const external = /^https?:\/\//.test(item.href);

  return (
    <a
      href={item.href}
      {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
    >
      {item.label}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

export function SiteHeader({ navigation }: SiteHeaderProps) {
  return (
    <header className="opg-site-header">
      <SiteContainer className="opg-site-header__inner">
        {/* Native navigation keeps the server-only shell free of Link prefetch/runtime code. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          aria-label="Wildan Syukri Niam, home"
          className="opg-site-mark"
          href="/"
        >
          WSN
        </a>

        <nav aria-label="Primary" className="opg-site-navigation">
          <ul className="opg-site-navigation__primary">
            {navigation.primary.map((item) => (
              <li key={item.id}>
                <NavigationAnchor item={item} />
              </li>
            ))}
          </ul>

          {navigation.secondary && navigation.secondary.length > 0 ? (
            <ul className="opg-site-navigation__secondary">
              {navigation.secondary.map((item) => (
                <li key={item.id}>
                  <NavigationAnchor item={item} />
                </li>
              ))}
            </ul>
          ) : null}
        </nav>
      </SiteContainer>
    </header>
  );
}
