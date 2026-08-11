"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FaqRespuesta } from "@/lib/i18n/faq-render";

/**
 * Preguntas frecuentes.
 *
 * No está aquí por los rich results: Google retiró el resultado enriquecido de
 * FAQ en mayo de 2026. Está por citabilidad en buscadores generativos, que
 * extraen pasajes de texto corrido antes que JSON-LD.
 *
 * PLEGADO CON <details>, Y ESO IMPORTA MÁS DE LO QUE PARECE.
 * Google indexa sin penalización el contenido de acordeones, pero SOLO si el
 * texto está en el HTML servido y únicamente oculto de forma visual. La versión
 * "natural" en React —{abierto && <dd>…</dd>}— lo borra del DOM y lo haría
 * invisible para Google y para cualquier IA, que es justo lo contrario de lo
 * que busca esta sección.
 *
 * `<details>` nativo resuelve las tres cosas a la vez: el contenido está
 * siempre en el HTML, funciona sin JavaScript y es accesible con teclado sin
 * añadir una sola línea de ARIA.
 *
 * La primera va abierta (`defaultOpen`) para que se vea de un vistazo que ahí
 * hay respuestas y no solo titulares.
 */
export function FaqSection() {
  const { t, language } = useLanguage();

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

        <div className="space-y-3">
          {t.faq.items.map((item, i) => (
            <details
              key={item.q}
              open={i === 0}
              className="group rounded-2xl border border-flame-blue/20 bg-charcoal-light/30 px-6 [&[open]]:bg-charcoal-light/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-heading text-lg font-bold text-ash-50 transition-colors marker:content-none hover:text-flame-blue-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-blue-bright/60 [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <svg
                  className="h-5 w-5 shrink-0 text-flame-blue-bright transition-transform duration-300 group-open:rotate-45"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>

              <div className="pb-6 font-body leading-relaxed text-ash-300">
                <FaqRespuesta plantilla={item.a} lang={language} />
              </div>
            </details>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
