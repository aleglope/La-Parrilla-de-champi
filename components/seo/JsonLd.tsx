"use client";

import Script from "next/script";

interface JsonLdProps {
  data: Record<string, any>;
  id?: string;
}

export function JsonLd({ data, id = "schema-org" }: JsonLdProps) {
  // JSON.stringify no escapa "<", así que un valor que contenga "</script>"
  // cierra la etiqueta e inyecta HTML arbitrario. Los datos que entran aquí
  // incluyen nombres y descripciones de platos, que salen de la base de datos.
  // Escapar "<" como < es válido en JSON y neutraliza el cierre.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
      strategy="beforeInteractive"
    />
  );
}
