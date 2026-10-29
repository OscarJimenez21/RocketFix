import { useMemo, useState } from "react";
import { BUSQUEDAS_POPULARES } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { IconoWhatsApp } from "../components/Iconos";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { buscarProductos } from "../lib/busqueda";
import { hrefBusqueda } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";

const PAGINA = 24;

export function Buscar({ q }: { q: string }) {
  const resultados = useMemo(() => buscarProductos(q), [q]);
  const [limite, setLimite] = useState(PAGINA);
  const quedan = resultados.length - limite;
  const texto = q.trim();
  const lead = !texto ? "Escribe en el buscador qué producto quieres." : resultados.length
    ? `${resultados.length} ${resultados.length === 1 ? "producto coincide" : "productos coinciden"} con “${texto}”.`
    : `No encontramos productos con “${texto}”.`;

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: "#inicio" }, { texto: "Buscar" }]} titulo={texto ? `Resultados para “${texto}”` : "Buscar"} lead={lead} />
      <div className="contenedor py-8">
        {resultados.length > 0 ? (
          <>
            <h2 className="sr-only">Productos encontrados</h2>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {resultados.slice(0, limite).map((p, i) => <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>)}
            </ul>
            {quedan > 0 && <div className="mt-8 text-center"><button type="button" onClick={() => setLimite(l => l + PAGINA)} className="btn btn-borde">Ver más resultados (quedan {quedan})</button></div>}
          </>
        ) : (
          <div className="mx-auto max-w-2xl rounded-md border border-dashed border-linea-fuerte px-6 py-10 text-center">
            {texto && <p className="font-semibold">Ningún producto del catálogo coincide con “{texto}”.</p>}
            <p className="mt-1 text-sm text-tinta-2">Revisa cómo está escrito o prueba con una palabra más corta (por ejemplo, la marca o el modelo). Si no está en la tienda, pregúntanos: puede que lo consigamos por pedido.</p>
            <a href={waLink(texto ? `Hola, estoy buscando: ${texto}` : undefined)} target="_blank" rel="noopener" className="btn btn-wa mt-5"><IconoWhatsApp />Preguntar por WhatsApp</a>
            <p className="etiqueta mt-8">Búsquedas populares</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {BUSQUEDAS_POPULARES.map(b => <a key={b} href={hrefBusqueda(b)} className="chip">{b}</a>)}
            </div>
            <p className="etiqueta mt-6">O explora una categoría</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {TIENDAS.map(t => <a key={t.id} href={`#${t.vista}`} className="chip">{t.menu}</a>)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
