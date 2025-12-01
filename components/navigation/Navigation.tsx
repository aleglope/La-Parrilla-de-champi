"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import BubbleMenu from "./BubbleMenu";
import BrandButton from "@/components/ui/BrandButton";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();
  const { t, language, setLanguage } = useLanguage();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    setIsScrolled(latest > 20);
  });

  const menuItems = [
    { href: "/#hero", label: t.nav.home },
    { href: "/#story", label: t.nav.story },
  ];

  const bubbleMenuItems = [
    {
      label: t.nav.home,
      href: "/#hero",
      rotation: -5,
      hoverStyles: { bgColor: "#C01F19", textColor: "#ffffff" }, // Fire Red
    },
    {
      label: t.nav.story,
      href: "/#story",
      rotation: 5,
      hoverStyles: { bgColor: "#314A78", textColor: "#ffffff" }, // Flame Blue
    },
    {
      label: t.nav.menu,
      href: "/menu",
      rotation: -5,
      hoverStyles: { bgColor: "#1789C0", textColor: "#ffffff" }, // Bright Blue
    },
    {
      label: "Reservar",
      href: "/reservas",
      rotation: 5,
      hoverStyles: { bgColor: "#283435", textColor: "#ffffff" }, // Charcoal
    },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "gl" : "es");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isHidden ? "-100%" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
          isScrolled
            ? "bg-transparent border-flame-blue/20 shadow-lg"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  src="/Logo-Bento-Hero.svg"
                  alt="La Parrilla de Champi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white leading-tight">
                  La Parrilla de Champi
                </h1>
                <p className="text-xs text-gray-400">{t.nav.subtitle}</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:text-fire-red transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}

              {/* Language Switcher */}
              <BrandButton
                onClick={toggleLanguage}
                style={{ minWidth: "auto", padding: "0 1.5rem" }}
              >
                <span className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-medium ${
                      language === "es" ? "text-fire-red" : "text-gray-400"
                    }`}
                  >
                    ES
                  </span>
                  <span className="text-gray-600">|</span>
                  <span
                    className={`text-sm font-medium ${
                      language === "gl" ? "text-fire-blue" : "text-gray-400"
                    }`}
                  >
                    GL
                  </span>
                </span>
              </BrandButton>

              <BrandButton href="/menu" className="!text-base">
                {t.nav.menu}
              </BrandButton>
            </div>

            {/* Mobile Language Switcher (Visible when Bubble Menu is closed or as part of header) */}
            <div className="flex items-center md:hidden space-x-4 mr-16">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/5 border border-white/10"
              >
                <span
                  className={`text-xs font-bold ${
                    language === "es" ? "text-fire-red" : "text-gray-400"
                  }`}
                >
                  ES
                </span>
                <span className="text-gray-600">/</span>
                <span
                  className={`text-xs font-bold ${
                    language === "gl" ? "text-fire-blue" : "text-gray-400"
                  }`}
                >
                  GL
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Bubble Menu for Mobile */}
      <div className="md:hidden fixed top-4 right-4 z-[1002]">
        <BubbleMenu
          logo="/images/logo.svg"
          items={bubbleMenuItems}
          menuBg="#ffffff"
          menuContentColor="#111111"
          useFixedPosition={true}
          className="!top-0 !right-0 !left-auto !p-0"
          style={{ position: "relative" }}
        />
      </div>
    </>
  );
}
