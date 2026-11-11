// Pruebas automáticas (npm run probar). Corren en un navegador simulado (jsdom), sin abrir ventanas.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/pruebas/preparar.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true
  }
});
