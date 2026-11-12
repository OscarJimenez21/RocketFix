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

/** Mejora de rendimiento 1 y 2 (12/11/2026): la lista de productos y las galerías de fotos van en archivos aparte,
    datos/productos.json y datos/galerias.json, con nombre fijo.
    · Antes la lista de productos iba dentro del programa de la tienda (assets/index-….js): cada cambio de precios cambiaba
      ese archivo entero y todos los visitantes lo volvían a bajar. Ahora un cambio de precios solo cambia productos.json,
      y el programa sigue guardado en el navegador de quien ya entró.
    · La tienda baja productos.json al mismo tiempo que el programa (index.html lo pide de una vez) y arranca cuando
      tiene los dos (ver src/main.tsx). src/data/catalogo.ts lo recibe en globalThis.__RF_PRODUCTOS.
    · Las galerías (las fotos extra de cada producto) solo se piden al abrir un producto o al pasar el mouse por una tarjeta
      (ver src/lib/galerias.ts).
    · Las pruebas automáticas (Vitest) siguen leyendo los JSON directamente: este cambio no corre ahí. */
function datosAparte(): Plugin {
  const archivos = { "datos/productos.json": "productos.json", "datos/galerias.json": "galerias.json" } as const;
  const leer = (f: string) => readFileSync(new URL(`./src/data/${f}`, import.meta.url), "utf8");
  const VIRTUAL = "\0rf-productos";
  let base = "/";
  return {
    name: "datos-aparte",
    enforce: "pre",
    configResolved(c) { base = c.base; },
    resolveId(fuente, importador) {
      if (process.env.VITEST) return null;
      if (fuente === "./productos.json" && importador?.replace(/\\/g, "/").endsWith("/src/data/catalogo.ts")) return VIRTUAL;
      return null;
    },
    load(id) {
      if (id === VIRTUAL) return "export default globalThis.__RF_PRODUCTOS;";
      return null;
    },
    configureServer(servidor) {
      servidor.middlewares.use((pedido, respuesta, seguir) => {
        const url = pedido.url?.split("?")[0] ?? "";
        const clave = Object.keys(archivos).find(k => url === base + k) as keyof typeof archivos | undefined;
        if (!clave) return seguir();
        respuesta.setHeader("Content-Type", "application/json; charset=utf-8");
        respuesta.end(leer(archivos[clave]));
      });
    },
    generateBundle() {
      for (const [destino, origen] of Object.entries(archivos)) {
        this.emitFile({ type: "asset", fileName: destino, source: JSON.stringify(JSON.parse(leer(origen))) });
      }
    },
    // index.html pide de una vez la lista de productos y el programa de la tienda (src/arranque.tsx y lo que usa), para
    // que lleguen en paralelo y no uno después del otro
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const enlaces = [`<link rel="preload" href="${base}datos/productos.json" as="fetch" crossorigin="anonymous" fetchpriority="high">`];
        const paquete = ctx.bundle;
        if (paquete) {
          const arranque = Object.values(paquete).find(c => c.type === "chunk" && c.facadeModuleId?.replace(/\\/g, "/").endsWith("/src/arranque.tsx"));
          const vistos = new Set<string>();
          const recorrer = (nombre: string) => {
            const c = paquete[nombre];
            if (!c || c.type !== "chunk" || vistos.has(nombre)) return;
            vistos.add(nombre);
            c.imports.forEach(recorrer);
          };
          if (arranque) recorrer(arranque.fileName);
          for (const n of vistos) enlaces.push(`<link rel="modulepreload" crossorigin href="${base}${n}">`);
        }
        return html.replace("</head>", `    ${enlaces.join("\n    ")}\n  </head>`);
      }
    }
  };
}

// La tienda se publica en GitHub Pages bajo /RocketFix/. Para otro alojamiento (dominio propio, Netlify…)
// se compila con BASE_PATH=/ npm run build.
// Direcciones limpias (12/11/2026): /RocketFix/p/sa07/ en vez de /RocketFix/#p/sa07. Las páginas de productos, secciones,
// marcas, blog y políticas existen como archivos (scripts/paginas-estaticas.mjs); las demás (búsquedas, favoritos) las
// atiende public/404.html, que devuelve a la tienda con la dirección pedida. Los enlaces viejos con # siguen funcionando.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/RocketFix/",
  plugins: [react(), descripcionesPorProducto(), datosAparte()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 700
  }
});
