import { HeroBentoBox } from "@/components/hero/HeroBentoBox";
import { ParticleBackground } from "@/components/particles/ParticleBackground";
import { StorySection } from "@/components/story/StorySection";
import { CTASection } from "@/components/sections/CTASection";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SocialMediaCard } from "@/components/social/SocialMediaCard";
import { isFeriaActiva } from "@/lib/event/feria-medieval";
import { MedievalHeroBanner } from "@/components/feria/MedievalHeroBanner";
import { CornerOrnament } from "@/components/feria/MedievalOrnaments";
import type { Locale } from "@/i18n-config";

// ISR: sin revalidate la home quedaría 100% estática y el date-gate de la
// feria se congelaría en el valor del momento del build.
export const revalidate = 60;

export const metadata = {
  alternates: {
    languages: {
      es: "/es",
      gl: "/gl",
    },
  },
};

export default function HomePage({
  params,
}: Readonly<{ params: { lang: Locale } }>) {
  const feriaActiva = isFeriaActiva();

  return (
    <main className="relative min-h-screen">
      {/* Sistema de partículas de fondo (tinte ámbar durante la feria) */}
      {feriaActiva ? (
        <ParticleBackground colors={["#E3C355", "#8A6520", "#D9542E"]} />
      ) : (
        <ParticleBackground />
      )}

      {/* Navegación */}
      <Navigation />

      {/* Capa medieval aditiva durante la feria */}
      {feriaActiva && (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-10"
            aria-hidden="true"
          >
            <CornerOrnament className="absolute left-2 top-20 h-10 w-10 sm:h-12 sm:w-12" />
            <CornerOrnament className="absolute right-2 top-20 h-10 w-10 rotate-90 sm:h-12 sm:w-12" />
            <CornerOrnament className="absolute bottom-2 left-2 h-10 w-10 -rotate-90 sm:h-12 sm:w-12" />
            <CornerOrnament className="absolute bottom-2 right-2 h-10 w-10 rotate-180 sm:h-12 sm:w-12" />
          </div>
          <MedievalHeroBanner lang={params.lang} />
        </>
      )}

      {/* Hero Section con Bento Box */}
      <section id="hero" className="relative z-10">
        <HeroBentoBox />
      </section>

      {/* Story Section con Scrollytelling */}
      <section id="story" className="relative z-10 py-20 md:py-32">
        <StorySection />
      </section>

      {/* Call to Action */}
      <section id="cta" className="relative z-10 py-16">
        <CTASection />
      </section>

      {/* Social Media Section */}
      <section id="social" className="relative z-10 py-8 md:py-12">
        <div className="container-custom">
          <SocialMediaCard />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
