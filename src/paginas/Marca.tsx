/* Página de una marca (#marca/Intel): todos sus productos según la marca guardada en cada producto, no por texto
   (buscar "Intel" como texto también traía "relojes inteligentes" y portátiles "con procesador Intel"). */
import { useMemo, useState } from "react";
import { PRODUCTOS } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { norm } from "../lib/formato";
import { hrefBusqueda } from "../lib/rutas";
import type { TiendaId } from "../types";

const PAGINA = 24;

export function Marca({ marca }: { marca: string }) {
  const productos = useMemo(() => PRODUCTOS.filter(p => p.marca && norm(p.marca) === norm(marca)), [marca]);
  const nombre = productos[0]?.marca ?? marca;
  const secciones = TIENDAS.filter(t => productos.some(p => p.tienda === t.id));
  const [seccion, setSeccion] = useState<TiendaId | "todas">("todas");
  const [limite, setLimite] = useState(PAGINA);
  const visibles = seccion === "todas" ? productos : productos.filter(p => p.tienda === seccion);
  const quedan = visibles.length - limite;
  const elegir = (s: TiendaId | "todas") => { setSeccion(s); setLimite(PAGINA); };

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: "#inicio" }, { texto: nombre }]} titulo={nombre}
        lead={productos.length ? `${productos.length} ${productos.length === 1 ? "producto" : "productos"} ${nombre} en Rocket Fix.` : `Por ahora no tenemos productos ${nombre}.`} />
      <div className="contenedor py-6">
        {secciones.length > 1 && (
          <div role="group" aria-label="Sección" className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <button type="button" aria-pressed={seccion === "todas"} onClick={() => elegir("todas")} className="chip">
              Todo <span className={`text-xs tabular-nums ${seccion === "todas" ? "text-white" : "text-tinta-3"}`}>{productos.length}</span>
            </button>
            {secciones.map(t => (
              <button key={t.id} type="button" aria-pressed={seccion === t.id} onClick={() => elegir(t.id)} className="chip">
                {t.menu} <span className={`text-xs tabular-nums ${seccion === t.id ? "text-white" : "text-tinta-3"}`}>{productos.filter(p => p.tienda === t.id).length}</span>
              </button>
            ))}
          </div>
        )}
        {visibles.length > 0 ? (
          <>
            <h2 className="sr-only">Productos {marca}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibles.slice(0, limite).map((p, i) => <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>)}
            </ul>
            {quedan > 0 && (
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setLimite(l => l + PAGINA)} className="btn btn-borde">Ver más productos (quedan {quedan})</button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-linea-fuerte px-6 py-12 text-center">
            <p className="font-semibold">No encontramos productos de la marca “{marca}”.</p>
            <a href={hrefBusqueda(marca)} className="enlace-suelto mt-2">Buscar “{marca}” en toda la tienda</a>
          </div>
        )}
      </div>
    </>
  );
}
