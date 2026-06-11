"use client";

import React from "react";
import Link from "next/link";

interface BrandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  withGlow?: boolean;
}

// Base del botón: neumorphism en reposo, glow azul en hover, inset en active,
// sliding line (::before) y máscara interior glass (::after).
const brandBtnClasses = [
  "brand-btn font-heading",
  "relative z-[1] flex h-[3em] w-full min-w-[9em] cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-[30em] border border-white/10 bg-transparent px-[1.5em] py-0 text-[15px] font-bold text-white no-underline",
  // Neumorphism para tema oscuro + transiciones
  "[box-shadow:6px_6px_12px_#1a2324,-6px_-6px_12px_#364647]",
  "[transition:box-shadow_0.3s_ease,transform_0.1s_ease]",
  // Hover: glow azul #1789C0 + elevación
  "hover:[box-shadow:0_0_20px_#1789c0,0_0_40px_rgba(23,137,192,0.4)]",
  "hover:[transform:translateY(-2px)]",
  // Active: sombras inset + scale
  "active:[box-shadow:inset_4px_4px_12px_#1a2324,inset_-4px_-4px_12px_#364647]",
  "active:[transform:scale(0.98)]",
  // Sliding line background effect (::before)
  "before:pointer-events-none before:absolute before:left-[-100%] before:top-0 before:z-[5] before:h-full before:w-full before:rounded-[30em] before:content-['']",
  "before:[background:linear-gradient(120deg,transparent,rgba(23,137,192,0.4),transparent)]",
  "before:[transition:all_0.6s_ease]",
  "hover:before:left-full",
  // Inner mask glass (::after) - ESTE ES EL FONDO
  "after:pointer-events-none after:absolute after:inset-[2px] after:z-[-1] after:rounded-[30em] after:bg-[rgba(40,52,53,0.6)] after:content-['']",
  "after:[backdrop-filter:blur(8px)]",
].join(" ");

// Borde de luz animado (withGlow): gradiente cónico rotando 3s (keyframe rotate
// registrado en tailwind.config.ts, animación brand-rotate).
const dotsBorderClasses = [
  "dots_border",
  "pointer-events-none absolute left-1/2 top-1/2 z-[-2] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-[30em] bg-transparent",
  "[transform:translate(-50%,-50%)]",
  "before:absolute before:left-1/2 before:top-1/2 before:z-[-1] before:h-[200%] before:w-[200%] before:animate-brand-rotate before:content-['']",
  "before:[background:conic-gradient(from_0deg,transparent_0%,transparent_80%,rgba(255,255,255,0.8)_100%)]",
  "before:[transform:translate(-50%,-50%)_rotate(0deg)]",
].join(" ");

const BrandButton = ({
  children,
  className,
  href,
  withGlow = true,
  ...props
}: BrandButtonProps) => {
  if (href) {
    return (
      <div className={`inline-block${className ? ` ${className}` : ""}`}>
        {/* Pasamos ...props al Link también, excepto href y className que ya se pasan */}
        <Link href={href} className={brandBtnClasses} {...(props as any)}>
          {withGlow && <div className={dotsBorderClasses} />}
          <span className="btn-content relative z-10">{children}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`inline-block${className ? ` ${className}` : ""}`}>
      <button {...props} className={brandBtnClasses}>
        {withGlow && <div className={dotsBorderClasses} />}
        <span className="btn-content relative z-10">{children}</span>
      </button>
    </div>
  );
};

export default BrandButton;
