import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Una descripción por producto: de src/data/descripciones.json sale un archivo descripciones/<id>.json por producto.
    La página de producto pide solo la suya, en vez de cargar las casi mil descripciones (unos 62 KB comprimidos) para
    mostrar una. Al trabajar en local las sirve el mismo servidor de Vite, leídas del JSON en cada pedido. */
function descripcionesPorProducto(): Plugin {
  const leer = () => JSON.parse(readFileSync(new URL("./src/data/descripciones.json", import.meta.url), "utf8")) as Record<string, unknown>;
  return {
    name: "descripciones-por-producto",
    configureServer(servidor) {
      servidor.middlewares.use((pedido, respuesta, seguir) => {
        const m = /\/descripciones\/([\w-]+)\.json$/.exec(pedido.url?.split("?")[0] ?? "");
        if (!m?.[1]) return seguir();
        const d = leer()[m[1]];
        respuesta.setHeader("Content-Type", "application/json; charset=utf-8");
        if (!d) { respuesta.statusCode = 404; respuesta.end("{}"); return; }
        respuesta.end(JSON.stringify(d));
      });
    },
    generateBundle() {
      for (const [id, d] of Object.entries(leer())) {
        if (/^[\w-]+$/.test(id)) this.emitFile({ type: "asset", fileName: `descripciones/${id}.json`, source: JSON.stringify(d) });
      }
    }
  };
}

// La tienda se publica en GitHub Pages bajo /RocketFix/. Para otro alojamiento (dominio propio, Netlify…)
// se compila con BASE_PATH=/ npm run build. Las rutas internas usan # (ej.: #p/sa07), así que recargar
// o abrir un enlace directo nunca da 404 en un alojamiento estático.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/RocketFix/",
  plugins: [react(), descripcionesPorProducto()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 700
  }
});
