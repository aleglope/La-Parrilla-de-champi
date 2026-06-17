import { Resend } from "resend";
import { escapeHtml } from "./escapeHtml";

// Lazy init: el constructor de Resend lanza si falta la API key, así que
// instanciarlo a nivel de módulo rompe `next build` sin env vars (la fase
// "Collecting page data" evalúa los módulos de las rutas que lo importan).
// Los callers ya comprueban RESEND_API_KEY antes de enviar.
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface ReservationEmailData {
  guestName: string;
  guestEmail: string;
  reservationDate: string;
  timeSlot: string;
  guestsCount: number;
  reservationId: string;
  specialRequests?: string | null;
}

/**
 * Send confirmation email to guest
 */
export async function sendReservationConfirmation(data: ReservationEmailData) {
  try {
    const { data: emailData, error } = await getResend().emails.send({
      from: "La Parrilla de Champi <reservas@reservas.laparrilladechampi.es>",
      to: [data.guestEmail],
      subject: `Confirmación de Reserva - ${data.reservationDate} a las ${data.timeSlot}`,
      html: generateConfirmationEmailHTML(data),
    });

    if (error) {
      console.error("Error sending confirmation email:", error);
      return { success: false, error };
    }

    console.log("Confirmation email sent:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send notification email to restaurant admin
 */
export async function sendAdminNotification(data: ReservationEmailData) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@laparrilla.com";

    const { data: emailData, error } = await getResend().emails.send({
      from: "Sistema de Reservas <sistema@reservas.laparrilladechampi.es>",
      to: [adminEmail],
      subject: `Nueva Reserva - ${data.reservationDate} a las ${data.timeSlot}`,
      html: generateAdminNotificationHTML(data),
    });

    if (error) {
      console.error("Error sending admin notification:", error);
      return { success: false, error };
    }

    console.log("Admin notification sent:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return { success: false, error };
  }
}

/**
 * Generate HTML for guest confirmation email
 */
export function generateConfirmationEmailHTML(
  data: ReservationEmailData
): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">¡Reserva Confirmada!</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">La Parrilla de Champi</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #2c3e50; margin-top: 0;">Hola ${escapeHtml(data.guestName)},</p>
    
    <p style="font-size: 16px; color: #555;">Tu reserva ha sido confirmada. ¡Te esperamos!</p>
    
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 25px; border-radius: 12px; border: 2px solid #ecf0f1; margin: 25px 0;">
      <h2 style="color: #2c3e50; margin-top: 0; font-size: 20px; border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">Detalles de la Reserva</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #7f8c8d; font-weight: 600;">Número de Reserva:</td>
          <td style="padding: 12px 0; color: #2c3e50; font-weight: 700; text-align: right;">${data.reservationId
            .substring(0, 8)
            .toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #7f8c8d; font-weight: 600;">Fecha:</td>
          <td style="padding: 12px 0; color: #2c3e50; font-weight: 700; text-align: right;">${formatDate(
            data.reservationDate
          )}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #7f8c8d; font-weight: 600;">Hora:</td>
          <td style="padding: 12px 0; color: #ff6b35; font-weight: 700; text-align: right; font-size: 18px;">${
            data.timeSlot
          }</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #7f8c8d; font-weight: 600;">Comensales:</td>
          <td style="padding: 12px 0; color: #2c3e50; font-weight: 700; text-align: right;">${
            data.guestsCount
          } persona${data.guestsCount > 1 ? "s" : ""}</td>
        </tr>
        ${
          data.specialRequests
            ? `
        <tr>
          <td style="padding: 12px 0; color: #7f8c8d; font-weight: 600; vertical-align: top;">Solicitudes Especiales:</td>
          <td style="padding: 12px 0; color: #2c3e50; text-align: right;">${escapeHtml(data.specialRequests)}</td>
        </tr>
        `
            : ""
        }
      </table>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin: 25px 0;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Importante:</strong> Si necesitas cancelar o modificar tu reserva, por favor llámanos con al menos 24 horas de antelación.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0;">📍 Dirección del Restaurante</p>
      <p style="color: #2c3e50; font-weight: 600; margin: 5px 0;">La Parrilla de Champi</p>
      <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0;">📞 Teléfono: 711 224 328</p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
    
    <p style="color: #7f8c8d; font-size: 13px; text-align: center; margin: 0;">
      ¡Gracias por elegirnos! Nos vemos pronto.<br>
      <strong style="color: #ff6b35;">Equipo de La Parrilla de Champi</strong>
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for admin notification email
 */
export function generateAdminNotificationHTML(
  data: ReservationEmailData
): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Reserva</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">🔔 Nueva Reserva Web</h2>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">ID:</td>
        <td style="padding: 10px 0;">${data.reservationId
          .substring(0, 8)
          .toUpperCase()}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">Cliente:</td>
        <td style="padding: 10px 0;">${escapeHtml(data.guestName)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">Email:</td>
        <td style="padding: 10px 0;">${escapeHtml(data.guestEmail)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">Fecha:</td>
        <td style="padding: 10px 0; color: #ff6b35; font-weight: bold;">${formatDate(
          data.reservationDate
        )}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">Hora:</td>
        <td style="padding: 10px 0; color: #ff6b35; font-weight: bold; font-size: 18px;">${
          data.timeSlot
        }</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">Comensales:</td>
        <td style="padding: 10px 0; font-weight: bold; font-size: 18px; color: #2c3e50;">${
          data.guestsCount
        }</td>
      </tr>
      ${
        data.specialRequests
          ? `
      <tr>
        <td style="padding: 10px 0; font-weight: bold; vertical-align: top;">Solicitudes:</td>
        <td style="padding: 10px 0;">${escapeHtml(data.specialRequests)}</td>
      </tr>
      `
          : ""
      }
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
      <p style="margin: 0; color: #2e7d32;">
        <strong>Acción requerida:</strong> Confirma esta reserva en el panel de administración.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
