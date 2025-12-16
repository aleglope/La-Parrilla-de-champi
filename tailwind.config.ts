import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de marca - La Parrilla de Champi
        charcoal: {
          DEFAULT: "#283435",
          dark: "#1a2324",
          light: "#314042",
        },
        ocean: {
          DEFAULT: "#273A46",
          deep: "#1e2d36",
          light: "#314a5a",
        },
        fire: {
          red: "#C01F19",
          "red-glow": "#e02820",
          "red-dark": "#9a1813",
        },
        flame: {
          blue: "#314A78",
          "blue-bright": "#1789C0",
          "blue-glow": "#2699d0",
        },
        // Sistema de tonos cálidos para texto (reemplazo de blanco puro)
        ash: {
          50: "#F5F3F0", // Blanco cálido - Títulos principales
          100: "#EBE8E3", // Blanco humo - Subtítulos
          200: "#D9D5CF", // Gris claro cálido - Texto destacado
          300: "#B8B3AB", // Texto normal principal
          400: "#9A948B", // Texto secundario
          500: "#7C766D", // Placeholders y metadatos
        },
      },
      backgroundImage: {
        "charcoal-texture": "url('/textures/charcoal-bg.jpg')",
        "wood-burned": "url('/textures/wood-burned.jpg')",
        "gradient-fire": "linear-gradient(135deg, #C01F19 0%, #314A78 100%)",
        "gradient-ocean-fire":
          "linear-gradient(180deg, #273A46 0%, #283435 50%, #C01F19 100%)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "ember-float": "emberFloat 8s ease-in-out infinite",
        "scale-pulse": "scalePulse 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "liquid-morph": "liquidMorph 4s ease-in-out infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
      },
      keyframes: {
        emberFloat: {
          "0%, 100%": {
            transform: "translateY(0) translateX(0) scale(1)",
            opacity: "0.8",
          },
          "50%": {
            transform: "translateY(-100px) translateX(20px) scale(1.2)",
            opacity: "0.4",
          },
        },
        scalePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        liquidMorph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% center" },
          "50%": { backgroundPosition: "100% center" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
