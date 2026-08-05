import { SITE_URL } from "@/lib/seo/site";
import { BUSINESS } from "@/lib/config/business";
import { RESERVAS_ONLINE_VISIBLES } from "@/lib/config/features";

/**
 * /llms.txt — resumen del sitio para asistentes de IA.
 *
 * Antes esta ruta devolvía un 200 con la home entera y `<html lang="llms.txt">`:
 * el segmento `[lang]` se tragaba cualquier cadena. El guard de idioma está en
 * `app/[lang]/layout.tsx`; esto es lo que ocupa su lugar.
 *
 * Se genera en vez de servirse como fichero estático para que dirección,
 * teléfono y URLs salgan de la misma fuente que el pie y el JSON-LD.
 */
export const dynamic = "force-static";

export function GET() {
  const { address, phone } = BUSINESS;

  const body = `# ${BUSINESS.name}

> Asador de carne a la brasa en Noia (A Coruña, Galicia). Parrilladas,
> churrasco y secreto ibérico hechos sobre carbón de encina.

## Contacto

- Dirección: ${address.street}, ${address.postalCode} ${address.locality} (${address.region}), España
- Teléfono: ${phone.display} (${phone.tel})
- Google Maps: ${BUSINESS.mapsUrl}
- Instagram: ${BUSINESS.social.instagram}
- TikTok: ${BUSINESS.social.tiktok}

## Horarios

- Comidas: de martes a viernes y domingo, 13:00–16:00
- Cenas: de martes a sábado, 20:00–23:30
- Lunes cerrado

## Páginas

- [Inicio](${SITE_URL}/es): presentación del asador, historia y reseñas de clientes.
- [Carta](${SITE_URL}/es/menu): carta completa con precios, actualizada desde el panel del restaurante.
- [Aviso legal](${SITE_URL}/es/aviso-legal)
- [Política de privacidad](${SITE_URL}/es/politica-privacidad)
- [Política de cookies](${SITE_URL}/es/politica-cookies)

## Idiomas

El sitio está en castellano (/es) y gallego (/gl). Ambas versiones tienen el
mismo contenido; /es es la versión por defecto.

## Reservas

${
  RESERVAS_ONLINE_VISIBLES
    ? `Reserva online disponible en ${SITE_URL}/es/reservas.`
    : `No hay reserva online: las reservas se hacen por teléfono, en el ${phone.display}.`
}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
