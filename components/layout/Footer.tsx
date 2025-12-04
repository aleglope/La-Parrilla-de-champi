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
        <div className="flex justify-center space-x-6 text-sm text-ash-400 font-body">
          <Link
            href="/menu"
            className="hover:text-flame-blue-bright transition-colors"
          >
            {t.nav.menu}
          </Link>
          <span>|</span>
          <Link
            href="/#story"
            className="hover:text-flame-blue-bright transition-colors"
          >
            {t.story.title}
          </Link>
          <span>|</span>
          <Link
            href="/admin"
            className="hover:text-flame-blue-bright transition-colors"
          >
            Admin
          </Link>
        </div>
        <div className="flex justify-center space-x-6 text-xs text-ash-500 font-body mt-6">
          <Link href="/aviso-legal" className="hover:text-ash-300">
            {t.footer.legalNotice}
          </Link>
        </div>
        <p className="text-xs text-ash-500 font-body mt-4">
          © 2025 La Parrilla de Champi. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
