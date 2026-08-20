/**
 * Reemplazo de la foto de un plato desde el panel admin.
 *
 * El fallo que motiva estas pruebas: al cambiar la foto de un plato que YA
 * tenía imagen, el plato se guardaba conservando la imagen antigua. La causa
 * es que la foto elegida no llega al modal hasta que termina de validarse y
 * comprimirse (segundos, con una foto de móvil), y hasta entonces `Guardar`
 * seguía activo: al pulsarlo, `pendingImage` era null, no se subía nada y el
 * plato se guardaba con su `image_url` anterior, sin ningún aviso.
 *
 * En un plato sin foto el mismo fallo se ve a simple vista ("Sin imagen"); en
 * uno que ya tenía foto es invisible, y por eso solo se notó al reemplazar.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";

// ---- Mocks ----

vi.mock("framer-motion", async () => {
  const react = await import("react");
  const quitarPropsDeAnimacion = (props: Record<string, unknown>) => {
    const {
      initial,
      animate,
      exit,
      transition,
      layout,
      variants,
      whileHover,
      whileTap,
      ...resto
    } = props;
    void initial;
    void animate;
    void exit;
    void transition;
    void layout;
    void variants;
    void whileHover;
    void whileTap;
    return resto;
  };

  const motion = new Proxy(
    {},
    {
      get: (_target, etiqueta: string) =>
        react.forwardRef<unknown, Record<string, unknown>>((props, ref) =>
          react.createElement(etiqueta, {
            ...quitarPropsDeAnimacion(props),
            ref,
          })
        ),
    }
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      react.createElement(react.Fragment, null, children),
  };
});

vi.mock("next/image", async () => {
  const react = await import("react");
  return {
    default: (props: Record<string, unknown>) => {
      const { fill, sizes, unoptimized, priority, ...resto } = props;
      void fill;
      void sizes;
      void unoptimized;
      void priority;
      return react.createElement("img", resto);
    },
  };
});

const updateDishImage = vi.fn(async () => ({
  success: true,
  imageUrl: "https://supabase.test/dishes/foto-nueva.webp",
}));
vi.mock("@/app/actions/updateDishImage", () => ({
  updateDishImage: (...args: unknown[]) => updateDishImage(...(args as [])),
}));

vi.mock("@/app/actions/deleteDishImage", () => ({
  deleteDishImage: vi.fn(async () => ({ success: true })),
}));

/**
 * `compressImage` real usa canvas, que jsdom no tiene. El doble conserva el
 * contenido del fichero de entrada para poder afirmar, byte a byte, cuál de
 * las fotos elegidas acabó viajando al servidor.
 *
 * El `setTimeout` no es adorno: comprimir una foto de móvil tarda segundos, y
 * es en esa ventana donde el admin se adelanta pulsando Guardar. Sin él, el
 * doble resolvería en el mismo tick y la ventana que se está probando no
 * existiría. Antes la aportaba de rebote el `FileReader` que convertía a
 * base64 dentro del componente; al pasar la foto a binario ese paso desapareció
 * y la espera hay que declararla aquí, que es donde de verdad ocurre.
 */
vi.mock("@/utils/imageHelpers", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/utils/imageHelpers")>();
  return {
    ...original,
    validateImage: vi.fn(async () => ({ isValid: true })),
    compressImage: vi.fn(async (file: File) => {
      const contenido = await file.text();
      await new Promise((resolve) => setTimeout(resolve, 0));
      return {
        file: new File([`comprimida:${contenido}`], file.name, {
          type: "image/webp",
        }),
        sizeKB: 120,
        dimensions: { width: 800, height: 600 },
        originalSizeKB: 900,
        compressionRatio: 86,
      };
    }),
    createPreviewUrl: vi.fn(() => "blob:preview"),
    revokePreviewUrl: vi.fn(),
  };
});

import { DishModal } from "@/components/admin/DishModal";
import type { Category, Dish } from "@/lib/types";

// ---- Datos y utilidades del test ----

const IMAGEN_ANTIGUA = "https://supabase.test/dishes/foto-antigua.webp";

const PLATO_CON_FOTO = {
  id: "plato-1",
  name: "Coulant de chocolate",
  name_gl: "",
  description: "",
  description_gl: "",
  price: 6.5,
  category_id: "cat-1",
  image_url: IMAGEN_ANTIGUA,
  is_available: true,
  order_index: 0,
} as unknown as Dish;

const CATEGORIAS = [{ id: "cat-1", name: "Postres" }] as unknown as Category[];

let contenedor: HTMLDivElement;
let root: Root;

const montarModal = async (onSave = vi.fn(async () => ({ success: true }))) => {
  await act(async () => {
    root.render(
      React.createElement(DishModal, {
        isOpen: true,
        dish: PLATO_CON_FOTO,
        categories: CATEGORIAS,
        onClose: vi.fn(),
        onSave,
        isLoading: false,
      })
    );
  });
  return onSave;
};

/**
 * Simula al admin eligiendo un fichero. Al volver, la compresión sigue en
 * curso: se ha quedado esperando al FileReader, igual que en el navegador.
 */
const elegirFoto = async (nombre: string, contenido: string) => {
  const input = contenedor.querySelector<HTMLInputElement>(
    'input[type="file"]'
  );
  if (!input) throw new Error("No hay input de fichero en el modal");

  const fichero = new File([contenido], nombre, { type: "image/jpeg" });
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [fichero],
  });

  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
};

/** Deja que terminen las tareas de macrotarea (FileReader) de la compresión. */
const esperarProcesado = async () => {
  for (let i = 0; i < 3; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
};

const botonGuardar = () => {
  const boton = contenedor.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  );
  if (!boton) throw new Error("No hay botón de guardar en el modal");
  return boton;
};

const guardar = async () => {
  const form = contenedor.querySelector("form");
  if (!form) throw new Error("No hay formulario en el modal");
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
};

/** Devuelve el FormData con el que se llamó a la Server Action. */
const payloadEnviado = () => {
  const llamada = updateDishImage.mock.calls.at(-1)?.[0] as FormData | undefined;
  if (!llamada) throw new Error("updateDishImage no fue llamada");
  return llamada;
};

/** Devuelve el contenido real de la imagen que se envió al servidor. */
const contenidoEnviado = async () => {
  const imagen = payloadEnviado().get("image");
  if (!(imagen instanceof Blob)) {
    throw new Error("La imagen no viajó como binario");
  }
  return imagen.text();
};

beforeEach(() => {
  // React 18 exige esta marca para que `act` vacíe de verdad las colas.
  (
    globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  updateDishImage.mockClear();
  contenedor = document.createElement("div");
  document.body.appendChild(contenedor);
  root = createRoot(contenedor);
});

afterEach(() => {
  act(() => root.unmount());
  contenedor.remove();
});

// ---- Pruebas ----

describe("reemplazo de la imagen de un plato existente", () => {
  it("no guarda el plato con la imagen antigua si el admin se adelanta a la compresión", async () => {
    const onSave = await montarModal();

    // El admin elige la foto y pulsa Guardar sin esperar a que se comprima.
    await elegirFoto("nueva.jpg", "PIXELES-NUEVOS");

    // Mientras la foto se prepara, Guardar está bloqueado. Se comprueba aquí,
    // que es el momento en que se puede observar: el `act` del propio submit
    // vacía la cola de tareas y con ella termina la compresión.
    expect(botonGuardar().disabled).toBe(true);

    await guardar();

    // Guardar aquí sería guardar el plato con su imagen anterior.
    expect(onSave).not.toHaveBeenCalled();
    expect(updateDishImage).not.toHaveBeenCalled();

    // En cuanto la foto está lista, guardar sube la nueva.
    await esperarProcesado();
    expect(botonGuardar().disabled).toBe(false);

    await guardar();
    expect(updateDishImage).toHaveBeenCalledTimes(1);
    expect(await contenidoEnviado()).toBe("comprimida:PIXELES-NUEVOS");
    expect(onSave).not.toHaveBeenCalledWith(
      expect.objectContaining({ image_url: IMAGEN_ANTIGUA })
    );
  });

  it("envía la foto recién elegida, no la que ya tenía el plato", async () => {
    await montarModal();
    await elegirFoto("nueva.jpg", "PIXELES-NUEVOS");
    await esperarProcesado();
    await guardar();

    expect(updateDishImage).toHaveBeenCalledTimes(1);
    expect(await contenidoEnviado()).toBe("comprimida:PIXELES-NUEVOS");
  });

  it("tras cambiar de idea, envía la última foto elegida y no la primera", async () => {
    await montarModal();
    await elegirFoto("primera.jpg", "PIXELES-PRIMERA");
    await esperarProcesado();
    await elegirFoto("segunda.jpg", "PIXELES-SEGUNDA");
    await esperarProcesado();
    await guardar();

    expect(updateDishImage).toHaveBeenCalledTimes(1);
    expect(await contenidoEnviado()).toBe("comprimida:PIXELES-SEGUNDA");
  });

  it("manda como imagen anterior la del plato, para que el servidor borre la correcta", async () => {
    await montarModal();
    await elegirFoto("nueva.jpg", "PIXELES-NUEVOS");
    await esperarProcesado();
    await guardar();

    // Mismo invariante que antes; se lee del FormData en vez de un objeto.
    const payload = payloadEnviado();
    expect(payload.get("dishId")).toBe("plato-1");
    expect(payload.get("oldImageUrl")).toBe(IMAGEN_ANTIGUA);
  });

  /**
   * Red de seguridad del paso a binario: si alguien "arregla" un fallo futuro
   * volviendo a serializar la foto a cadena, el envío recuperaría el ~33% de
   * inflado del base64 contra un techo de cuerpo que no se puede subir.
   */
  it("manda la foto en binario, no como cadena", async () => {
    await montarModal();
    await elegirFoto("nueva.jpg", "PIXELES-NUEVOS");
    await esperarProcesado();
    await guardar();

    const imagen = payloadEnviado().get("image");
    expect(imagen).toBeInstanceOf(Blob);
    expect(typeof imagen).not.toBe("string");
  });
});
