"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CookiePolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-charcoal-dark pt-32 pb-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-display text-fire-red mb-12 text-center">
            {t.footer.cookiePolicy}
          </h1>

          <div className="glass-card p-8 md:p-12 space-y-8 text-ash-300 font-body">
            <div className="space-y-4">
              <p>
                Esta Política de Cookies explica qué son las cookies y cómo las
                utilizamos en <strong>La Parrilla de Champi</strong>. Es
                importante que lea esta política para entender qué tipos de
                cookies utilizamos, la información que recopilamos mediante las
                cookies y cómo se utiliza esa información.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                ¿Qué son las cookies?
              </h2>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en
                su dispositivo (ordenador, tablet o móvil) cuando visita sitios
                web. Las cookies permiten que el sitio web recuerde sus acciones
                y preferencias (como inicio de sesión, idioma, tamaño de fuente
                y otras preferencias de visualización) durante un período de
                tiempo.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                Tipos de cookies que utilizamos
              </h2>

              <div className="space-y-4 pl-4 border-l-2 border-fire-red/30">
                <h3 className="text-xl font-bold text-ash-100">
                  1. Cookies Esenciales
                </h3>
                <p>
                  Estas cookies son necesarias para que el sitio web funcione
                  correctamente y no se pueden desactivar en nuestros sistemas.
                  Se utilizan principalmente para fines de autenticación y
                  seguridad.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Supabase Auth:</strong> Utilizamos cookies para
                    gestionar las sesiones de usuario y autenticación de forma
                    segura.
                  </li>
                </ul>
              </div>

              <div className="space-y-4 pl-4 border-l-2 border-fire-red/30">
                <h3 className="text-xl font-bold text-ash-100">
                  2. Cookies Analíticas
                </h3>
                <p>
                  Estas cookies nos permiten contar las visitas y fuentes de
                  tráfico para poder medir y mejorar el rendimiento de nuestro
                  sitio. Nos ayudan a saber qué páginas son las más y las menos
                  populares y ver cómo los visitantes se mueven por el sitio.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Vercel Analytics:</strong> Utilizamos este servicio
                    para obtener métricas anónimas sobre el uso de la web y
                    mejorar la experiencia de usuario.
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                Gestión de Cookies
              </h2>
              <p>
                Puede configurar su navegador para rechazar todas o algunas
                cookies del navegador, o para que le avise cuando los sitios web
                instalen o accedan a cookies. Si desactiva o rechaza las
                cookies, tenga en cuenta que algunas partes de este sitio web
                pueden volverse inaccesibles o no funcionar correctamente.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
