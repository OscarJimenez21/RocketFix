import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ARTICULOS, CONFIG, VISTAS } from "./data/catalogo";
import { TiendaProvider, useTienda } from "./estado/TiendaContext";
import { Aviso } from "./components/Aviso";
import { Cabecera } from "./components/Cabecera";
import { Carrito } from "./components/Carrito";
import { Limite } from "./components/Limite";
import { PiePagina } from "./components/PiePagina";
import { activa } from "./lib/animaciones";
import { clavePago, leerRegresoBold } from "./lib/bold";
import { claveRuta, tomarPosicion, useRuta } from "./lib/rutas";
import { waLink } from "./lib/whatsapp";
import { Inicio } from "./paginas/Inicio";
import { NoEncontrada } from "./paginas/NoEncontrada";
import { POLITICAS } from "./components/TextoLegal";
import { Tienda } from "./paginas/Tienda";
import type { Ruta } from "./types";

// La página de producto se carga aparte, cuando se abre el primer producto (y cada producto baja solo su descripción)
const Producto = lazy(() => import("./paginas/Producto"));
// Las páginas que se abren menos (búsqueda, marca, blog, artículos y políticas) también van aparte: así el programa que
// baja todo el que entra a la tienda pesa menos. La portada y las secciones siguen dentro, porque son las más visitadas
const Buscar = lazy(() => import("./paginas/Buscar").then(m => ({ default: m.Buscar })));
const Marca = lazy(() => import("./paginas/Marca").then(m => ({ default: m.Marca })));
const Blog = lazy(() => import("./paginas/Blog").then(m => ({ default: m.Blog })));
const Articulo = lazy(() => import("./paginas/Articulo").then(m => ({ default: m.Articulo })));
const Politica = lazy(() => import("./paginas/Politica").then(m => ({ default: m.Politica })));
// Panel para revisar las animaciones en prueba: solo existe al trabajar en local (no llega a la página publicada)
const PanelAnimaciones = import.meta.env.DEV ? lazy(() => import("./components/PanelAnimaciones")) : null;

/** Mientras se carga la página del producto: un esqueleto con su forma (foto, nombre, precio) y un brillo que lo recorre
    (animación 23). Ocupa toda la pantalla para que el pie de página no se alcance a ver y luego salte */
function CargandoProducto() {
  if (!activa(23)) return <div className="contenedor min-h-[100svh] py-16 text-tinta-3">Cargando producto…</div>;
  return (
    <div role="status" className="contenedor grid min-h-[100svh] content-start gap-8 pb-10 pt-[3.25rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
      <span className="sr-only">Cargando producto…</span>
      <div aria-hidden="true" className="esqueleto aspect-square" />
      <div aria-hidden="true" className="grid content-start gap-3">
        <div className="esqueleto h-4 w-32" />
        <div className="esqueleto h-9 w-[85%]" />
        <div className="esqueleto h-9 w-[55%]" />
        <div className="mt-3 flex gap-1.5"><div className="esqueleto h-7 w-24" /><div className="esqueleto h-7 w-20" /><div className="esqueleto h-7 w-28" /></div>
        <div className="esqueleto mt-4 h-44 w-full" />
      </div>
    </div>
  );
}

/** Mientras llega una página secundaria: espacio en blanco del alto de la pantalla (así el pie no aparece y luego salta) */
function Cargando() {
  return <div role="status" className="contenedor min-h-[100svh] py-16"><span className="sr-only">Cargando…</span></div>;
}

function tituloDe(r: Ruta) {
  const base = `${CONFIG.nombre} · Tecnología a domicilio en Bogotá y Colombia`;
  if (r.tipo === "tienda") return `${VISTAS[r.vista]} · ${CONFIG.nombre}`;
  if (r.tipo === "blog") return `Blog y servicio técnico · ${CONFIG.nombre}`;
  if (r.tipo === "articulo") return `${ARTICULOS.find(a => a.id === r.id)?.titulo ?? ""} · ${CONFIG.nombre}`;
  if (r.tipo === "buscar") return `Buscar ${r.q} · ${CONFIG.nombre}`;
  if (r.tipo === "marca") return `${r.marca} · ${CONFIG.nombre}`;
  if (r.tipo === "politica") return `${POLITICAS.find(p => p.id === r.id)?.titulo ?? ""} · ${CONFIG.nombre}`;
  return base;
}

/** Aviso cuando Bold devuelve al cliente a la tienda. El estado viene en la dirección (?bold-tx-status=…) y la página
    no puede comprobarlo: por eso no afirma que el pago se recibió; Rocket Fix lo verifica en Bold antes de despachar. */
function RegresoBold() {
  const { vaciar } = useTienda();
  const [regreso] = useState(leerRegresoBold);
  useEffect(() => { if (regreso?.estado === "approved") vaciar(); }, [regreso, vaciar]);
  if (!regreso) return null;
  let msg = "";
  try { msg = localStorage.getItem(clavePago(regreso.ref)) || ""; } catch { /* sin almacenamiento */ }
  const aprobado = regreso.estado === "approved";
  const titulo = aprobado ? "Bold reportó tu pago como aprobado." : regreso.estado === "pending" ? "Tu pago está en proceso." : "El pago no se completó.";
  const texto = aprobado ? "Envíanos el pedido por WhatsApp: verificamos el pago y coordinamos la entrega." : regreso.estado === "pending" ? "Te avisamos por WhatsApp cuando Bold lo confirme." : "Puedes intentarlo de nuevo desde el carrito o enviarnos el pedido por WhatsApp.";
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
    case "producto": return <Suspense fallback={<CargandoProducto />}><Producto id={ruta.id} /></Suspense>;
    case "buscar": return <Suspense fallback={<Cargando />}><Buscar key={ruta.q} q={ruta.q} /></Suspense>;
    case "marca": return <Suspense fallback={<Cargando />}><Marca key={ruta.marca} marca={ruta.marca} /></Suspense>;
    case "blog": return <Suspense fallback={<Cargando />}><Blog /></Suspense>;
    case "articulo": return <Suspense fallback={<Cargando />}><Articulo key={ruta.id} id={ruta.id} /></Suspense>;
    case "politica": return <Suspense fallback={<Cargando />}><Politica key={ruta.id} id={ruta.id} /></Suspense>;
    case "no-encontrada": return <NoEncontrada />;
  }
}

function Marco() {
  const ruta = useRuta();
  const clave = claveRuta(ruta);
  const primera = useRef(true);
  // La primera página que abre la persona aparece de una vez (así no se retrasa lo primero que ve); desde la segunda,
  // cada página nueva entra con un fundido corto en vez de cambiar de golpe
  const navego = useRef(false);
  useEffect(() => { navego.current = true; }, []);

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
        {CONFIG.ejemplo && <p className="bg-acento-suave py-2 text-center text-sm">Vista de ejemplo: los precios y productos son ilustrativos.</p>}
        {/* La clave es la de la página: al ir a otra, se vuelve a montar y corre la animación (en la portada, ir a
            #categorias o #servicios no cuenta como otra página: solo baja) */}
        <main key={clave} className={navego.current ? "motion-safe:animate-entrar" : undefined}>
          {/* Si esta página falla al dibujarse, se muestra un aviso en su lugar (y se reinicia al ir a otra página) */}
          <Limite><Contenido ruta={ruta} /></Limite>
        </main>
        <PiePagina />
      </div>
      <Carrito />
      <Aviso />
      {PanelAnimaciones && <Suspense fallback={null}><PanelAnimaciones /></Suspense>}
    </>
  );
}

export function App() {
  return <TiendaProvider><Marco /></TiendaProvider>;
}
