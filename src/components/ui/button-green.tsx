"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SizeKey = "sm" | "md" | "lg" | "now";

type ButtonGreenProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string | React.ReactNode;
    size?: SizeKey;
    fullWidth?: boolean;
    loading?: boolean;
    iconSize?: number | string;
    iconClassName?: string;
    textSize?: string;
    fontWeight?: "normal" | "medium" | "semibold" | "bold";
    textClassName?: string;
};

const ButtonGreen: React.FC<ButtonGreenProps> = ({
    children,
    icon,
    onClick,
    className = "",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    type = "button",
    iconSize,
    iconClassName = "",
    textSize,
    fontWeight,
    textClassName = "",
    ...props
}) => {
    const sizeMap: Record<SizeKey, { padding: string; text: string; icon: string }> = {
        sm: { padding: "px-4 py-2", text: "text-[13px]", icon: "w-[16px] h-[16px]" },
        md: { padding: "px-6 py-3", text: "text-[16px]", icon: "w-[18px] h-[18px]" },
        lg: { padding: "px-8 py-4", text: "text-[18px]", icon: "w-[20px] h-[20px]" },
        now: { padding: "px-3 py-2", text: "text-[14px]", icon: "w-[16px] h-[16px]" },
    };

    const s = sizeMap[size] || sizeMap.md;

    const weightClassMap: Record<NonNullable<ButtonGreenProps["fontWeight"]>, string> = {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
    };

    const iconNode = icon && (
        typeof icon === "string" ? (
            <img
                src={icon}
                alt="icon"
                className={cn("select-none", typeof iconSize === "string" ? iconSize : s.icon, iconClassName)}
                style={typeof iconSize === "number" ? { width: iconSize, height: iconSize } : undefined}
            />
        ) : (
            icon
        )
    );

    const content = (
        <>
            {iconNode}
            <span className={cn("tracking-wide", textSize ? textSize : s.text, weightClassMap[fontWeight || "semibold"], "text-[#0A4C2A]", textClassName)}>
                {children}
            </span>
        </>
    );

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "relative inline-flex items-center justify-center gap-3 rounded-full overflow-hidden",
                s.padding,
                fullWidth ? "w-full" : "",
                "bg-gradient-to-b from-[#99E39E] to-[#4BB255]",
                "border border-white/15 shadow-[0_8px_24px_rgba(75,178,85,0.45),inset_0_-2px_6px_rgba(0,0,0,0.35)]",
                "transition-all duration-200 ease-out will-change-transform",
                "hover:shadow-[0_12px_28px_rgba(75,178,85,0.6),inset_0_-2px_8px_rgba(0,0,0,0.35)] hover:-translate-y-[1px]",
                "active:translate-y-0 active:shadow-[0_6px_18px_rgba(75,178,85,0.45),inset_0_-1px_4px_rgba(0,0,0,0.4)]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                className
            )}
            {...props}
        >
            <span className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(120%_120%_at_50%_120%,rgba(75,178,85,0.25)_0%,rgba(75,178,85,0)_60%)] blur-md" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(120%_60%_at_50%_-30%,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_60%)]" />
            <span className="relative z-[1] flex items-center gap-2">
                {loading ? (
                    <span className={cn("flex items-center gap-2", s.text)}>
                        <svg className="animate-spin h-4 w-4 text-[#0A4C2A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span>Loading...</span>
                    </span>
                ) : (
                    content
                )}
            </span>
        </button>
    );
};

export default ButtonGreen;


