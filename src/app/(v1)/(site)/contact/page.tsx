import { ActionLink } from "@/components/v1/foundations/action-link";
import { EditorialGrid } from "@/components/v1/foundations/editorial-grid";
import { SiteContainer } from "@/components/v1/foundations/site-container";
import { getContactProfile } from "@/content/queries.server";
import type { LinkState } from "@/content/types";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "Contact",
  description:
    "Contact Wildan Syukri Niam about software engineering, AI, Web3, and ambitious product work.",
  pathname: "/contact",
});

type PublicContactLink = {
  href: string;
  label: string;
};

function publicContactLink(
  label: string,
  state: LinkState,
): PublicContactLink | null {
  return state.status === "public" ? { href: state.url, label } : null;
}

export default function ContactPage() {
  const profile = getContactProfile();
  const publicLinks = [
    publicContactLink("GitHub", profile.github),
    publicContactLink("LinkedIn", profile.linkedin),
    publicContactLink("Resume", profile.resume),
  ].filter((link): link is PublicContactLink => link !== null);

  return (
    <article className="opg-contact-page" data-contact-page>
      <SiteContainer>
        <header className="opg-contact-opening">
          <EditorialGrid>
            <p className="opg-contact-opening__eyebrow">Contact / Direct line</p>
            <h1>Let&apos;s build something worth proving.</h1>
            <p className="opg-contact-opening__summary">{profile.availability}</p>
          </EditorialGrid>
        </header>

        <section aria-labelledby="contact-details-heading" className="opg-contact-details">
          <h2 id="contact-details-heading">Start a conversation</h2>
          <a className="opg-contact-email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>

          <EditorialGrid className="opg-contact-ledger">
            <dl>
              <div>
                <dt>Based in</dt>
                <dd>{profile.location}</dd>
              </div>
              {profile.education ? (
                <div>
                  <dt>Studying</dt>
                  <dd>{profile.education}</dd>
                </div>
              ) : null}
            </dl>

            <nav aria-label="Public profiles" className="opg-contact-links">
              <ActionLink href={`mailto:${profile.email}`}>Email</ActionLink>
              {publicLinks.map((link) => (
                <ActionLink
                  direction="external"
                  href={link.href}
                  key={link.label}
                  target="_blank"
                >
                  {link.label}
                </ActionLink>
              ))}
            </nav>
          </EditorialGrid>
        </section>
      </SiteContainer>
    </article>
  );
}
