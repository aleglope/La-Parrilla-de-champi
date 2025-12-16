import "server-only";
import type { Locale } from "../../i18n-config";
import { translations } from "./translations"; // We reuse the existing file

// We can split translations.ts later if the bundle size becomes an issue.
// For now, it's efficient enough to import the object directly.
const dictionaries = {
  es: () => Promise.resolve(translations.es),
  gl: () => Promise.resolve(translations.gl),
};

export const getDictionary = async (locale: Locale) => {
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  return dictionaries.es();
};
