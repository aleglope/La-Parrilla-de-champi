"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

interface ClientProvidersProps {
  readonly children: ReactNode;
  readonly lang: Language;
}

export function ClientProviders({ children, lang }: ClientProvidersProps) {
  return (
    // reducedMotion="user": Framer Motion respeta prefers-reduced-motion
    // en toda la web (el reset CSS de globals.css no afecta a estilos inline)
    <MotionConfig reducedMotion="user">
      <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
    </MotionConfig>
  );
}
