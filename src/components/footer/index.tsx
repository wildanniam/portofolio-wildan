import { profile, socials } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-white/48 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-[color:var(--ink)]">{profile.name}</p>
          <p className="mt-1">{profile.statement}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noreferrer" : undefined}
              className="transition hover:text-white"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
