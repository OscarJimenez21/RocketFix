import { lazy, memo, Suspense, useId, useRef, useState } from "react";
import { ARTICULOS, CONFIG, PAGOS } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { useEnPantalla, useVisto } from "../lib/enPantalla";
import { CATALOGO_PDF, pesoCatalogo } from "../lib/catalogoPdf";
import { dinero, recurso } from "../lib/formato";
import { filasHorario } from "../lib/horario";
import { waLink } from "../lib/whatsapp";
import { BotonCopiar, PuntoEstado, useAtencion } from "./Contacto";
import { IconoCamion, IconoFlecha, IconoMoto, IconoWhatsApp } from "./Iconos";
import { Cohete, Logo } from "./Logo";
import { useInstalar } from "../lib/instalar";
import { POLITICAS, TextoLegal } from "./TextoLegal";
import { hrefDe } from "../lib/rutas";
import { DECORAR } from "../lib/temporada";

// Mejora 6: guirnalda de la temporada en el borde de arriba (se baja aparte y solo en temporada)
const DecoracionPie = DECORAR ? lazy(() => import("./temporada/Decoracion")) : null;

/** «Volver arriba»: el cohete despega hacia arriba mientras la página sube. Con «reducir movimiento» la página salta
    arriba de una vez. El foco pasa al logo de la cabecera, para seguir con el teclado desde arriba */
function VolverArriba() {
  const [despega, setDespega] = useState(0);
  const subir = () => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducir) { setDespega(n => n + 1); window.setTimeout(() => setDespega(0), 700); }
    window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
    document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
  };
  return (
    <button type="button" onClick={subir} className="btn btn-sm btn-claro">
      <span key={despega} className={`inline-block ${despega ? "animate-despegar" : ""}`}><Cohete className="h-[18px] w-[18px] text-marca-menta" /></span>
      Volver arriba
    </button>
  );
}

/** Estrellas del pie: posición en % del ancho y del alto, tamaño en px y opacidad (fijas, siempre iguales) */
const ESTRELLAS_PIE: [number, number, number, number][] = [
  [3, 8, 2, 0.35], [9, 44, 1.5, 0.2], [14, 82, 2, 0.25], [19, 18, 1.5, 0.3], [26, 61, 2, 0.2], [31, 4, 1.5, 0.3],
  [37, 36, 2, 0.18], [42, 92, 1.5, 0.25], [48, 14, 2, 0.3], [53, 70, 1.5, 0.2], [58, 28, 2, 0.22], [63, 88, 2, 0.2],
  [68, 6, 1.5, 0.3], [72, 52, 2, 0.18], [77, 76, 1.5, 0.25], [83, 22, 2, 0.3], [88, 64, 1.5, 0.2], [93, 40, 2, 0.25],
  [97, 10, 1.5, 0.3], [6, 96, 1.5, 0.2], [45, 54, 1.5, 0.15], [91, 94, 2, 0.2]
];
/** Las que titilan (animación 3, la misma de la portada): posición en %, retraso en segundos y si solo van en computador.
    Brillan más, así que van en los bordes y en espacios sin texto (encima de las letras parecían manchas) */
const TITILAN_PIE: [number, number, number, boolean][] = [[1.5, 30, 0.4, false], [98.5, 12, 1.9, false], [98, 58, 1.1, false], [72, 74, 2.6, true], [88, 79, 0.9, true]];

/** Cielo del pie (como la portada y el catálogo): estrellas quietas y unas pocas que titilan, detrás del contenido.
    Decorativo: no se toca ni lo leen los lectores de pantalla; las que titilan se detienen fuera de pantalla */
function CieloPie() {
  const caja = useRef<HTMLDivElement>(null);
  const visible = useEnPantalla(caja);
  return (
    <div ref={caja} aria-hidden="true" data-fuera={!visible || undefined} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {ESTRELLAS_PIE.map(([x, y, t, o], i) => (
        <span key={i} className="absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: t, height: t, opacity: o }} />
      ))}
      {TITILAN_PIE.map(([x, y, s, pc]) => <span key={`${x}-${y}`} className={`estrella-titila${pc ? " hidden lg:block" : ""}`} style={{ left: `${x}%`, top: `${y}%`, "--t": `${s}s` } as React.CSSProperties} />)}
    </div>
  );
}

/** En computador, el cohete del logo sube con su estela punteada por el espacio libre entre el texto y los botones de
    WhatsApp (ocupa justo ese hueco, así nunca pasa por detrás de los botones). Animación 56: la primera vez que se ve,
    la estela se dibuja hasta el cohete */
function RutaCohete() {
  const caja = useRef<HTMLDivElement>(null);
  const visto = useVisto(caja);
  const ruta = "M 6 112 C 70 110, 140 86, 192 26";
  return (
    <div ref={caja} aria-hidden="true" data-visto={visto || undefined} className="pie-cielo pointer-events-none hidden h-[120px] min-w-0 flex-1 xl:block">
      <svg viewBox="0 0 215 125" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <linearGradient id="rf-estela-pie" gradientUnits="userSpaceOnUse" x1="6" y1="112" x2="192" y2="26">
            <stop offset="0" stopColor="#5BE0A9" stopOpacity="0" />
            <stop offset="1" stopColor="#5BE0A9" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path d={ruta} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 8" />
        <path className="pie-estela" d={ruta} pathLength={1} fill="none" stroke="url(#rf-estela-pie)" strokeWidth="2" strokeLinecap="round" />
        {/* El cohete mira hacia arriba: se gira para que la punta siga la curva al final */}
        <g transform="translate(192 26) rotate(41)">
          {/* Los mismos trazos del cohete del logo (Logo.tsx) */}
          <g className="pie-cohete">
            <g transform="translate(-15 -18) scale(0.95)" fill="none" stroke="#5BE0A9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
              <path d="M16 3c4.5 3.5 6.5 8.5 6 14.5L19.5 22h-7L10 17.5C9.5 11.5 11.5 6.5 16 3z" />
              <circle cx="16" cy="12.5" r="2.5" />
              <path d="M10 17l-3.5 4.5 1 3.5 5-3M22 17l3.5 4.5-1 3.5-5-3" />
              <path d="M14 25l2 4 2-4" stroke="#FF6B2C" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

/** Grupos de las formas de pago del pie (idea 40), por nombre en pagos.json. Una forma que no esté en ningún grupo va en «Otras» */
const GRUPOS_PAGO: { titulo: string; nombres: string[] }[] = [
  { titulo: "Tarjetas", nombres: ["Visa", "Mastercard", "Bold, pago en línea"] },
  { titulo: "Transferencias y billeteras", nombres: ["PSE", "Bre-B", "DaviPlata", "Nu", "Grupo Aval"] },
  { titulo: "Contra entrega", nombres: ["Efectivo"] }
];
const AGRUPADAS = GRUPOS_PAGO.flatMap(g => g.nombres);
const OTRAS = PAGOS.lista.filter(f => !AGRUPADAS.includes(f.nombre)).map(f => f.nombre);
if (OTRAS.length) GRUPOS_PAGO.push({ titulo: "Otras", nombres: OTRAS });

/** 19/11/2026: en celular cada grupo de enlaces del pie se abre y se cierra con su título (el pie medía casi 3.000 px,
    unas 3,6 pantallas, porque todas las listas iban abiertas una debajo de otra). Desde tableta se ven siempre abiertas,
    con su título de siempre */
function SeccionPie({ titulo, children, className = "" }: { titulo: string; children: React.ReactNode; className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <h3 className="etiqueta mb-3 hidden text-white/60 sm:block">{titulo}</h3>
      <h3 className="sm:hidden">
        <button type="button" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto(a => !a)}
          className="flex min-h-[52px] w-full items-center justify-between gap-3 border-b border-white/10 text-left text-[15px] font-semibold text-white">
          {titulo}
          <IconoFlecha className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 ease-salida ${abierto ? "-rotate-90" : "rotate-90"}`} />
        </button>
      </h3>
      <div id={id} className={abierto ? "pb-4 pt-3 sm:p-0" : "max-sm:hidden"}>{children}</div>
    </div>
  );
}

/** Mejora 3: «Instalar la tienda» como aplicación. Solo aparece cuando el navegador lo ofrece (Chrome, Edge, Android) */
function BotonInstalar() {
  const instalar = useInstalar();
  if (!instalar) return null;
  return (
    <>
      <h3 className="etiqueta mb-2 mt-6 text-white/60">Aplicación</h3>
      <button type="button" onClick={instalar} className="btn btn-claro">
        <Cohete className="h-5 w-5" />Instalar la tienda
      </button>
      <p className="mt-2 text-xs text-white/55">Queda en tu pantalla de inicio y abre más rápido.</p>
    </>
  );
}

/** Cómo se escribe cada red en el pie (15/11/2026: TikTok lleva la K mayúscula) */
const NOMBRE_RED: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok" };

/** Logos de las redes en sus colores, para las fichas blancas de «Síguenos» (decorativos: el nombre va escrito al lado) */
function LogoRed({ red }: { red: string }) {
  const id = useId();
  const caja = "h-9 w-9 shrink-0";
  if (red === "facebook") return (
    <svg viewBox="0 0 24 24" className={caja} aria-hidden="true">
      <path fill="#0866FF" d="M9.1 23.7v-8H6.6V12h2.5v-1.6c0-4.1 1.8-6 5.9-6 .8 0 2.1.2 2.6.3v3.3l-1.4-.1c-2 0-2.8.8-2.8 2.7V12h3.9l-.7 3.7h-3.2V24C19.4 23.2 24 18.2 24 12 24 5.4 18.6 0 12 0S0 5.4 0 12c0 5.6 3.9 10.4 9.1 11.7z" />
    </svg>
  );
  if (red === "instagram") return (
    <svg viewBox="0 0 24 24" className={caja} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA75" /><stop offset=".3" stopColor="#FA7E1E" /><stop offset=".6" stopColor="#D62976" /><stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill={`url(#${id})`} />
      <rect x="6" y="6" width="12" height="12" rx="3.6" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="15.6" cy="8.4" r="1" fill="#fff" />
    </svg>
  );
  if (red === "tiktok") return (
    <svg viewBox="0 0 24 24" className={caja} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#000" />
      <g transform="translate(4.6 4.2) scale(.62)">
        <path fill="#25F4EE" transform="translate(-.9 -.7)" d={NOTA_TIKTOK} />
        <path fill="#FE2C55" transform="translate(.9 .7)" d={NOTA_TIKTOK} />
        <path fill="#fff" d={NOTA_TIKTOK} />
      </g>
    </svg>
  );
  // WhatsApp: el mismo ícono de toda la tienda, blanco sobre el verde de WhatsApp
  return <span className={`${caja} flex items-center justify-center rounded-full bg-wa-vivo text-white`}><IconoWhatsApp className="h-6 w-6" /></span>;
}
const NOTA_TIKTOK = "M12.5 0h3.9c.1 1.5.6 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8V10c-1.4-.1-2.9-.4-4.2-1-.6-.3-1.1-.6-1.6-.9v8.7c-.1 1.4-.5 2.8-1.4 3.9-1.3 1.9-3.6 3.2-5.9 3.2-1.4.1-2.9-.3-4.1-1C3.2 21.8 1.8 19.6 1.6 17.3v-1.5c.2-1.9 1.1-3.7 2.6-5 1.7-1.4 4-2.1 6.2-1.7v4.4c-1-.3-2.2-.2-3 .4-.6.4-1.1 1-1.4 1.8-.2.5-.1 1.1-.1 1.6.2 1.6 1.8 3 3.5 2.9 1.1 0 2.2-.7 2.8-1.6.2-.3.4-.7.4-1.1.1-1.8.1-3.6.1-5.4V0z";

/** Banner «Síguenos» (15/11/2026): las redes y el WhatsApp en fichas blancas como las de las formas de pago.
    Cada ficha entera es el enlace; las redes salen de config.json (si una queda vacía, no aparece) */
function Siguenos() {
  const fichas = [
    ...(["facebook", "instagram", "tiktok"] as const).filter(r => CONFIG.redes[r]).map(r => ({ red: r, nombre: NOMBRE_RED[r], texto: CONFIG.nombre, href: CONFIG.redes[r] as string })),
    { red: "whatsapp", nombre: "WhatsApp", texto: CONFIG.whatsappVisible, href: waLink(`Hola ${CONFIG.nombre}, `) }
  ];
  return (
    <div className="border-t border-white/10">
      <section aria-labelledby="t-redes" className="contenedor py-7 sm:py-9">
        <h2 id="t-redes" className="etiqueta mb-4 text-white/60">Síguenos y escríbenos</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fichas.map(f => (
            <li key={f.red}>
              <a href={f.href} target="_blank" rel="noopener"
                className="claro-siempre presionable flex h-14 items-center gap-3 rounded-md bg-white px-3.5 text-tinta hover:bg-[#EEF5F1]">
                <LogoRed red={f.red} />
                <span className="min-w-0 leading-tight">
                  <span className="block text-[13px] font-semibold text-tinta-2">{f.nombre}</span>
                  <span className="block truncate text-[15px] font-bold">{f.texto}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Pie de todas las páginas. Incluye el contacto (#contacto): WhatsApp, horario y estado de atención. */
/** memo: el pie no depende de la página, así que no se vuelve a dibujar en cada cambio de página (13/11/2026) */
export const PiePagina = memo(function PiePagina() {
  const atencion = useAtencion();
  // Animación 76: en computador, el subrayado crece de izquierda a derecha al pasar el mouse (ver .enlace-pie en index.css)
const enlace = "enlace-pie hover:text-white";
  // Animación 40: la primera vez que se ve el botón de WhatsApp del pie, lanza dos ondas
  const botonesWa = useRef<HTMLDivElement>(null);
  const waVisto = useVisto(botonesWa);
  return (
    <footer id="contacto" aria-labelledby="t-contacto" className="relative isolate overflow-hidden bg-marca-noche text-white/75">
      <CieloPie />
      {DecoracionPie && <Suspense fallback={null}><DecoracionPie donde="pie" /></Suspense>}
      <div className="border-b border-white/10">
        <div className="contenedor flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <h2 id="t-contacto" className="text-xl font-extrabold text-white sm:text-2xl">¿Necesitas ayuda para elegir?</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed">Escríbenos por WhatsApp: te asesoramos y coordinamos la entrega o el servicio.</p>
            <a href={hrefDe("como-comprar")} className="mt-1 inline-flex min-h-[44px] items-center text-[15px] font-semibold text-marca-menta underline-offset-4 hover:underline">Mira cómo comprar en 3 pasos</a>
          </div>
          <RutaCohete />
          <div ref={botonesWa} className="flex flex-wrap items-center gap-3">
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className={`btn btn-wa relative${waVisto ? " onda-wa" : ""}`}><IconoWhatsApp />Escribir por WhatsApp</a>
            <BotonCopiar texto={CONFIG.whatsappVisible} className="btn-claro" />
          </div>
        </div>
      </div>

      <div className="contenedor grid py-8 sm:grid-cols-2 sm:gap-10 sm:py-12 lg:grid-cols-[1.25fr_1.4fr_1.1fr_1fr]">
        <div className="mb-5 sm:mb-0">
          <Logo claro />
          {/* Eslogan de la marca (antes iba una frase larga con todo lo que vende la tienda) */}
          <p className="mt-4 max-w-xs font-display text-[19px] font-extrabold leading-snug text-white ancho-108">Hacemos despegar tu tecnología</p>
          {/* 16/11/2026: el número de WhatsApp y los nombres de las redes ya no van aquí: están en las fichas de
              «Síguenos y escríbenos», más abajo, con sus logos */}
        </div>
        <nav aria-label="Categorías de la tienda">
          <SeccionPie titulo="Tienda">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{TIENDAS.map(t => <li key={t.id}><a href={hrefDe(t.vista)} className={enlace}>{t.menu}</a></li>)}</ul>
          </SeccionPie>
        </nav>
        <nav aria-label="Servicio técnico y ayuda">
          <SeccionPie titulo="Servicio técnico">
          <ul className="grid gap-2 text-sm">
            <li><a href={hrefDe("servicios")} className={enlace}>Solicitar un servicio</a></li>
            {ARTICULOS.map(a => <li key={a.id}><a href={hrefDe(a.id)} className={enlace}>{a.titulo}</a></li>)}
            <li><a href={hrefDe("blog")} className={enlace}>Blog</a></li>
          </ul>
          </SeccionPie>
          {/* Páginas de ayuda (12/11) */}
          <SeccionPie titulo="Ayuda" className="sm:mt-6">
          <ul className="grid gap-2 text-sm">
            {[["preguntas-frecuentes", "Preguntas frecuentes"], ["sigue-tu-pedido", "Sigue tu pedido"], ["diagnostico", "¿Qué le pasa a tu equipo?"],
              ["busca-por-uso", "Busca por uso"], ["todas-las-marcas", "Todas las marcas"], ["guia-de-originales", "Cómo saber si es original"],
              ["cuidado-de-tus-equipos", "Cuida tus equipos"], ["glosario", "Glosario"], ["empresas", "Compras para empresas"]]
              .map(([id, t]) => <li key={id}><a href={hrefDe(id ?? "")} className={enlace}>{t}</a></li>)}
            {/* Idea 69 (13/11/2026): catálogo completo para descargar */}
            <li><a href={CATALOGO_PDF.href} target="_blank" rel="noopener" className={enlace}>{CATALOGO_PDF.texto} <span className="text-white/60">({pesoCatalogo})</span></a></li>
          </ul>
          </SeccionPie>
        </nav>
        <div>
          <SeccionPie titulo="Horario">
            <p className="flex items-center gap-2 text-sm font-semibold text-white"><PuntoEstado abierto={atencion.abierto} claro />{atencion.texto}</p>
            <ul className="mt-2 grid gap-1 text-sm">{filasHorario().map(([d, h]) => <li key={d}>{d}: {h}</li>)}</ul>
            <p className="mt-3 text-xs leading-relaxed text-white/60">{CONFIG.atencion}</p>
          </SeccionPie>
          {/* 25/11/2026: sin «Colores de la página» (se retiraron el modo noche, la letra grande y el contraste); aquí
              queda solo el botón para instalar la tienda, que aparece cuando el navegador lo permite */}
          <div className="sm:mt-6"><BotonInstalar /></div>
        </div>
      </div>

      {/* Idea 40: envíos y formas de pago lado a lado. Los pagos van agrupados y más grandes; son los mismos de pagos.json
          (no se agregó ninguno). Las redes y el WhatsApp van en «Síguenos y escríbenos», desde config.json */}
      <div className="border-t border-white/10">
        <div className="contenedor grid gap-6 py-7 sm:gap-10 sm:py-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-14">
          {/* En celular los envíos también se abren con su título (ya están en la portada y en cada producto) */}
          <section aria-label="Envíos de la tienda">
            <SeccionPie titulo="Envíos">
            <ul className="grid gap-4 text-sm">
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-marca-menta"><IconoMoto /></span>
                <span><b className="block text-white">Bogotá y alrededores</b>Despacho el mismo día con motorizado en pedidos hechos antes de las {CONFIG.corteMismoDia} Gratis desde {dinero(CONFIG.envios.bogota.gratisDesde)}.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-marca-menta"><IconoCamion /></span>
                <span><b className="block text-white">Resto de Colombia</b>Por Interrapidísimo. Gratis desde {dinero(CONFIG.envios.nacional.gratisDesde)}.</span>
              </li>
            </ul>
            </SeccionPie>
          </section>
          <section aria-labelledby="t-pagos">
            <h2 id="t-pagos" className="etiqueta mb-4 text-white/60">Formas de pago</h2>
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {GRUPOS_PAGO.map(g => {
                const formas = PAGOS.lista.filter(f => g.nombres.includes(f.nombre));
                if (!formas.length) return null;
                return (
                  <div key={g.titulo}>
                    <h3 className="mb-2 text-[13px] font-semibold text-white">{g.titulo}</h3>
                    <ul className="flex flex-wrap gap-2">
                      {formas.map(f => (
                        <li key={f.nombre} className="claro-siempre flex h-12 min-w-[76px] items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-tinta sm:h-14 sm:min-w-[88px] sm:px-3.5">
                          {f.archivo
                            ? <img src={recurso(f.archivo)} alt={f.alt ?? f.nombre} className="h-7 w-auto max-w-[110px] object-contain sm:h-8 sm:max-w-[120px]" loading="lazy" decoding="async" />
                            // eslint-disable-next-line no-restricted-syntax -- íconos propios (pagos.json); scripts/verificar-catalogo.mjs no deja publicar si traen algo que se ejecute
                            : <><span className="h-6 w-6 text-marca-medio [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: f.icono ?? "" }} />{f.nombre}</>}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {PAGOS.nota && <p className="mt-5 max-w-3xl text-sm">{PAGOS.nota}</p>}
          </section>
        </div>
      </div>
      <Siguenos />
      {/* Identidad del vendedor (art. 50, Ley 1480) y enlaces a las políticas */}
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-3 py-5 text-xs text-white/55 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="min-w-0">
            <p>© {new Date().getFullYear()} {CONFIG.nombre} · Bogotá, Colombia</p>
            <p className="mt-1 [overflow-wrap:anywhere]"><TextoLegal t="{titular} · {documento} · {direccion} · {correo}" /></p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <nav aria-label="Políticas de la tienda">
              <ul className="flex flex-wrap gap-x-4 gap-y-1">{POLITICAS.map(p => <li key={p.id}><a href={hrefDe(p.id)} className={enlace}>{p.menu}</a></li>)}</ul>
            </nav>
            <VolverArriba />
          </div>
        </div>
      </div>
    </footer>
  );
});
