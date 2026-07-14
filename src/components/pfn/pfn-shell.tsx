import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PfnMobileNav } from "./pfn-mobile-nav";

const primary = [
  { href: "/work", label: "Work" },
  { href: "/moments", label: "Moments" },
  { href: "/about", label: "About" },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || (href === "/work" && pathname.startsWith("/work/"));
}

export function PfnHeader({
  basePath = "",
  currentPath = "/",
}: {
  basePath?: string;
  currentPath?: string;
}) {
  const mobileItems = [
    ...primary.map((item) => ({
      current: isCurrent(currentPath, item.href),
      href: `${basePath}${item.href}`,
      label: item.label,
    })),
    {
      current: currentPath === "/contact",
      href: `${basePath}/contact`,
      label: "Contact",
    },
  ];

  return (
    <header className="pfn-header">
      <Link className="pfn-wordmark" href={`${basePath}/` || "/"} prefetch={false}>
        <span>Wildan</span>
        <span>Niam</span>
      </Link>

      <nav aria-label="Primary navigation" className="pfn-header__nav">
        {primary.map((item) => (
          <Link
            aria-current={isCurrent(currentPath, item.href) ? "page" : undefined}
            href={`${basePath}${item.href}`}
            key={item.href}
            prefetch={false}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        aria-current={currentPath === "/contact" ? "page" : undefined}
        className="pfn-header__contact"
        href={`${basePath}/contact`}
        prefetch={false}
      >
        Start a conversation
        <ArrowUpRight aria-hidden="true" size={16} />
      </Link>

      <PfnMobileNav items={mobileItems} />
    </header>
  );
}
