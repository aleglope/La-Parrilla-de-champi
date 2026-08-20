/**
 * Elección del formato de transporte de la foto según lo que el navegador sabe
 * CODIFICAR.
 *
 * El fallo que motiva estas pruebas: `compressImage` pedía siempre
 * `image/webp`. `browser-image-compression` acaba llamando a
 * `canvas.toDataURL(tipo, calidad)` y, según la especificación, si el navegador
 * no sabe codificar ese tipo NO lanza: devuelve PNG en silencio. Safari en
 * iPhone decodifica WebP pero no lo codifica por canvas, así que la foto
 * "comprimida" salía como un PNG enorme y el admin leía que su foto pesaba
 * demasiado — un diagnóstico falso.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { compresionMock } = vi.hoisted(() => ({ compresionMock: vi.fn() }));

vi.mock("browser-image-compression", () => ({ default: compresionMock }));

const DATA_URL_PNG = "data:image/png;base64,iVBORw0KGgo=";
const DATA_URL_WEBP = "data:image/webp;base64,UklGRg==";

const toDataURLOriginal = HTMLCanvasElement.prototype.toDataURL;

/** Sustituye el codificador del canvas por el de un navegador concreto. */
const simularNavegador = (dataUrl: string) => {
  const espia = vi.fn(() => dataUrl);
  HTMLCanvasElement.prototype.toDataURL =
    espia as unknown as typeof toDataURLOriginal;
  return espia;
};

/**
 * La caché de la sonda vive en el ámbito del módulo, así que cada caso necesita
 * una carga limpia. Se hace desde el test para no exponer un reseteador de
 * pruebas en la API de producción.
 */
const cargarHelpers = async () => {
  vi.resetModules();
  return import("@/utils/imageHelpers");
};

const ficheroDeEntrada = () =>
  new File(["PIXELES-ORIGINALES"], "foto.jpg", { type: "image/jpeg" });

beforeEach(() => {
  compresionMock.mockReset();
});

afterEach(() => {
  HTMLCanvasElement.prototype.toDataURL = toDataURLOriginal;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("sonda de codificación WebP por canvas", () => {
  it("un navegador que devuelve PNG al pedir WebP no sabe codificarlo: se transporta JPEG", async () => {
    simularNavegador(DATA_URL_PNG);
    const { canvasCanEncodeWebp, getTransportMimeType } = await cargarHelpers();

    expect(canvasCanEncodeWebp()).toBe(false);
    expect(getTransportMimeType()).toBe("image/jpeg");
  });

  it("un navegador que devuelve WebP sí sabe codificarlo: se sigue transportando WebP", async () => {
    simularNavegador(DATA_URL_WEBP);
    const { canvasCanEncodeWebp, getTransportMimeType } = await cargarHelpers();

    expect(canvasCanEncodeWebp()).toBe(true);
    expect(getTransportMimeType()).toBe("image/webp");
  });

  it("sonda una sola vez por sesión: el resultado se cachea", async () => {
    const espia = simularNavegador(DATA_URL_WEBP);
    const { canvasCanEncodeWebp, getTransportMimeType } = await cargarHelpers();

    canvasCanEncodeWebp();
    canvasCanEncodeWebp();
    getTransportMimeType();
    getTransportMimeType();

    expect(espia).toHaveBeenCalledTimes(1);
  });

  it("sin document (bundle de servidor) devuelve false sin lanzar", async () => {
    vi.stubGlobal("document", undefined);
    const { canvasCanEncodeWebp, getTransportMimeType } = await cargarHelpers();

    expect(canvasCanEncodeWebp()).toBe(false);
    expect(getTransportMimeType()).toBe("image/jpeg");
  });

  it("si toDataURL lanza, la sonda devuelve false sin propagar la excepción", async () => {
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
      throw new Error("sin codificador");
    }) as unknown as typeof toDataURLOriginal;
    const { canvasCanEncodeWebp } = await cargarHelpers();

    expect(canvasCanEncodeWebp()).toBe(false);
  });
});

describe("compressImage frente al formato realmente devuelto", () => {
  it("pide a la librería el formato que el navegador sí sabe codificar", async () => {
    simularNavegador(DATA_URL_PNG); // Safari: no codifica WebP
    const { compressImage } = await cargarHelpers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    compresionMock.mockResolvedValue(
      new File(["x"], "foto.png", { type: "image/png" })
    );

    await expect(compressImage(ficheroDeEntrada())).rejects.toThrow();

    expect(compresionMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ fileType: "image/jpeg" })
    );
  });

  it("si el navegador devuelve otro formato, el error habla de la conversión y no del peso", async () => {
    simularNavegador(DATA_URL_WEBP); // la sonda dice que sí sabe WebP
    const { compressImage, ERROR_MESSAGES } = await cargarHelpers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    compresionMock.mockResolvedValue(
      new File(["x"], "foto.png", { type: "image/png" })
    );

    await expect(compressImage(ficheroDeEntrada())).rejects.toThrow(
      ERROR_MESSAGES.TRANSPORT_ENCODE_MISMATCH
    );
  });

  it("un fallo real de la librería sigue dando el mensaje genérico de compresión", async () => {
    simularNavegador(DATA_URL_WEBP);
    const { compressImage, ERROR_MESSAGES } = await cargarHelpers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    compresionMock.mockRejectedValue(new Error("worker roto"));

    await expect(compressImage(ficheroDeEntrada())).rejects.toThrow(
      ERROR_MESSAGES.COMPRESSION_FAILED
    );
  });
});
