/* Cabecera: botón de menú, logo, buscador, WhatsApp y carrito. En todas las pantallas (celular y computador)
   las categorías y el servicio técnico viven en el menú lateral que abre el botón de tres líneas. */
import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG, deTienda } from "../data/catalogo";
import { GRUPOS, RECORTE, TIENDAS, tiendaPorId } from "../data/tiendas";
import { useTienda } from "../estado/TiendaContext";
import { dinero, recurso, srcsetFoto } from "../lib/formato";
import { subtotalDe } from "../lib/pedido";
import { usePanelModal } from "../lib/panel";
import { usePestanaViva } from "../lib/pestana";
import { claveRuta, hrefDe } from "../lib/rutas";
import { ATERRIZAJE, hayVuelo } from "../lib/vuelo";
import { waLink } from "../lib/whatsapp";
import type { Ruta, TiendaId } from "../types";
import { Buscador } from "./Buscador";
import { PuntoEstado, useAtencion } from "./Contacto";
import { IconoBolsa, IconoCerrar, IconoMenu, IconoWhatsApp } from "./Iconos";
import { Cohete, Logo } from "./Logo";
import { EnlaceFavoritos } from "./Favorito";
import { AjustesLectura, BotonTema, SelectorTema } from "./SelectorTema";

const CANTIDAD = Object.fromEntries(TIENDAS.map(t => [t.id, deTienda(t.id).length])) as Record<TiendaId, number>;
const secciones = (ids: TiendaId[]) => ids.map(tiendaPorId).filter((t): t is NonNullable<typeof t> => Boolean(t));

/** Servicio técnico en el menú lateral (con cada línea de servicio) */
const SERVICIO = [
  { texto: "Solicitar un servicio", href: hrefDe("servicios") },
  { texto: "¿Qué le pasa a tu equipo?", href: hrefDe("diagnostico") },
  { texto: "Reparación de computadores", href: hrefDe("blog-computadores") },
  { texto: "Reparación de celulares", href: hrefDe("blog-celulares") },
  { texto: "Instalación de cámaras", href: hrefDe("blog-camaras") },
  { texto: "Blog", href: hrefDe("blog") }
];

/** El logo y «Inicio» del menú llevan a la dirección de la tienda sin #: el navegador carga la portada de nuevo,
    desde arriba y con todas sus animaciones de entrada (con #inicio era un cambio de página interno, y si la persona
    venía de la portada, la devolvía al punto donde estaba). El carrito queda guardado en el navegador. */
const INICIO = import.meta.env.BASE_URL;

/** Accesos generales al final del menú */
const AYUDA = [
  { texto: "Inicio", href: INICIO },
  { texto: "Tus favoritos", href: hrefDe("favoritos") },
  { texto: "Cómo comprar", href: hrefDe("como-comprar") },
  { texto: "Busca por uso", href: hrefDe("busca-por-uso") },
  { texto: "Todas las categorías", href: hrefDe("categorias") },
  { texto: "Todas las marcas", href: hrefDe("todas-las-marcas") },
  { texto: "Preguntas frecuentes", href: hrefDe("preguntas-frecuentes") },
  { texto: "Sigue tu pedido", href: hrefDe("sigue-tu-pedido") },
  { texto: "Compras para empresas", href: hrefDe("empresas") },
  { texto: "Calificaciones de clientes", href: hrefDe("calificaciones") },
  { texto: "Contacto y horario", href: hrefDe("contacto") }
];

/** Al tocar un enlace dentro del menú, el menú se cierra (también si el enlace es la página actual) */
const cerrarAlElegir = (cerrar: () => void) => (e: React.MouseEvent) => {
  if ((e.target as Element).closest("a")) cerrar();
};

function MenuLateral({ abierto, cerrar, actual }: { abierto: boolean; cerrar: () => void; actual: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const atencion = useAtencion();

  // Abierto: bloquea el fondo, enfoca «cerrar» y Esc cierra; al cerrar, el foco vuelve a donde estaba (ver lib/panel.ts)
  usePanelModal(abierto, cerrar, panel, botonCerrar);

  const fila = (activo: boolean) => `flex items-center justify-between gap-3 rounded px-2 py-2.5 transition-colors duration-150 ${activo ? "fila-actual relative bg-marca-suave font-semibold text-marca-oscuro" : "hover:bg-fondo active:bg-fondo"}`;
  // Al abrir el menú, sus grupos entran uno tras otro desde la izquierda (45 ms entre cada uno)
  const entra = (n: number) => (abierto ? { className: " motion-safe:animate-entrar-lado", style: { animationDelay: `${90 + n * 45}ms` } } : { className: "", style: undefined });
  return (
    // El contenedor mide lo mismo que la pantalla y recorta el panel cerrado (si sobresaliera, Chrome en celular alejaría la página)
    <div className={`fixed inset-0 z-50 overflow-hidden ${abierto ? "" : "pointer-events-none"}`}>
      <div onClick={cerrar} aria-hidden="true" className={`absolute inset-0 bg-marca-noche/40 transition-opacity duration-300 ${abierto ? "opacity-100" : "opacity-0"}`} />
      <div ref={panel} id="menu-lateral" role="dialog" aria-modal="true" aria-label="Menú"
        className={`absolute inset-y-0 left-0 flex w-[88%] max-w-[380px] flex-col bg-superficie shadow-flota transition-transform duration-300 ease-cajon ${abierto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-linea pl-4 pr-2 lg:h-[68px]">
          <Logo />
          <button ref={botonCerrar} type="button" onClick={cerrar} aria-label="Cerrar menú" className="cerrar-gira presionable flex h-11 w-11 items-center justify-center rounded text-tinta-2 hover:bg-fondo"><IconoCerrar /></button>
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- no es un control: solo escucha los clics de sus enlaces (que ya funcionan con el teclado) para cerrar el menú */}
        <nav aria-label="Menú principal" onClick={cerrarAlElegir(cerrar)} className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          {GRUPOS.map((g, n) => (
            <div key={g.titulo} className={`border-b border-linea py-3 first:pt-1${entra(n).className}`} style={entra(n).style}>
              <p className="etiqueta px-2">{g.titulo}</p>
              <ul className="mt-1.5">
                {secciones(g.tiendas).map(t => (
                  <li key={t.id}>
                    <a href={hrefDe(t.vista)} aria-current={actual === t.vista ? "page" : undefined} className={fila(actual === t.vista)}>
                      {/* Idea 1: cada sección con su producto recortado (sin fondo), el mismo del mosaico de la portada */}
                      <span className="flex min-w-0 items-center gap-3">
                        <span aria-hidden="true" className="claro-siempre flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-fondo">
                          <img src={recurso(`fotos/recortes/${RECORTE[t.id]}.webp`)} alt="" loading="lazy" decoding="async" width={32} height={32} className="h-8 w-8 object-contain" />
                        </span>
                        {t.titulo}
                      </span>
                      <span className="text-xs tabular-nums text-tinta-3">{CANTIDAD[t.id]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className={`border-b border-linea py-3${entra(GRUPOS.length).className}`} style={entra(GRUPOS.length).style}>
            <p className="etiqueta px-2">Servicio técnico</p>
            <ul className="mt-1.5">
              {SERVICIO.map(s => (
                <li key={s.href}><a href={s.href} aria-current={actual === s.href.slice(1) ? "page" : undefined} className={fila(actual === s.href.slice(1))}>{s.texto}</a></li>
              ))}
            </ul>
          </div>
          <div className={`py-3${entra(GRUPOS.length + 1).className}`} style={entra(GRUPOS.length + 1).style}>
            <p className="etiqueta px-2">Rocket Fix</p>
            <ul className="mt-1.5">
              {AYUDA.map(s => (
                <li key={s.href}><a href={s.href} className={fila(false)}>{s.texto}</a></li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="shrink-0 border-t border-linea p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <p className="mb-3 flex items-center gap-2 text-sm text-tinta-2"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</p>
          {/* Idea 30: colores de día o de noche */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-tinta-2">Colores</span><SelectorTema /></div>
          <div className="mb-3"><AjustesLectura /></div>
          <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="btn btn-wa w-full"><IconoWhatsApp />Escríbenos por WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

export function Cabecera({ ruta }: { ruta: Ruta }) {
  const { unidades, lineas, abrirCarrito } = useTienda();
  const [menu, setMenu] = useState(false);
  // Título e ícono de la pestaña con el carrito, y el saludo del logo al volver (animaciones 44, 45 y 54)
  usePestanaViva(unidades);
  // Cada vez que se agrega algo al carrito, el contador da un pequeño salto (no al cargar la página ni al quitar).
  // Si la foto del producto va volando hacia el carrito, el salto espera a que aterrice
  const antes = useRef(unidades);
  const [saltos, setSaltos] = useState(0);
  useEffect(() => {
    if (unidades > antes.current && !hayVuelo()) setSaltos(n => n + 1);
    antes.current = unidades;
  }, [unidades]);
  useEffect(() => {
    const saltar = () => setSaltos(n => n + 1);
    window.addEventListener(ATERRIZAJE, saltar);
    return () => window.removeEventListener(ATERRIZAJE, saltar);
  }, []);
  const actual = ruta.tipo === "tienda" ? ruta.vista : ruta.tipo === "articulo" ? ruta.id : ruta.tipo === "blog" ? "blog" : "";
  const q = ruta.tipo === "buscar" ? ruta.q : "";
  const clave = claveRuta(ruta);

  useEffect(() => { setMenu(false); }, [clave]);
  const cerrarMenu = useCallback(() => setMenu(false), []);

  // Animación 8: el botón de WhatsApp saluda una vez, solo en la primera página que se abre en la visita
  const [saluda] = useState(() => { try { return !sessionStorage.getItem("rf-saludo"); } catch { return false; } });
  useEffect(() => { try { sessionStorage.setItem("rf-saludo", "1"); } catch { /* sin almacenamiento */ } }, []);

  return (
    <>
      {/* cabecera: al bajar aparece una sombra suave debajo (animación 7) */}
      <header className="cabecera sticky top-0 z-40 border-b border-linea bg-superficie">
        <div className="contenedor flex h-14 items-center gap-1.5 sm:gap-3 lg:h-[68px] lg:gap-6">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => setMenu(true)} aria-label="Abrir menú" aria-expanded={menu} aria-controls="menu-lateral"
              className="presionable -ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded text-tinta hover:bg-fondo">
              <IconoMenu />
            </button>
            <a href={INICIO} className="cabecera-logo flex h-11 shrink-0 items-center" aria-label="Rocket Fix, ir al inicio"><Logo /></a>
          </div>
          <div className="hidden min-w-0 flex-1 lg:block lg:max-w-[560px]"><Buscador inicial={q} /></div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* En pantallas de menos de 360 px no cabe junto al logo y el carrito; ahí WhatsApp queda en el menú y en el pie */}
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"
              className={`presionable inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded bg-wa px-3 text-sm font-semibold text-white hover:bg-wa-hover max-[359px]:hidden${saluda ? " saludo-wa" : ""}`}>
              <IconoWhatsApp className="h-5 w-5" /><span className="hidden xl:inline">Escríbenos por WhatsApp</span>
            </a>
            <BotonTema />
            <EnlaceFavoritos />
            <button type="button" onClick={abrirCarrito} aria-label={`Abrir carrito, ${unidades} ${unidades === 1 ? "producto" : "productos"}`}
              title={unidades ? `Ver tu pedido: ${dinero(subtotalDe(lineas))} en productos` : "Tu carrito está vacío"}
              className="boton-carrito presionable inline-flex h-11 items-center gap-1.5 rounded border border-linea-fuerte px-2.5 text-sm font-semibold hover:border-tinta-2 sm:gap-2 sm:px-3">
              <IconoBolsa />
              <span className="hidden sm:inline">Carrito</span>
              {/* Idea 23: con productos, sus fotos pequeñas apiladas (hasta 3), desde 640 px */}
              {lineas.length > 0 && (
                <span aria-hidden="true" className="fotos-carrito hidden items-center sm:flex">
                  {lineas.filter(l => l.producto.imagen).slice(-3).reverse().map((l, i) => (
                    <span key={l.clave} className="claro-siempre -ml-2 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-superficie bg-white first:ml-0" style={{ zIndex: 3 - i, "--i": i } as React.CSSProperties}>
                      <img src={recurso(l.producto.imagen ?? "")} srcSet={srcsetFoto(l.producto.imagen ?? "")} sizes="24px" alt="" width={24} height={24} decoding="async" className="h-6 w-6 object-contain" />
                    </span>
                  ))}
                </span>
              )}
              {/* La clave cambia con cada producto agregado: así la animación vuelve a empezar */}
              <span key={saltos} data-destino-carrito className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-xs font-bold tabular-nums transition-colors duration-200 ${unidades ? "bg-acento text-acento-tinta" : "bg-fondo text-tinta-2"} ${saltos ? "motion-safe:animate-latido" : ""}`}>{unidades}</span>
            </button>
          </div>
        </div>
        <div className="contenedor pb-2.5 lg:hidden"><Buscador inicial={q} /></div>
        {/* Animación 58: el cohete del logo avanza por el borde de abajo de la cabecera a medida que se baja por la página,
            dejando su estela (en todas las páginas; ver .rumbo en index.css) */}
        <span aria-hidden="true" className="rumbo"><Cohete className="rumbo-cohete" /></span>
      </header>
      <MenuLateral abierto={menu} cerrar={cerrarMenu} actual={actual} />
    </>
  );
}
