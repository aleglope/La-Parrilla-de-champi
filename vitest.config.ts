import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // tsconfig usa jsx:preserve (Next); oxc debe transformar JSX en tests
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
    coverage: {
      reporter: ["text", "html"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "utils/**/*.{ts,tsx}",
      ],
      exclude: ["**/*.d.ts", "**/node_modules/**", "**/__tests__/**"],
    },
  },
});
