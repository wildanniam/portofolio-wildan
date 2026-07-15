import type { Metadata } from "next";

export const siteConfig = {
  url: "https://portofolio-wildan-zeta.vercel.app",
  name: "Wildan Syukri Niam",
  shortName: "Wildan",
  socialImage: {
    alt: "Wildan Syukri Niam working with teammates during a hackathon.",
    height: 630,
    pathname: "/media/site/personal-field-notes-social.webp",
    width: 1200,
  },
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
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title: socialTitle,
      description,
      images: [
        {
          alt: siteConfig.socialImage.alt,
          height: siteConfig.socialImage.height,
          url: absoluteSiteUrl(siteConfig.socialImage.pathname),
          width: siteConfig.socialImage.width,
        },
      ],
      type: "website",
      url: absoluteSiteUrl(pathname),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [absoluteSiteUrl(siteConfig.socialImage.pathname)],
    },
  };
}
