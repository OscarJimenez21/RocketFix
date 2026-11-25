/* 26/11/2026 (usuario: «quiero la página como la de Apple de Estados Unidos, más dinámica, bonita e intuitiva; no repitas fotos»).
   Partes de la página del producto con estilo de página de marca:
   - LoMasDestacado: franja oscura con estrellas (la de la portada y el pie) y tarjetas altas que se deslizan de lado, como
     «Get the highlights» de apple.com. Cada tarjeta lleva su propia foto (nunca repetida: ver `distintas` en descripciones.json);
     si no queda una foto distinta, la tarjeta muestra el ícono del tema y la cifra principal del texto en grande.
   - MiradaDeCerca: un visor grande con las fotos que de verdad se ven distintas, para pasarlas con miniaturas.
   - DeUnVistazo: mosaico de tarjetas con lo principal de cada sección de la ficha, con su ícono.
   Todo sale de los datos del producto; si algo no alcanza (pocas fotos, ficha corta), esa parte no se muestra. */
import { useEffect, useRef, useState } from "react";
import { recurso, srcsetFoto } from "../lib/formato";
import { useVisto } from "../lib/enPantalla";
import { suave } from "../lib/animaciones";
import { useGaleria } from "../lib/galerias";
import type { DescripcionArmada } from "../lib/descripcion";
import type { Producto } from "../types";
import { CifrasProducto } from "./FichaPro";
import { IconoFlecha } from "./Iconos";
import { IconoTema, cifraDe, temaDe } from "./IconosTema";

/** Todo junto, en el orden de una página de marca: destacados (oscuro) → de cerca (claro) → cifras (oscuro) → de un vistazo */
export function ExperienciaProducto({ producto, d }: { producto: Producto; d: DescripcionArmada }) {
  const todas = useGaleria(producto);
  const distintas = (d.distintas ?? todas.map((_, i) => i)).filter(i => i < todas.length).map(i => todas[i]).filter((f): f is string => !!f);
  const nombre = producto.nombre;
  return (
    <>
      {d.destacados.length > 0 && <LoMasDestacado destacados={d.destacados} fotos={todas} nombre={nombre} />}
      <MiradaDeCerca fotos={distintas} nombre={nombre} />
      {d.cifras.length >= 3 && <CifrasProducto cifras={d.cifras} nombre={nombre} />}
      <DeUnVistazo secciones={d.secciones} nombre={nombre} />
    </>
  );
}

type Destacado = { titulo: string; texto: string; foto?: number };

const ESTRELLAS: [number, number, number, number][] = [
  [3, 12, 2, 0.6], [9, 64, 1.5, 0.45], [16, 30, 1, 0.55], [24, 82, 2, 0.35], [31, 8, 1.5, 0.7], [38, 52, 1, 0.45], [46, 20, 2, 0.5],
  [53, 74, 1.5, 0.4], [61, 36, 1, 0.6], [68, 10, 2, 0.45], [75, 60, 1.5, 0.55], [82, 26, 1, 0.7], [89, 78, 2, 0.35], [95, 42, 1.5, 0.55]
];

/** Primera frase de un texto (para que la tarjeta no se llene de letra); el resto queda en la ficha */
const primeraFrase = (t: string, max = 170) => {
  const f = t.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t;
  const s = f.length < 60 && t.length > f.length ? (t.match(/^.*?[.!?](?=\s|$).*?[.!?](?=\s|$)/)?.[0] ?? f) : f;
  return s.length > max ? s.slice(0, max).replace(/[ ,;:]+\S*$/, "") + "…" : s;
};

/** Los textos armados con la ficha vienen como «Clave: valor. Clave: valor.»: se separan para mostrarlos como datos (valor en
    grande, clave debajo). Un texto escrito como frase devuelve [] y se muestra tal cual */
function hechosDe(texto: string): [string, string][] {
  const partes = texto.split(/(?<=[.…])\s+(?=[A-ZÁÉÍÓÚÑ0-9¿])/).map(s => s.trim()).filter(Boolean);
  const pares = partes.map(s => s.match(/^([^:]{2,60}):\s*(.+?)\.?$/)).filter((m): m is RegExpMatchArray => !!m).map(m => [m[1] ?? "", m[2] ?? ""] as [string, string]);
  if (pares.length < 2 || pares.length < partes.length * 0.6) return [];
  // sin repetir el mismo valor dos veces (p. ej. «15,6" FHD» y «15,6" (39,6 cm)»)
  const vistos = new Set<string>();
  return pares.filter(([, v]) => { const k = (v.match(/\d+(?:[.,]\d+)?/)?.[0] ?? v.slice(0, 10)).toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; }).slice(0, 3);
}

export function LoMasDestacado({ destacados, fotos, nombre }: { destacados: Destacado[]; fotos: string[]; nombre: string }) {
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const [bordes, setBordes] = useState({ ini: true, fin: false });
  const caja = useRef<HTMLElement>(null);
  const visto = useVisto(caja);
  const medir = () => {
    const el = pista.current; if (!el) return;
    const tarjetas = [...el.children] as HTMLElement[];
    const centro = el.scrollLeft + 24;
    let k = 0; tarjetas.forEach((t, i) => { if (t.offsetLeft - el.offsetLeft <= centro) k = i; });
    setActual(k);
    setBordes({ ini: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(() => { medir(); }, []);
  const ir = (dir: number) => {
    const el = pista.current; if (!el) return;
    const t = el.children[Math.max(0, Math.min(destacados.length - 1, actual + dir))] as HTMLElement | undefined;
    if (t) el.scrollTo({ left: t.offsetLeft - el.offsetLeft, behavior: suave() });
  };
  if (!destacados.length) return null;
  return (
    <section ref={caja} id="destacados" aria-labelledby="t-destacados" data-visto={visto || undefined}
      className="exp-destacados relative isolate overflow-hidden bg-marca-noche text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {ESTRELLAS.map(([x, y, t, o]) => <span key={`${x}-${y}`} className="absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: t, height: t, opacity: o }} />)}
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-marca-menta/10 blur-3xl" />
      </div>
      <div className="contenedor pb-14 pt-16 sm:pb-20 sm:pt-24">
        <h2 id="t-destacados" className="exp-titulo max-w-[18ch] font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[52px] lg:text-[60px]">
          Lo más destacado.
        </h2>
      </div>
      {/* Tarjetas altas que se deslizan; el borde izquierdo de la primera queda alineado con el título */}
      <div ref={pista} onScroll={medir} role="group" aria-roledescription="carrusel" aria-label={`Lo más destacado del ${nombre}`}
        className="exp-pista sin-barra flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-5">
        {destacados.map((d, i) => {
          const foto = typeof d.foto === "number" ? fotos[d.foto] : undefined;
          const tema = temaDe(d.titulo, d.texto);
          const cifra = foto ? null : cifraDe(`${d.titulo} ${d.texto}`);
          const hechos = hechosDe(d.texto).slice(0, foto ? 2 : 3);
          return (
            <article key={d.titulo} style={{ "--i": i } as React.CSSProperties} aria-label={`${i + 1} de ${destacados.length}: ${d.titulo}`}
              className="exp-tarjeta relative flex h-[520px] w-[84vw] max-w-[400px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] bg-white/[0.06] ring-1 ring-inset ring-white/10 sm:h-[580px] sm:w-[380px]">
              <div className="px-7 pt-8 sm:px-8 sm:pt-9">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-marca-menta"><IconoTema tema={tema} className="h-4 w-4" />{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-[26px] font-extrabold leading-[1.1] text-white sm:text-[30px]">{d.titulo}</h3>
                {hechos.length ? (
                  <dl className="mt-4 grid gap-2.5">
                    {hechos.map(([k, v]) => (
                      <div key={k} className="border-l-2 border-marca-menta/50 pl-3">
                        <dd className="line-clamp-2 text-[16px] font-semibold leading-snug text-white">{v}</dd>
                        <dt className="mt-0.5 text-[12.5px] text-white/55">{k}</dt>
                      </div>
                    ))}
                  </dl>
                ) : <p className="mt-3 text-[15px] leading-relaxed text-white/70">{primeraFrase(d.texto)}</p>}
              </div>
              {foto ? (
                <div className="mt-auto px-4 pb-4">
                  <div className="exp-foto overflow-hidden rounded-[20px] bg-white">
                    <img src={recurso(foto)} srcSet={srcsetFoto(foto)} sizes="400px" alt={`${nombre}: ${d.titulo}`} loading="lazy" decoding="async"
                      width={800} height={800} className="aspect-[4/3] w-full scale-[1.12] object-contain" />
                  </div>
                </div>
              ) : (
                // Sin foto distinta: el ícono del tema en grande y la cifra principal, sobre un brillo verde
                <div aria-hidden="true" className="relative mt-auto flex min-h-[230px] flex-col items-start justify-end overflow-hidden px-7 pb-8 sm:px-8">
                  <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-marca-menta/20 blur-2xl" />
                  <IconoTema tema={tema} className="exp-icono absolute right-6 top-2 h-28 w-28 text-marca-menta/80 sm:h-32 sm:w-32" />
                  {cifra && (
                    <p className="relative flex items-baseline gap-2">
                      <span className="font-display text-[72px] font-extrabold leading-none tabular-nums text-white sm:text-[84px]">{cifra.valor}</span>
                      <span className="text-xl font-bold text-marca-menta">{cifra.unidad}</span>
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
      {destacados.length > 1 && (
        <div className="contenedor flex items-center justify-between gap-4 pb-14 pt-4 sm:pb-20">
          {/* Puntos: cuál tarjeta va adelante */}
          <div aria-hidden="true" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2">
            {destacados.map((d, i) => <span key={d.titulo} className={`h-1.5 rounded-full bg-white transition-[width,opacity] duration-300 ease-salida ${i === actual ? "w-6 opacity-100" : "w-1.5 opacity-40"}`} />)}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => ir(-1)} disabled={bordes.ini} aria-label="Anterior"
              className="presionable flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-opacity hover:bg-white/25 disabled:opacity-30"><IconoFlecha dir={-1} className="h-5 w-5" /></button>
            <button type="button" onClick={() => ir(1)} disabled={bordes.fin} aria-label="Siguiente"
              className="presionable flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-opacity hover:bg-white/25 disabled:opacity-30"><IconoFlecha className="h-5 w-5" /></button>
          </div>
        </div>
      )}
    </section>
  );
}

/** «Míralo de cerca»: visor grande con las fotos distintas del producto. Con menos de 3 no se muestra (ya están arriba) */
export function MiradaDeCerca({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  // (las fotos extra llegan un instante después: el visor se monta cuando ya están, así su animación de entrada funciona)
  return fotos.length < 3 ? null : <Visor fotos={fotos} nombre={nombre} />;
}
function Visor({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const [k, setK] = useState(0);
  const caja = useRef<HTMLElement>(null);
  const visto = useVisto(caja);
  const foto = fotos[k] ?? fotos[0] ?? "";
  return (
    <section ref={caja} id="de-cerca" aria-labelledby="t-cerca" data-visto={visto || undefined} className="exp-cerca bg-fondo">
      <div className="contenedor py-16 sm:py-24">
        <h2 id="t-cerca" className="exp-titulo font-display text-[34px] font-extrabold leading-[1.05] tracking-tight sm:text-[52px]">Míralo de cerca.</h2>
        <div className="mt-8 overflow-hidden rounded-[28px] bg-white ring-1 ring-inset ring-linea sm:mt-10">
          {/* La foto nueva entra con un fundido (la clave la vuelve a montar) */}
          <img key={foto} src={recurso(foto)} srcSet={srcsetFoto(foto)} sizes="(min-width: 1240px) 1200px, 100vw" alt={`${nombre}, vista ${k + 1} de ${fotos.length}`}
            width={800} height={800} decoding="async" className="exp-visor mx-auto aspect-[4/3] max-h-[620px] w-full object-contain p-6 sm:aspect-[16/10] sm:p-10" />
        </div>
        <div role="group" aria-label="Elegir vista" className="sin-barra -mx-4 mt-5 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:px-0">
          {fotos.map((f, i) => (
            <button key={f} type="button" onClick={() => setK(i)} aria-label={`Vista ${i + 1}`} aria-pressed={i === k}
              className={`presionable h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white p-1.5 ring-1 ring-inset transition-shadow sm:h-[72px] sm:w-[72px] ${i === k ? "ring-2 ring-marca" : "ring-linea hover:ring-linea-fuerte"}`}>
              <img src={recurso(f)} srcSet={srcsetFoto(f)} sizes="72px" alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** «De un vistazo»: una tarjeta por sección de la ficha con sus dos primeros datos en grande. Las dos primeras son anchas */
export function DeUnVistazo({ secciones, nombre }: { secciones: [string, [string, string][]][]; nombre: string }) {
  const caja = useRef<HTMLElement>(null);
  const visto = useVisto(caja);
  const tarjetas = secciones.filter(([t, f]) => !/^(general|lo principal|requisitos|compatibilidad|informaci)/i.test(t) && f.length > 0).slice(0, 6);
  if (tarjetas.length < 2) return null;
  const corto = (v: string, n = 46) => { const s = (v.split(/[;·|](?!\d)/)[0] ?? v).trim(); return s.length > n ? s.slice(0, n).replace(/[ ,]+\S*$/, "") + "…" : s; };
  return (
    <section ref={caja} id="vistazo" aria-labelledby="t-vistazo" data-visto={visto || undefined} className="exp-vistazo">
      <div className="contenedor py-16 sm:py-24">
        <h2 id="t-vistazo" className="exp-titulo max-w-[20ch] font-display text-[34px] font-extrabold leading-[1.05] tracking-tight sm:text-[52px]">De un vistazo.</h2>
        <ul aria-label={`${nombre}: lo principal de cada parte de la ficha`} className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {tarjetas.map(([titulo, filas], i) => {
            const tema = temaDe(titulo, filas.map(([k, v]) => `${k} ${v}`).join(" "));
            const ancha = i < 2;
            // El dato grande: el primero con un valor de verdad (no «Sí»/«No»); el segundo, si es «Sí», se nombra solo
            const siNo = (v: string) => /^(sí|si|no|yes)$/i.test(v.trim());
            const a = filas.find(([, v]) => !siNo(v));
            const otra = filas.find(f => f !== a);
            const b = otra && (siNo(otra[1]) ? ([otra[0], ""] as [string, string]) : otra);
            return (
              <li key={titulo} style={{ "--i": i } as React.CSSProperties}
                className={`exp-baldosa flex min-h-[220px] flex-col rounded-[24px] p-6 sm:p-7 ${ancha ? "lg:col-span-3" : "lg:col-span-2"} ${i === 0 ? "bg-marca-noche text-white" : "bg-superficie ring-1 ring-inset ring-linea"}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${i === 0 ? "bg-white/10 text-marca-menta" : "bg-marca-suave text-marca"}`}><IconoTema tema={tema} className="h-5 w-5" /></span>
                  <h3 className={`text-[15px] font-bold ${i === 0 ? "text-white/80" : "text-tinta-2"}`}>{titulo}</h3>
                </div>
                <div className="mt-auto pt-6">
                  {a && <p className={`line-clamp-2 font-display font-extrabold leading-tight ${ancha ? "text-[28px] sm:text-[34px]" : "text-[22px] sm:text-[26px]"}`}>{corto(a[1])}</p>}
                  {a && <p className={`mt-1 text-[13.5px] ${i === 0 ? "text-white/60" : "text-tinta-3"}`}>{a[0]}</p>}
                  {b && (b[1]
                    ? <p className={`mt-3 line-clamp-2 text-[15px] font-semibold leading-snug ${i === 0 ? "text-white/85" : "text-tinta-2"}`}>{corto(b[1], 60)} <span className={`font-normal ${i === 0 ? "text-white/55" : "text-tinta-3"}`}>· {b[0]}</span></p>
                    : <p className={`mt-3 text-[15px] font-semibold leading-snug ${i === 0 ? "text-white/85" : "text-tinta-2"}`}>✓ {b[0]}</p>)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
