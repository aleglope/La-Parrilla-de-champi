// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { isVacacionesActiva, VACACIONES_END, VACACIONES_START } from "@/lib/event/vacaciones";

const origin = "https://laparrilladechampi.es";
const request = (path: string) => new NextRequest(`${origin}${path}`);

describe("vacation date window", () => {
  it.each([
    [VACACIONES_START.getTime() - 1, false],
    [VACACIONES_START.getTime(), true],
    [VACACIONES_START.getTime() + 1, true],
    [VACACIONES_END.getTime() - 1, true],
    [VACACIONES_END.getTime(), false],
    [VACACIONES_END.getTime() + 1, false],
    [new Date("2027-10-27T12:00:00Z").getTime(), false],
  ])("evaluates instant %s as %s", (instant, expected) => {
    expect(isVacacionesActiva(new Date(instant))).toBe(expected);
  });

  it("ends exactly at the start of reopening day in Madrid", () => {
    expect(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid", dateStyle: "short", timeStyle: "short", hourCycle: "h23",
    }).format(VACACIONES_END)).toBe("12/11/2026, 00:00");
  });
});

describe("request-time vacation middleware", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-27T12:00:00Z")); });
  afterEach(() => vi.useRealTimers());

  it.each(["/es", "/gl", "/es/", "/gl/", "/es/menu", "/gl/menu", "/es/menu/", "/gl/menu/", "/es/reservas", "/gl/reservas", "/es/reservas/", "/gl/reservas/"])("rewrites only approved surface %s with no-store", (path) => {
    const response = middleware(request(path));
    expect(response?.headers.get("x-middleware-rewrite")).toBe(`${origin}/${path.split("/")[1]}/vacaciones`);
    expect(response?.headers.get("cache-control")).toContain("no-store");
    expect(response?.headers.get("cdn-cache-control")).toBe("no-store");
    expect(response?.headers.get("vercel-cdn-cache-control")).toBe("no-store");
    expect(response?.headers.get("location")).toBeNull();
  });

  it.each(["/es", "/gl/menu", "/es/reservas"])("restores normal routing at the exact expiry for %s", (path) => {
    vi.setSystemTime(VACACIONES_END.getTime() - 1);
    expect(middleware(request(path))?.headers.get("x-middleware-rewrite")).toContain("/vacaciones");
    vi.setSystemTime(VACACIONES_END);
    expect(middleware(request(path))).toBeUndefined();
    vi.setSystemTime(VACACIONES_END.getTime() + 1);
    expect(middleware(request(path))).toBeUndefined();
  });

  it("does not activate before the start and evaluates the next request afresh", () => {
    vi.setSystemTime(VACACIONES_START.getTime() - 1);
    expect(middleware(request("/es"))).toBeUndefined();
    vi.setSystemTime(VACACIONES_START);
    expect(middleware(request("/es"))?.headers.get("x-middleware-rewrite")).toBe(`${origin}/es/vacaciones`);
  });

  it.each([
    "/es/admin", "/gl/admin", "/es/admin/login", "/gl/admin/reservations",
    "/es/aviso-legal", "/gl/aviso-legal", "/es/politica-privacidad", "/gl/politica-privacidad",
    "/es/politica-cookies", "/gl/politica-cookies", "/es/feria-preview", "/es/vacaciones-preview",
    "/gl/vacaciones", "/es/unknown", "/es/menu/unknown", "/es/menubar", "/es/carnes",
    "/api/reservations/create", "/_next/static/chunk.js", "/_next/image", "/favicon.ico",
    "/Logo-Bento-Hero.svg", "/vacaciones/champi-vacaciones.webp", "/robots.txt", "/sitemap.xml",
  ])("never takes over excluded route %s", (path) => {
    expect(middleware(request(path))).toBeUndefined();
  });

  it.each(["/", "/menu", "/reservas", "/admin/login", "/aviso-legal"])("preserves locale-first redirects for %s", (path) => {
    const response = middleware(request(path));
    expect(response?.headers.get("location")).toBe(`${origin}/es${path}`);
    expect(response?.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("keeps queries but does not let them override the server clock", () => {
    const response = middleware(request("/es/menu?utm_source=maps&now=2099-01-01&vacaciones=false"));
    const destination = new URL(response!.headers.get("x-middleware-rewrite")!);
    expect(destination.pathname).toBe("/es/vacaciones");
    expect(destination.searchParams.get("utm_source")).toBe("maps");
    vi.setSystemTime(VACACIONES_END);
    expect(middleware(request("/es?now=2026-10-28&vacaciones=true"))).toBeUndefined();
  });
});
