import { lazy, Suspense, useRef, useState } from "react";
import { ARTICULOS, CONFIG, PAGOS } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { useEnPantalla, useVisto } from "../lib/enPantalla";
import { dinero, recurso } from "../lib/formato";
import { filasHorario } from "../lib/horario";
import { waLink } from "../lib/whatsapp";
import { BotonCopiar, PuntoEstado, useAtencion } from "./Contacto";
import { IconoCamion, IconoMoto, IconoWhatsApp } from "./Iconos";
import { Cohete, Logo } from "./Logo";
import { useInstalar } from "../lib/instalar";
import { SelectorTema } from "./SelectorTema";
import { POLITICAS, TextoLegal } from "./TextoLegal";
import { hrefDe } from "../lib/rutas";
import { TEMPORADA } from "../lib/temporada";

// Mejora 6: guirnalda de la temporada en el borde de arriba (se baja aparte y solo en temporada)
const DecoracionPie = TEMPORADA ? lazy(() => import("./temporada/Decoracion")) : null;

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

/** Pie de todas las páginas. Incluye el contacto (#contacto): WhatsApp, horario y estado de atención. */
export function PiePagina() {
  const atencion = useAtencion();
  const redes = Object.entries(CONFIG.redes).filter(([, url]) => url);
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
            <p className="mt-1.5 text-[15px] leading-relaxed">Escríbenos por WhatsApp: te asesoramos, confirmamos disponibilidad y coordinamos la entrega o el servicio.</p>
            <a href={hrefDe("como-comprar")} className="mt-1 inline-flex min-h-[44px] items-center text-[15px] font-semibold text-marca-menta underline-offset-4 hover:underline">Mira cómo comprar en 3 pasos</a>
          </div>
          <RutaCohete />
          <div ref={botonesWa} className="flex flex-wrap items-center gap-3">
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className={`btn btn-wa relative${waVisto ? " onda-wa" : ""}`}><IconoWhatsApp />Escribir por WhatsApp</a>
            <BotonCopiar texto={CONFIG.whatsappVisible} className="btn-claro" />
          </div>
        </div>
      </div>

      <div className="contenedor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1.4fr_1.1fr_1fr]">
        <div>
          <Logo claro />
          {/* Eslogan de la marca (antes iba una frase larga con todo lo que vende la tienda) */}
          <p className="mt-4 max-w-xs font-display text-[19px] font-extrabold leading-snug text-white ancho-108">Hacemos despegar tu tecnología</p>
          <p className="mt-4 text-sm">
            <span className="block text-xs text-white/55">WhatsApp</span>
            {/* El mismo destino que el número de la portada (dos enlaces con el mismo texto deben llevar al mismo lugar) */}
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="font-semibold text-white hover:underline">{CONFIG.whatsappVisible}</a>
          </p>
          {redes.length > 0 && (
            <p className="mt-3 flex gap-4 text-sm">{redes.map(([red, url]) => <a key={red} href={url} target="_blank" rel="noopener" className={`capitalize ${enlace}`}>{red}</a>)}</p>
          )}
        </div>
        <nav aria-label="Categorías de la tienda">
          <h3 className="etiqueta mb-3 text-white/60">Tienda</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{TIENDAS.map(t => <li key={t.id}><a href={hrefDe(t.vista)} className={enlace}>{t.menu}</a></li>)}</ul>
        </nav>
        <nav aria-label="Servicio técnico">
          <h3 className="etiqueta mb-3 text-white/60">Servicio técnico</h3>
          <ul className="grid gap-2 text-sm">
            <li><a href={hrefDe("servicios")} className={enlace}>Solicitar un servicio</a></li>
            {ARTICULOS.map(a => <li key={a.id}><a href={hrefDe(a.id)} className={enlace}>{a.titulo}</a></li>)}
            <li><a href={hrefDe("blog")} className={enlace}>Blog</a></li>
          </ul>
        </nav>
        <div>
          <h3 className="etiqueta mb-3 text-white/60">Horario</h3>
          <p className="flex items-center gap-2 text-sm font-semibold text-white"><PuntoEstado abierto={atencion.abierto} claro />{atencion.texto}</p>
          <ul className="mt-2 grid gap-1 text-sm">{filasHorario().map(([d, h]) => <li key={d}>{d}: {h}</li>)}</ul>
          <p className="mt-3 text-xs leading-relaxed text-white/60">{CONFIG.atencion}</p>
          {/* Idea 30: colores de día o de noche */}
          <h3 className="etiqueta mb-2 mt-6 text-white/60">Colores de la página</h3>
          <SelectorTema oscuro />
          <BotonInstalar />
        </div>
      </div>

      {/* Idea 40: envíos y formas de pago lado a lado. Los pagos van agrupados y más grandes; son los mismos de pagos.json
          (no se agregó ninguno). Sin redes sociales hasta que existan */}
      <div className="border-t border-white/10">
        <div className="contenedor grid gap-10 py-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-14">
          <section aria-labelledby="t-envios-pie">
            <h2 id="t-envios-pie" className="etiqueta mb-4 text-white/60">Envíos</h2>
            <ul className="grid gap-4 text-sm">
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-marca-menta"><IconoMoto /></span>
                <span><b className="block text-white">Bogotá y alrededores</b>Despacho el mismo día con motorizado. Gratis desde {dinero(CONFIG.envios.bogota.gratisDesde)}.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-marca-menta"><IconoCamion /></span>
                <span><b className="block text-white">Resto de Colombia</b>Por transportadora: Envía, Interrapidísimo o Servientrega. Gratis desde {dinero(CONFIG.envios.nacional.gratisDesde)}.</span>
              </li>
            </ul>
          </section>
          <section aria-labelledby="t-pagos">
            <h2 id="t-pagos" className="etiqueta mb-4 text-white/60">Formas de pago</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {GRUPOS_PAGO.map(g => {
                const formas = PAGOS.lista.filter(f => g.nombres.includes(f.nombre));
                if (!formas.length) return null;
                return (
                  <div key={g.titulo}>
                    <h3 className="mb-2 text-[13px] font-semibold text-white">{g.titulo}</h3>
                    <ul className="flex flex-wrap gap-2">
                      {formas.map(f => (
                        <li key={f.nombre} className="claro-siempre flex h-14 min-w-[88px] items-center justify-center gap-2 rounded-md bg-white px-3.5 text-sm font-semibold text-tinta">
                          {f.archivo
                            ? <img src={recurso(f.archivo)} alt={f.alt ?? f.nombre} className="h-8 w-auto max-w-[120px] object-contain" loading="lazy" decoding="async" />
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
}
