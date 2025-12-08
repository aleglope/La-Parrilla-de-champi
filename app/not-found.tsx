"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFoundPage() {
  const { language } = useLanguage();

  return (
    <div className="h-screen w-screen bg-charcoal flex items-center justify-center relative overflow-hidden">
      {/* Animated background embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-fire-red rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 40 - 20, 0],
              scale: [1, 1.5, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10 px-4 py-8 flex items-center justify-center min-h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Animated 404 - Responsive sizing */}
          <motion.div
            className="mb-2 md:mb-4"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <h1 className="text-[8rem] sm:text-[10rem] md:text-[11rem] lg:text-[13rem] font-display leading-none">
              <span className="gradient-text drop-shadow-[0_0_40px_rgba(192,31,25,0.5)]">
                404
              </span>
            </h1>
          </motion.div>

          {/* Humorous message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 md:p-6 lg:p-8 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-fire-red mb-3 md:mb-4">
              {language === "es"
                ? "¡Que pasa gentuza! 🔥"
                : "¡Que pasa xentuza! 🔥"}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-ash-200 font-body mb-2 md:mb-3">
              {language === "es"
                ? "¡Esta página se quemó más que un chuletón olvidado en la parrilla!"
                : "¡Esta páxina queimouse máis que un chuletón esquecido na parrilla!"}
            </p>
            <p className="text-base md:text-lg text-ash-300 font-body mb-4 md:mb-5">
              {language === "es"
                ? "Parece que te has perdido entre las brasas... ¡Pero tranqui! Te llevamos de vuelta al calor del hogar."
                : "Parece que te perdiches entre as brasas... ¡Pero tranqui! Levámoste de volta ao calor do fogar."}
            </p>

            {/* Fun stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-5 text-center">
              <div className="bg-charcoal-light/50 rounded-xl p-3 md:p-4 border border-fire-red/30">
                <div className="text-2xl md:text-4xl font-display text-fire-red mb-1 md:mb-2">
                  404
                </div>
                <div className="text-xs md:text-sm text-ash-400 font-body uppercase tracking-wider">
                  {language === "es" ? "Grados" : "Graos"}
                </div>
              </div>
              <div className="bg-charcoal-light/50 rounded-xl p-3 md:p-4 border border-flame-blue/30">
                <div className="text-2xl md:text-4xl font-display text-flame-blue-bright mb-1 md:mb-2">
                  0
                </div>
                <div className="text-xs md:text-sm text-ash-400 font-body uppercase tracking-wider">
                  {language === "es" ? "Páginas" : "Páxinas"}
                </div>
              </div>
              <div className="bg-charcoal-light/50 rounded-xl p-3 md:p-4 border border-fire-red/30">
                <div className="text-2xl md:text-4xl font-display text-fire-red mb-1 md:mb-2">
                  100%
                </div>
                <div className="text-xs md:text-sm text-ash-400 font-body uppercase tracking-wider">
                  {language === "es" ? "Hambre" : "Fame"}
                </div>
              </div>
            </div>

            {/* Funny quote */}
            <motion.div
              className="bg-gradient-to-r from-fire-red/10 to-flame-blue/10 border-l-4 border-fire-red p-4 md:p-6 rounded-lg mb-4 md:mb-5"
              animate={{
                borderColor: ["#C01F19", "#1789C0", "#C01F19"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <p className="text-sm md:text-lg italic text-ash-200 font-body">
                {language === "es"
                  ? '"No te preocupes, hasta los mejores parrilleros se equivocan de vez en cuando... ¡Pero yo nunca! MASIVO SUUUUIIII!!!"'
                  : '"Non te preocupes, ata os mellores parrilleiros equivócanse de vez en cando... ¡Pero eu nunca! MASIVO SUUUUIIII!!!"'}
              </p>
              <p className="text-xs md:text-sm text-ash-400 mt-2 font-heading">
                - Champi
              </p>
            </motion.div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
              <Link href="/" className="flex-1 sm:flex-initial">
                <motion.button
                  className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-fire-red to-fire-red-dark text-white font-heading font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-fire-red/50 transition-all duration-300 uppercase tracking-wider"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === "es" ? "🏠 Inicio" : "🏠 Inicio"}
                </motion.button>
              </Link>
              <Link href="/menu" className="flex-1 sm:flex-initial">
                <motion.button
                  className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white font-heading font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-flame-blue-bright/50 transition-all duration-300 uppercase tracking-wider"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === "es" ? "🍖 Carta" : "🍖 Carta"}
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Easter egg */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs md:text-sm text-ash-500 font-body italic mt-4"
          >
            {language === "es"
              ? "Consejo pro: Si sigues perdido, siempre puedes seguir el olor a carne a la brasa 🔥"
              : "Consello pro: Se segues perdido, sempre podes seguir o cheiro a carne á brasa 🔥"}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
