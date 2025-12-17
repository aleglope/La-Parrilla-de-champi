"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { translations, Language } from "./translations";
import { i18n } from "../../i18n-config";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
  initialLang: Language;
}

export function LanguageProvider({
  children,
  initialLang,
}: Readonly<LanguageProviderProps>) {
  const router = useRouter();
  const pathname = usePathname();

  // The language is now derived primarily from the URL (initialLang)
  // We don't need local state for 'language' because the URL is the source of truth.
  // When the URL changes, the Page component re-renders and passes the new initialLang.
  const language = initialLang;

  const handleSetLanguage = (newLang: Language) => {
    if (newLang === language) return;

    // Redirect to the new language URL
    // We assume the current path starts with /es/ or /gl/
    // We replace the first segment with the new language
    const segments = pathname.split("/");
    segments[1] = newLang; // Replace 'es' or 'gl' with newLang
    const newPath = segments.join("/");

    router.push(newPath);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language] || translations["es"], // We are still using the bundled translations on the client for interactivity
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
