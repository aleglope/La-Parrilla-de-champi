import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n-config";
import { translations } from "@/lib/i18n/translations";
import { VACACIONES_RETURN_DATE, VACACIONES_TEXTS } from "@/lib/event/vacaciones";
import AnimatedContent from "@/components/react-bits/AnimatedContent";
import TiltedCard from "@/components/react-bits/TiltedCard";
import styles from "./vacaciones.module.css";

interface VacacionesPageProps {
  lang: Locale;
  preview?: boolean;
}

export default function VacacionesPage({ lang, preview = false }: VacacionesPageProps) {
  const texts = VACACIONES_TEXTS[lang];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href={`/${lang}`} className={styles.brand} prefetch={false}>
          <Image
            src="/Logo-Bento-Hero.svg"
            width={48}
            height={64}
            alt=""
            className={styles.brandLogo}
          />
          <span className={styles.brandText}>
            <span className={styles.brandName}>LA PARRILLA DE CHAMPI</span>
            <span className={styles.brandSubtitle}>{translations[lang].nav.subtitle}</span>
          </span>
        </Link>
        <nav aria-label={texts.language} className={styles.languages}>
          <Link href={preview ? "/es/vacaciones-preview" : "/es"} hrefLang="es" lang="es" aria-current={lang === "es" ? "page" : undefined} prefetch={false}>ES</Link>
          <span aria-hidden="true">/</span>
          <Link href={preview ? "/gl/vacaciones-preview" : "/gl"} hrefLang="gl" lang="gl" aria-current={lang === "gl" ? "page" : undefined} prefetch={false}>GL</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="vacation-heading">
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span aria-hidden="true" />{texts.eyebrow}</p>
          <AnimatedContent distance={24}>
            <h1 id="vacation-heading" className={styles.heading}>
              <span>{texts.headingStart} </span>
              <span className={styles.headingBlue}>{texts.headingEnd}</span>
            </h1>
          </AnimatedContent>
          <p className={styles.description}>{texts.description}</p>
          <p className={styles.detail}>{texts.detail}</p>

          <time dateTime={VACACIONES_RETURN_DATE} aria-label={texts.returnDateFull} className={styles.returnDate}>
            <span className={styles.returnLabel}>{texts.returnLabel}</span>
            <strong className={styles.returnDay}>12</strong>
            <span className={styles.returnMonth}>{texts.monthPrefix}<br />{texts.month}</span>
            <svg className={styles.returnArrow} width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M6 15h18M16 7l8 8-8 8" stroke="currentColor" strokeWidth="1.5" /></svg>
          </time>
        </div>

        <AnimatedContent className={styles.artwork} distance={42} scale={0.96} rotate={1.2} delay={0.08}>
          <div className={styles.sun} aria-hidden="true">✳</div>
          <TiltedCard className={styles.mascot}>
            <Image
              src="/vacaciones/champi-vacaciones.webp"
              width={1400}
              height={1120}
              alt={texts.imageAlt}
              priority
              sizes="(max-width: 760px) 100vw, 58vw"
              className={styles.image}
            />
          </TiltedCard>
          <p className={styles.badge}><span aria-hidden="true">☀</span>{texts.badge}</p>
        </AnimatedContent>
      </section>

      <footer className={styles.footer}>
        <p className={styles.location}><span aria-hidden="true">↗</span> Noia, Galicia</p>
        <p className={styles.farewell}>{texts.footer}</p>
        {preview ? (
          <Link href={`/${lang}/menu`} className={styles.menuLink} prefetch={false}>
            <span className={styles.menuDesktop}>{texts.menu}</span>
            <span className={styles.menuMobile}>{texts.menuShort}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ) : (
          <div className={styles.legalLinks}>
            <Link href={`/${lang}/aviso-legal`} prefetch={false}>{translations[lang].footer.legalNotice}</Link>
            <Link href={`/${lang}/politica-privacidad`} prefetch={false}>{translations[lang].footer.privacyPolicy}</Link>
            <Link href={`/${lang}/politica-cookies`} prefetch={false}>{translations[lang].footer.cookiePolicy}</Link>
          </div>
        )}
      </footer>
    </main>
  );
}
