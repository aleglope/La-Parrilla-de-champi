import { describe, it, expect, vi } from "vitest";

// El módulo instancia `new Resend(process.env.RESEND_API_KEY)` al importarse;
// se mockea resend para poder testear los generadores de HTML sin la API key.
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn() };
  },
}));

import {
  generateConfirmationEmailHTML,
  generateAdminNotificationHTML,
} from "@/lib/email/EmailService";

const baseData = {
  guestName: "Juan Pérez",
  guestEmail: "juan@example.com",
  reservationDate: "2025-02-15",
  timeSlot: "20:00",
  guestsCount: 2,
  reservationId: "abc12345-6789-0000-1111-222233334444",
  specialRequests: null as string | null,
};

describe("EmailService HTML templates (SEC-05)", () => {
  describe("generateConfirmationEmailHTML", () => {
    it("escapa specialRequests malicioso como texto", () => {
      const html = generateConfirmationEmailHTML({
        ...baseData,
        specialRequests: "<script>x</script>",
      });

      expect(html).toContain("&lt;script&gt;x&lt;/script&gt;");
      expect(html).not.toContain("<script>");
    });

    it("escapa guestName con markup", () => {
      const html = generateConfirmationEmailHTML({
        ...baseData,
        guestName: "<b>hax</b>",
      });

      expect(html).toContain("&lt;b&gt;hax&lt;/b&gt;");
      expect(html).not.toContain("<b>hax</b>");
    });

    it("no altera campos controlados ni texto normal", () => {
      const html = generateConfirmationEmailHTML({ ...baseData });

      expect(html).toContain("Juan Pérez");
      expect(html).toContain("ABC12345");
      expect(html).toContain("20:00");
      expect(html).toContain("2 persona");
    });
  });

  describe("generateAdminNotificationHTML", () => {
    it("escapa guestName y guestEmail con markup", () => {
      const html = generateAdminNotificationHTML({
        ...baseData,
        guestName: "<b>hax</b>",
        guestEmail: 'evil"<img src=x onerror=alert(1)>"@example.com',
      });

      expect(html).toContain("&lt;b&gt;hax&lt;/b&gt;");
      expect(html).not.toContain("<b>hax</b>");
      expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
      expect(html).not.toContain("<img src=x");
    });

    it("escapa specialRequests malicioso como texto", () => {
      const html = generateAdminNotificationHTML({
        ...baseData,
        specialRequests: "<script>document.cookie</script>",
      });

      expect(html).toContain("&lt;script&gt;document.cookie&lt;/script&gt;");
      expect(html).not.toContain("<script>");
    });

    it("no altera campos controlados ni texto normal", () => {
      const html = generateAdminNotificationHTML({ ...baseData });

      expect(html).toContain("Juan Pérez");
      expect(html).toContain("juan@example.com");
      expect(html).toContain("ABC12345");
      expect(html).toContain("20:00");
    });
  });
});
