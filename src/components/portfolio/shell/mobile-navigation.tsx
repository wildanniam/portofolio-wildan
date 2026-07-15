"use client";

import { useId, useRef, useState } from "react";

import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";

import type { Navigation, Profile } from "@/content/types";

type MobileNavigationProps = {
  basePath?: string;
  currentPath: string;
  navigation: Navigation;
  profile: Pick<Profile, "identity" | "researchDirection">;
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

export function MobileNavigation({
  basePath = "",
  currentPath,
  navigation,
  profile,
}: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useId();
  const titleId = useId();
  const items = [...navigation.primary, ...(navigation.secondary ?? [])];

  const close = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const open = () => {
    dialogRef.current?.showModal();
    setIsOpen(true);
  };

  return (
    <>
      <button
        aria-controls={dialogId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open navigation"
        className="portfolio-menu-trigger"
        onClick={open}
        ref={triggerRef}
        type="button"
      >
        <Menu aria-hidden="true" size={24} strokeWidth={1.6} />
      </button>

      <dialog
        aria-labelledby={titleId}
        className="portfolio-mobile-nav"
        id={dialogId}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.currentTarget === event.target) close();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;

          event.preventDefault();
          close();
        }}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        ref={dialogRef}
      >
        <div className="portfolio-mobile-nav__surface">
          <div className="portfolio-mobile-nav__topline">
            <h2 id={titleId}>Navigate</h2>
            <button
              aria-label="Close navigation"
              className="portfolio-menu-close"
              onClick={close}
              type="button"
            >
              <X aria-hidden="true" size={22} strokeWidth={1.6} />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="portfolio-mobile-nav__links">
            {items.map((item) => {
              const href = resolveHref(item.href, basePath);
              const current = isCurrent(currentPath, item.href);
              const content = (
                <>
                  <span>{item.label}</span>
                  {isHttpHref(item.href) ? (
                    <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.6} />
                  ) : (
                    <ArrowRight aria-hidden="true" size={20} strokeWidth={1.6} />
                  )}
                </>
              );

              return item.href.startsWith("/") ? (
                <Link
                  aria-current={current ? "page" : undefined}
                  href={href}
                  key={item.id}
                  onClick={close}
                  prefetch={false}
                >
                  {content}
                </Link>
              ) : (
                <a
                  href={href}
                  key={item.id}
                  onClick={close}
                  rel={isHttpHref(item.href) ? "noreferrer" : undefined}
                  target={isHttpHref(item.href) ? "_blank" : undefined}
                >
                  {content}
                </a>
              );
            })}
          </nav>

          <p className="portfolio-mobile-nav__note">
            <strong>{profile.identity}</strong>
            <span>{profile.researchDirection}</span>
          </p>
        </div>
      </dialog>
    </>
  );
}
