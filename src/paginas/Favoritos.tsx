/* Página de favoritos (/favoritos/, mejora 8): los productos que la persona guardó con el corazón, en este navegador.
   Se envían por WhatsApp para pedir una cotización: el mensaje lleva cada producto con su precio publicado (el de la
   página, sin cambios) y su enlace. No es un pedido: Rocket Fix responde con la cotización y la disponibilidad.
   Idea 99 (12/11): la lista se puede compartir con un enlace (/favoritos/?lista=a,b). Quien lo abre ve esa lista y puede
   guardarla en sus favoritos; no se mezcla con la suya hasta que toque «Guardar». */
import { useMemo, useState } from "react";
import { CONFIG, desde, porId, rotuloPrecio } from "../data/catalogo";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { IconoCorazon } from "../components/Favorito";
import { IconoWhatsApp } from "../components/Iconos";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { useTienda } from "../estado/TiendaContext";
import { leerListaCompartida, sumarFavoritos, useFavoritos, vaciarFavoritos } from "../lib/favoritos";
import { dinero } from "../lib/formato";
import { hrefDe, hrefProducto, navegar } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { Producto } from "../types";

/** Mensaje de WhatsApp con la lista (precio publicado y enlace de cada producto) */
export function mensajeFavoritos(productos: Producto[], origen = typeof location === "undefined" ? "" : location.origin) {
  const filas = productos.map(p => {
    const precio = p.consultar ? "preguntar disponibilidad" : `${rotuloPrecio(p).toLowerCase()} ${dinero(desde(p))}`;
    return `• ${p.nombre} (${precio})\n  ${origen}${hrefProducto(p.id)}`;
  });
  return `Hola ${CONFIG.nombre}, me gustaría una cotización de estos productos que guardé en la tienda:\n\n${filas.join("\n")}\n\n¿Me confirman disponibilidad y precio?`;
}

const deIds = (ids: string[]) => ids.map(id => porId[id]).filter((p): p is Producto => Boolean(p));

function Lista({ productos }: { productos: Producto[] }) {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {productos.map((p, i) => <li key={p.id}><TarjetaProducto producto={p} prioridad={i < 4} /></li>)}
    </ul>
  );
}

export function Favoritos() {
  const ids = useFavoritos();
  const { avisar } = useTienda();
  const productos = useMemo(() => deIds(ids), [ids]);
  const [compartida, setCompartida] = useState(() => deIds(leerListaCompartida(location.search)));
  const n = productos.length;

  const compartir = async () => {
    const url = `${location.origin}${hrefDe("favoritos")}?lista=${encodeURIComponent(productos.map(p => p.id).join(","))}`;
    if (navigator.share) { navigator.share({ title: `Mis favoritos en ${CONFIG.nombre}`, url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(url); avisar("Copiamos el enlace de tu lista"); } catch { avisar(url); }
  };
  const verMios = () => { setCompartida([]); navegar(hrefDe("favoritos"), { reemplazar: true }); };
  const guardarCompartida = () => {
    const k = sumarFavoritos(compartida.map(p => p.id));
    avisar(k ? `Guardaste ${k} ${k === 1 ? "producto" : "productos"} en tus favoritos` : "Ya tenías todos esos productos en tus favoritos");
    verMios();
  };

  if (compartida.length) {
    const m = compartida.length;
    return (
      <>
        <EncabezadoVista migas={[{ texto: "Inicio", href: hrefDe("inicio") }, { texto: "Favoritos" }]} titulo="Lista compartida"
          lead={`Te compartieron ${m} ${m === 1 ? "producto" : "productos"}. Puedes guardarlos en tus favoritos o pedir la cotización por WhatsApp.`} />
        <div className="contenedor py-6">
          <div className="flex flex-wrap items-center gap-3 border-b border-linea pb-4">
            <button type="button" onClick={guardarCompartida} className="btn btn-marca"><IconoCorazon className="h-[18px] w-[18px]" />Guardar en mis favoritos</button>
            <a href={waLink(mensajeFavoritos(compartida))} target="_blank" rel="noopener" className="btn btn-wa"><IconoWhatsApp />Pedir cotización por WhatsApp</a>
            <button type="button" onClick={verMios} className="btn btn-borde">Ver mis favoritos</button>
          </div>
          <h2 className="sr-only">Productos de la lista compartida</h2>
          <Lista productos={compartida} />
        </div>
      </>
    );
  }

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: hrefDe("inicio") }, { texto: "Favoritos" }]} titulo="Tus favoritos"
        lead={n ? `${n} ${n === 1 ? "producto guardado" : "productos guardados"} en este navegador. Envíanos la lista por WhatsApp y te cotizamos.` : "Guarda aquí los productos que te interesan y envíanos la lista por WhatsApp para cotizar."} />
      <div className="contenedor py-6">
        {n > 0 ? (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-linea pb-4">
              <a href={waLink(mensajeFavoritos(productos))} target="_blank" rel="noopener" className="btn btn-wa"><IconoWhatsApp />Pedir cotización por WhatsApp</a>
              <button type="button" onClick={compartir} className="btn btn-borde">Compartir la lista</button>
              <button type="button" onClick={vaciarFavoritos} className="btn btn-borde">Vaciar la lista</button>
              <p className="w-full text-xs text-tinta-3 sm:ml-auto sm:w-auto">La lista se guarda solo en este navegador.</p>
            </div>
            <h2 className="sr-only">Productos guardados</h2>
            <Lista productos={productos} />
          </>
        ) : (
          <div className="rounded-md border border-dashed border-linea-fuerte px-6 py-12 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDECEC] text-[#E5484D]"><IconoCorazon className="h-7 w-7" /></span>
            <p className="font-semibold">Aún no tienes favoritos.</p>
            <p className="mt-1 text-sm text-tinta-2">Toca el corazón de cualquier producto para guardarlo aquí.</p>
            <a href={hrefDe("categorias")} className="btn btn-marca mt-5">Ver categorías</a>
          </div>
        )}
      </div>
    </>
  );
}
