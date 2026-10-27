import { useMemo, useState } from "react";
import { BUSQUEDAS_POPULARES } from "../data/catalogo";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { buscarProductos } from "../lib/busqueda";
import { hrefBusqueda } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";

const PAGINA = 24;

export function Buscar({ q }: { q: string }) {
  const resultados = useMemo(() => buscarProductos(q), [q]);
  const [limite, setLimite] = useState(PAGINA);
  const quedan = resultados.length - limite;
  const lead = !q.trim() ? "Escribe en el buscador qué producto quieres." : resultados.length
    ? `${resultados.length} ${resultados.length === 1 ? "producto coincide" : "productos coinciden"} con “${q.trim()}”.`
    : `No encontramos productos con “${q.trim()}”.`;

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: "#inicio" }, { texto: "Buscar" }]} titulo={q.trim() ? `Resultados para “${q.trim()}”` : "Buscar"} lead={lead} />
      <div className="contenedor py-8">
        {resultados.length > 0 ? (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {resultados.slice(0, limite).map((p, i) => <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>)}
            </ul>
            {quedan > 0 && <div className="mt-8 text-center"><button type="button" onClick={() => setLimite(l => l + PAGINA)} className="btn btn-borde">Ver más resultados (quedan {quedan})</button></div>}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-linea-fuerte px-6 py-10 text-center">
            <p className="text-tinta-2">Pregúntanos por WhatsApp: puede que lo consigamos por pedido.</p>
            <a href={waLink(q.trim() ? `Hola, estoy buscando: ${q.trim()}` : undefined)} target="_blank" rel="noopener" className="enlace mt-2 inline-block">Preguntar por WhatsApp</a>
            <p className="etiqueta-mono mt-8">Búsquedas populares</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {BUSQUEDAS_POPULARES.map(b => <a key={b} href={hrefBusqueda(b)} className="rounded-full border border-linea px-3 py-1 text-sm hover:border-linea-fuerte">{b}</a>)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
