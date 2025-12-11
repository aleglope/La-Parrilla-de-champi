"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import BubbleMenu from "./BubbleMenu";
import BrandButton from "@/components/ui/BrandButton";
import InfoModal from "@/components/ui/InfoModal";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [checkingReservations, setCheckingReservations] = useState(false);
  const { scrollY } = useScroll();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

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
      label: t.nav.reservations,
      href: "/reservas",
      rotation: 5,
      hoverStyles: { bgColor: "#283435", textColor: "#ffffff" }, // Charcoal
      onClick: (e: React.MouseEvent) => handleReservationClick(e), // Add custom handler
    },
  ];

  const handleReservationClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (checkingReservations) return;

    setCheckingReservations(true);

    try {
      const response = await fetch("/api/reservations/settings");
      const data = await response.json();

      if (response.ok) {
        if (data.reservationsEnabled) {
          // Reservations are open, navigate
          router.push("/reservas");
        } else {
          // Reservations are closed, show modal
          setShowClosedModal(true);
        }
      } else {
        // Error checking status, allow navigation anyway
        console.error("Error checking reservation status:", data.error);
        router.push("/reservas");
      }
    } catch (error) {
      // Network error, allow navigation anyway
      console.error("Network error checking reservation status:", error);
      router.push("/reservas");
    } finally {
      setCheckingReservations(false);
    }
  };

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
                <h1 className="text-lg md:text-xl font-display uppercase tracking-[0.45em] text-ash-50 drop-shadow-[0_5px_20px_rgba(0,0,0,0.55)] transition-colors">
                  LA PARRILLA DE CHAMPI
                </h1>
                <p className="text-xs text-ash-400 font-body uppercase tracking-[0.35em]">
                  {t.nav.subtitle}
                </p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-ash-300 hover:text-fire-red transition-colors font-heading text-sm tracking-[0.4em] uppercase"
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
                    className={`text-sm font-medium transition-colors ${
                      language === "gl"
                        ? "text-flame-blue-bright"
                        : "text-ash-400"
                    }`}
                  >
                    GL
                  </span>
                  <span className="text-ash-500">|</span>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      language === "es" ? "text-fire-red" : "text-ash-400"
                    }`}
                  >
                    ES
                  </span>
                </span>
              </BrandButton>

              <BrandButton href="/menu" className="!text-base">
                {t.nav.menu}
              </BrandButton>

              <BrandButton
                onClick={handleReservationClick}
                className="!text-base cursor-pointer"
              >
                {checkingReservations ? "..." : t.nav.reservations}
              </BrandButton>
            </div>

            {/* Mobile Language Switcher (Visible when Bubble Menu is closed or as part of header) */}
            <div className="flex items-center md:hidden space-x-3 mr-[4.5rem]">
              <BrandButton
                onClick={toggleLanguage}
                style={{ minWidth: "auto", padding: "0 1rem", height: "2.5em" }}
              >
                <span className="flex items-center space-x-1">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      language === "gl"
                        ? "text-flame-blue-bright"
                        : "text-ash-400"
                    }`}
                  >
                    GL
                  </span>
                  <span className="text-ash-500">/</span>
                  <span
                    className={`text-xs font-bold transition-colors ${
                      language === "es" ? "text-fire-red" : "text-ash-400"
                    }`}
                  >
                    ES
                  </span>
                </span>
              </BrandButton>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Bubble Menu for Mobile - Now with motion animation and proper overflow handling */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isHidden ? "-200%" : 0,
          opacity: isHidden ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden fixed top-4 right-4 z-[1002]"
        style={{
          overflow: "hidden",
          pointerEvents: isHidden ? "none" : "auto",
          visibility: isHidden ? "hidden" : "visible",
        }}
      >
        <BubbleMenu
          logo="/images/logo.svg"
          items={bubbleMenuItems}
          menuBg="#ffffff"
          menuContentColor="#111111"
          useFixedPosition={true}
          className="!top-0 !right-0 !left-auto !p-0"
          style={{ position: "relative" }}
          isHidden={isHidden}
        />
      </motion.div>

      {/* Info Modal for closed reservations */}
      <InfoModal
        isOpen={showClosedModal}
        onClose={() => setShowClosedModal(false)}
        title={translations[language].reservations.closed.title}
        message={translations[language].reservations.closed.message}
        icon="🔒"
        buttonText={translations[language].reservations.closed.button}
      />
    </>
  );
}
