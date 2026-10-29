import { useEffect, useState } from "react";
import descripcionesJson from "../data/descripciones.json";
import { CONFIG, TIENDA_VISTA, VISTAS, deTienda, etiquetaDe, nombreCat, nombreItem, porId } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { Migas } from "../components/EncabezadoVista";
import { Galeria } from "../components/Galeria";
import { IconoCamion, IconoCompartir, IconoMoto, IconoTarjeta, IconoWhatsApp } from "../components/Iconos";
import { NotaProducto, TarjetaProducto, TextoAgregar } from "../components/TarjetaProducto";
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
    // Se comparte la página propia del producto: al pegarla en WhatsApp sale con su foto, nombre y precio
    const url = `${location.origin}${import.meta.env.BASE_URL}p/${p.id}/`;
    if (navigator.share) { navigator.share({ title: p.nombre, text: `${p.nombre} en ${CONFIG.nombre}`, url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { avisar(url); }
  };
  const entrega = [
    { icono: <IconoMoto className="h-[18px] w-[18px]" />, texto: `Entrega el mismo día en Bogotá y alrededores, gratis desde ${dinero(CONFIG.envios.bogota.gratisDesde)}` },
    { icono: <IconoCamion className="h-[18px] w-[18px]" />, texto: `Envíos a todo Colombia, gratis desde ${dinero(CONFIG.envios.nacional.gratisDesde)}` },
    { icono: <IconoTarjeta className="h-[18px] w-[18px]" />, texto: "Paga con tarjeta, Bre-B, Daviplata, transferencia o efectivo" }
  ];

  return (
    <>
      <div className="contenedor pt-5">
        <Migas migas={[{ texto: "Inicio", href: "#inicio" }, { texto: VISTAS[vista] ?? "", href: `#${vista}` }, ...(cat ? [{ texto: cat }] : [])]} />
      </div>
      <div className="contenedor grid gap-8 pb-10 pt-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <Galeria producto={p} />

        <div className="min-w-0">
          <p className="etiqueta text-tinta-3">{etiquetaDe(p)}</p>
          <h1 tabIndex={-1} className="mt-1.5 text-[26px] font-extrabold leading-tight md:text-[32px]">{p.nombre}</h1>
          {p.specs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">{p.specs.map(s => <li key={s} className="rounded-sm bg-fondo px-2 py-1 text-[13px] text-tinta-2">{s}</li>)}</ul>
          )}
          {p.nota && <NotaProducto nota={p.nota} className="mt-3" />}

          {p.opciones.length > 1 && (
            <fieldset className="mt-6">
              <legend className="etiqueta mb-2">{p.etiqueta || "Versión"}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {p.opciones.map((op, j) => (
                  <button key={j} type="button" aria-pressed={j === i} onClick={() => elegirVersion(p.id, j)}
                    className={`flex min-h-[44px] items-center justify-between gap-3 rounded border px-3.5 py-2.5 text-left text-sm transition-colors ${j === i ? "border-marca bg-marca-suave ring-1 ring-marca" : "border-linea-fuerte hover:border-tinta-2"}`}>
                    <span>{op.nombre}</span><b className="whitespace-nowrap font-display tabular-nums">{dinero(op.precio)}</b>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="tarjeta mt-6 p-5">
            <p className="font-display text-[34px] font-extrabold leading-none tabular-nums">{dinero(o.precio)}</p>
            <p className="mt-2 text-[13px] text-tinta-3">Precio en pesos colombianos. Antes de cualquier pago te confirmamos disponibilidad por WhatsApp.</p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <button type="button" onClick={alAgregar} disabled={tope} className="btn btn-primario w-full"><TextoAgregar cantidad={q} tope={tope} /> al carrito</button>
              <a href={waLink(`Hola ${CONFIG.nombre}, me interesa ${nombreItem(p, o.nombre)} (${dinero(o.precio)}). ¿Está disponible?`)} target="_blank" rel="noopener"
                className="btn btn-borde w-full"><IconoWhatsApp className="h-[18px] w-[18px] text-wa" />Preguntar por WhatsApp</a>
            </div>
            {q > 0 && <p className="mt-3 text-sm font-semibold text-marca">{q} en el carrito · <button type="button" onClick={abrirCarrito} className="underline underline-offset-2">Ver carrito</button></p>}
          </div>

          <ul className="mt-5 grid gap-2.5 text-sm text-tinta-2">
            {entrega.map(e => <li key={e.texto} className="flex items-start gap-2.5"><span className="mt-px shrink-0 text-marca">{e.icono}</span>{e.texto}</li>)}
          </ul>
          <button type="button" onClick={compartir} className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-tinta-2 hover:text-tinta">
            <IconoCompartir />{copiado ? "Enlace copiado" : "Compartir este producto"}
          </button>
        </div>
      </div>

      <section aria-labelledby="h-desc" className="border-t border-linea bg-fondo">
        <div className="contenedor grid gap-8 py-10 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <h2 id="h-desc" className="text-xl font-extrabold">Descripción</h2>
            <p className="mt-3 leading-relaxed text-tinta-2">{d.resumen}</p>
            <h3 className="etiqueta mt-6">Qué incluye la caja</h3>
            <p className="mt-2 text-tinta-2">{d.incluye}</p>
            <p className="mt-3 text-[13px] text-tinta-3">El contenido puede variar según el fabricante. Si necesitas algo puntual, pregúntanos antes de comprar.</p>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold">Características</h2>
            <dl className="mt-3 overflow-hidden rounded-md border border-linea bg-white text-sm">
              {d.filas.map(([k, v], n) => (
                <div key={`${k}-${n}`} className={`grid grid-cols-[minmax(110px,38%)_1fr] gap-3 px-4 py-2.5 ${n ? "border-t border-linea" : ""}`}>
                  <dt className="font-semibold text-tinta-2">{k}</dt><dd className="break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section aria-labelledby="t-relacionados" className="contenedor py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 id="t-relacionados" className="text-xl font-extrabold">También te puede interesar</h2>
            <a href={`#${vista}`} className="enlace-suelto shrink-0 text-sm">Ver {VISTAS[vista]?.toLowerCase()}</a>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{relacionados.map(r => <li key={r.id}><TarjetaProducto producto={r} /></li>)}</ul>
        </section>
      )}
    </>
  );
}
