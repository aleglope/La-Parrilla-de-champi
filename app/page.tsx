import { HeroBentoBox } from "@/components/hero/HeroBentoBox";
import { ParticleSystem } from "@/components/particles/ParticleSystem";
import { StorySection } from "@/components/story/StorySection";
import { CTASection } from "@/components/sections/CTASection";
import { Navigation } from "@/components/navigation/Navigation";

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
      <footer className="relative z-10 bg-charcoal-dark border-t border-flame-blue/20 py-12">
        <div className="container-custom text-center">
          <h3 className="text-2xl font-bold text-fire-red mb-4">
            ¡Que pasa gentuza!
          </h3>
          <p className="text-gray-400 mb-6">
            La Parrilla de Champi - Carne a la Brasa con Alma
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="/menu" className="hover:text-flame-blue-bright transition-colors">
              Ver Carta
            </a>
            <span>|</span>
            <a href="#story" className="hover:text-flame-blue-bright transition-colors">
              Nuestra Historia
            </a>
            <span>|</span>
            <a href="/admin" className="hover:text-flame-blue-bright transition-colors">
              Admin
            </a>
          </div>
          <p className="text-xs text-gray-600 mt-8">
            © 2025 La Parrilla de Champi. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}

