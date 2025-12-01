"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SocialLink {
  name: string;
  href: string;
  icon: JSX.Element;
  gradient: string;
  delay: number;
}

export function SocialMediaCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  // Detectar si es móvil o tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const socialLinks: SocialLink[] = [
    {
      name: 'Instagram Principal',
      href: 'https://www.instagram.com/laparrilladechampi/',
      icon: (
        <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z" fill="currentColor"/>
        </svg>
      ),
      gradient: 'from-[#fdf497] via-[#ff53d4] to-[#62c2fe]',
      delay: 0,
    },
    {
      name: 'Instagram Stories',
      href: 'https://www.instagram.com/champimuros/',
      icon: (
        <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z" fill="currentColor"/>
        </svg>
      ),
      gradient: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
      delay: 0.2,
    },
    {
      name: 'Twitter/X',
      href: 'https://twitter.com/laparrillachampi',
      icon: (
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" fill="currentColor"/>
        </svg>
      ),
      gradient: 'from-[#91e9ff] to-[#1DA1F2]',
      delay: 0.4,
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/laparrillachampi',
      icon: (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>
        </svg>
      ),
      gradient: 'from-[#4267B2] to-[#1877f2]',
      delay: 0.6,
    },
  ];

  const handleCardClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  // Determinar si debe mostrar los botones (hover en desktop o click en móvil)
  const shouldShowButtons = isMobile ? isExpanded : isHovered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex justify-center items-center py-16 px-4"
    >
      <motion.div
        className={`
          relative w-full max-w-[250px] aspect-square
          bg-gradient-to-br from-charcoal-dark via-ocean to-charcoal-dark
          rounded-[30px] overflow-hidden
          shadow-2xl border-2 border-flame-blue/30
          ${isMobile ? 'cursor-pointer' : ''}
        `}
        onClick={handleCardClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        whileHover={!isMobile ? { scale: 1.02 } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Fondo con gradiente animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-fire-red via-flame-blue to-flame-blue-bright opacity-90"
          animate={{
            background: [
              'linear-gradient(43deg, #C01F19 0%, #314A78 46%, #1789C0 100%)',
              'linear-gradient(43deg, #1789C0 0%, #314A78 46%, #C01F19 100%)',
              'linear-gradient(43deg, #C01F19 0%, #314A78 46%, #1789C0 100%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Logo/Texto "Síguenos" */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          animate={
            shouldShowButtons
              ? { x: '-50%', y: '-90px', scale: 0.85 }
              : { x: '-50%', y: '-50%', scale: 1 }
          }
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-[3px] whitespace-nowrap">
            {t.social.title}
          </h3>
        </motion.div>

        {/* Botones de redes sociales */}
        {socialLinks.map((social, index) => (
          <motion.a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              absolute rounded-[20px] shadow-2xl z-20
              bg-white/20 backdrop-blur-sm
              border-t-2 border-r border-white/50
              transition-all duration-500
              hover:bg-white/30
            `}
            style={{
              width: `${70 - index * 20}%`,
              height: `${70 - index * 20}%`,
            }}
            initial={{ bottom: `-${70 - index * 20}%`, left: `-${70 - index * 20}%` }}
            animate={
              shouldShowButtons
                ? { bottom: '-1px', left: '-1px' }
                : { bottom: `-${70 - index * 20}%`, left: `-${70 - index * 20}%` }
            }
            transition={{
              duration: 0.5,
              delay: shouldShowButtons ? social.delay : 0,
              ease: 'easeInOut',
            }}
            onClick={(e) => {
              if (isMobile && !isExpanded) {
                e.preventDefault();
              }
            }}
          >
            {/* Gradiente de fondo del botón */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${social.gradient} opacity-0 transition-opacity duration-300 rounded-[20px]`}
              whileHover={{ opacity: 1 }}
            />

            {/* Icono */}
            <div className="absolute inset-0 flex items-end justify-end p-3 md:p-4">
              <motion.div
                className="w-6 h-6 md:w-7 md:h-7 text-white/90"
                whileHover={{ scale: 1.2, filter: 'drop-shadow(0 0 8px white)' }}
                transition={{ duration: 0.2 }}
              >
                {social.icon}
              </motion.div>
            </div>
          </motion.a>
        ))}

        {/* Botón decorativo pequeño */}
        <motion.div
          className="absolute w-[10%] h-[10%] rounded-[20px] bg-white/10 backdrop-blur-sm border-t border-white/30"
          initial={{ bottom: '-10%', left: '-10%' }}
          animate={
            shouldShowButtons
              ? { bottom: '-1px', left: '-1px' }
              : { bottom: '-10%', left: '-10%' }
          }
          transition={{
            duration: 0.5,
            delay: shouldShowButtons ? 0.8 : 0,
            ease: 'easeInOut',
          }}
        />

        {/* Indicador de click para móviles */}
        {isMobile && !isExpanded && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-body"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t.social.tapHere}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

