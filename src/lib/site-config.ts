import type { Metadata } from "next";

export const siteConfig = {
  url: "https://wildanniam.dev",
  name: "Wildan Syukri Niam",
  shortName: "Wildan",
  role: "Software Engineer",
  positioning: "Software Engineer building AI agents and Web3 systems.",
  description:
    "Evidence-backed case studies from Wildan Syukri Niam, a software engineer building AI agents and Web3 systems.",
} as const;

export function absoluteSiteUrl(pathname = "/"): string {
  return new URL(pathname, `${siteConfig.url}/`).toString();
}

type PublicPageMetadataInput = {
  description: string;
  pathname: string;
  title: string;
};

export function createPublicPageMetadata({
  description,
  pathname,
  title,
}: PublicPageMetadataInput): Metadata {
  const socialTitle = `${title} — ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title: socialTitle,
      description,
      type: "website",
      url: absoluteSiteUrl(pathname),
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
    },
  };
}
