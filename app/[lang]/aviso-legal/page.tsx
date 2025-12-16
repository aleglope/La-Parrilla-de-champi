"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LegalNoticePage() {
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
            {t.footer.legalNotice}
          </h1>

          <div className="glass-card p-8 md:p-12 space-y-8 text-ash-300 font-body">
            <div className="space-y-4">
              <h2 className="text-2xl font-heading text-ash-100 mb-4">
                Información Legal
              </h2>
              <p>
                En cumplimiento con el deber de información recogido en artículo
                10 de la Ley 34/2002, de 11 de julio, de Servicios de la
                Sociedad de la Información y del Comercio Electrónico, a
                continuación se reflejan los siguientes datos:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-ash-100">
                  Denominación Social
                </h3>
                <p>LA PARRILLA DE CHAMPI SL</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-ash-100">NIF</h3>
                <p>B24828030</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-ash-100">
                  Domicilio Social
                </h3>
                <p>PRAZA MARQUES DE MONROY, NUM 8 PLANTA BAJ</p>
                <p>15200 NOIA - (A CORUÑA)</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-ash-100">Contacto</h3>
                <p>Email: contacto@laparrilladechampi.com</p>
                <p>Teléfono: +34 912 345 678</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-ash-700/30">
              <h3 className="text-lg font-bold text-ash-100">
                Datos Registrales
              </h3>
              <p>
                Inscrita en el Registro Mercantil de SANTIAGO DE COMPOSTELA.
                <br />
                IRUS: 1000461862464
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
