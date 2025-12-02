"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import BrandButton from "@/components/ui/BrandButton";
import Link from "next/link";

export function MenuHeader() {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "gl" : "es");
  };

  return (
    <header className="sticky top-0 z-50 bg-charcoal-dark/95 backdrop-blur-lg border-b border-flame-blue/20">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="group">
            <h1 className="text-xl md:text-2xl font-display uppercase tracking-[0.45em] text-ash-50 drop-shadow-[0_5px_20px_rgba(0,0,0,0.55)] transition-colors group-hover:text-fire-red">
              LA PARRILLA DE CHAMPI
            </h1>
            <p className="text-xs text-ash-400 font-body uppercase tracking-[0.35em]">
              {t.nav.subtitle}
            </p>
          </Link>

          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <BrandButton
              onClick={toggleLanguage}
              style={{ minWidth: "auto", padding: "0 1rem", height: "2.5em" }}
            >
              <span className="flex items-center space-x-1">
                <span
                  className={`text-xs font-bold transition-colors ${
                    language === "gl"
                      ? "text-flame-blue-bright"
                      : "text-ash-400"
                  }`}
                >
                  GL
                </span>
                <span className="text-ash-500">/</span>
                <span
                  className={`text-xs font-bold transition-colors ${
                    language === "es" ? "text-fire-red" : "text-ash-400"
                  }`}
                >
                  ES
                </span>
              </span>
            </BrandButton>

            {/* Back Button */}
            <Link
              href="/"
              aria-label={`Volver a ${t.nav.home}`}
              className="hidden sm:block group"
            >
              <span className="inline-flex items-center gap-3 rounded-full border border-flame-blue/30 bg-white/5 px-5 py-2 font-heading text-[0.65rem] uppercase tracking-[0.55em] text-ash-200 transition-all duration-300 group-hover:bg-fire-red/10 group-hover:border-fire-red/50 group-hover:text-ash-50 group-hover:shadow-[0_18px_50px_rgba(192,31,25,0.35)]">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-charcoal-dark via-charcoal-light/30 to-charcoal-dark shadow-[0_10px_25px_rgba(0,0,0,0.45)] text-ash-100 text-lg transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-fire-red/80 group-hover:via-fire-red group-hover:to-flame-blue/60 group-hover:border-transparent group-hover:text-white">
                  <span
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-fire-red/30 via-transparent to-flame-blue/30 blur-md opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="relative">←</span>
                </span>
                {t.nav.home}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
