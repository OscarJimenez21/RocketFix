import { useEffect, useState } from "react";
import descripcionesJson from "../data/descripciones.json";
import { CONFIG, TIENDA_VISTA, VISTAS, deTienda, etiquetaDe, nombreCat, nombreItem, porId } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { Galeria } from "../components/Galeria";
import { IconoCompartir, IconoWhatsApp } from "../components/Iconos";
import { TarjetaProducto, TextoAgregar } from "../components/TarjetaProducto";
import { armarDescripcion } from "../lib/descripcion";
import { dinero } from "../lib/formato";
import { waLink } from "../lib/whatsapp";
import type { Descripcion } from "../types";
import { NoEncontrada } from "./NoEncontrada";

// TypeScript lee cada fila de la ficha como string[]; scripts/verificar-catalogo.mjs comprueba que todas tengan exactamente 2 textos
const DESCRIPCIONES = descripcionesJson as unknown as Record<string, Descripcion>;

export default function Producto({ id }: { id: string }) {
  const p = porId[id];
  const { version, elegirVersion, cantidadDe, agregar, avisar, abrirCarrito } = useTienda();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (p) document.title = `${p.nombre} · ${CONFIG.nombre}`;
  }, [p]);

  if (!p) return <NoEncontrada texto="Este producto ya no está en la tienda." />;

  const i = Math.min(version(p.id), p.opciones.length - 1);
  const o = p.opciones[i] ?? p.opciones[0]!;
  const q = cantidadDe(p.id, i);
  const tope = p.stock != null && q >= p.stock;
  const vista = TIENDA_VISTA[p.tienda];
  const d = armarDescripcion(p, DESCRIPCIONES[p.id]);
  const cat = p.tienda !== "cel" && p.categoria ? nombreCat[p.categoria] : null;

  // Primero los de la misma categoría y marca, luego el resto de la sección
  const puntos = (r: typeof p) => (r.categoria === p.categoria ? 2 : 0) + (r.marca && r.marca === p.marca ? 1 : 0);
  const relacionados = deTienda(p.tienda).filter(r => r.id !== p.id).sort((a, b) => puntos(b) - puntos(a)).slice(0, 4);

  const alAgregar = () => {
    if (agregar(p.id, i)) avisar(`Agregaste ${nombreItem(p, o.nombre)} al carrito`);
  };
  const compartir = async () => {
    const url = `${location.href.split("#")[0]}#p/${p.id}`;
    if (navigator.share) { navigator.share({ title: p.nombre, text: `${p.nombre} en ${CONFIG.nombre}`, url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { avisar(url); }
  };

  return (
    <>
      <EncabezadoVista
        migas={[{ texto: "Inicio", href: "#inicio" }, { texto: VISTAS[vista] ?? "", href: `#${vista}` }, ...(cat ? [{ texto: cat }] : [])]}
        titulo={p.nombre} />
      <div className="contenedor grid gap-8 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <Galeria producto={p} />

        <div className="min-w-0">
          <p className="etiqueta-mono">{etiquetaDe(p)}</p>
          {p.specs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">{p.specs.map(s => <li key={s} className="rounded-sm bg-fondo px-2 py-1 text-[13px] text-tinta-2">{s}</li>)}</ul>
          )}
          {p.nota && <p className="mt-3 text-sm font-semibold text-acento-hover">{p.nota}</p>}

          {p.opciones.length > 1 && (
            <fieldset className="mt-6">
              <legend className="etiqueta-mono mb-2">{p.etiqueta || "Versión"}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {p.opciones.map((op, j) => (
                  <button key={j} type="button" aria-pressed={j === i} onClick={() => elegirVersion(p.id, j)}
                    className={`flex items-center justify-between gap-3 rounded border px-3.5 py-2.5 text-left text-sm ${j === i ? "border-marca bg-marca-suave ring-1 ring-marca" : "border-linea-fuerte hover:border-tinta-2"}`}>
                    <span>{op.nombre}</span><b className="whitespace-nowrap font-display">{dinero(op.precio)}</b>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-6 border-y border-linea py-5">
            <p className="font-display text-[34px] font-extrabold leading-none">{dinero(o.precio)}</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button type="button" onClick={alAgregar} disabled={tope} className="btn btn-primario min-w-[180px] flex-1 sm:flex-none"><TextoAgregar cantidad={q} tope={tope} /> al carrito</button>
              <a href={waLink(`Hola ${CONFIG.nombre}, me interesa ${nombreItem(p, o.nombre)} (${dinero(o.precio)}). ¿Está disponible?`)} target="_blank" rel="noopener"
                className="btn btn-borde flex-1 sm:flex-none"><IconoWhatsApp className="h-[18px] w-[18px] text-wa" />Preguntar por WhatsApp</a>
            </div>
            {q > 0 && <p className="mt-3 text-sm font-semibold text-marca">{q} en el carrito · <button type="button" onClick={abrirCarrito} className="underline underline-offset-2">Ver carrito</button></p>}
          </div>

          <ul className="mt-5 grid gap-2 text-sm text-tinta-2">
            <li className="flex gap-2.5"><span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-marca" />Entrega el mismo día en Bogotá y alrededores, gratis desde {dinero(CONFIG.envios.bogota.gratisDesde)}</li>
            <li className="flex gap-2.5"><span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-marca" />Envíos a todo Colombia, gratis desde {dinero(CONFIG.envios.nacional.gratisDesde)}</li>
            <li className="flex gap-2.5"><span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-marca" />Paga con tarjeta, Bre-B, Daviplata, transferencia o efectivo</li>
          </ul>
          <button type="button" onClick={compartir} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-tinta-2 hover:text-tinta">
            <IconoCompartir />{copiado ? "Enlace copiado" : "Compartir este producto"}
          </button>

          <section aria-labelledby="h-desc" className="mt-8 border-t border-linea pt-6">
            <h2 id="h-desc" className="text-xl font-extrabold">Descripción</h2>
            <p className="mt-3 leading-relaxed text-tinta-2">{d.resumen}</p>
            <h3 className="etiqueta-mono mt-6">Características</h3>
            <dl className="mt-2 overflow-hidden rounded-md border border-linea text-sm">
              {d.filas.map(([k, v], n) => (
                <div key={`${k}-${n}`} className={`grid grid-cols-[minmax(110px,36%)_1fr] gap-3 px-4 py-2.5 ${n ? "border-t border-linea" : ""} ${n % 2 ? "bg-fondo" : ""}`}>
                  <dt className="font-semibold text-tinta-2">{k}</dt><dd className="break-words">{v}</dd>
                </div>
              ))}
            </dl>
            <h3 className="etiqueta-mono mt-6">Qué incluye la caja</h3>
            <p className="mt-2 text-tinta-2">{d.incluye}</p>
            <p className="mt-3 text-[13px] text-tinta-3">El contenido puede variar según el fabricante. Si necesitas algo puntual, pregúntanos antes de comprar.</p>
          </section>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section aria-labelledby="t-relacionados" className="contenedor border-t border-linea py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 id="t-relacionados" className="text-xl font-extrabold">También te puede interesar</h2>
            <a href={`#${vista}`} className="enlace text-sm">Ver {VISTAS[vista]?.toLowerCase()}</a>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{relacionados.map(r => <li key={r.id}><TarjetaProducto producto={r} /></li>)}</ul>
        </section>
      )}
    </>
  );
}
