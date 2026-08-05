interface JsonLdProps {
  data: Record<string, any>;
  id?: string;
}

/**
 * Emite datos estructurados Schema.org como una etiqueta <script> real en el HTML.
 *
 * Server component a propósito: con `next/script` y `strategy="beforeInteractive"`
 * Next serializa el contenido en `self.__next_s` y lo inyecta por JavaScript, así
 * que el HTML servido no contiene ninguna etiqueta `application/ld+json` y los
 * rastreadores que no ejecutan JS no ven nada.
 */
export function JsonLd({ data, id = "schema-org" }: JsonLdProps) {
  // JSON.stringify no escapa "<", así que un valor que contenga "</script>"
  // cierra la etiqueta e inyecta HTML arbitrario. Los datos que entran aquí
  // incluyen nombres y descripciones de platos, que salen de la base de datos.
  // Escapar "<" como < es válido en JSON y neutraliza el cierre.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
