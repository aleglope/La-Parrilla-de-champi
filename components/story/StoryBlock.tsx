"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef } from "react";
import Image from "next/image";

interface StoryBlockProps {
  readonly title: string;
  readonly content: string;
  readonly icon?: string; // Optional emoji icon (deprecated, use iconImage instead)
  readonly iconImage?: string; // Optional image path for icon
  readonly imageAlt?: string; // Descriptive alt text for SEO
  readonly imageClassName?: string; // Optional custom classes for the image
  readonly gradient: string;
  readonly index: number;
}

/**
 * Bloque individual de historia con animaciones de scroll
 */
export function StoryBlock({
  title,
  content,
  icon,
  iconImage,
  imageAlt,
  imageClassName,
  gradient,
  index,
}: StoryBlockProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Animaciones de parallax - Reducidas para evitar conflictos con el fondo
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Alternar dirección según el índice (izquierda/derecha)
  const isEven = index % 2 === 0;

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        ref={ref}
        style={{ y, scale, opacity }}
        className={`flex flex-col ${
          isEven ? "md:flex-row" : "md:flex-row-reverse"
        } gap-8 md:gap-16 items-center`}
      >
        {/* Icono decorativo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1], // Easing suave personalizado
            delay: 0.1,
          }}
          className="flex-shrink-0"
        >
          <div
            className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br ${gradient} backdrop-blur-sm flex items-center justify-center border border-flame-blue/20 shadow-2xl`}
          >
            {iconImage ? (
              <Image
                src={iconImage}
                alt={imageAlt || title}
                width={128}
                height={128}
                className={`w-20 h-20 md:w-32 md:h-32 object-contain ${
                  imageClassName || ""
                }`}
              />
            ) : (
              <span className="text-6xl md:text-8xl">{icon}</span>
            )}
          </div>
        </motion.div>

        {/* Contenido de texto */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`flex-1 ${
            isEven
              ? "md:text-left"
              : "md:text-right md:flex md:flex-col md:items-end"
          }`}
        >
          <h3 className="text-4xl md:text-5xl font-heading font-bold text-ash-100 mb-6">
            {title}
          </h3>
          <p className="text-xl text-ash-300 font-body leading-relaxed max-w-2xl md:ml-auto md:max-w-[48ch] lg:md:max-w-[52ch] xl:md:max-w-[56ch]">
            {content}
          </p>

          {/* Línea decorativa */}
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: "100%" } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-1 bg-gradient-to-r ${
              isEven
                ? "from-fire-red to-transparent"
                : "from-transparent to-flame-blue-bright"
            } mt-6 max-w-md ${isEven ? "" : "md:ml-auto"}`}
          />
        </motion.div>
      </motion.div>

      {/* Decoración de fondo */}
      <motion.div
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.2, 0]),
        }}
        className={`absolute top-0 ${
          isEven ? "left-0" : "right-0"
        } w-64 h-64 bg-gradient-to-br ${gradient} rounded-full blur-3xl -z-10`}
      />
    </div>
  );
}
