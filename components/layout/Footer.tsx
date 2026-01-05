"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 bg-charcoal-dark border-t border-flame-blue/20 py-12">
      <div className="container-custom text-center">
        <h3 className="text-2xl font-heading font-bold text-fire-red mb-4">
          ¡Que pasa gentuza!
        </h3>
        <p className="text-ash-400 font-body mb-6">
          La Parrilla de Champi - {t.nav.subtitle}
        </p>
        <div className="flex justify-center items-center gap-3 md:gap-6 text-base md:text-sm text-ash-400 font-body">
          <Link
            href="/menu"
            className="py-3 px-2 hover:text-flame-blue-bright transition-colors touch-manipulation"
          >
            {t.nav.menu}
          </Link>
          <span className="select-none">|</span>
          <Link
            href="/#story"
            className="py-3 px-2 hover:text-flame-blue-bright transition-colors touch-manipulation"
          >
            {t.story.title}
          </Link>
          <span className="select-none">|</span>
          <Link
            href="/admin"
            className="py-3 px-2 hover:text-flame-blue-bright transition-colors touch-manipulation"
          >
            Admin
          </Link>
        </div>
        <div className="flex justify-center flex-wrap gap-4 text-xs text-ash-500 font-body mt-6">
          <Link href="/aviso-legal" className="hover:text-ash-300">
            {t.footer.legalNotice}
          </Link>
          <span>|</span>
          <Link href="/politica-privacidad" className="hover:text-ash-300">
            {t.footer.privacyPolicy}
          </Link>
          <span>|</span>
          <Link href="/politica-cookies" className="hover:text-ash-300">
            {t.footer.cookiePolicy}
          </Link>
        </div>
        <p className="text-xs text-ash-500 font-body mt-4">
          © 2025 La Parrilla de Champi. {t.footer.rights}
        </p>
        <div className="mt-4 flex w-full justify-center md:justify-end">
          <p className="text-xs text-ash-500 font-body">
            Creada y diseñada por{" "}
            <a
              href="https://www.aleglopez.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame-blue-bright hover:text-flame-blue-glow active:text-flame-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-red/60"
            >
              Aleglopez.tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
