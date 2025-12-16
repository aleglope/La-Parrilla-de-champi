"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

interface ClientProvidersProps {
  readonly children: ReactNode;
  readonly lang: Language;
}

export function ClientProviders({ children, lang }: ClientProvidersProps) {
  return <LanguageProvider initialLang={lang}>{children}</LanguageProvider>;
}
