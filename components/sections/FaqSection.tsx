"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Preguntas frecuentes en prosa.
 *
 * No está aquí por los rich results: Google retiró el resultado enriquecido de
 * FAQ en mayo de 2026. Está por citabilidad en buscadores generativos, que
 * extraen pasajes de texto corrido antes que JSON-LD. Antes de esto, la web
 * tenía los datos (dirección, horarios, precios) repartidos entre el pie, las
 * tarjetas y el schema, pero ni una sola frase que respondiera entera a lo que
 * alguien le pregunta a una IA.
 *
 * Los textos evitan cifras volátiles a propósito: la carta se edita desde
 * Supabase y un precio escrito aquí a mano se quedaría desfasado y
 * contradiría a la carta viva.
 */
export function FaqSection() {
  const { t } = useLanguage();

  return (
    <div className="container-custom">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-10 text-center">
          <h2 className="mb-3 font-display text-4xl md:text-5xl">
            <span className="gradient-text">{t.faq.title}</span>
          </h2>
          <p className="font-body text-lg text-ash-300">{t.faq.subtitle}</p>
        </div>

        <dl className="space-y-6">
          {t.faq.items.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-flame-blue/20 bg-charcoal-light/30 p-6"
            >
              <dt className="mb-2 font-heading text-lg font-bold text-ash-50">
                {item.q}
              </dt>
              <dd className="font-body leading-relaxed text-ash-300">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  );
}
