'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}

