/**
 * Contrato de `DishCard` con `next/image`.
 *
 * Por qué existe este fichero: `DishCard` era el único componente del camino
 * público que iba sin red, y es justo el que decide cómo se piden las 79 fotos
 * de la carta. Servirlas directamente desde el CDN de Supabase generaba 5-8
 * GB/mes de egress cacheado contra los 5 GB del plan gratuito; pasarlas por el
 * optimizador de Vercel arregla eso, pero el arreglo se puede deshacer en
 * silencio con un cambio de una línea (quitar `sizes`, "normalizar" el `src`,
 * volver a decidir la prioridad con el índice de categoría). Nada de eso se ve
 * roto a simple vista: la carta sigue pintándose igual. Estos tests son los que
 * lo muerden.
 *
 * Dos capas distintas, para que nadie las confunda:
 *  - AQUÍ se comprueba el CONTRATO con `next/image`: qué props recibe el
 *    componente de imagen. `next/image` está doblado, así que de esta capa no
 *    se puede concluir nada sobre la URL final.
 *  - Que el navegador pida de verdad `/_next/image?url=…` y CERO fotos a
 *    `*.supabase.co` lo verifica la tarea 1 de la quick task, midiendo el HTML
 *    real de `/es/menu` con datos reales.
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

/**
 * El proveedor real de idioma arrastra `useRouter`/`usePathname` de
 * `next/navigation`, que no aportan nada a lo que aquí se prueba. `DishCard`
 * solo consume `language`.
 */
vi.mock("@/lib/i18n/LanguageContext", () => ({
  useLanguage: () => ({ language: "es", setLanguage: vi.fn(), t: {} }),
}));

/**
 * Props con los que se ha llamado a `next/image`, en orden de renderizado.
 *
 * El doble hace dos cosas a la vez a propósito: registra TODOS los props (para
 * poder afirmar sobre `src`, `fill`, `sizes`, `loading` y sobre la AUSENCIA de
 * `priority`) y además pinta una etiqueta de imagen real reenviando `src`,
 * `alt` y `onError`, que es lo que permite disparar el fallo de carga.
 *
 * No se reutiliza el doble de `__tests__/admin/reemplazo-imagen.test.tsx`
 * porque aquel descarta `sizes` y `priority` en silencio, y aquí son justo lo
 * que se quiere observar.
 */
const propsDeImagen: Record<string, unknown>[] = [];

vi.mock("next/image", async () => {
  const react = await import("react");
  return {
    default: (props: Record<string, unknown>) => {
      propsDeImagen.push(props);
      return react.createElement("img", {
        src: props.src,
        alt: props.alt,
        onError: props.onError,
      });
    },
  };
});

import { DishCard } from "@/components/menu/DishCard";
import type { Dish } from "@/lib/types";

// ---- Datos y utilidades del test ----

/** Misma forma que en producción: host de Supabase, bucket `menu-images`. */
const IMAGEN_DEL_PLATO =
  "https://proyecto-de-prueba.supabase.co/storage/v1/object/public/menu-images/dishes/pulpo-a-feira-1712345678901.webp";

/** Ruta que `DishCard` usa cuando el plato no tiene foto propia. */
const IMAGEN_POR_DEFECTO = "/images/default-dish.svg";

const PLATO_CON_FOTO = {
  id: "plato-1",
  category_id: "cat-1",
  name: "Pulpo á feira",
  name_gl: "",
  description: "Con cachelos y pimentón de la Vera",
  description_gl: "",
  price: 18.5,
  image_url: IMAGEN_DEL_PLATO,
  is_available: true,
  order_index: 0,
} as unknown as Dish;

const PLATO_SIN_FOTO = {
  ...PLATO_CON_FOTO,
  id: "plato-2",
  name: "Chuletón de vaca vieja",
  image_url: null,
} as unknown as Dish;

let contenedor: HTMLDivElement;
let root: Root;

/**
 * `useTouchDevice` llama a `window.matchMedia`, que jsdom no implementa. El
 * doble responde que NO es un dispositivo táctil, que es el caso de escritorio
 * y el que deja la tarjeta en su estado inicial.
 */
const doblarMatchMedia = () => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (consulta: string) => ({
      matches: false,
      media: consulta,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

const montarCard = async (dish: Dish, priority = false) => {
  await act(async () => {
    root.render(
      React.createElement(DishCard, { dish, index: 0, priority })
    );
  });
};

/** Props con los que se pintó la imagen la última vez. */
const ultimaImagen = () => {
  const props = propsDeImagen.at(-1);
  if (!props) throw new Error("next/image no llegó a renderizarse");
  return props;
};

const nodoImagen = () => {
  const img = contenedor.querySelector("img");
  if (!img) throw new Error("No hay etiqueta de imagen en la tarjeta");
  return img;
};

const tarjeta = () => {
  const boton = contenedor.querySelector("button");
  if (!boton) throw new Error("No hay tarjeta renderizada");
  return boton;
};

beforeEach(() => {
  // React 18 exige esta marca para que `act` vacíe de verdad las colas.
  (
    globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  doblarMatchMedia();
  propsDeImagen.length = 0;
  contenedor = document.createElement("div");
  document.body.appendChild(contenedor);
  root = createRoot(contenedor);
});

afterEach(() => {
  act(() => root.unmount());
  contenedor.remove();
});

// ---- Pruebas ----

describe("DishCard: cómo pide la foto del plato", () => {
  /**
   * El borrado de imágenes saca la ruta del fichero parseando `image_url` con
   * `/\/menu-images\/(.+)$/`. Si alguien "mejora" la URL aquí, ese parseo deja
   * de encontrarla y `deleteDishImages()` devuelve éxito sin borrar nada:
   * huérfanos en el bucket, en silencio y sin error.
   */
  it("pasa la URL de la base de datos sin transformar", async () => {
    await montarCard(PLATO_CON_FOTO);

    expect(ultimaImagen().src).toBe(IMAGEN_DEL_PLATO);
    expect(String(ultimaImagen().src)).not.toContain("/_next/");
  });

  it("usa el SVG por defecto y sigue siendo volteable cuando el plato no tiene foto", async () => {
    await montarCard(PLATO_SIN_FOTO);

    expect(ultimaImagen().src).toBe(IMAGEN_POR_DEFECTO);
    expect(tarjeta().dataset.hasImage).toBe("true");
    expect(tarjeta().dataset.flippable).toBe("true");
  });

  /**
   * Las dos mitades de la decisión, juntas: `priority` y `loading="lazy"` son
   * excluyentes en `next/image` (lanza un error si llegan los dos), y además
   * `priority` inyecta un preload para una foto que vive en la cara trasera de
   * la tarjeta y que nadie ve hasta que la voltea. Por eso el reparto se hace
   * con `loading` y el prop `priority` no se usa nunca.
   */
  it("traduce la prioridad a loading y nunca pasa el prop priority", async () => {
    await montarCard(PLATO_CON_FOTO, true);
    expect(ultimaImagen().loading).toBe("eager");
    expect(ultimaImagen()).not.toHaveProperty("priority");

    await montarCard(PLATO_CON_FOTO, false);
    expect(ultimaImagen().loading).toBe("lazy");
    expect(ultimaImagen()).not.toHaveProperty("priority");
  });

  /**
   * Comportamiento REAL de hoy, que no es el que sugiere la variable
   * `imageToShow`: cuando la foto falla, `canRevealImage` pasa a false y la
   * cara trasera se desmonta ENTERA, así que el SVG por defecto no llega a
   * verse por este camino. El SVG solo aparece cuando el plato nunca tuvo foto.
   */
  it("deja la tarjeta sin cara trasera cuando la foto falla", async () => {
    await montarCard(PLATO_CON_FOTO);
    expect(tarjeta().textContent).toContain("FOTO");

    // Camino usado: evento `error` nativo sobre el nodo de imagen. React 18 no
    // delega los eventos de medios, los engancha directamente al elemento, así
    // que en jsdom llegan al `onError` del componente sin tener que invocarlo
    // a mano desde el doble.
    await act(async () => {
      nodoImagen().dispatchEvent(new Event("error", { bubbles: false }));
    });

    expect(tarjeta().dataset.hasImage).toBe("false");
    expect(tarjeta().dataset.flippable).toBe("false");
    expect(contenedor.querySelector("img")).toBeNull();
    expect(tarjeta().textContent).not.toContain("FOTO");
  });

  /**
   * El test que protege el dinero: un `fill` sin `sizes` declara 100vw, el
   * navegador se descarga la variante más ancha del srcset y el ahorro de
   * egress se evapora sin que nada se vea roto.
   */
  it("pide la imagen con fill y con sizes declarado", async () => {
    await montarCard(PLATO_CON_FOTO);

    expect(ultimaImagen().fill).toBe(true);
    expect(typeof ultimaImagen().sizes).toBe("string");
    expect(ultimaImagen().sizes).not.toBe("");
    expect(String(ultimaImagen().sizes)).toContain("vw");
  });
});
