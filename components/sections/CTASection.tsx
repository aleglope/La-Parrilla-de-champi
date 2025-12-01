'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import BrandButton from '@/components/ui/BrandButton';

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
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '30% 60% 70% 40% / 50% 60% 30% 60%',
              '60% 40% 30% 70% / 60% 30% 70% 40%',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-br from-fire-red/20 to-flame-blue/20 blur-2xl"
        />

        <div className="relative z-10">
          <motion.h2
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="text-fire-glow">{t.cta.title}</span>
            <br />
            <span className="gradient-text">{t.cta.subtitle}</span>
          </motion.h2>

          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <BrandButton href="/menu" className="w-full sm:w-auto">
              {t.nav.menu} 📱
            </BrandButton>
            <BrandButton href="/#story" className="w-full sm:w-auto">
              {t.story.cta}
            </BrandButton>
          </div>

          {/* QR Code placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 inline-block"
          >
            <div className="bg-white p-6 rounded-2xl shadow-2xl">
              <div className="w-40 h-40 bg-charcoal-dark rounded-lg flex items-center justify-center">
                <span className="text-6xl">📲</span>
              </div>
              <p className="text-charcoal-dark font-bold mt-4">Escanea aquí</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
