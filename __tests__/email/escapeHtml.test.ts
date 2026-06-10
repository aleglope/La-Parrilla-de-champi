import { describe, it, expect } from "vitest";
import { escapeHtml } from "@/lib/email/escapeHtml";

describe("escapeHtml", () => {
  it("escapa tags HTML como entidades de texto", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
  });

  it("escapa ampersand, comillas dobles y comillas simples", () => {
    expect(escapeHtml(`a & b "c" 'd'`)).toBe(
      "a &amp; b &quot;c&quot; &#39;d&#39;"
    );
  });

  it("devuelve cadena vacía para null", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("devuelve cadena vacía para undefined", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("escapa & primero sin doble-procesar el resto de entidades", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });
});
