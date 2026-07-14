"use client";

import { useRef } from "react";

import Link from "next/link";

type MobileNavItem = {
  current: boolean;
  href: string;
  label: string;
};

function MenuGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 22 22" width="22">
      <path d="M3 6.5h16M3 15.5h16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 22 22" width="22">
      <path d="m4.5 4.5 13 13m0-13-13 13" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 22 22" width="22">
      <path d="M6 16 16 6m-7 0h7v7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function PfnMobileNav({ items }: { items: MobileNavItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label="Open navigation"
        className="pfn-menu-trigger"
        onClick={() => dialogRef.current?.showModal()}
        ref={triggerRef}
        type="button"
      >
        <MenuGlyph />
      </button>
      <dialog
        aria-labelledby="pfn-mobile-nav-title"
        className="pfn-menu-panel"
        onClick={(event) => {
          if (event.currentTarget === event.target) close();
        }}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="pfn-menu-panel__surface">
          <div className="pfn-menu-panel__topline">
            <h2 id="pfn-mobile-nav-title">Navigate</h2>
            <button aria-label="Close navigation" className="pfn-menu-close" onClick={close} type="button">
              <CloseGlyph />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="pfn-menu-links">
            {items.map((item) => (
              <Link
                aria-current={item.current ? "page" : undefined}
                href={item.href}
                key={item.href}
                onClick={close}
                prefetch={false}
              >
                {item.label}
                <ArrowGlyph />
              </Link>
            ))}
          </nav>
          <p>Software systems, documentary proof, and the decisions behind the build.</p>
        </div>
      </dialog>
    </>
  );
}
