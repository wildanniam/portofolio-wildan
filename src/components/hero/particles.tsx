"use client";

import * as React from "react";

type Particle = {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    baseAlpha: number;
    twinklePhase: number;
    color: string;
};

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function Particles() {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const particlesRef = React.useRef<Particle[]>([]);
    const scrollRef = React.useRef(0);

    React.useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { alpha: true }) as CanvasRenderingContext2D;
        if (!ctx) return;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(canvas.clientWidth * dpr);
            canvas.height = Math.floor(canvas.clientHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener("resize", resize);

        // Colors from design tokens (fallbacks in case CSS variables not resolved)
        const getVar = (v: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(v) || fallback;
        const purpleFrom = getVar("--brand-primary-from", "#6F64FF").trim() || "#6F64FF";
        const purpleTo = getVar("--brand-primary-to", "#5B49E8").trim() || "#5B49E8";
        const green = getVar("--accent-secure", "#4BB255").trim() || "#4BB255";
        const palette = [purpleFrom, purpleTo, green];

        // Init particles (density light)
        const PARTICLE_COUNT = 60;
        const SPEED = 0.15; // px/frame
        const particles: Particle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.clientWidth,
                y: Math.random() * canvas.clientHeight,
                r: Math.random() * 1.8 + 0.8,
                vx: (Math.random() - 0.5) * SPEED,
                vy: (Math.random() - 0.5) * SPEED,
                baseAlpha: Math.random() * 0.25 + 0.1,
                twinklePhase: Math.random() * Math.PI * 2,
                color: pick(palette),
            });
        }
        particlesRef.current = particles;

        function step() {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            ctx.clearRect(0, 0, w, h);

            // gentle parallax based on scroll
            const offsetY = (scrollRef.current / 1000) * 12; // up to ~12px

            for (const p of particlesRef.current) {
                p.x += p.vx;
                p.y += p.vy;
                // wrap around edges softly
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;

                // twinkle
                p.twinklePhase += 0.01 + Math.random() * 0.005;
                const alpha = p.baseAlpha + Math.sin(p.twinklePhase) * 0.1;

                ctx.globalAlpha = Math.max(0, Math.min(0.5, alpha));
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y + offsetY, p.r, 0, Math.PI * 2);
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(step);
        }
        rafRef.current = requestAnimationFrame(step);

        const onScroll = () => {
            scrollRef.current = window.scrollY;
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <div className="absolute inset-0 -z-20 pointer-events-none">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
}

export default Particles;


