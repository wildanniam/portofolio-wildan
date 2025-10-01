"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = { id: string; label: string };
const items: NavItem[] = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
];

function useScrollSpy(ids: string[], rootMargin = "-50% 0px -40% 0px") {
    const [active, setActive] = React.useState<string>(ids[0] ?? "home");
    React.useEffect(() => {
        const sections = ids
            .map((id) => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];
        if (sections.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { root: null, rootMargin, threshold: 0.1 }
        );
        sections.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [ids, rootMargin]);
    return active;
}

function NavLinks({ orientation = "row", onClick }: { orientation?: "row" | "col"; onClick?: () => void }) {
    const active = useScrollSpy(items.map((i) => i.id));
    return (
        <nav className={cn("flex gap-1", orientation === "col" && "flex-col gap-2")}>
            {items.map((item) => {
                const isActive = active === item.id;
                return (
                    <a key={item.id} href={item.id === "home" ? "#" : `#${item.id}`} onClick={onClick}
                        className={cn(
                            "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                            "text-foreground/80 hover:text-foreground",
                            isActive && "text-foreground"
                        )}
                    >
                        <span className="relative z-10">{item.label}</span>
                        {isActive && (
                            <motion.span
                                layoutId="active-pill"
                                className="absolute inset-0 rounded-full brand-gradient opacity-90"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        {!isActive && (
                            <span className="absolute inset-0 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm" />
                        )}
                    </a>
                );
            })}
        </nav>
    );
}

export function Navbar() {
    const [scrolled, setScrolled] = React.useState(false);
    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className={cn("sticky top-0 z-50 flex w-full justify-center ")}>
            <div
                className={cn(
                    "w-full transition-all duration-300",
                    scrolled ? "max-w-5xl" : "max-w-none",
                )}
            >
                <div
                    className={cn(
                        "glass border border-border/60 shadow-sm mx-auto",
                        "flex items-center justify-between",
                        "transition-all duration-300",
                        scrolled
                            ? "rounded-full px-4 py-2 backdrop-blur-md"
                            : "rounded-none px-6 py-4 backdrop-blur-lg"
                    )}
                >
                    {/* Left brand */}
                    <a href="#" className={cn("flex items-center gap-3", scrolled ? "text-base" : "text-lg")}>
                        <span className={cn("rounded-full bg-[color:var(--accent-secure)]", scrolled ? "size-2.5" : "size-3")} />
                        <span className="font-semibold gradient-text">Wildan</span>
                    </a>

                    {/* Desktop nav */}
                    <div className="hidden md:block">
                        <div className={cn("transition-all", scrolled ? "scale-95" : "scale-100")}>
                            <NavLinks />
                        </div>
                    </div>

                    {/* Right spacer / mobile trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top" className="glass border-border/60">
                                <div className="pt-8">
                                    <NavLinks orientation="col" />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </div>
    );
}


