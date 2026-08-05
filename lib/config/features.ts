/**
 * Interruptores de funcionalidad del sitio.
 *
 * Cambiar aquí, no borrar código: lo que hoy está apagado puede volver.
 */

/**
 * Reservas online visibles en la web.
 *
 * DESACTIVADO desde el 5-ago-2026 por decisión del dueño: no quiere reservas
 * por web de momento, y un botón que nunca lleva a nada es peor que no tenerlo.
 * En la base de datos `reservation_settings.reservations_enabled` está en false
 * desde enero de 2026, así que el botón ya solo abría un modal de "cerradas".
 *
 * Con esto en `false`:
 *   - Desaparece la entrada "Reservas" del menú de navegación.
 *   - La ruta /reservas SIGUE existiendo y funcionando si se entra a mano,
 *     igual que la API y el panel de administración. No se borra nada.
 *
 * PARA REACTIVARLO no basta con poner `true`. El flujo nunca llegó a probarse
 * en producción con reservas abiertas, así que antes hay que revisar:
 *   1. `POST /api/reservations/create` NO consulta `reservations_enabled`:
 *      acepta reservas por API aunque la web las muestre cerradas, y manda
 *      un email de "¡Reserva Confirmada!". Hay que añadir ese gate.
 *   2. La política RLS de INSERT en `reservations` permite crear filas desde
 *      el cliente saltándose las validaciones de aforo del handler.
 *   3. No hay validación de esquema (zod) en el cuerpo: faltan límites de
 *      longitud, rango de comensales y fecha no pasada.
 *   4. El rate limit cuelga solo de la IP; dos peticiones llenan un turno de
 *      40 plazas. Conviene un segundo bucket por email o teléfono.
 *   5. `scrubPii` no cubre los nombres camelCase (`guestName`, `guestEmail`,
 *      `guestPhone`), que son los que viajan de verdad al crear la reserva.
 *
 * Detalle en `.planning/STATE.md`, sección "Auditoría de Seguridad".
 */
export const RESERVAS_ONLINE_VISIBLES = false;
