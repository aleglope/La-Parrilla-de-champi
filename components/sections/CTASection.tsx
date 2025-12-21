"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import BrandButton from "@/components/ui/BrandButton";

/**
 * Sección de Call-to-Action final
 */
export function CTASection() {
  const { t } = useLanguage();

  return (
    <div className="container-custom">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative glass-card p-12 md:p-20 text-center overflow-hidden"
      >
        {/* Fondo animado */}
        <div className="absolute inset-0 bg-gradient-fire opacity-10 animate-pulse" />

        {/* Efecto líquido */}
        <motion.div
          animate={{
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 60% 70% 40% / 50% 60% 30% 60%",
              "60% 40% 30% 70% / 60% 30% 70% 40%",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-br from-fire-red/20 to-flame-blue/20 blur-2xl"
        />

        <div className="relative z-10">
          <motion.h2
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-display mb-6"
          >
            <span className="text-fire-glow">{t.cta.title}</span>
            <br />
            <span className="gradient-text">{t.cta.subtitle}</span>
          </motion.h2>

          <p className="text-xl md:text-2xl text-ash-300 font-body mb-10 max-w-2xl mx-auto">
            {t.hero.description}
          </p>

          <div className="flex flex-col gap-4 justify-center items-center max-w-md mx-auto w-full">
            <BrandButton
              href="tel:711224328"
              className="w-full"
              withGlow={false}
            >
              <span className="flex items-center justify-center gap-2">
                {t.cta.button}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
            </BrandButton>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <BrandButton href="/menu" className="w-full" withGlow={false}>
                <span className="flex items-center justify-center gap-2">
                  {t.nav.menu}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </span>
              </BrandButton>
              <BrandButton href="/#story" className="w-full" withGlow={false}>
                <span className="flex items-center justify-center gap-2">
                  {t.story.cta}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </BrandButton>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
