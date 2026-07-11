import { SiteFooter } from "@/components/v1/shell/site-footer";
import { SiteHeader } from "@/components/v1/shell/site-header";
import { SkipLink } from "@/components/v1/shell/skip-link";
import { getSiteShell } from "@/content/queries.server";

export default function PortfolioSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { navigation, profile } = getSiteShell();

  return (
    <div className="opg-site-shell">
      <SkipLink />
      <SiteHeader navigation={navigation} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter profile={profile} />
    </div>
  );
}
