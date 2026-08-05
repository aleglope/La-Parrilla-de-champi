import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localeAlternates } from "@/lib/seo/site";
import type { Locale } from "@/i18n-config";

// La página es un client component y no puede exportar metadata: va aquí.
export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);

  return {
    title: dictionary.footer.privacyPolicy,
    alternates: localeAlternates(params.lang, "/politica-privacidad"),
  };
}

export default function PrivacyPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
