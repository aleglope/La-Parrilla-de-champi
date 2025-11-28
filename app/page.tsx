import { HeroBentoBox } from "@/components/hero/HeroBentoBox";
import { ParticleSystem } from "@/components/particles/ParticleSystem";
import { StorySection } from "@/components/story/StorySection";
import { CTASection } from "@/components/sections/CTASection";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Sistema de partículas de fondo */}
      <ParticleSystem />
      
      {/* Navegación */}
      <Navigation />
      
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

      {/* Footer */}
      <Footer />
    </main>
  );
}

