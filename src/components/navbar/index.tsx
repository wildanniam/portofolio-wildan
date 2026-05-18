"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#home", label: "Home" },
  { href: "#research", label: "Research" },
  { href: "#work", label: "Work" },
  { href: "#proof", label: "Proof" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3 py-3 md:px-6">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-[8px] border px-3 py-3 transition duration-300 md:px-4",
          scrolled
            ? "border-white/14 bg-[#050706]/82 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl"
            : "border-white/8 bg-[#050706]/45 backdrop-blur-md"
        )}
      >
        <a href="#home" className="flex items-center gap-3">
          <span className="relative flex size-8 items-center justify-center rounded-[8px] border border-[color:var(--signal-mint)]/35 bg-[color:var(--signal-mint)]/10">
            <span className="size-2 rounded-full bg-[color:var(--signal-mint)] shadow-[0_0_18px_var(--signal-mint)]" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-none text-[color:var(--ink)]">
              Wildan
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              AI x Web3
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[8px] px-3 py-2 text-sm text-white/62 transition hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="mailto:wildanniam4@gmail.com"
          className="hidden rounded-[8px] border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-white/25 hover:bg-white/[0.08] md:inline-flex"
        >
          Collaborate
        </a>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex size-10 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.04] text-[color:var(--ink)] md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="mx-auto mt-2 max-w-7xl rounded-[8px] border border-white/12 bg-[#050706]/95 p-2 backdrop-blur-xl md:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-[8px] px-3 py-3 text-sm text-white/72 hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}
