import type { Metadata } from "next";
import ReservationForm from "@/components/reservations/ReservationForm";

export const metadata: Metadata = {
  title: "Reservas | La Parrilla de Champi",
  description:
    "Reserva tu mesa en La Parrilla de Champi. Disfruta de las mejores carnes a la brasa en un ambiente acogedor.",
};

export default function ReservationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal via-charcoal-dark to-charcoal">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-8 text-center bg-gradient-to-br from-fire-red via-fire-red-dark to-fire-red overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-4 drop-shadow-lg tracking-tight">
            Reserva tu Mesa
          </h1>
          <p className="text-xl md:text-2xl text-white/95 font-body font-medium drop-shadow-md">
            Asegura tu lugar en la mejor parrilla de la ciudad
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative z-20 px-4 -mt-12 pb-16 max-w-4xl mx-auto">
        <div className="animate-[fadeInUp_0.6s_ease-out]">
          <ReservationForm />
        </div>
      </section>

      {/* Alternative Contact Section */}
      <section className="py-12 px-8 text-center bg-gradient-to-br from-charcoal-light to-charcoal border-y border-flame-blue/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-heading font-extrabold mb-3">
            <span className="gradient-text">¿Prefieres llamarnos?</span>
          </h2>
          <p className="text-lg text-ash-300 mb-8 font-body">
            También puedes hacer tu reserva por teléfono
          </p>

          <a
            href="tel:+34600000000"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-ash-50 to-white text-charcoal-dark rounded-full text-2xl font-heading font-bold transition-all duration-300 shadow-lg shadow-flame-blue-bright/20 hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:shadow-flame-blue-bright/30 mb-4"
          >
            <svg
              className="w-7 h-7 text-fire-red"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            +34 600 000 000
          </a>

          <p className="text-sm text-ash-400 italic font-body">
            Horario de atención: Martes a Domingo, 12:00 - 23:30
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card bg-gradient-to-br from-charcoal-light to-charcoal p-10 rounded-3xl text-center border-2 border-transparent hover:border-flame-blue-bright hover:-translate-y-2 hover:shadow-xl hover:shadow-flame-blue-bright/20 transition-all duration-300 group">
            <div className="text-6xl mb-4 inline-block animate-[bounce_2s_ease-in-out_infinite]">
              📅
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-ash-100 mb-4 group-hover:text-flame-blue-bright transition-colors">
              Reserva Anticipada
            </h3>
            <p className="text-ash-300 font-body leading-relaxed">
              Recomendamos reservar con al menos 24 horas de antelación,
              especialmente para grupos grandes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card bg-gradient-to-br from-charcoal-light to-charcoal p-10 rounded-3xl text-center border-2 border-transparent hover:border-flame-blue-bright hover:-translate-y-2 hover:shadow-xl hover:shadow-flame-blue-bright/20 transition-all duration-300 group">
            <div className="text-6xl mb-4 inline-block animate-[bounce_2s_ease-in-out_infinite] [animation-delay:0.2s]">
              ⏰
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-ash-100 mb-4 group-hover:text-flame-blue-bright transition-colors">
              Confirmación Inmediata
            </h3>
            <p className="text-ash-300 font-body leading-relaxed">
              Recibirás un email de confirmación al instante con todos los
              detalles de tu reserva.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card bg-gradient-to-br from-charcoal-light to-charcoal p-10 rounded-3xl text-center border-2 border-transparent hover:border-flame-blue-bright hover:-translate-y-2 hover:shadow-xl hover:shadow-flame-blue-bright/20 transition-all duration-300 group">
            <div className="text-6xl mb-4 inline-block animate-[bounce_2s_ease-in-out_infinite] [animation-delay:0.4s]">
              ✨
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-ash-100 mb-4 group-hover:text-flame-blue-bright transition-colors">
              Eventos Especiales
            </h3>
            <p className="text-ash-300 font-body leading-relaxed">
              Para grupos de más de 15 personas o eventos especiales, por favor
              llámanos directamente.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
