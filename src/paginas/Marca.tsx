/* Página de una marca (#marca/Intel): todos sus productos según la marca guardada en cada producto, no por texto
   (buscar "Intel" como texto también traía "relojes inteligentes" y portátiles "con procesador Intel").
   La sección y el orden elegidos se recuerdan mientras la persona navega (ej.: al volver de un producto). */
import { useMemo, useState } from "react";
import { PRODUCTOS, conPrecioPrimero, desde } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { norm } from "../lib/formato";
import { hrefBusqueda } from "../lib/rutas";
import type { TiendaId } from "../types";
import { CohetePerdido } from "./NoEncontrada";

const PAGINA = 24;
interface Filtros { seccion: TiendaId | "todas"; orden: "rel" | "menor" | "mayor"; limite: number }
const inicial: Filtros = { seccion: "todas", orden: "rel", limite: PAGINA };
const recordados: Record<string, Filtros> = {};

export function Marca({ marca }: { marca: string }) {
  const productos = useMemo(() => PRODUCTOS.filter(p => p.marca && norm(p.marca) === norm(marca)), [marca]);
  const nombre = productos[0]?.marca ?? marca;
  const secciones = TIENDAS.filter(t => productos.some(p => p.tienda === t.id));
  const clave = norm(marca);
  const [f, setF] = useState<Filtros>(() => recordados[clave] ?? inicial);
  const poner = (cambio: Partial<Filtros>) => setF(x => {
    const sig = { ...x, limite: PAGINA, ...cambio };
    recordados[clave] = sig;
    return sig;
  });

  const visibles = useMemo(() => {
    let vis = f.seccion === "todas" ? productos : productos.filter(p => p.tienda === f.seccion);
    if (f.orden === "menor") vis = [...vis].sort((a, b) => desde(a) - desde(b));
    if (f.orden === "mayor") vis = [...vis].sort((a, b) => desde(b) - desde(a));
    // En cualquier orden, los de «Preguntar disponibilidad» van al final
    return [...vis].sort(conPrecioPrimero);
  }, [productos, f.seccion, f.orden]);
  const quedan = visibles.length - f.limite;

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: "#inicio" }, { texto: nombre }]} titulo={nombre}
        lead={productos.length ? `${productos.length} ${productos.length === 1 ? "producto" : "productos"} ${nombre} en Rocket Fix.` : `Por ahora no tenemos productos ${nombre}.`} />
      <div className="contenedor py-6">
        {secciones.length > 1 && (
          <div role="group" aria-label="Sección" className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <button type="button" aria-pressed={f.seccion === "todas"} onClick={() => poner({ seccion: "todas" })} className="chip">
              Todo <span className={`text-xs tabular-nums ${f.seccion === "todas" ? "text-white" : "text-tinta-3"}`}>{productos.length}</span>
            </button>
            {secciones.map(t => (
              <button key={t.id} type="button" aria-pressed={f.seccion === t.id} onClick={() => poner({ seccion: t.id })} className="chip">
                {t.menu} <span className={`text-xs tabular-nums ${f.seccion === t.id ? "text-white" : "text-tinta-3"}`}>{productos.filter(p => p.tienda === t.id).length}</span>
              </button>
            ))}
          </div>
        )}
        {visibles.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-linea pb-4">
            <p className="text-sm text-tinta-2" aria-live="polite">{visibles.length} productos</p>
            <label className="ml-auto flex items-center gap-2 text-sm text-tinta-2">Ordenar
              <select value={f.orden} onChange={e => poner({ orden: e.target.value as Filtros["orden"] })} className="campo h-10 w-auto py-0 text-sm">
                <option value="rel">Recomendados</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option>
              </select>
            </label>
          </div>
        )}
        {visibles.length > 0 ? (
          <>
            <h2 className="sr-only">Productos {marca}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibles.slice(0, f.limite).map((p, i) => <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>)}
            </ul>
            {quedan > 0 && (
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setF(x => { const sig = { ...x, limite: x.limite + PAGINA }; recordados[clave] = sig; return sig; })} className="btn btn-borde">
                  Ver más productos (quedan {quedan})
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-linea-fuerte px-6 py-12 text-center">
            <CohetePerdido className="mb-5" />
            <p className="font-semibold">No encontramos productos de la marca “{marca}”.</p>
            <a href={hrefBusqueda(marca)} className="enlace-suelto mt-2">Buscar “{marca}” en toda la tienda</a>
          </div>
        )}
      </div>
    </>
  );
}
