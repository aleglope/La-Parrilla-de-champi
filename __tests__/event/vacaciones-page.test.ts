// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NOT_FOUND"); },
  redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); },
}));
vi.mock("@/components/react-bits/AnimatedContent", () => ({ default: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/components/react-bits/TiltedCard", () => ({ default: ({ children }: { children: ReactNode }) => children }));

import VacacionesPage from "@/components/vacaciones/VacacionesPage";
import VacacionesProductionPage, { dynamic, revalidate } from "@/app/[lang]/vacaciones/page";
import VacacionesPreviewPage from "@/app/[lang]/vacaciones-preview/page";
import { VACACIONES_END, VACACIONES_START } from "@/lib/event/vacaciones";

describe("production vacation route", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-27T12:00:00Z")); });
  afterEach(() => vi.useRealTimers());

  it("uses request-time rendering with no revalidation cache", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(revalidate).toBe(0);
  });

  it.each(["es", "gl"] as const)("provides the production %s composition and server clock to expiry", (lang) => {
    const page = VacacionesProductionPage({ params: { lang } });
    const [composition, expiry] = page.props.children;
    expect(composition.props.lang).toBe(lang);
    expect(composition.props.preview).toBeUndefined();
    expect(expiry.props.serverNow).toBe(Date.now());
    expect(expiry.props.endsAt).toBe(VACACIONES_END.getTime());
  });

  it.each([VACACIONES_START.getTime() - 1, VACACIONES_END.getTime(), VACACIONES_END.getTime() + 1])("redirects direct visits outside the window at %s", (instant) => {
    vi.setSystemTime(instant);
    expect(() => VacacionesProductionPage({ params: { lang: "es" } })).toThrow("REDIRECT:/es");
    expect(() => VacacionesProductionPage({ params: { lang: "gl" } })).toThrow("REDIRECT:/gl");
  });

  it("rejects invalid locales and confines preview behavior to the preview route", () => {
    expect(() => VacacionesProductionPage({ params: { lang: "en" as "es" } })).toThrow("NOT_FOUND");
    expect(VacacionesPreviewPage({ params: { lang: "es" } }).props.preview).toBe(true);
  });
});

describe("production destinations", () => {
  it.each(["es", "gl"] as const)("keeps %s legal and language links useful without preview/menu loops", (lang) => {
    const html = renderToStaticMarkup(VacacionesPage({ lang }));
    for (const path of ["/es", "/gl", `/${lang}/aviso-legal`, `/${lang}/politica-privacidad`, `/${lang}/politica-cookies`]) {
      expect(html).toContain(`href="${path}"`);
    }
    expect(html).not.toContain("vacaciones-preview");
    expect(html).not.toContain(`href="/${lang}/menu"`);
    expect(html).toMatch(/datetime="2026-11-12"/i);
    expect(html).toContain("LA PARRILLA DE CHAMPI");
  });

  it("preserves the existing preview destinations when explicitly requested", () => {
    const html = renderToStaticMarkup(VacacionesPage({ lang: "es", preview: true }));
    expect(html).toContain('href="/es/vacaciones-preview"');
    expect(html).toContain('href="/gl/vacaciones-preview"');
    expect(html).toContain('href="/es/menu"');
  });
});
