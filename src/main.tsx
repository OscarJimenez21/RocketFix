import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PRODUCTOS } from "./data/catalogo";
import "./index.css";

// Páginas para buscadores (scripts/paginas-estaticas.mjs): /RocketFix/p/sa07/, /RocketFix/celulares/, /RocketFix/marca/cooler-master/…
// Al abrirlas, la dirección pasa a su forma con # (la que usa la tienda) y la tienda se carga encima, como siempre.
const base = import.meta.env.BASE_URL;
if (!location.hash && location.pathname.startsWith(base) && location.pathname !== base) {
  let ruta = location.pathname.slice(base.length).replace(/\/(index\.html)?$/, "");
  const marca = ruta.match(/^marca\/(.+)$/);
  if (marca) {
    const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const nombre = PRODUCTOS.map(p => p.marca).find(m => m && slug(m) === marca[1]);
    ruta = nombre ? `marca/${encodeURIComponent(nombre)}` : ruta;
  }
  history.replaceState(null, "", `${base}#${ruta}`);
}
// El contenido estático (para quien no ejecuta JavaScript) ya no hace falta
document.getElementById("estatico")?.remove();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
