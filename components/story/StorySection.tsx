'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { StoryBlock } from './StoryBlock';

/**
 * Sección de historia con Scrollytelling
 * Narrativa visual que se revela al hacer scroll
 */
export function StorySection() {
  const [titleRef, titleInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const storyBlocks = [
    {
      title: 'El Fuego que nos une',
      content: 'Desde hace más de 20 años, La Parrilla de Champi ha sido sinónimo de pasión por la carne a la brasa. Cada plato cuenta una historia de dedicación, técnica y amor por lo auténtico.',
      icon: '🔥',
      gradient: 'from-fire-red/20 to-transparent',
    },
    {
      title: 'El Alma del Mar',
      content: 'Inspirados por la fluidez del océano, nuestro concepto fusiona el poder del fuego con la serenidad del mar. Una experiencia culinaria que fluye como las olas, intensa como las brasas.',
      icon: '🌊',
      gradient: 'from-flame-blue/20 to-transparent',
    },
    {
      title: 'Carbón de Calidad',
      content: 'Seleccionamos cuidadosamente cada pieza de carbón de encina. El secreto está en la brasa perfecta: no muy fuerte para quemar, no muy suave para cocinar. El punto justo que hace brillar cada corte.',
      icon: '⚫',
      gradient: 'from-charcoal/20 to-transparent',
    },
    {
      title: 'Carne Premium',
      content: 'Trabajamos con los mejores proveedores locales para ofrecerte cortes de primera calidad. Cada pieza es seleccionada por nuestro maestro parrillero con más de dos décadas de experiencia.',
      icon: '🥩',
      gradient: 'from-fire-red/20 to-flame-blue/20',
    },
  ];

  return (
    <div className="container-custom">
      {/* Título de la sección */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 50 }}
        animate={titleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h2 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="gradient-text">Nuestra Historia</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Un viaje gastronómico que fusiona tradición, innovación y pasión por el fuego
        </p>
      </motion.div>

      {/* Bloques de historia */}
      <div className="space-y-32">
        {storyBlocks.map((block, index) => (
          <StoryBlock
            key={index}
            title={block.title}
            content={block.content}
            icon={block.icon}
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
          <p className="text-3xl md:text-4xl font-bold text-ember mb-4">
            "Donde el fuego encuentra al mar"
          </p>
          <p className="text-gray-400 text-lg">
            — La filosofía de La Parrilla de Champi
          </p>
        </div>
      </motion.div>
    </div>
  );
}

