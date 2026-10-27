/* Cabecera: logo, buscador, WhatsApp y carrito. En escritorio, una segunda fila con "Todas las categorías",
   las secciones principales y el servicio técnico; en celular, todo eso vive en el menú lateral. */
import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG, deTienda } from "../data/catalogo";
import { GRUPOS, PRINCIPALES, TIENDAS, tiendaPorId } from "../data/tiendas";
import { useTienda } from "../estado/TiendaContext";
import { claveRuta } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { Ruta, TiendaId } from "../types";
import { Buscador } from "./Buscador";
import { PuntoEstado, useAtencion } from "./Contacto";
import { IconoAbajo, IconoBolsa, IconoCerrar, IconoCuadricula, IconoMenu, IconoWhatsApp } from "./Iconos";
import { Logo } from "./Logo";

const CANTIDAD = Object.fromEntries(TIENDAS.map(t => [t.id, deTienda(t.id).length])) as Record<TiendaId, number>;
const secciones = (ids: TiendaId[]) => ids.map(tiendaPorId).filter((t): t is NonNullable<typeof t> => Boolean(t));

/** Servicio técnico en la segunda fila (escritorio) */
const SERVICIO = [
  { texto: "Servicio técnico", href: "#servicios", clave: "servicios", siempre: true },
  { texto: "Cámaras de seguridad", href: "#blog-camaras", clave: "blog-camaras", siempre: false },
  { texto: "Blog", href: "#blog", clave: "blog", siempre: false }
];

/** Servicio técnico en el menú de celular (con cada línea de servicio) */
const SERVICIO_MOVIL = [
  { texto: "Solicitar un servicio", href: "#servicios" },
  { texto: "Reparación de computadores", href: "#blog-computadores" },
  { texto: "Reparación de celulares", href: "#blog-celulares" },
  { texto: "Instalación de cámaras", href: "#blog-camaras" },
  { texto: "Blog", href: "#blog" }
];

/** Al tocar un enlace dentro de un menú, el menú se cierra (también si el enlace es la página actual) */
const cerrarAlElegir = (cerrar: () => void) => (e: React.MouseEvent) => {
  if ((e.target as Element).closest("a")) cerrar();
};

function PanelCategorias({ cerrar }: { cerrar: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    // Un clic fuera de la fila de navegación lo cierra (el botón que lo abre está en la misma fila)
    const fuera = (e: PointerEvent) => { if (!panel.current?.parentElement?.contains(e.target as Node)) cerrar(); };
    document.addEventListener("keydown", tecla);
    document.addEventListener("pointerdown", fuera);
    return () => { document.removeEventListener("keydown", tecla); document.removeEventListener("pointerdown", fuera); };
  }, [cerrar]);
  return (
    <div ref={panel} id="panel-categorias" onClick={cerrarAlElegir(cerrar)}
      className="absolute inset-x-4 top-full z-50 rounded-b-md border border-t-0 border-linea bg-white p-6 shadow-flota sm:inset-x-6">
      <div className="grid grid-cols-4 gap-8">
        {GRUPOS.map(g => (
          <div key={g.titulo}>
            <p className="etiqueta">{g.titulo}</p>
            <ul className="mt-2.5 grid gap-0.5">
              {secciones(g.tiendas).map(t => (
                <li key={t.id}>
                  <a href={`#${t.vista}`} className="-mx-2 flex items-baseline justify-between gap-3 rounded px-2 py-1.5 hover:bg-fondo">
                    <span className="font-medium">{t.titulo}</span><span className="text-xs tabular-nums text-tinta-3">{CANTIDAD[t.id]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuMovil({ abierto, cerrar, actual }: { abierto: boolean; cerrar: () => void; actual: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const atencion = useAtencion();

  // Cerrado, el panel no se puede enfocar ni lo leen los lectores de pantalla
  useEffect(() => { if (panel.current) panel.current.inert = !abierto; }, [abierto]);
  // Abierto: bloquea el fondo, enfoca "cerrar" y al cerrar devuelve el foco; Esc cierra
  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement;
    const pagina = document.getElementById("pagina");
    document.documentElement.style.overflow = "hidden";
    if (pagina) pagina.inert = true;
    const t = window.setTimeout(() => botonCerrar.current?.focus(), 30);
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    document.addEventListener("keydown", tecla);
    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
      if (pagina) pagina.inert = false;
      document.removeEventListener("keydown", tecla);
      if (previo instanceof HTMLElement && previo !== document.body) previo.focus();
    };
  }, [abierto, cerrar]);

  const fila = (activo: boolean) => `flex items-center justify-between gap-3 rounded px-2 py-2.5 ${activo ? "bg-marca-suave font-semibold text-marca-oscuro" : "hover:bg-fondo"}`;
  return (
    // El contenedor mide lo mismo que la pantalla y recorta el panel cerrado (si sobresaliera, Chrome en celular alejaría la página)
    <div className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${abierto ? "" : "pointer-events-none"}`}>
      <div onClick={cerrar} aria-hidden="true" className={`absolute inset-0 bg-marca-noche/40 transition-opacity ${abierto ? "opacity-100" : "opacity-0"}`} />
      <div ref={panel} id="menu-movil" role="dialog" aria-modal="true" aria-label="Menú"
        className={`absolute inset-y-0 left-0 flex w-[88%] max-w-[360px] flex-col bg-white shadow-flota transition-transform duration-300 ${abierto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-linea pl-4 pr-2">
          <Logo />
          <button ref={botonCerrar} type="button" onClick={cerrar} aria-label="Cerrar menú" className="flex h-11 w-11 items-center justify-center rounded text-tinta-2 hover:bg-fondo"><IconoCerrar /></button>
        </div>
        <nav aria-label="Menú principal" onClick={cerrarAlElegir(cerrar)} className="flex-1 overflow-y-auto px-3 py-3">
          {GRUPOS.map(g => (
            <div key={g.titulo} className="border-b border-linea py-3 first:pt-1">
              <p className="etiqueta px-2">{g.titulo}</p>
              <ul className="mt-1.5">
                {secciones(g.tiendas).map(t => (
                  <li key={t.id}>
                    <a href={`#${t.vista}`} aria-current={actual === t.vista ? "page" : undefined} className={fila(actual === t.vista)}>
                      {t.titulo}<span className="text-xs tabular-nums text-tinta-3">{CANTIDAD[t.id]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="py-3">
            <p className="etiqueta px-2">Servicio técnico</p>
            <ul className="mt-1.5">
              {SERVICIO_MOVIL.map(s => (
                <li key={s.href}><a href={s.href} aria-current={actual === s.href.slice(1) ? "page" : undefined} className={fila(actual === s.href.slice(1))}>{s.texto}</a></li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="shrink-0 border-t border-linea p-4">
          <p className="mb-3 flex items-center gap-2 text-sm text-tinta-2"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</p>
          <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="btn btn-wa w-full"><IconoWhatsApp />Escríbenos por WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

export function Cabecera({ ruta }: { ruta: Ruta }) {
  const { unidades, abrirCarrito } = useTienda();
  const [menu, setMenu] = useState(false);
  const [categorias, setCategorias] = useState(false);
  const actual = ruta.tipo === "tienda" ? ruta.vista : ruta.tipo === "articulo" ? ruta.id : ruta.tipo === "blog" ? "blog" : "";
  const q = ruta.tipo === "buscar" ? ruta.q : "";
  const clave = claveRuta(ruta);

  useEffect(() => { setMenu(false); setCategorias(false); }, [clave]);
  const cerrarMenu = useCallback(() => setMenu(false), []);
  const cerrarCategorias = useCallback(() => setCategorias(false), []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-linea bg-white">
        <div className="contenedor flex h-14 items-center gap-1.5 sm:gap-3 lg:h-[68px] lg:gap-6">
          <button type="button" onClick={() => setMenu(true)} aria-label="Abrir menú" aria-expanded={menu} aria-controls="menu-movil"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded text-tinta hover:bg-fondo lg:hidden">
            <IconoMenu />
          </button>
          <a href="#inicio" className="shrink-0" aria-label="Rocket Fix, ir al inicio"><Logo /></a>
          <div className="hidden min-w-0 flex-1 lg:block lg:max-w-[560px]"><Buscador inicial={q} /></div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* En pantallas de menos de 360 px no cabe junto al logo y el carrito; ahí WhatsApp queda en el menú y en el pie */}
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"
              className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded bg-wa px-3 text-sm font-semibold text-white transition-colors hover:bg-wa-hover max-[359px]:hidden">
              <IconoWhatsApp className="h-5 w-5" /><span className="hidden xl:inline">Escríbenos por WhatsApp</span>
            </a>
            <button type="button" onClick={abrirCarrito} aria-label={`Abrir carrito, ${unidades} ${unidades === 1 ? "producto" : "productos"}`}
              className="inline-flex h-11 items-center gap-1.5 rounded border border-linea-fuerte px-2.5 text-sm font-semibold transition-colors hover:border-tinta-2 sm:gap-2 sm:px-3">
              <IconoBolsa />
              <span className="hidden sm:inline">Carrito</span>
              <span className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-xs font-bold tabular-nums ${unidades ? "bg-acento text-white" : "bg-fondo text-tinta-2"}`}>{unidades}</span>
            </button>
          </div>
        </div>
        <div className="contenedor pb-2.5 lg:hidden"><Buscador inicial={q} /></div>
        <nav aria-label="Secciones de la tienda" className="hidden border-t border-linea lg:block">
          <div className="contenedor relative flex h-11 items-center">
            <button type="button" onClick={() => setCategorias(v => !v)} aria-expanded={categorias} aria-controls="panel-categorias"
              className="-ml-2.5 flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded px-2.5 text-sm font-semibold transition-colors hover:bg-fondo">
              <IconoCuadricula />Todas las categorías<IconoAbajo className={`h-4 w-4 transition-transform ${categorias ? "rotate-180" : ""}`} />
            </button>
            <span aria-hidden="true" className="mx-3 h-5 w-px bg-linea" />
            <ul className="flex items-center">
              {secciones(PRINCIPALES).map(t => (
                <li key={t.id}>
                  <a href={`#${t.vista}`} aria-current={actual === t.vista ? "page" : undefined}
                    className={`relative flex h-11 items-center whitespace-nowrap px-2.5 text-sm font-medium transition-colors ${actual === t.vista ? "text-marca after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-marca" : "text-tinta-2 hover:text-tinta"}`}>
                    {t.menu}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="ml-auto flex items-center">
              {SERVICIO.map(s => (
                <li key={s.href} className={s.siempre ? "" : "hidden xl:block"}>
                  <a href={s.href} aria-current={actual === s.clave ? "page" : undefined}
                    className={`relative flex h-11 items-center whitespace-nowrap px-2.5 text-sm font-semibold transition-colors ${actual === s.clave ? "text-marca after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-marca" : "text-marca-medio hover:text-marca"}`}>
                    {s.texto}
                  </a>
                </li>
              ))}
            </ul>
            {categorias && <PanelCategorias cerrar={cerrarCategorias} />}
          </div>
        </nav>
      </header>
      <MenuMovil abierto={menu} cerrar={cerrarMenu} actual={actual} />
    </>
  );
}
