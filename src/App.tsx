import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ARTICULOS, CONFIG, VISTAS } from "./data/catalogo";
import { TiendaProvider, useTienda } from "./estado/TiendaContext";
import { Aviso } from "./components/Aviso";
import { Cabecera } from "./components/Cabecera";
import { Carrito } from "./components/Carrito";
import { Contacto } from "./components/Contacto";
import { PiePagina } from "./components/PiePagina";
import { leerRegresoBold } from "./lib/bold";
import { claveRuta, tomarPosicion, useRuta } from "./lib/rutas";
import { waLink } from "./lib/whatsapp";
import { Articulo } from "./paginas/Articulo";
import { Blog } from "./paginas/Blog";
import { Buscar } from "./paginas/Buscar";
import { Inicio } from "./paginas/Inicio";
import { NoEncontrada } from "./paginas/NoEncontrada";
import { Tienda } from "./paginas/Tienda";
import type { Ruta } from "./types";

// La página de producto (con las 963 descripciones) se carga aparte, cuando se abre el primer producto
const Producto = lazy(() => import("./paginas/Producto"));

function tituloDe(r: Ruta) {
  const base = `${CONFIG.nombre} · Tecnología a domicilio en Bogotá y Colombia`;
  if (r.tipo === "tienda") return `${VISTAS[r.vista]} · ${CONFIG.nombre}`;
  if (r.tipo === "blog") return `Blog y servicio técnico · ${CONFIG.nombre}`;
  if (r.tipo === "articulo") return `${ARTICULOS.find(a => a.id === r.id)?.titulo ?? ""} · ${CONFIG.nombre}`;
  if (r.tipo === "buscar") return `Buscar ${r.q} · ${CONFIG.nombre}`;
  return base;
}

/** Aviso del resultado cuando Bold devuelve al cliente a la tienda */
function RegresoBold() {
  const { vaciar } = useTienda();
  const [regreso] = useState(leerRegresoBold);
  useEffect(() => { if (regreso?.estado === "approved") vaciar(); }, [regreso, vaciar]);
  if (!regreso) return null;
  let msg = "";
  try { msg = localStorage.getItem("rf-pago-" + regreso.ref) || ""; } catch { /* sin almacenamiento */ }
  const aprobado = regreso.estado === "approved";
  const titulo = aprobado ? "¡Pago recibido!" : regreso.estado === "pending" ? "Tu pago está en proceso." : "El pago no se completó.";
  const texto = aprobado ? "Envíanos el pedido por WhatsApp para coordinar la entrega." : regreso.estado === "pending" ? "Te avisamos por WhatsApp cuando Bold lo confirme." : "Puedes intentarlo de nuevo desde el carrito o enviarnos el pedido por WhatsApp.";
  return (
    <div role="status" className={aprobado ? "bg-marca-suave" : "bg-acento-suave"}>
      <p className="contenedor py-3 text-sm"><strong>{titulo}</strong> {texto} Referencia {regreso.ref}.{" "}
        {msg && <a className="enlace" href={waLink(msg)} target="_blank" rel="noopener">Enviar el pedido por WhatsApp</a>}</p>
    </div>
  );
}

function Contenido({ ruta }: { ruta: Ruta }) {
  switch (ruta.tipo) {
    case "inicio": return <Inicio ancla={ruta.ancla} />;
    case "tienda": return <Tienda key={ruta.tienda} vista={ruta.vista} tienda={ruta.tienda} />;
    case "producto": return <Suspense fallback={<div className="contenedor min-h-[60vh] py-16 text-tinta-3">Cargando producto…</div>}><Producto id={ruta.id} /></Suspense>;
    case "buscar": return <Buscar key={ruta.q} q={ruta.q} />;
    case "blog": return <Blog />;
    case "articulo": return <Articulo key={ruta.id} id={ruta.id} />;
    case "no-encontrada": return <NoEncontrada />;
  }
}

function Marco() {
  const ruta = useRuta();
  const clave = claveRuta(ruta);
  const primera = useRef(true);

  // Al cambiar de página: vuelve a la posición anterior si la persona regresó, o sube al inicio; y lleva el foco al título
  useLayoutEffect(() => {
    document.title = tituloDe(ruta);
    if (primera.current) { primera.current = false; return; }
    const y = tomarPosicion();
    if (ruta.tipo === "inicio" && ruta.ancla) return;
    window.scrollTo({ top: y ?? 0, behavior: "instant" as ScrollBehavior });
    if (y === null) requestAnimationFrame(() => document.querySelector<HTMLElement>("#pagina h1")?.focus({ preventScroll: true }));
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <a href="#pagina" onClick={e => { e.preventDefault(); document.querySelector<HTMLElement>("#pagina h1")?.focus(); }}
        className="sr-only z-[70] rounded bg-marca px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Saltar al contenido</a>
      <Cabecera ruta={ruta} />
      <div id="pagina">
        <RegresoBold />
        {CONFIG.ejemplo && <p className="bg-brillo/30 py-2 text-center text-sm">Vista de ejemplo: los precios y productos son ilustrativos.</p>}
        <main>
          <Contenido ruta={ruta} />
        </main>
        <Contacto />
        <PiePagina />
      </div>
      <Carrito />
      <Aviso />
    </>
  );
}

export function App() {
  return <TiendaProvider><Marco /></TiendaProvider>;
}
