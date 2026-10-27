import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// La tienda se publica en GitHub Pages bajo /RocketFix/. Para otro alojamiento (dominio propio, Netlify…)
// se compila con BASE_PATH=/ npm run build. Las rutas internas usan # (ej.: #p/sa07), así que recargar
// o abrir un enlace directo nunca da 404 en un alojamiento estático.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/RocketFix/",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 700
  }
});
