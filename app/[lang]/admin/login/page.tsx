import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-ocean-fire opacity-20" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-fire-red/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-flame-blue/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-fire rounded-full flex items-center justify-center mx-auto mb-4 shadow-fire">
            <span className="text-4xl">🔥</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            La Parrilla de Champi
          </h1>
          <p className="text-gray-400">Panel de Administración</p>
        </div>

        {/* Formulario de login */}
        <div className="glass-card p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Acceso restringido solo para personal autorizado
        </p>
      </div>
    </div>
  );
}

