/* Página de una sección de la tienda: filtros por tipo (o marca en celulares), marca, estado, búsqueda y orden.
   Los filtros de cada sección se recuerdan mientras la persona navega (ej.: al volver de un producto). */
import { useMemo, useState } from "react";
import { CABECERAS, CATEGORIAS, ORDEN_CAT, TEXTO_BUSQUEDA, VISTAS, deTienda, desde, marcasDe } from "../data/catalogo";
import { tiendaPorVista } from "../data/tiendas";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { IconoBuscar, IconoWhatsApp } from "../components/Iconos";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { norm } from "../lib/formato";
import { waLink } from "../lib/whatsapp";
import type { Producto, TiendaId } from "../types";

const PAGINA = 24;
interface Filtros { cat: string; marca: string; cond: string; q: string; orden: "rel" | "menor" | "mayor"; limite: number }
const recordados: Partial<Record<TiendaId, Filtros>> = {};
const inicial: Filtros = { cat: "todos", marca: "todas", cond: "todos", q: "", orden: "rel", limite: PAGINA };

/** Deja la sección abierta en un tipo de producto (los enlaces "Ver discos SSD →" de los artículos) */
export function abrirTiendaEn(tienda: TiendaId, cat: string) {
  recordados[tienda] = { ...inicial, cat };
}

function Chip({ activo, onClick, children, n }: { activo: boolean; onClick: () => void; children: React.ReactNode; n: number }) {
  return (
    <button type="button" aria-pressed={activo} onClick={onClick} className="chip">
      {children} <span className={`text-xs tabular-nums ${activo ? "text-white" : "text-tinta-3"}`}>{n}</span>
    </button>
  );
}

export function Tienda({ vista, tienda }: { vista: string; tienda: TiendaId }) {
  const [f, setF] = useState<Filtros>(() => recordados[tienda] ?? inicial);
  const poner = (cambio: Partial<Filtros>) => setF(x => {
    const sig = { ...x, limite: PAGINA, ...cambio };
    recordados[tienda] = sig;
    return sig;
  });

  const base = useMemo(() => deTienda(tienda), [tienda]);
  const info = tiendaPorVista(vista);
  const cab = CABECERAS[vista];
  const esCel = tienda === "cel";
  const cats = esCel ? [] : (CATEGORIAS[tienda] ?? []).filter(c => base.some(p => p.categoria === c.id));
  const marcas = marcasDe(base).sort((a, b) => a.localeCompare(b));

  const visibles = useMemo(() => {
    const q = norm(f.q.trim());
    let vis = base.filter((p: Producto) =>
      (esCel || f.cat === "todos" || p.categoria === f.cat) &&
      (f.marca === "todas" || p.marca === f.marca) &&
      (!esCel || f.cond === "todos" || norm(p.estado) === f.cond) &&
      (!q || (TEXTO_BUSQUEDA[p.id] ?? "").includes(q)));
    if (f.orden === "rel" && !esCel) vis = [...vis].sort((a, b) => (ORDEN_CAT[a.categoria ?? ""] ?? 999) - (ORDEN_CAT[b.categoria ?? ""] ?? 999));
    if (f.orden === "menor") vis = [...vis].sort((a, b) => desde(a) - desde(b));
    if (f.orden === "mayor") vis = [...vis].sort((a, b) => desde(b) - desde(a));
    return vis;
  }, [base, f, esCel]);

  const mostrados = visibles.slice(0, f.limite);
  const quedan = visibles.length - mostrados.length;

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: "#inicio" }, { texto: info?.titulo ?? VISTAS[vista] ?? "" }]} titulo={cab?.titulo ?? VISTAS[vista] ?? ""} lead={cab?.lead} nota={cab?.nota} />
      <div className="contenedor py-6">
        {/* Tipo de producto (o marca, en celulares) */}
        {(esCel ? marcas.length > 1 : cats.length > 1) && (
          <div role="group" aria-label={esCel ? "Marca" : "Tipo de producto"} className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {esCel ? (
              <>
                <Chip activo={f.marca === "todas"} n={base.length} onClick={() => poner({ marca: "todas" })}>Todas</Chip>
                {marcasDe(base).map(m => <Chip key={m} activo={f.marca === m} n={base.filter(p => p.marca === m).length} onClick={() => poner({ marca: m })}>{m}</Chip>)}
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
              className="campo h-10 py-0 pl-9 text-sm" />
          </label>
          {esCel && (
            <div role="group" aria-label="Estado del equipo" className="inline-flex rounded border border-linea-fuerte p-0.5">
              {([["todos", "Todos"], ["nuevo", "Nuevos"], ["cpo", "CPO"]] as const).map(([v, t]) => (
                <button key={v} type="button" aria-pressed={f.cond === v} onClick={() => poner({ cond: v })}
                  className={`rounded-sm px-3 py-1.5 text-sm font-semibold ${f.cond === v ? "bg-tinta text-white" : "text-tinta-2 hover:text-tinta"}`}>{t}</button>
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
          <label className="ml-auto flex items-center gap-2 text-sm text-tinta-2">Ordenar
            <select value={f.orden} onChange={e => poner({ orden: e.target.value as Filtros["orden"] })} className="campo h-10 w-auto py-0 text-sm">
              <option value="rel">Recomendados</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option>
            </select>
          </label>
        </div>

        <p className="mt-4 text-sm text-tinta-2" aria-live="polite">Mostrando {mostrados.length} de {visibles.length} {visibles.length === 1 ? "producto" : "productos"}</p>

        {visibles.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {mostrados.map((p, i) => <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>)}
          </ul>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-linea-fuerte px-6 py-12 text-center">
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
            <button type="button" onClick={() => setF(x => { const sig = { ...x, limite: x.limite + PAGINA }; recordados[tienda] = sig; return sig; })} className="btn btn-borde">
              Ver más productos (quedan {quedan})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
