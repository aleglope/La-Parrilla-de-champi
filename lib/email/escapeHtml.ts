/**
 * Escapa input libre de usuario antes de interpolarlo en HTML de email,
 * para que markup malicioso (<script>, <b>, etc.) llegue como texto visible
 * y no como HTML interpretado en el cliente de correo.
 *
 * El orden de los .replace importa: & se escapa PRIMERO para no
 * doble-escapar el resto de entidades.
 */
export function escapeHtml(input: string | null | undefined): string {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
