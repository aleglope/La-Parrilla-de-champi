'use client';

import { motion } from 'framer-motion';

/**
 * Logo animado con efecto de fuego y humo
 */
export function AnimatedLogo() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2 
      }}
      className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8"
    >
      {/* Círculo exterior con efecto de pulso */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-fire-red to-flame-blue-bright blur-xl"
      />
      
      {/* Logo principal */}
      <div className="relative z-10 w-full h-full rounded-full bg-gradient-fire flex items-center justify-center shadow-fire p-4">
        <motion.img
          src="/images/logo.svg"
          alt="La Parrilla de Champi"
          animate={{
            filter: [
              "drop-shadow(0 0 20px rgba(193, 31, 25, 0.8))",
              "drop-shadow(0 0 40px rgba(193, 31, 25, 1))",
              "drop-shadow(0 0 20px rgba(193, 31, 25, 0.8))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Partículas flotantes alrededor */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, Math.cos(i * 60 * Math.PI / 180) * 50],
            y: [0, Math.sin(i * 60 * Math.PI / 180) * 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute top-1/2 left-1/2 w-2 h-2 bg-fire-red rounded-full"
          style={{
            boxShadow: '0 0 10px rgba(193, 31, 25, 0.8)',
          }}
        />
      ))}
    </motion.div>
  );
}

