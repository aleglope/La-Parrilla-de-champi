"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const socialLinks: SocialLink[] = [
    {
      name: "Instagram Principal",
      href: "https://www.instagram.com/laparrilladechampi/",
      icon: (
        <svg
          viewBox="0 0 30 30"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"
            fill="currentColor"
          />
        </svg>
      ),
      gradient: "from-fire-red via-fire-red-glow to-flame-blue-bright",
      delay: 0,
    },
    {
      name: "Instagram Stories",
      href: "https://www.instagram.com/champimuros/",
      icon: (
        <svg
          viewBox="0 0 30 30"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"
            fill="currentColor"
          />
        </svg>
      ),
      gradient: "from-flame-blue-bright via-flame-blue to-fire-red",
      delay: 0.2,
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@Champimurosoficial",
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            fill="currentColor"
          />
        </svg>
      ),
      gradient: "from-fire-red via-fire-red-glow to-fire-red-dark",
      delay: 0.4,
    },
    {
      name: "Facebook",
      href: "https://facebook.com/laparrillachampi",
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            fill="currentColor"
          />
        </svg>
      ),
      gradient: "from-charcoal-light via-ocean to-flame-blue",
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
          bg-gradient-to-br from-charcoal-dark via-ocean-deep to-charcoal
          rounded-[30px] overflow-hidden
          shadow-[0_20px_60px_-15px_rgba(192,31,25,0.4)]
          border-2 border-fire-red/40
          ${isMobile ? "cursor-pointer" : ""}
        `}
        onClick={handleCardClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        whileHover={isMobile ? {} : { scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Fondo con gradiente animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-fire-red via-flame-blue to-flame-blue-bright opacity-80"
          animate={{
            background: [
              "linear-gradient(135deg, #C01F19 0%, #314A78 50%, #1789C0 100%)",
              "linear-gradient(135deg, #1789C0 0%, #C01F19 50%, #314A78 100%)",
              "linear-gradient(135deg, #314A78 0%, #1789C0 50%, #C01F19 100%)",
              "linear-gradient(135deg, #C01F19 0%, #314A78 50%, #1789C0 100%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo/Texto "Síguenos" */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          animate={
            shouldShowButtons
              ? { x: "-50%", y: "-90px", scale: 0.85 }
              : { x: "-50%", y: "-50%", scale: 1 }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
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
              bg-charcoal/30 backdrop-blur-md
              border-t-2 border-r-2 border-fire-red/40
              transition-all duration-500
              hover:bg-charcoal/50 hover:border-fire-red/70
              hover:shadow-[0_10px_30px_-5px_rgba(192,31,25,0.5)]
            `}
            style={{
              width: `${70 - index * 20}%`,
              height: `${70 - index * 20}%`,
            }}
            initial={{
              bottom: `-${70 - index * 20}%`,
              left: `-${70 - index * 20}%`,
            }}
            animate={
              shouldShowButtons
                ? { bottom: "-1px", left: "-1px" }
                : {
                    bottom: `-${70 - index * 20}%`,
                    left: `-${70 - index * 20}%`,
                  }
            }
            transition={{
              duration: 0.5,
              delay: shouldShowButtons ? social.delay : 0,
              ease: "easeInOut",
            }}
            onClick={(e) => {
              if (isMobile && !isExpanded) {
                e.preventDefault();
              }
            }}
          >
            {/* Gradiente de fondo del botón */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${social.gradient} opacity-0 transition-opacity duration-500 rounded-[20px]`}
              whileHover={{ opacity: 0.9 }}
            />

            {/* Icono */}
            <div className="absolute inset-0 flex items-end justify-end p-3 md:p-4">
              <motion.div
                className="w-6 h-6 md:w-7 md:h-7 text-white/90"
                whileHover={{
                  scale: 1.2,
                  filter: "drop-shadow(0 0 8px white)",
                }}
                transition={{ duration: 0.2 }}
              >
                {social.icon}
              </motion.div>
            </div>
          </motion.a>
        ))}

        {/* Botón decorativo pequeño */}
        <motion.div
          className="absolute w-[10%] h-[10%] rounded-[20px] bg-fire-red/20 backdrop-blur-sm border-t-2 border-fire-red/50"
          initial={{ bottom: "-10%", left: "-10%" }}
          animate={
            shouldShowButtons
              ? { bottom: "-1px", left: "-1px" }
              : { bottom: "-10%", left: "-10%" }
          }
          transition={{
            duration: 0.5,
            delay: shouldShowButtons ? 0.8 : 0,
            ease: "easeInOut",
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
