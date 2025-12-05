"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { StoryBlock } from "./StoryBlock";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Sección de historia con Scrollytelling
 * Narrativa visual que se revela al hacer scroll
 */
export function StorySection() {
  const { t } = useLanguage();
  const [titleRef, titleInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const storyBlocks = [
    {
      title: "El Fuego que nos une",
      content: t.story.p1,
      iconImage: "/images/llama-de-historia.webp",
      gradient: "from-fire-red/20 to-transparent",
    },
    {
      title: "El Alma del Mar",
      content: t.story.p2,
      iconImage: "/images/ola-del-mar.svg",
      gradient: "from-flame-blue/20 to-transparent",
    },
    {
      title: "Carbón de Calidad",
      content: t.story.p3,
      iconImage: "/images/parrilla.svg",
      imageClassName: "rounded-full border-2 border-white/10",
      gradient: "from-charcoal-dark/60 to-charcoal/30",
    },
    {
      title: "Carne Premium",
      content: t.story.p4,
      iconImage: "/images/parrilla-carne.svg",
      imageClassName: "rounded-full border-2 border-white/10",
      gradient: "from-fire-red/30 to-fire-red-dark/10",
    },
  ];

  return (
    <div className="container-custom relative">
      {/* Título de la sección */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 50 }}
        animate={titleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h2 className="text-5xl md:text-7xl font-display mb-6">
          <span className="gradient-text">{t.story.title}</span>
        </h2>
        <p className="text-xl text-ash-300 font-body max-w-2xl mx-auto">
          {t.story.subtitle}
        </p>
      </motion.div>

      {/* Bloques de historia */}
      <div className="space-y-32">
        {storyBlocks.map((block, index) => (
          <StoryBlock
            key={index}
            title={block.title}
            content={block.content}
            iconImage={block.iconImage}
            imageClassName={block.imageClassName}
            gradient={block.gradient}
            index={index}
          />
        ))}
      </div>

      {/* Frase final */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-center mt-32 mb-20"
      >
        <div className="glass-card inline-block px-12 py-8">
          <p className="text-3xl md:text-4xl font-display text-ember mb-4">
            "Donde el fuego encuentra al mar"
          </p>
          <p className="text-ash-400 font-body text-lg">
            — La filosofía de La Parrilla de Champi
          </p>
        </div>
      </motion.div>
    </div>
  );
}
