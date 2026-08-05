"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { localeHref } from "@/lib/i18n/href";
import { BUSINESS } from "@/lib/config/business";

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="relative z-10 bg-charcoal-dark border-t border-flame-blue/20 py-12">
      <div className="container-custom text-center">
        <h3 className="text-2xl font-heading font-bold text-fire-red mb-4">
          ¡Que pasa gentuza!
        </h3>
        <p className="text-ash-400 font-body mb-10">
          La Parrilla de Champi - {t.nav.subtitle}
        </p>

        {/*
          NAP (nombre, dirección, teléfono) como texto real.
          Antes solo existía dentro del JSON-LD; para un negocio local es la
          señal más valiosa que puede dar una web, y un rastreador no la ve si
          no está en el HTML. Los datos salen de lib/config/business.ts, el
          mismo sitio del que los lee el schema, para que no se contradigan.
        */}
        <address className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-8 text-left not-italic sm:grid-cols-3">
          <div>
            <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-flame-blue-bright">
              {t.footer.addressTitle}
            </h4>
            <p className="font-body text-sm text-ash-300">
              {BUSINESS.address.street}
              <br />
              {t.footer.city}
            </p>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-body text-sm text-ash-400 underline decoration-flame-blue/40 underline-offset-4 transition-colors hover:text-flame-blue-bright"
            >
              {t.footer.viewOnMaps}
            </a>
          </div>

          <div>
            <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-flame-blue-bright">
              {t.footer.hoursTitle}
            </h4>
            <p className="font-body text-sm text-ash-300">
              {t.footer.hoursLunch}
              <br />
              {t.footer.hoursDinner}
            </p>
            <p className="mt-2 font-body text-sm text-ash-500">
              {t.footer.closedDay}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-flame-blue-bright">
              {t.footer.phoneTitle}
            </h4>
            <a
              href={`tel:${BUSINESS.phone.tel}`}
              className="font-body text-lg text-ash-100 transition-colors hover:text-flame-blue-bright"
            >
              {BUSINESS.phone.display}
            </a>
          </div>
        </address>

        <div className="flex justify-center items-center gap-3 md:gap-6 text-base md:text-sm text-ash-400 font-body">
          <Link
            href={localeHref(language, "/menu")}
            className="py-3 px-2 hover:text-flame-blue-bright transition-colors touch-manipulation"
          >
            {t.nav.menu}
          </Link>
          <span className="select-none">|</span>
          <Link
            href={localeHref(language, "/#story")}
            className="py-3 px-2 hover:text-flame-blue-bright transition-colors touch-manipulation"
          >
            {t.story.title}
          </Link>
          <span className="select-none">|</span>
          <Link
            href={localeHref(language, "/admin")}
            className="py-3 px-2 hover:text-flame-blue-bright transition-colors touch-manipulation"
          >
            Admin
          </Link>
        </div>
        <div className="flex justify-center flex-wrap gap-4 text-xs text-ash-500 font-body mt-6">
          <Link
            href={localeHref(language, "/aviso-legal")}
            className="hover:text-ash-300"
          >
            {t.footer.legalNotice}
          </Link>
          <span>|</span>
          <Link
            href={localeHref(language, "/politica-privacidad")}
            className="hover:text-ash-300"
          >
            {t.footer.privacyPolicy}
          </Link>
          <span>|</span>
          <Link
            href={localeHref(language, "/politica-cookies")}
            className="hover:text-ash-300"
          >
            {t.footer.cookiePolicy}
          </Link>
        </div>
        <p className="text-xs text-ash-500 font-body mt-4">
          © {new Date().getFullYear()} La Parrilla de Champi. {t.footer.rights}
        </p>
        <div className="mt-4 flex w-full justify-center md:justify-end">
          <p className="text-xs text-ash-500 font-body">
            {t.footer.credit}{" "}
            <a
              href="https://www.aglwences.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame-blue-bright hover:text-flame-blue-glow active:text-flame-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-red/60"
            >
              aglwences.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
