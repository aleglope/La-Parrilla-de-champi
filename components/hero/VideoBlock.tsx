"use client";

/**
 * Bloque de video de YouTube
 * Incrusta un YouTube Short
 */
export function VideoBlock() {
  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[250px] bg-charcoal-dark">
      <iframe
        className="absolute inset-0 w-full h-full"
        src="https://www.youtube.com/embed/uvE0oEGzciU?autoplay=1&mute=1&loop=1&playlist=uvE0oEGzciU&controls=0&modestbranding=1&rel=0&enablejsapi=1"
        title="La Parrilla de Champi"
        style={{ border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
