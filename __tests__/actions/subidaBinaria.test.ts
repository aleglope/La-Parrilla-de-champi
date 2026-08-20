// @vitest-environment node

/**
 * La foto de un plato viaja a las Server Actions como binario dentro de un
 * FormData, no como cadena base64 (que inflaba el envío un ~33% contra un techo
 * de cuerpo que es infraestructura y no se puede subir).
 *
 * Lo que se prueba aquí es que ese cambio de transporte NO abrió un agujero: la
 * validación de formato sigue mirando los magic bytes del buffer recibido, no
 * el tipo MIME que declara el cliente, y corta ANTES de que sharp toque nada.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const { spies, getSupabaseAdminMock } = vi.hoisted(() => {
  const spies = {
    upload: vi.fn(async () => ({ error: null })),
    getPublicUrl: vi.fn(() => ({
      data: { publicUrl: "https://supabase.test/dishes/nueva.webp" },
    })),
    remove: vi.fn(async () => ({ error: null })),
    dbUpdate: vi.fn(),
    reencode: vi.fn(),
    checkRateLimit: vi.fn(async () => true),
    isAdmin: vi.fn(async () => true),
  };

  const cliente = {
    storage: {
      from: vi.fn(() => ({
        upload: spies.upload,
        getPublicUrl: spies.getPublicUrl,
        remove: spies.remove,
      })),
    },
    from: vi.fn(() => {
      const chain: Record<string, unknown> = {};
      chain.update = vi.fn((...args: unknown[]) => {
        spies.dbUpdate(...args);
        return chain;
      });
      chain.eq = vi.fn(async () => ({ error: null }));
      return chain;
    }),
  };

  return { spies, getSupabaseAdminMock: vi.fn(() => cliente) };
});

vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: getSupabaseAdminMock }));
vi.mock("@/lib/ratelimit", () => ({ checkRateLimit: spies.checkRateLimit }));
vi.mock("@/lib/auth/requireAdmin", () => ({ isAdminRequest: spies.isAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/images/reencodeImage", () => ({
  reencodeToWebp: spies.reencode,
  reencodeErrorMessage: (motivo: string) => `reencodado fallido: ${motivo}`,
  MAX_INPUT_SIZE_BYTES: 4.5 * 1024 * 1024,
}));

import { uploadDishImage } from "@/app/actions/uploadDishImage";
import { ERROR_MESSAGES } from "@/utils/imageHelpers";

// ---- Datos ----

/** Cabecera PNG real seguida de relleno: lo que mira la validación. */
const BYTES_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

/** Texto plano: ningún formato de imagen empieza así. */
const BYTES_NO_IMAGEN = new TextEncoder().encode(
  "esto no es una imagen, es texto plano disfrazado"
);

const payloadCon = (
  bytes: Uint8Array,
  opciones: { type?: string; nombre?: string } = {}
) => {
  const payload = new FormData();
  payload.append("dishId", "plato-1");
  payload.append("dishName", "Churrasco");
  payload.append(
    "image",
    new Blob([bytes], { type: opciones.type ?? "image/png" }),
    opciones.nombre ?? "foto.png"
  );
  return payload;
};

beforeEach(() => {
  vi.clearAllMocks();
  spies.isAdmin.mockResolvedValue(true);
  spies.checkRateLimit.mockResolvedValue(true);
  spies.upload.mockResolvedValue({ error: null });
  spies.getPublicUrl.mockReturnValue({
    data: { publicUrl: "https://supabase.test/dishes/nueva.webp" },
  });
  spies.reencode.mockResolvedValue({
    success: true,
    buffer: Buffer.from("webp-reencodado"),
    sizeKb: 120,
    quality: 82,
  });
});

// ---- Pruebas ----

describe("uploadDishImage con la imagen en binario", () => {
  it("sube la foto y devuelve la URL pública", async () => {
    const resultado = await uploadDishImage(payloadCon(BYTES_PNG));

    expect(resultado.success).toBe(true);
    expect(resultado.imageUrl).toBe("https://supabase.test/dishes/nueva.webp");
    expect(spies.upload).toHaveBeenCalledTimes(1);
  });

  it("pasa a sharp los bytes recibidos, sin decodificar base64 por el camino", async () => {
    await uploadDishImage(payloadCon(BYTES_PNG));

    const bufferRecibido = spies.reencode.mock.calls[0][0] as Buffer;
    expect(Buffer.isBuffer(bufferRecibido)).toBe(true);
    expect(Buffer.from(BYTES_PNG).equals(bufferRecibido)).toBe(true);
  });

  it("rechaza un binario que no es una imagen y NO llega a invocar a sharp", async () => {
    const resultado = await uploadDishImage(payloadCon(BYTES_NO_IMAGEN));

    expect(resultado.success).toBe(false);
    expect(resultado.error).toBe(ERROR_MESSAGES.INVALID_TYPE);
    // El gate corta antes, no después: sharp no ve el buffer.
    expect(spies.reencode).not.toHaveBeenCalled();
    expect(spies.upload).not.toHaveBeenCalled();
  });

  it("acepta una cabecera PNG válida aunque el tipo declarado por el cliente mienta", async () => {
    const resultado = await uploadDishImage(
      payloadCon(BYTES_PNG, { type: "text/plain", nombre: "notas.txt" })
    );

    expect(resultado.success).toBe(true);
  });

  it("sin sesión admin devuelve No autorizado y no toca Storage", async () => {
    spies.isAdmin.mockResolvedValue(false);

    const resultado = await uploadDishImage(payloadCon(BYTES_PNG));

    expect(resultado).toEqual({ success: false, error: "No autorizado" });
    expect(spies.upload).not.toHaveBeenCalled();
    expect(spies.reencode).not.toHaveBeenCalled();
  });

  it("si el FormData no trae imagen devuelve error en vez de lanzar", async () => {
    const payload = new FormData();
    payload.append("dishId", "plato-1");
    payload.append("dishName", "Churrasco");

    const resultado = await uploadDishImage(payload);

    expect(resultado.success).toBe(false);
    expect(resultado.error).toBe(ERROR_MESSAGES.INVALID_TYPE);
    expect(spies.reencode).not.toHaveBeenCalled();
  });
});
