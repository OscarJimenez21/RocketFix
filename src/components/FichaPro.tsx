/* 19/11/2026: partes de la página de producto ampliada (pedido del usuario: «que la página sea demasiado profesional»).
   - CifrasProducto: franja oscura con estrellas, como el pie y la portada, con 3 o 4 cifras clave del producto. Es la única
     animación que no responde a la persona: las cifras entran una tras otra la primera vez que se ven.
   - DestacadosProducto: bloques con una foto de detalle grande y un texto corto, alternando lados.
   - FichaInteractiva: la ficha técnica por secciones, con pestañas y un buscador dentro de la ficha.
   - NavProducto: en computador, al bajar, una barra fija con el nombre, accesos a cada parte, el precio y «Agregar».
   Todo sale de descripciones.json (cifras, destacados, secciones); si un producto no los tiene, esa parte no se muestra. */
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { dinero, norm, recurso, srcsetFoto } from "../lib/formato";
import { useVisto } from "../lib/enPantalla";
import { useGaleria } from "../lib/galerias";
import type { Producto } from "../types";
import { IconoCaracteristica, tipoDeClave } from "./Destacados";

/** Estrellas quietas de la franja (posiciones fijas: la franja se ve igual cada vez) */
const ESTRELLAS: [number, number, number, number][] = [
  [4, 18, 2, 0.7], [11, 72, 1.5, 0.5], [19, 34, 1, 0.6], [27, 86, 2, 0.4], [33, 12, 1.5, 0.8], [41, 58, 1, 0.5], [48, 24, 2, 0.6],
  [56, 78, 1.5, 0.45], [63, 40, 1, 0.7], [70, 14, 2, 0.5], [77, 66, 1.5, 0.6], [84, 30, 1, 0.8], [91, 82, 2, 0.4], [96, 46, 1.5, 0.6]
];

export function CifrasProducto({ cifras, nombre }: { cifras: [string, string, string][]; nombre: string }) {
  const caja = useRef<HTMLElement>(null);
  const visto = useVisto(caja);
  return (
    <section ref={caja} id="cifras" aria-labelledby="t-cifras" data-visto={visto || undefined}
      className="cifras-producto relative isolate overflow-hidden bg-marca-noche text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {ESTRELLAS.map(([x, y, t, o]) => <span key={`${x}-${y}`} className="absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: t, height: t, opacity: o }} />)}
        {/* El horizonte de la portada, curvo, en el borde de abajo */}
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full">
          <path d="M0 10 Q50 -2 100 10" fill="none" stroke="rgb(91 224 169 / 0.35)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="contenedor py-14 sm:py-16">
        <h2 id="t-cifras" className="max-w-[30ch] font-display text-[26px] font-extrabold leading-tight text-white sm:text-[32px]">{nombre} en cifras</h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {cifras.map(([valor, unidad, texto], i) => (
            <li key={texto} style={{ "--i": i } as React.CSSProperties} className="cifra border-l border-white/15 pl-4 sm:pl-5">
              <p className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-display text-[42px] font-extrabold leading-none tabular-nums text-white sm:text-[56px]">{valor}</span>
                <span className="text-base font-semibold text-marca-menta sm:text-lg">{unidad}</span>
              </p>
              <p className="mt-2.5 max-w-[24ch] text-sm leading-snug text-white/70">{texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DestacadosProducto({ destacados, producto }: { destacados: { titulo: string; texto: string; foto?: number }[]; producto: Producto }) {
  const fotos = useGaleria(producto);
  const nombre = producto.nombre;
  if (!fotos.length || !destacados.length) return null;
  return (
    <section id="destacados" aria-labelledby="t-destacados" className="contenedor py-14 sm:py-16">
      <h2 id="t-destacados" className="text-xl font-extrabold">Destacados</h2>
      <div className="mt-8 grid gap-12 lg:gap-16">
        {destacados.map((d, i) => {
          const foto = fotos[d.foto ?? i + 1] ?? fotos[i % fotos.length] ?? fotos[0] ?? "";
          return (
            <article key={d.titulo} className="grid items-center gap-6 md:grid-cols-2 md:gap-12 lg:gap-16">
              <div className={`escenario overflow-hidden rounded-xl border border-linea bg-superficie ${i % 2 ? "md:order-2" : ""}`}>
                <img src={recurso(foto)} srcSet={srcsetFoto(foto)} sizes="(min-width: 768px) 50vw, 100vw" alt={`${nombre}: ${d.titulo}`}
                  loading="lazy" decoding="async" width={800} height={800} className="aspect-square w-full scale-[1.11] object-cover" />{/* (las fotos traen 40 px de margen blanco: así llenan la tarjeta) */}
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-[24px] font-extrabold leading-tight sm:text-[30px]">{d.titulo}</h3>
                <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-tinta-2">{d.texto}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/** Ficha técnica con pestañas por sección y buscador. «Toda la ficha» muestra todas las secciones seguidas */
export function FichaInteractiva({ secciones }: { secciones: [string, [string, string][]][] }) {
  const base = useId();
  // Abre en la primera sección con datos del fabricante (la sección «General» solo repite marca, tipo y versiones)
  const [activa, setActiva] = useState(() => (secciones[0]?.[0] === "General" && secciones.length > 1 ? 1 : 0));
  const [buscar, setBuscar] = useState("");
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);
  const todas = secciones.length;   // índice de la pestaña «Toda la ficha»
  const total = secciones.reduce((n, [, f]) => n + f.length, 0);
  const q = norm(buscar.trim());
  const halladas = useMemo(() => (q ? secciones.map(([t, f]): [string, [string, string][]] => [t, f.filter(([k, v]) => norm(`${k} ${v}`).includes(q))]).filter(([, f]) => f.length) : []), [q, secciones]);
  const cuantos = halladas.reduce((n, [, f]) => n + f.length, 0);
  const visibles: [string, [string, string][]][] = q ? halladas : activa === todas ? secciones : secciones[activa] ? [secciones[activa]] : [];
  const mover = (e: React.KeyboardEvent, i: number) => {
    const ultimo = todas;
    const sig = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % (ultimo + 1) : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i + ultimo) % (ultimo + 1) : e.key === "Home" ? 0 : e.key === "End" ? ultimo : -1;
    if (sig < 0) return;
    e.preventDefault(); setActiva(sig); pestanas.current[sig]?.focus();
  };
  const titulos = [...secciones.map(([t, f]) => [t, f.length] as const), ["Toda la ficha", total] as const];
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      <div className="min-w-0">
        <label className="block">
          <span className="rotulo">Buscar en la ficha</span>
          <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Ej.: batería, peso, Wi-Fi" className="campo" />
        </label>
        {/* En celular, las secciones van en una fila que se desliza; en computador, en una columna */}
        <div role="tablist" aria-label="Secciones de la ficha técnica" aria-orientation="vertical"
          className={`-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sin-barra lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 ${q ? "opacity-50" : ""}`}>
          {titulos.map(([t, n], i) => {
            const sel = !q && activa === i;
            const tipo = i < todas ? tipoDeClave(t) : null;
            return (
              <button key={t} ref={el => { pestanas.current[i] = el; }} type="button" role="tab" id={`${base}-p${i}`} aria-selected={sel} aria-controls={`${base}-panel`}
                tabIndex={sel || (q && i === 0) ? 0 : -1} onClick={() => { setBuscar(""); setActiva(i); }} onKeyDown={e => mover(e, i)}
                className={`flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors lg:w-full ${sel ? "border-marca bg-marca-suave text-marca" : "border-linea bg-superficie text-tinta-2 hover:border-linea-fuerte hover:text-tinta"}`}>
                {tipo ? <IconoCaracteristica tipo={tipo} className="h-4 w-4 shrink-0" /> : <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
                <span className="whitespace-nowrap lg:flex-1 lg:whitespace-normal">{t}</span>
                <span className="text-xs font-normal tabular-nums text-tinta-3">{n}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={q ? undefined : `${base}-p${activa}`} aria-label={q ? `Resultados para ${buscar}` : undefined} className="min-w-0">
        {q && <p aria-live="polite" className="mb-3 text-sm text-tinta-2">{cuantos ? `${cuantos} ${cuantos === 1 ? "dato" : "datos"} con «${buscar.trim()}»` : `Ningún dato dice «${buscar.trim()}». Prueba con otra palabra o pregúntanos por WhatsApp.`}</p>}
        <div key={q ? "q" : activa} className="grid gap-4 motion-safe:animate-entrar">
          {visibles.map(([titulo, filas]) => (
            <section key={titulo} aria-label={titulo} className="overflow-hidden rounded-md border border-linea bg-superficie">
              {(visibles.length > 1 || q) && <h3 className="border-b border-linea bg-fondo px-4 py-2.5 text-[15px] font-bold">{titulo}</h3>}
              <dl className="text-sm">
                {filas.map(([k, v], n) => (
                  <div key={`${k}-${n}`} className={`grid grid-cols-[minmax(110px,38%)_1fr] gap-3 px-4 py-3 ${n ? "border-t border-linea" : ""}`}>
                    <dt className="font-semibold text-tinta-2">{k}</dt><dd className="whitespace-pre-line break-words">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Barra fija de computador: aparece cuando el botón «Agregar al carrito» de arriba ya no se ve. Marca la parte de la
    página en la que va la persona y la lleva a cada una con un toque */
export function NavProducto({ nombre, precio, partes, vigilar, alAgregar, etiquetaAgregar, deshabilitado }: {
  nombre: string; precio: number | null; partes: { id: string; texto: string }[]; vigilar: RefObject<HTMLButtonElement | null>;
  alAgregar?: (e: React.MouseEvent<HTMLButtonElement>) => void; etiquetaAgregar?: React.ReactNode; deshabilitado?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [actual, setActual] = useState("");
  useEffect(() => {
    const el = vigilar.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const o = new IntersectionObserver(([e]) => { if (e) setVisible(!e.isIntersecting && e.boundingClientRect.top < 0); });
    o.observe(el);
    return () => o.disconnect();
  }, [vigilar]);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = partes.map(p => document.getElementById(p.id)).filter((x): x is HTMLElement => !!x);
    const o = new IntersectionObserver(es => {
      const vista = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vista) setActual(vista.target.id);
    }, { rootMargin: "-140px 0px -55% 0px" });
    els.forEach(e => o.observe(e));
    return () => o.disconnect();
  }, [partes]);
  if (partes.length < 2) return null;
  return (
    <nav aria-label="Partes de esta página" aria-hidden={!visible || undefined} inert={!visible || undefined}
      className={`fixed inset-x-0 top-[110px] z-30 hidden border-b border-linea bg-superficie/90 backdrop-blur transition-[transform,opacity] duration-300 ease-salida lg:block ${visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"}`}>
      <div className="contenedor flex h-14 items-center gap-6">
        <p className="min-w-0 max-w-[26ch] truncate font-display text-[15px] font-bold">{nombre}</p>
        <ul className="flex min-w-0 flex-1 items-center gap-1">
          {partes.map(p => (
            <li key={p.id}>
              <button type="button" onClick={() => document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                aria-current={actual === p.id ? "true" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${actual === p.id ? "bg-marca-suave text-marca" : "text-tinta-2 hover:text-tinta"}`}>{p.texto}</button>
            </li>
          ))}
        </ul>
        {precio != null && <p className="shrink-0 font-display text-lg font-extrabold tabular-nums">{dinero(precio)}</p>}
        {alAgregar && <button type="button" onClick={alAgregar} disabled={deshabilitado} className="btn btn-primario btn-sm shrink-0">{etiquetaAgregar ?? "Agregar al carrito"}</button>}
      </div>
    </nav>
  );
}
