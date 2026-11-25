/* 25/11/2026 (usuario: «que la portada se vea como apple.com: bonita, dinámica, que llame la atención y que los productos
   se muevan solos»). Dos partes, justo después de las ventajas:
   - Escaparate: bloques grandes a todo el ancho (como los de la portada de apple.com) con el nombre del producto en letra
     enorme, una frase que sale de su ficha, el precio «Desde» y dos botones; la foto grande flota despacio. Después, un
     mosaico de dos columnas con más productos estrella. Siempre en claro (también de noche), como las fotos de producto.
   - CintaProductos: los más vendidos pasan solos de lado, sin tocar nada; se detienen con el mouse encima, con el botón de
     pausa (WCAG 2.2.2) y quedan quietos si la persona pidió reducir el movimiento.
   Las frases salen de la ficha de cada producto (descripciones.json): nada inventado. Si un producto deja de existir, su
   bloque no se muestra. */
import { useEffect, useRef, useState } from "react";
import { MAS_VENDIDOS, desde, porId, recienLlegados } from "../../data/catalogo";
import { dinero, recurso, srcsetFoto } from "../../lib/formato";
import { useVisto } from "../../lib/enPantalla";
import { hrefProducto } from "../../lib/rutas";
import type { Producto } from "../../types";
import { BotonPausa } from "./BotonPausa";

type Bloque = { id: string; nombre: string; lema: string };
// Frases tomadas de la ficha y el resumen de cada producto
const GRANDES: Bloque[] = [
  { id: "ip18pm", nombre: "iPhone 18 Pro Max", lema: "Tres cámaras de 48 MP. Chip A20 Pro. Pantalla de 6,9\"." },
  { id: "ss26u", nombre: "Galaxy S26 Ultra", lema: "Cámara de 200 MP y 5.000 mAh de batería." },
];
const MOSAICO: Bloque[] = [
  { id: "mbairm5", nombre: "MacBook Air M5", lema: "Delgada, liviana y sin ventilador." },
  { id: "appro3", nombre: "AirPods Pro 3", lema: "La mejor cancelación de ruido de Apple." },
  { id: "awultra4", nombre: "Apple Watch Ultra 4", lema: "Titanio y hasta 50 horas de batería." },
  { id: "p45585", nombre: "ROG Xbox Ally X", lema: "Consola portátil con pantalla de 7\" a 120 Hz." },
  { id: "ipadpro", nombre: "iPad Pro M5", lema: "El iPad más potente y delgado." },
  { id: "szfold8u", nombre: "Galaxy Z Fold 8 Ultra", lema: "Una pantalla plegable de 7,6\"." },
];

function Botones({ p }: { p: Producto }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <a href={hrefProducto(p.id)} className="inline-flex min-h-[44px] items-center rounded-full bg-marca px-6 text-[15px] font-semibold text-white transition-colors hover:bg-marca-oscuro">Ver más</a>
      <a href={hrefProducto(p.id)} className="inline-flex min-h-[44px] items-center rounded-full px-6 text-[15px] font-semibold text-marca-texto ring-1 ring-inset ring-marca transition-colors hover:bg-marca hover:text-white">Comprar</a>
    </div>
  );
}

function Foto({ p, grande, i }: { p: Producto; grande?: boolean; i: number }) {
  if (!p.imagen) return null;
  return (
    // La foto trae fondo blanco: «multiply» la funde con el gris del bloque. Flota despacio (esc-flotar en index.css)
    <img src={recurso(p.imagen)} srcSet={srcsetFoto(p.imagen)} sizes={grande ? "(min-width: 1024px) 640px, 90vw" : "(min-width: 768px) 420px, 80vw"}
      alt={p.nombre} loading={i === 0 ? "eager" : "lazy"} decoding="async" width={800} height={800} style={{ "--i": i } as React.CSSProperties}
      className={`esc-flotar mx-auto object-contain mix-blend-multiply ${grande ? "mt-8 h-[300px] w-auto sm:h-[440px]" : "mt-6 h-[230px] w-auto sm:h-[300px]"}`} />
  );
}

export function Escaparate() {
  const caja = useRef<HTMLElement>(null);
  const visto = useVisto(caja);
  // Por si el navegador no avisa que se ve (pestaña en segundo plano, ahorro de energía): a los 2,5 s se muestra igual
  const [forzar, setForzar] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setForzar(true), 2500); return () => window.clearTimeout(t); }, []);
  const grandes = GRANDES.map(b => ({ b, p: porId[b.id] })).filter((x): x is { b: Bloque; p: Producto } => !!x.p && !x.p.consultar);
  const mosaico = MOSAICO.map(b => ({ b, p: porId[b.id] })).filter((x): x is { b: Bloque; p: Producto } => !!x.p && !x.p.consultar);
  if (!grandes.length && !mosaico.length) return null;
  return (
    <section ref={caja} id="escaparate" aria-label="Productos estrella" data-visto={visto || forzar || undefined} className="esc claro-siempre bg-white text-tinta">
      {grandes.map(({ b, p }, i) => (
        <article key={b.id} className={`esc-bloque overflow-hidden px-4 pt-14 text-center sm:pt-16 ${i % 2 ? "bg-[#f3f6f4]" : "bg-white"}`}>
          <h2 className="esc-sube font-display text-[44px] font-extrabold leading-none tracking-tight sm:text-[64px] lg:text-[72px]">{b.nombre}</h2>
          <p className="esc-sube mx-auto mt-3 max-w-[32ch] text-[20px] leading-snug text-tinta-2 sm:text-[26px]">{b.lema}</p>
          <p className="esc-sube mt-3 text-[15px] text-tinta-3">Desde <span className="font-semibold text-tinta">{dinero(desde(p))}</span></p>
          <Botones p={p} />
          <Foto p={p} grande i={i} />
        </article>
      ))}
      {mosaico.length > 0 && (
        <div className="grid gap-3 bg-white p-3 md:grid-cols-2">
          {mosaico.map(({ b, p }, i) => (
            <article key={b.id} style={{ "--i": i } as React.CSSProperties} className="esc-baldosa overflow-hidden rounded-[22px] bg-[#f3f6f4] px-6 pt-12 text-center">
              <h3 className="font-display text-[34px] font-extrabold leading-none tracking-tight sm:text-[44px]">{b.nombre}</h3>
              <p className="mx-auto mt-2.5 max-w-[30ch] text-[18px] leading-snug text-tinta-2 sm:text-[21px]">{b.lema}</p>
              <p className="mt-2 text-[14.5px] text-tinta-3">Desde <span className="font-semibold text-tinta">{dinero(desde(p))}</span></p>
              <Botones p={p} />
              <Foto p={p} i={i + 2} />
            </article>
          ))}
        </div>
      )}
      <CintaProductos />
    </section>
  );
}

/** Los recién llegados pasan solos de lado (la lista va dos veces seguidas para que la vuelta no se note). Si hay pocos, los más vendidos */
function CintaProductos() {
  const [pausada, setPausada] = useState(false);
  const nuevos = recienLlegados().filter(p => p.imagen).slice(0, 16);
  const productos = nuevos.length >= 6 ? nuevos : MAS_VENDIDOS.map(id => porId[id]).filter((p): p is Producto => !!p?.imagen);
  if (productos.length < 4) return null;
  const vuelta = [...productos, ...productos];
  return (
    <div className="esc-cinta relative overflow-hidden bg-white py-12 sm:py-16" data-pausada={pausada || undefined}>
      <div className="contenedor mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-[28px] font-extrabold leading-tight tracking-tight sm:text-[40px]">Recién llegados.</h2>
        <BotonPausa pausado={pausada} alternar={() => setPausada(v => !v)} que="la cinta de productos"
          className="presionable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3f6f4] text-tinta-2 hover:text-tinta" />
      </div>
      <div className="esc-mascara">
        <ul className="esc-pista flex w-max gap-4">
          {vuelta.map((p, i) => (
            <li key={`${p.id}-${i}`} aria-hidden={i >= productos.length || undefined}>
              <a href={hrefProducto(p.id)} tabIndex={i >= productos.length ? -1 : undefined}
                className="group flex w-[200px] flex-col items-center rounded-[20px] bg-[#f3f6f4] px-4 pb-5 pt-4 text-center sm:w-[230px]">
                <img src={recurso(p.imagen ?? "")} srcSet={srcsetFoto(p.imagen ?? "")} sizes="200px" alt="" loading="lazy" decoding="async" width={800} height={800}
                  className="h-[150px] w-[150px] object-contain mix-blend-multiply transition-transform duration-300 ease-salida group-hover:scale-105 sm:h-[170px] sm:w-[170px]" />
                <span className="mt-3 line-clamp-2 text-[14.5px] font-semibold leading-snug">{p.nombre}</span>
                <span className="mt-1 text-[13.5px] text-tinta-3">Desde {dinero(desde(p))}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
