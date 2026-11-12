/* Resultados del buscador. El orden elegido (y cuántos se ven) se recuerda por búsqueda mientras la persona navega,
   así al volver de un producto encuentra la lista como la dejó. */
import { useEffect, useMemo, useState } from "react";
import { BUSQUEDAS_POPULARES, TIENDA_VISTA, VISTAS, conPrecioPrimero, desde } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { IconoWhatsApp } from "../components/Iconos";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { buscarProductos, sugerirCorreccion } from "../lib/busqueda";
import { anotarBusqueda } from "../lib/busquedasRecientes";
import type { TiendaId } from "../types";
import { hrefBusqueda, hrefDe } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import { Astronauta } from "../components/Astronauta";

const PAGINA = 24;
interface Vista { orden: "rel" | "menor" | "mayor"; limite: number; seccion: TiendaId | null }
const inicial: Vista = { orden: "rel", limite: PAGINA, seccion: null };
const recordadas: Record<string, Vista> = {};

export function Buscar({ q }: { q: string }) {
  const texto = q.trim();
  const clave = texto.toLowerCase();
  const encontrados = useMemo(() => buscarProductos(q), [q]);
  const [v, setV] = useState<Vista>(() => recordadas[clave] ?? inicial);
  // Mejora 2: cada búsqueda que encuentra productos queda en «Tus búsquedas recientes» del buscador (las mal escritas, no)
  const hay = encontrados.length > 0;
  useEffect(() => { if (hay) anotarBusqueda(texto); }, [texto, hay]);
  const correccion = useMemo(() => (encontrados.length ? null : sugerirCorreccion(q)), [q, encontrados.length]);
  // Mejora: los primeros productos de la búsqueda corregida, para no tener que tocar el enlace
  const deCorreccion = useMemo(() => (correccion ? buscarProductos(correccion).slice(0, 8) : []), [correccion]);
  // Mejora 7: cuántos resultados hay en cada sección, para filtrar con un toque (solo si hay de dos secciones o más)
  const porSeccion = useMemo(() => {
    const m = new Map<TiendaId, number>();
    for (const p of encontrados) m.set(p.tienda, (m.get(p.tienda) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [encontrados]);
  const poner = (cambio: Partial<Vista>) => setV(x => { const sig = { ...x, ...cambio }; recordadas[clave] = sig; return sig; });

  const resultados = useMemo(() => {
    const base = v.seccion ? encontrados.filter(p => p.tienda === v.seccion) : encontrados;
    if (v.orden === "rel") return base;
    const ord = [...base].sort((a, b) => v.orden === "menor" ? desde(a) - desde(b) : desde(b) - desde(a));
    // Al ordenar por precio, los de «Preguntar disponibilidad» van al final
    return ord.sort(conPrecioPrimero);
  }, [encontrados, v.orden, v.seccion]);
  const quedan = resultados.length - v.limite;
  const lead = !texto ? "Escribe en el buscador qué producto quieres." : encontrados.length
    ? `${encontrados.length} ${encontrados.length === 1 ? "producto coincide" : "productos coinciden"} con “${texto}”.`
    : `No encontramos productos con “${texto}”.`;

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: hrefDe("inicio") }, { texto: "Buscar" }]} titulo={texto ? `Resultados para “${texto}”` : "Buscar"} lead={lead} />
      <div className="contenedor py-8">
        {resultados.length > 0 ? (
          <>
            {porSeccion.length > 1 && (
              <div role="group" aria-label="Filtrar por sección" className="sin-barra -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                <button type="button" aria-pressed={!v.seccion} onClick={() => poner({ seccion: null, limite: PAGINA })} className="chip">Todo <span className="text-tinta-3">{encontrados.length}</span></button>
                {porSeccion.map(([t, n]) => (
                  <button key={t} type="button" aria-pressed={v.seccion === t} onClick={() => poner({ seccion: v.seccion === t ? null : t, limite: PAGINA })} className="chip">
                    {VISTAS[TIENDA_VISTA[t]]} <span className={v.seccion === t ? "text-white/80" : "text-tinta-3"}>{n}</span>
                  </button>
                ))}
              </div>
            )}
            {resultados.length > 1 && (
              <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-linea pb-4">
                <p className="text-sm text-tinta-2" aria-live="polite"><span key={resultados.length} className="cuenta-cambia inline-block tabular-nums">{resultados.length}</span> {resultados.length === 1 ? "producto" : "productos"}</p>
                <label className="ml-auto flex items-center gap-2 text-sm text-tinta-2">Ordenar
                  <select value={v.orden} onChange={e => poner({ orden: e.target.value as Vista["orden"], limite: PAGINA })} className="campo h-10 w-auto py-0 text-sm">
                    <option value="rel">Más relevantes</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option>
                  </select>
                </label>
              </div>
            )}
            <h2 className="sr-only">Productos encontrados</h2>
            {/* Animación 84: al filtrar por sección o cambiar el orden, los resultados entran con un fundido corto */}
            <ul key={`${v.seccion ?? "todo"}-${v.orden}`} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {resultados.slice(0, v.limite).map((p, i) => <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>)}
            </ul>
            {quedan > 0 && <div className="mt-8 text-center"><button type="button" onClick={() => poner({ limite: v.limite + PAGINA })} className="btn btn-borde">Ver más resultados (quedan {quedan})</button></div>}
          </>
        ) : (
          <div className="mx-auto max-w-2xl rounded-md border border-dashed border-linea-fuerte px-6 py-10 text-center">
            {texto && <Astronauta className="mb-5" />}
            {texto && <p className="font-semibold">Ningún producto del catálogo coincide con “{texto}”.</p>}
            {correccion && <p className="correccion-entra mt-2 text-[15px]">¿Quisiste decir <a href={hrefBusqueda(correccion)} className="enlace font-semibold">{correccion}</a>?</p>}
            {deCorreccion.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {deCorreccion.slice(0, 4).map(p => <li key={p.id}><TarjetaProducto producto={p} /></li>)}
              </ul>
            )}
            {deCorreccion.length > 4 && correccion && <a href={hrefBusqueda(correccion)} className="btn btn-borde mt-4">Ver todo lo de «{correccion}»</a>}
            <p className="mt-1 text-sm text-tinta-2">Revisa cómo está escrito o prueba con una palabra más corta (por ejemplo, la marca o el modelo). Si no está en la tienda, pregúntanos: puede que lo consigamos por pedido.</p>
            <a href={waLink(texto ? `Hola, estoy buscando: ${texto}` : undefined)} target="_blank" rel="noopener" className="btn btn-wa mt-5"><IconoWhatsApp />Preguntar por WhatsApp</a>
            <p className="etiqueta mt-8">Búsquedas populares</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {BUSQUEDAS_POPULARES.map(b => <a key={b} href={hrefBusqueda(b)} className="chip">{b}</a>)}
            </div>
            <p className="etiqueta mt-6">O explora una categoría</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {TIENDAS.map(t => <a key={t.id} href={hrefDe(t.vista)} className="chip">{t.menu}</a>)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
