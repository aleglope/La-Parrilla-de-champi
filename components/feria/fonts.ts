import { MedievalSharp } from "next/font/google";

/**
 * Fuente gótica del modo feria, instanciada una sola vez y compartida por
 * los componentes de components/feria/ (títulos/cabeceras solamente).
 * Cobertura latin verificada para acentos es/gl (á é í ó ú ñ ü).
 */
export const medievalFont = MedievalSharp({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["serif"],
});
