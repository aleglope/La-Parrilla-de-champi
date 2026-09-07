import { SITE_URL } from "@/lib/seo/site";
import { BUSINESS } from "@/lib/config/business";
import { RESERVAS_ONLINE_VISIBLES } from "@/lib/config/features";
import { RATING, REVIEW_COUNT } from "@/data/reviews";

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

- Comidas: de miércoles a sábado, 11:00–16:00
- Comidas los domingos: 11:00–18:00
- Cenas: de miércoles a domingo, 20:00–00:00
- Lunes cerrado
- Los martes solo se abre en temporada de verano

## Sobre el proyecto

La Parrilla de Champi es el restaurante de Santiago Caamaño, "Champi"
(@champimuros), creador gallego con más de medio millón de seguidores en
TikTok. El maestro parrillero de la casa acumula más de dos décadas de
experiencia y se cocina sobre carbón de encina.

## Reputación

Valoración media de ${RATING.toLocaleString("es-ES")} sobre 5 en Google, con ${REVIEW_COUNT} reseñas de clientes.

## Cómo se sirve la carne

Los chuletones y las piezas grandes se venden AL PESO: el precio que figura en
la carta es por kilo, y la pieza se pesa delante del cliente antes de hacerla a
la brasa. El resto de platos llevan precio por ración.

## Páginas

- [Inicio](${SITE_URL}/es): quiénes somos, la historia del proyecto, reseñas de clientes y preguntas frecuentes.
- [Carta](${SITE_URL}/es/menu): parrilladas para compartir, chuletones al peso, churrasco, marisco gallego y vinos de D.O. gallegas, con los precios actualizados.
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
