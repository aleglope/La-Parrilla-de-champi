"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PrivacyPolicyPage() {
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
            {t.footer.privacyPolicy}
          </h1>

          <div className="glass-card p-8 md:p-12 space-y-8 text-ash-300 font-body">
            <div className="space-y-4">
              <p>
                En <strong>La Parrilla de Champi</strong>, nos comprometemos a
                proteger la privacidad y seguridad de sus datos personales. Esta
                Política de Privacidad describe cómo recopilamos, utilizamos y
                protegemos su información personal cuando utiliza nuestro sitio
                web y realiza reservas.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                1. Responsable del Tratamiento
              </h2>
              <p>
                <strong>Identidad:</strong> LA PARRILLA DE CHAMPI SL
                <br />
                <strong>NIF:</strong> B24828030
                <br />
                <strong>Dirección:</strong> PRAZA MARQUES DE MONROY, NUM 8
                PLANTA BAJ, 15200 NOIA - (A CORUÑA)
                <br />
                <strong>Email:</strong> contacto@laparrilladechampi.com
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                2. Finalidad del Tratamiento
              </h2>
              <p>
                Tratamos la información que nos facilita con las siguientes
                finalidades:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Gestión de Reservas:</strong> Para tramitar su
                  solicitud de reserva en nuestro restaurante a través del
                  formulario web.
                </li>
                <li>
                  <strong>Comunicaciones:</strong> Para enviarle confirmaciones
                  de reserva, recordatorios o avisos sobre cambios en el estado
                  de su reserva (vía email o teléfono).
                </li>
                <li>
                  <strong>Atención al Cliente:</strong> Para atender sus
                  consultas o solicitudes especiales.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                3. Legitimación
              </h2>
              <p>
                La base legal para el tratamiento de su datos es el{" "}
                <strong>consentimiento</strong> que usted otorga al aceptar esta
                política antes de enviar el formulario de reserva, así como la
                necesidad contractual para la gestión de la propia reserva.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                4. Destinatarios de los Datos
              </h2>
              <p>
                Para poder prestarle el servicio, utilizamos proveedores
                tecnológicos de confianza que pueden tener acceso a sus datos:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Supabase:</strong> Proveedor de base de datos y
                  autenticación.
                </li>
                <li>
                  <strong>Resend:</strong> Plataforma para el envío de correos
                  electrónicos transaccionales (confirmaciones de reserva).
                </li>
              </ul>
              <p className="mt-2">
                No cederemos sus datos a terceros salvo obligación legal.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                5. Derechos del Usuario
              </h2>
              <p>
                Usted tiene derecho a obtener confirmación sobre si estamos
                tratando sus datos personales. Tiene derecho a acceder a sus
                datos, rectificar los datos inexactos o solicitar su supresión
                cuando los datos ya no sean necesarios.
              </p>
              <p>
                Puede ejercer sus derechos enviando un email a{" "}
                <strong>contacto@laparrilladechampi.com</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                6. Seguridad
              </h2>
              <p>
                Implementamos las medidas de seguridad técnicas y organizativas
                necesarias para garantizar la seguridad de sus datos de carácter
                personal y evitar su alteración, pérdida y tratamiento y/o
                acceso no autorizado.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
