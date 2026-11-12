/* Arranque de la tienda. Lo carga src/main.tsx cuando ya llegó la lista de productos (datos/productos.json). */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Limite } from "./components/Limite";
import { BASE, direccionDe, leerRuta } from "./lib/rutas";
import { aplicarTema } from "./lib/tema";
import { registrarTrabajador } from "./lib/instalar";

// Enlaces viejos con # (/RocketFix/#p/sa07, /RocketFix/#celulares): la dirección pasa a la limpia (/RocketFix/p/sa07/).
// Las secciones de la portada (/RocketFix/#servicios) se quedan como están
if (location.hash && (location.pathname === BASE || location.pathname === `${BASE}index.html`)) {
  const r = leerRuta(location.hash);
  if (r.tipo !== "inicio") {
    const destino = new URL(direccionDe(r), location.href);
    history.replaceState(null, "", destino.pathname + location.search + destino.hash);
  }
}
// El contenido estático (para quien no ejecuta JavaScript) ya no hace falta
document.getElementById("estatico")?.remove();

// Al recargar, la página empieza arriba (en la portada, en un producto o en cualquier sección) en vez de que el navegador
// la devuelva al punto donde estaba. Volver con «atrás» dentro de la tienda sigue regresando al mismo punto: eso lo
// maneja la tienda misma (lib/rutas.ts). Las anclas como #categorias también, al montar la portada
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

// Solo al trabajar en local: las animaciones en prueba que se apagaron en el panel de revisión siguen apagadas al recargar
if (import.meta.env.DEV) {
  try {
    for (const n of JSON.parse(localStorage.getItem("rf-animaciones-apagadas") || "[]") as number[]) document.documentElement.classList.add(`sin-a${n}`);
  } catch { /* sin almacenamiento */ }
}

// Modo noche (idea 30): solo si el visitante lo eligió; se aplica antes de pintar la tienda
aplicarTema();

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

// Mejora 3: visitas siguientes más rápidas y la tienda abre aunque no haya señal (ver public/sw.js)
registrarTrabajador();
