/* Página de una sección de la tienda: filtros por tipo (o marca en celulares), marca, estado, búsqueda y orden.
   Los filtros de cada sección se recuerdan mientras la persona navega (ej.: al volver de un producto). */
import { useEffect, useMemo, useRef, useState } from "react";
import { CABECERAS, CATEGORIAS, LOGOS_MARCAS, ORDEN_CAT, TEXTO_BUSQUEDA, VISTAS, conPrecioPrimero, deTienda, desde, fechaLlegada, marcasDe } from "../data/catalogo";
import { FILTROS_VACIOS, capacidades, enGB, filtrosDeUrl, ordenPulgadas, procesadorDe, pulgadasDe, ramDe, rangoPulgadas, tiene5G, urlDeFiltros } from "../lib/filtros";
import { tiendaPorVista } from "../data/tiendas";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { IconoBuscar, IconoCuadricula, IconoLista, IconoWhatsApp } from "../components/Iconos";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { activa, reducirMovimiento } from "../lib/animaciones";
import { dinero, norm, recurso } from "../lib/formato";
import { useMarco } from "../lib/movimiento";
import { waLink } from "../lib/whatsapp";
import { CohetePerdido } from "./NoEncontrada";
import type { Producto, TiendaId } from "../types";
import { hrefDe } from "../lib/rutas";

const PAGINA = 24;
interface Filtros { cat: string; marca: string; cond: string; q: string; orden: "rel" | "menor" | "mayor" | "nuevos"; limite: number; tope: number | null; capacidad: string; ram: string; cpu: string; pantalla: string; red: string }
const recordados: Partial<Record<TiendaId, Filtros>> = {};
const inicial: Filtros = { ...FILTROS_VACIOS, orden: "rel", limite: PAGINA };

/** Idea 13: al abrir una sección con filtros en la dirección (?marca=Apple&capacidad=256+GB…), se aplican */
function filtrosIniciales(tienda: TiendaId): Filtros {
  const deUrl = typeof location === "undefined" ? {} : filtrosDeUrl(location.search);
  if (Object.keys(deUrl).length) return { ...inicial, ...deUrl, limite: PAGINA } as Filtros;
  return recordados[tienda] ?? inicial;
}

/** Valores de un filtro con su cantidad, ordenados; vacío si hay menos de dos (un filtro con una sola opción no filtra nada) */
function valoresDe(ps: Producto[], f: (p: Producto) => string[], orden: (a: string, b: string) => number) {
  const m = new Map<string, number>();
  for (const p of ps) for (const v of new Set(f(p))) m.set(v, (m.get(v) ?? 0) + 1);
  return m.size > 1 ? [...m.entries()].sort((a, b) => orden(a[0], b[0])) : [];
}

/** Idea 38: cuadrícula o lista. Se recuerda en este navegador */
type Vista = "cuadricula" | "lista";
const CLAVE_VISTA = "rf-vista-seccion";
const vistaGuardada = (): Vista => { try { return localStorage.getItem(CLAVE_VISTA) === "lista" ? "lista" : "cuadricula"; } catch { return "cuadricula"; } };

/** Pasos del control de precio: de 50.000 en 50.000 (de 10.000 si la sección es económica) */
const redondear = (n: number, paso: number, arriba: boolean) => (arriba ? Math.ceil(n / paso) : Math.floor(n / paso)) * paso;

/** Deja la sección abierta en un tipo de producto (los enlaces "Ver discos SSD →" de los artículos) */
export function abrirTiendaEn(tienda: TiendaId, cat: string) {
  recordados[tienda] = { ...inicial, cat };
}

/** Animación 14: al elegir una pastilla, da un pequeño salto (crece y vuelve a su tamaño) */
function saltar(el: HTMLElement) {
  if (!activa(14) || reducirMovimiento() || !el.animate) return;
  el.animate([{ transform: "scale(0.92)" }, { transform: "scale(1.06)", offset: 0.6 }, { transform: "scale(1)" }], { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
}

function Chip({ activo, onClick, children, n, logo }: { activo: boolean; onClick: () => void; children: React.ReactNode; n: number; logo?: string }) {
  return (
    <button type="button" aria-pressed={activo} onClick={e => { if (!activo) saltar(e.currentTarget); onClick(); }} className="chip">
      {/* Idea 37: el logo de la marca en una pastilla blanca (los logos son para fondo claro) */}
      {logo && <span aria-hidden="true" className="claro-siempre -ml-1.5 flex h-6 w-9 items-center justify-center rounded-full bg-white px-1"><img src={recurso(logo)} alt="" loading="lazy" decoding="async" className="max-h-4 max-w-full object-contain" /></span>}
      {children} <span className={`text-xs tabular-nums ${activo ? "text-white" : "text-tinta-3"}`}>{n}</span>
    </button>
  );
}

export function Tienda({ vista, tienda }: { vista: string; tienda: TiendaId }) {
  const [f, setF] = useState<Filtros>(() => filtrosIniciales(tienda));
  // Idea 13: la dirección lleva los filtros puestos (sin crear una entrada nueva en el historial por cada cambio)
  useEffect(() => {
    const busqueda = urlDeFiltros(f);
    if (busqueda !== location.search) history.replaceState(history.state, "", location.pathname + busqueda + location.hash);
  }, [f]);
  // Desde qué posición están las tarjetas que trajo «Ver más productos» (entran en cascada); se olvida al cambiar un filtro
  const [nuevos, setNuevos] = useState<{ tienda: TiendaId; desde: number } | null>(null);
  const poner = (cambio: Partial<Filtros>) => {
    setNuevos(null);
    setF(x => {
      const sig = { ...x, limite: PAGINA, ...cambio };
      recordados[tienda] = sig;
      return sig;
    });
  };
  const enfocarNuevo = useRef<number | null>(null);
  const verMas = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) enfocarNuevo.current = f.limite;
    setNuevos({ tienda, desde: f.limite });
    setF(x => { const sig = { ...x, limite: x.limite + PAGINA }; recordados[tienda] = sig; return sig; });
  };

  const base = useMemo(() => deTienda(tienda), [tienda]);
  const info = tiendaPorVista(vista);
  const cab = CABECERAS[vista];
  const esCel = tienda === "cel";
  const cats = esCel ? [] : (CATEGORIAS[tienda] ?? []).filter(c => base.some(p => p.categoria === c.id));
  const marcas = marcasDe(base).sort((a, b) => a.localeCompare(b));
  // Idea 37: precio máximo (control deslizante) entre el más barato y el más caro de la sección
  const precios = base.filter(p => !p.consultar).map(desde);
  const paso = Math.max(...precios, 0) > 1_000_000 ? 50_000 : 10_000;
  const minimo = precios.length ? redondear(Math.min(...precios), paso, false) : 0;
  const maximo = precios.length ? redondear(Math.max(...precios), paso, true) : 0;
  const tope = f.tope != null && f.tope < maximo ? f.tope : null;
  const [vistaLista, setVistaLista] = useState<Vista>(vistaGuardada);
  // Mejora: en celular la fila de pastillas se desliza de lado; la elegida se trae a la vista (también al volver a la sección)
  const pastillas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fila = pastillas.current;
    const el = fila?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (!fila || !el || fila.scrollWidth <= fila.clientWidth) return;
    const izq = el.offsetLeft - (fila.clientWidth - el.offsetWidth) / 2;
    fila.scrollTo({ left: Math.max(0, izq), behavior: reducirMovimiento() ? "auto" : "smooth" });
  }, [f.marca, f.cat]);
  // Mejora: «Quitar filtros» se ofrece en cuanto hay alguno puesto (antes solo cuando no quedaba ningún producto)
  const conFiltros = f.cat !== inicial.cat || f.marca !== inicial.marca || f.cond !== inicial.cond || f.q.trim() !== "" || f.tope != null || f.orden !== inicial.orden ||
    Boolean(f.capacidad || f.ram || f.cpu || f.pantalla || f.red);
  // Ideas 4, 6, 7 y 29: filtros que salen de los datos de cada producto (solo los que tienen dos valores o más en la sección)
  const extra = useMemo(() => {
    const deCat = base.filter(p => esCel || f.cat === "todos" || p.categoria === f.cat);
    return {
      capacidad: valoresDe(deCat, capacidades, (a, b) => enGB(a) - enGB(b)),
      ram: valoresDe(deCat, p => { const r = ramDe(p); return r && tienda === "pc" ? [`${r} GB`] : []; }, (a, b) => parseInt(a) - parseInt(b)),
      cpu: valoresDe(deCat, p => { const c = procesadorDe(p); return c && tienda === "pc" ? [c] : []; }, (a, b) => a.localeCompare(b, "es", { numeric: true })),
      pantalla: valoresDe(deCat, p => { const n = pulgadasDe(p); return n && (tienda === "tv" || tienda === "pc" || p.categoria === "monitores") ? [rangoPulgadas(n)] : []; }, ordenPulgadas),
      red: esCel && base.some(tiene5G) ? base.filter(tiene5G).length : 0
    };
  }, [base, esCel, f.cat, tienda]);
  const elegirVista = (v: Vista) => { setVistaLista(v); try { localStorage.setItem(CLAVE_VISTA, v); } catch { /* sin almacenamiento */ } };

  const visibles = useMemo(() => {
    const q = norm(f.q.trim());
    let vis = base.filter((p: Producto) =>
      (esCel || f.cat === "todos" || p.categoria === f.cat) &&
      (f.marca === "todas" || p.marca === f.marca) &&
      (!esCel || f.cond === "todos" || norm(p.estado) === f.cond) &&
      (!q || (TEXTO_BUSQUEDA[p.id] ?? "").includes(q)) &&
      (f.tope == null || (!p.consultar && desde(p) <= f.tope)) &&
      (!f.capacidad || capacidades(p).includes(f.capacidad)) &&
      (!f.ram || `${ramDe(p) ?? ""} GB` === f.ram) &&
      (!f.cpu || procesadorDe(p) === f.cpu) &&
      (!f.pantalla || (pulgadasDe(p) != null && rangoPulgadas(pulgadasDe(p) ?? 0) === f.pantalla)) &&
      (!f.red || tiene5G(p)));
    if (f.orden === "rel" && !esCel) vis = [...vis].sort((a, b) => (ORDEN_CAT[a.categoria ?? ""] ?? 999) - (ORDEN_CAT[b.categoria ?? ""] ?? 999));
    if (f.orden === "menor") vis = [...vis].sort((a, b) => desde(a) - desde(b));
    if (f.orden === "mayor") vis = [...vis].sort((a, b) => desde(b) - desde(a));
    // Idea 8: los que llegaron hace poco primero (los que ya estaban antes del 28/10/2026 siguen en su orden de siempre)
    if (f.orden === "nuevos") vis = [...vis].sort((a, b) => fechaLlegada(b).localeCompare(fechaLlegada(a)));
    // En cualquier orden, los de «Preguntar disponibilidad» van al final
    return [...vis].sort(conPrecioPrimero);
  }, [base, f, esCel]);

  const mostrados = visibles.slice(0, f.limite);
  const lista = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const n = enfocarNuevo.current;
    if (n == null) return;
    enfocarNuevo.current = null;
    lista.current?.children[n]?.querySelector<HTMLElement>("a[href]")?.focus();
  }, [f.limite]);
  const quedan = visibles.length - mostrados.length;

  // Animación 15: en Todos / Nuevos / CPO, la pastilla oscura se desliza hasta la opción elegida
  const estados = [["todos", "Todos"], ["nuevo", "Nuevos"], ["cpo", "CPO"]] as const;
  const segmento = useRef<HTMLDivElement>(null);
  const marcoEstado = useMarco(segmento, Math.max(0, estados.findIndex(([v]) => v === f.cond)));
  const pastilla = activa(15) ? marcoEstado : null;

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: hrefDe("inicio") }, { texto: info?.titulo ?? VISTAS[vista] ?? "" }]} titulo={cab?.titulo ?? VISTAS[vista] ?? ""} lead={cab?.lead} nota={cab?.nota} />
      <div className="contenedor py-6">
        {/* Tipo de producto (o marca, en celulares) */}
        {(esCel ? marcas.length > 1 : cats.length > 1) && (
          <div ref={pastillas} role="group" aria-label={esCel ? "Marca" : "Tipo de producto"} className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {esCel ? (
              <>
                <Chip activo={f.marca === "todas"} n={base.length} onClick={() => poner({ marca: "todas" })}>Todas</Chip>
                {marcasDe(base).map(m => <Chip key={m} activo={f.marca === m} n={base.filter(p => p.marca === m).length} logo={LOGOS_MARCAS[m]} onClick={() => poner({ marca: m })}>{m}</Chip>)}
              </>
            ) : (
              <>
                <Chip activo={f.cat === "todos"} n={base.length} onClick={() => poner({ cat: "todos" })}>Todo</Chip>
                {cats.map(c => <Chip key={c.id} activo={f.cat === c.id} n={base.filter(p => p.categoria === c.id).length} onClick={() => poner({ cat: c.id })}>{c.nombre}</Chip>)}
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-linea pb-4">
          <label className="relative min-w-[200px] flex-1 sm:max-w-sm">
            <span className="sr-only">Buscar en {info?.titulo ?? "esta sección"}</span>
            <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-3" />
            <input type="search" value={f.q} onChange={e => poner({ q: e.target.value })} placeholder={`Buscar: ${info?.ejemploBusqueda ?? ""}`}
              enterKeyHint="search" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              onKeyDown={e => { if (e.key === "Escape" && f.q) { e.preventDefault(); poner({ q: "" }); } }}
              className="campo h-10 py-0 pl-9 text-sm" />
          </label>
          {esCel && (
            <div ref={segmento} role="group" aria-label="Estado del equipo" className="relative inline-flex rounded border border-linea-fuerte p-0.5">
              {pastilla && <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded-sm bg-oscuro" style={pastilla} />}
              {estados.map(([v, t]) => (
                <button key={v} data-opcion type="button" aria-pressed={f.cond === v} onClick={() => poner({ cond: v })}
                  className={`presionable relative min-h-[42px] rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors sm:min-h-[34px] ${f.cond === v ? `text-white ${pastilla ? "" : "bg-oscuro"}` : "text-tinta-2 hover:text-tinta"}`}>{t}</button>
              ))}
            </div>
          )}
          {!esCel && marcas.length > 1 && (
            <label className="flex items-center gap-2 text-sm text-tinta-2">Marca
              <select value={f.marca} onChange={e => poner({ marca: e.target.value })} className="campo h-10 w-auto py-0 text-sm">
                <option value="todas">Todas las marcas</option>
                {marcas.map(m => <option key={m} value={m}>{m} ({base.filter(p => p.marca === m).length})</option>)}
              </select>
            </label>
          )}
          {maximo > minimo && (
            <label className="flex min-w-[220px] flex-1 items-center gap-3 text-sm text-tinta-2 sm:max-w-xs">
              <span className="shrink-0">Hasta</span>
              <input type="range" min={minimo} max={maximo} step={paso} value={tope ?? maximo}
                onChange={e => { const v = Number(e.target.value); poner({ tope: v >= maximo ? null : v }); }}
                aria-valuetext={tope ? `Hasta ${dinero(tope)}` : "Cualquier precio"} className="rango-precio min-w-0 flex-1" />
              <span className="w-[6.5rem] shrink-0 text-right font-semibold tabular-nums text-tinta">{tope ? dinero(tope) : "Cualquiera"}</span>
            </label>
          )}
          <label className="ml-auto flex items-center gap-2 text-sm text-tinta-2">Ordenar
            <select value={f.orden} onChange={e => poner({ orden: e.target.value as Filtros["orden"] })} className="campo h-10 w-auto py-0 text-sm">
              <option value="rel">Recomendados</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option><option value="nuevos">Más nuevos</option>
            </select>
          </label>
          {/* Idea 38: ver en cuadrícula o en lista */}
          <div role="group" aria-label="Ver productos en" className="inline-flex rounded border border-linea-fuerte p-0.5">
            {([["cuadricula", "Cuadrícula", <IconoCuadricula key="c" className="h-[18px] w-[18px]" />], ["lista", "Lista", <IconoLista key="l" className="h-[18px] w-[18px]" />]] as const).map(([v, nombre, icono]) => (
              <button key={v} type="button" aria-pressed={vistaLista === v} aria-label={nombre} title={nombre} onClick={() => elegirVista(v)}
                className={`presionable flex h-[42px] w-11 items-center justify-center rounded-sm sm:h-[34px] sm:w-10 ${vistaLista === v ? "bg-oscuro text-white" : "text-tinta-2 hover:text-tinta"}`}>{icono}</button>
            ))}
          </div>
        </div>

        {/* Ideas 4, 6, 7 y 29: capacidad, RAM, procesador, pantalla y 5G (solo los que aplican en esta sección) */}
        {(extra.capacidad.length > 0 || extra.ram.length > 0 || extra.cpu.length > 0 || extra.pantalla.length > 0 || extra.red > 0) && (
          <div role="group" aria-label="Más filtros" className="mt-3 flex flex-wrap items-center gap-3 border-b border-linea pb-4">
            {([["capacidad", "Capacidad", extra.capacidad], ["ram", "Memoria RAM", extra.ram], ["cpu", "Procesador", extra.cpu], ["pantalla", "Pantalla", extra.pantalla]] as const).map(([k, rotulo, valores]) =>
              valores.length > 0 && (
                <label key={k} className="flex items-center gap-2 text-sm text-tinta-2">{rotulo}
                  <select value={f[k]} onChange={e => poner({ [k]: e.target.value })} className="campo h-10 w-auto py-0 text-sm">
                    <option value="">Todas</option>
                    {valores.map(([v, n]) => <option key={v} value={v}>{v} ({n})</option>)}
                  </select>
                </label>
              ))}
            {extra.red > 0 && (
              <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-semibold text-tinta-2">
                <input type="checkbox" checked={f.red === "5g"} onChange={e => poner({ red: e.target.checked ? "5g" : "" })} className="h-4 w-4 accent-[#0B8457]" />
                Solo con 5G <span className="text-xs font-normal tabular-nums text-tinta-3">({extra.red})</span>
              </label>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-tinta-2" aria-live="polite">
          Mostrando <span className="tabular-nums">{mostrados.length}</span> de {visibles.length} {visibles.length === 1 ? "producto" : "productos"}
          {conFiltros && visibles.length > 0 && <span className="quitar-filtros"> · <button type="button" onClick={() => poner({ ...inicial })} className="enlace-suelto -my-3 inline-flex min-h-[44px] items-center">Quitar filtros</button></span>}
        </p>

        {visibles.length ? (
          <>
            {/* Para lectores de pantalla: el título de la lista va entre el de la página y los de cada producto */}
            <h2 className="sr-only">Productos</h2>
            <ul ref={lista} className={`mt-4 grid gap-3 sm:gap-4 ${vistaLista === "lista" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
              {mostrados.map((p, i) => {
                // Las tarjetas nuevas entran una tras otra (30 ms entre cada una; desde la novena, todas juntas)
                const k = nuevos && nuevos.tienda === tienda && i >= nuevos.desde ? i - nuevos.desde : -1;
                return (
                  <li key={p.id} className={k >= 0 ? "motion-safe:animate-entrar" : undefined} style={k >= 0 ? { animationDelay: `${Math.min(k, 8) * 30}ms` } : undefined}>
                    <TarjetaProducto producto={p} prioridad={i < 4} fila={vistaLista === "lista"} />
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-linea-fuerte px-6 py-12 text-center">
            <CohetePerdido className="mb-5" />
            <p className="font-semibold">Ningún producto cumple todos los filtros elegidos.</p>
            <p className="mt-1 text-sm text-tinta-2">{f.q.trim() ? `No encontramos “${f.q.trim()}” en ${info?.titulo.toLowerCase() ?? "esta sección"}.` : "Prueba con otra marca o tipo de producto."} Si buscas algo puntual, pregúntanos: puede que lo consigamos por pedido.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => poner({ ...inicial })} className="btn btn-borde">Quitar filtros</button>
              <a href={waLink(f.q.trim() ? `Hola, estoy buscando: ${f.q.trim()}` : undefined)} target="_blank" rel="noopener" className="btn btn-wa"><IconoWhatsApp />Preguntar por WhatsApp</a>
            </div>
          </div>
        )}

        {quedan > 0 && (
          <div className="mt-8 text-center">
            <button type="button" onClick={verMas} className="btn btn-borde">
              Ver más productos (quedan {quedan})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
