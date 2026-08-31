"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface NeonSignCanvasProps {
  /** Ruta del GLB dentro de /public. */
  readonly src: string;
  /** Texto del rótulo, para quien no puede ver el canvas. */
  readonly alt: string;
  /** Margen alrededor del rótulo al encuadrar. 1 = justo, 1.15 = 15% de aire. */
  readonly padding?: number;
  /** Inclinación máxima de la deriva, en grados. 0 lo deja recto. */
  readonly tiltDeg?: number;
  /** Recorrido vertical de la flotación, como fracción del alto del rótulo. */
  readonly floatAmount?: number;
  /** Duración de un ciclo completo de flotación, en segundos. */
  readonly floatSeconds?: number;
  /** Desfase inicial, para que los dos rótulos no floten al mismo compás. */
  readonly floatOffset?: number;
  readonly className?: string;
}

/**
 * Escena de Three.js para un rótulo de neón exportado desde Blender.
 *
 * Los GLB vienen con el halo ya modelado (un segundo tubo con alpha 0.14 y
 * backface culling), así que aquí no hace falta postprocesado: el resplandor
 * sobre la pared lo pone el contenedor con un gradiente CSS.
 *
 * Solo dibuja mientras está en pantalla y la pestaña está activa, y libera el
 * contexto WebGL al desmontar — el navegador solo da unos 16 y la carta ya
 * gasta uno en el fondo de partículas de la home.
 */
export function NeonSignCanvas({
  src,
  alt,
  padding = 1.12,
  tiltDeg = 0.8,
  floatAmount = 0.05,
  floatSeconds = 7,
  floatOffset = 0,
  className = "",
}: NeonSignCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">(
    "cargando"
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // React 18 en dev monta y desmonta dos veces: la carga del GLB es async y
    // sin esta bandera el segundo montaje se encuentra la escena ya destruida.
    let desmontado = false;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Khronos PBR Neutral, igual que en Blender y en el visor de model-viewer.
    // Con ACES el rojo vira a naranja y el morado a magenta.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);

    // Los tubos emiten luz propia, pero los niveles amarillos del segundo
    // rótulo son objetos sólidos: sin entorno que reflejar salen planos.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.55;

    const luz = new THREE.DirectionalLight(0xffffff, 1.1);
    luz.position.set(0.6, 1.2, 2);
    scene.add(luz);

    // Jerarquía: raiz (flotación y parallax de ratón) → flotante (deriva) →
    // modelo. Los dos giros van separados para que no se pisen.
    const raiz = new THREE.Group();
    const flotante = new THREE.Group();
    raiz.add(flotante);
    scene.add(raiz);

    let anchoModelo = 1;
    let altoModelo = 1;

    const encuadrar = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const mitadFov = THREE.MathUtils.degToRad(camera.fov) / 2;
      const distanciaVertical = altoModelo / 2 / Math.tan(mitadFov);
      const distanciaHorizontal =
        anchoModelo / 2 / (Math.tan(mitadFov) * camera.aspect);
      camera.position.z =
        Math.max(distanciaVertical, distanciaHorizontal) * padding;
      camera.updateProjectionMatrix();
    };

    const sinMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let visible = false;
    let cargado = false;
    let ratonX = 0;
    let ratonY = 0;
    let giroX = 0;
    let giroY = 0;
    const inicio = performance.now();

    const dibujar = () => {
      raf = requestAnimationFrame(dibujar);
      if (!sinMovimiento) {
        const t = (performance.now() - inicio) / 1000;
        const fase = ((t + floatOffset) / floatSeconds) * Math.PI * 2;
        // Flota: sube y baja despacio, y la inclinación va a otro ritmo (el
        // 0.63) para que el conjunto no vuelva nunca a la misma pose y no se
        // lea como un bucle.
        raiz.position.y = altoModelo * floatAmount * Math.sin(fase);
        flotante.rotation.z =
          THREE.MathUtils.degToRad(tiltDeg) * Math.sin(fase * 0.63);
        // El parallax persigue al ratón con inercia: sin el 0.05 salta.
        giroY += (ratonX * 0.16 - giroY) * 0.05;
        giroX += (ratonY * 0.1 - giroX) * 0.05;
        raiz.rotation.y = giroY;
        raiz.rotation.x = giroX;
      }
      renderer.render(scene, camera);
    };

    const arrancar = () => {
      if (raf !== 0 || !cargado || !visible || document.hidden) return;
      raf = requestAnimationFrame(dibujar);
    };

    const parar = () => {
      if (raf === 0) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onRaton = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      ratonX = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      ratonY = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    };

    const onVisibilidad = () => (document.hidden ? parar() : arrancar());

    const observadorViewport = new IntersectionObserver(
      ([entrada]) => {
        visible = entrada.isIntersecting;
        if (visible) arrancar();
        else parar();
      },
      { rootMargin: "120px" }
    );
    observadorViewport.observe(container);

    const observadorTamano = new ResizeObserver(() => encuadrar());
    observadorTamano.observe(container);

    window.addEventListener("pointermove", onRaton, { passive: true });
    document.addEventListener("visibilitychange", onVisibilidad);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      src,
      (gltf) => {
        if (desmontado) return;
        const modelo = gltf.scene;
        // Los GLB están en milímetros: 1200 mm de ancho de texto.
        modelo.scale.setScalar(0.001);

        modelo.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.frustumCulled = false;
          const materiales = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const material of materiales) {
            // Blender no exporta esta decisión y sin ella el halo recorta lo
            // que tiene detrás: los tubos que cruzan por debajo desaparecen.
            if (material.transparent) material.depthWrite = false;
          }
        });

        const caja = new THREE.Box3().setFromObject(modelo);
        const tamano = caja.getSize(new THREE.Vector3());
        const centro = caja.getCenter(new THREE.Vector3());
        anchoModelo = tamano.x;
        altoModelo = tamano.y;

        // Centrado en el origen: la inclinación gira sobre el propio rótulo,
        // que es como se mueve algo que flota — no cuelga de ningún sitio.
        modelo.position.sub(centro);
        flotante.add(modelo);

        encuadrar();
        cargado = true;
        setEstado("listo");
        arrancar();
      },
      undefined,
      (err) => {
        if (desmontado) return;
        console.error(`Error cargando el rótulo ${src}:`, err);
        setEstado("error");
      }
    );

    return () => {
      desmontado = true;
      parar();
      observadorViewport.disconnect();
      observadorTamano.disconnect();
      window.removeEventListener("pointermove", onRaton);
      document.removeEventListener("visibilitychange", onVisibilidad);

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const materiales = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const material of materiales) material.dispose();
      });
      envRT.texture.dispose();
      pmrem.dispose();
      dracoLoader.dispose();
      // dispose() por sí solo no suelta el contexto WebGL, y el navegador solo
      // concede unos 16 antes de empezar a matar los más antiguos.
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, padding, tiltDeg, floatAmount, floatSeconds, floatOffset]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      // Un canvas no expone nada a un lector de pantalla: el rótulo es una
      // imagen y lo que dice es su texto alternativo.
      role="img"
      aria-label={alt}
      data-estado={estado}
    />
  );
}
