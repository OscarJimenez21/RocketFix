import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Limite } from "./components/Limite";
import { PRODUCTOS } from "./data/catalogo";
import { slug } from "./lib/formato";
import "./index.css";

// Páginas para buscadores (scripts/paginas-estaticas.mjs): /RocketFix/p/sa07/, /RocketFix/celulares/, /RocketFix/marca/cooler-master/…
// Al abrirlas, la dirección pasa a su forma con # (la que usa la tienda) y la tienda se carga encima, como siempre.
const base = import.meta.env.BASE_URL;
if (!location.hash && location.pathname.startsWith(base) && location.pathname !== base) {
  let ruta = location.pathname.slice(base.length).replace(/\/(index\.html)?$/, "");
  const marca = ruta.match(/^marca\/(.+)$/);
  if (marca) {
    const nombre = PRODUCTOS.map(p => p.marca).find(m => m && slug(m) === marca[1]);
    ruta = nombre ? `marca/${encodeURIComponent(nombre)}` : ruta;
  }
  history.replaceState(null, "", `${base}#${ruta}`);
}
// El contenido estático (para quien no ejecuta JavaScript) ya no hace falta
document.getElementById("estatico")?.remove();

// Solo al trabajar en local: las animaciones en prueba que se apagaron en el panel de revisión siguen apagadas al recargar
if (import.meta.env.DEV) {
  try {
    for (const n of JSON.parse(localStorage.getItem("rf-animaciones-apagadas") || "[]") as number[]) document.documentElement.classList.add(`sin-a${n}`);
  } catch { /* sin almacenamiento */ }
}

const raiz = document.getElementById("root");
if (!raiz) throw new Error("Falta #root en index.html");
createRoot(raiz).render(
  <StrictMode>
    {/* Último recurso: si falla algo fuera de la página (cabecera, carrito), al menos queda el aviso con WhatsApp */}
    <Limite>
      <App />
    </Limite>
  </StrictMode>
);
