import { SiteContainer } from "@/components/v1/foundations/site-container";
import type { LinkState, Profile } from "@/content/types";

type SiteFooterProps = {
  profile: Profile;
};

type ProfileLink = {
  href: string;
  label: string;
};

function publicProfileLink(label: string, link: LinkState): ProfileLink | null {
  return link.status === "public" ? { href: link.url, label } : null;
}

export function SiteFooter({ profile }: SiteFooterProps) {
  const profileLinks = [
    publicProfileLink("GitHub", profile.github),
    publicProfileLink("LinkedIn", profile.linkedin),
    publicProfileLink("Resume", profile.resume),
  ].filter((link): link is ProfileLink => link !== null);

  return (
    <footer className="opg-site-footer">
      <SiteContainer className="opg-site-footer__inner">
        <div className="opg-site-footer__identity">
          <p>{profile.name}</p>
          <p>{profile.positioning}</p>
        </div>

        <nav aria-label="Contact and profiles" className="opg-site-footer__links">
          <a href={`mailto:${profile.email}`}>Email</a>
          {profileLinks.map((link) => (
            <a href={link.href} key={link.label} rel="noreferrer" target="_blank">
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </nav>
      </SiteContainer>
    </footer>
  );
}
