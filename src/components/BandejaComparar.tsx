/* 26/11/2026 (idea 6, como la bandeja «Comparar» de Samsung y Best Buy): cuando la persona marca «Comparar» en una o
   más tarjetas, abajo aparece una bandeja con las fotos. Con 2 o 3, el botón abre la comparación: foto, precio y la
   ficha técnica de cada uno lado a lado (solo los datos de sus fichas; lo que un producto no trae queda vacío). */
import { useEffect, useRef, useState } from "react";
import { desde, porId } from "../data/catalogo";
import { pedirDescripcion } from "../lib/descripcion";
import { dinero, recurso } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import { TOPE_COMPARAR, alternarComparar, limpiarComparar, useComparar } from "../lib/comparar";
import type { Producto } from "../types";
import { IconoCerrar } from "./Iconos";

type Filas = Record<string, [string, string][]>;
const TOPE_FILAS = 40;

export function BandejaComparar() {
  const ids = useComparar();
  const productos = ids.map(id => porId[id]).filter((p): p is Producto => !!p);
  const [abierta, setAbierta] = useState(false);
  if (!productos.length) return null;
  return (
    <>
      <div role="region" aria-label="Productos para comparar"
        className="fixed inset-x-0 bottom-[calc(52px+env(safe-area-inset-bottom,0px))] z-40 border-t lg:bottom-0 border-linea bg-white/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur motion-safe:animate-entrar">
        <div className="contenedor flex items-center gap-3 py-2.5">
          <ul className="flex min-w-0 flex-1 gap-2">
            {Array.from({ length: TOPE_COMPARAR }, (_, k) => {
              const p = productos[k];
              return (
                <li key={p?.id ?? `vacio-${k}`} className="relative">
                  {p ? (
                    <>
                      <img src={recurso(p.imagen ?? "")} alt={p.nombre} width={48} height={48} className="h-12 w-12 rounded-lg border border-linea bg-white object-contain p-0.5" />
                      <button type="button" onClick={() => alternarComparar(p.id)} aria-label={`Quitar ${p.nombre} de la comparación`}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-tinta text-white">
                        <IconoCerrar className="h-3 w-3" />
                      </button>
                    </>
                  ) : <span aria-hidden="true" className="block h-12 w-12 rounded-lg border border-dashed border-linea-fuerte" />}
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={limpiarComparar} className="hidden min-h-[44px] px-2 text-sm font-semibold text-tinta-2 hover:text-tinta sm:block">Quitar todos</button>
          <button type="button" disabled={productos.length < 2} onClick={() => setAbierta(true)}
            className="inline-flex min-h-[44px] items-center rounded-full bg-marca px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-marca-oscuro disabled:cursor-not-allowed disabled:bg-linea-fuerte">
            {productos.length < 2 ? "Elige otro para comparar" : `Comparar ${productos.length}`}
          </button>
        </div>
      </div>
      {abierta && <Comparacion productos={productos} cerrar={() => setAbierta(false)} />}
    </>
  );
}

function Comparacion({ productos, cerrar }: { productos: Producto[]; cerrar: () => void }) {
  const [fichas, setFichas] = useState<Filas>({});
  const caja = useRef<HTMLDivElement>(null);
  // Depende de qué productos son (sus id), no del arreglo, que se arma de nuevo en cada dibujo
  const ids = productos.map(p => p.id).join(",");
  useEffect(() => {
    let vigente = true;
    void Promise.all(ids.split(",").map(id => pedirDescripcion(id).then(d => [id, (d.secciones ?? []).flatMap(([, f]) => f).concat(d.ficha ?? [])] as const)))
      .then(pares => { if (vigente) setFichas(Object.fromEntries(pares)); });
    return () => { vigente = false; };
  }, [ids]);
  useEffect(() => {
    caja.current?.focus();
    const alTecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    document.addEventListener("keydown", alTecla);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", alTecla); document.body.style.overflow = antes; };
  }, [cerrar]);
  // Las características en el orden del primer producto y luego las que solo traen los otros
  const claves: string[] = [];
  for (const p of productos) for (const [k] of fichas[p.id] ?? []) if (!claves.includes(k) && claves.length < TOPE_FILAS) claves.push(k);
  const valor = (p: Producto, k: string) => (fichas[p.id] ?? []).find(([c]) => c === k)?.[1] ?? "";
  const columnas = { gridTemplateColumns: `minmax(110px, 0.8fr) repeat(${productos.length}, minmax(150px, 1fr))` };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* El fondo oscuro también cierra (es un botón, así funciona con teclado y lectores de pantalla) */}
      <button type="button" tabIndex={-1} aria-label="Cerrar la comparación" onClick={cerrar} className="absolute inset-0 bg-black/50" />
      <div ref={caja} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="t-comparacion"
        className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[24px] bg-white text-tinta outline-none sm:rounded-[24px]">
        <div className="flex items-center justify-between border-b border-linea px-5 py-3">
          <h2 id="t-comparacion" className="font-display text-[20px] font-extrabold">Comparación</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar la comparación" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-fondo"><IconoCerrar className="h-5 w-5" /></button>
        </div>
        <div className="overflow-auto">
          <div className="grid min-w-max sm:min-w-0" style={columnas}>
            <div className="sticky left-0 bg-white" />
            {productos.map(p => (
              <div key={p.id} className="flex flex-col items-center px-3 pb-4 pt-5 text-center">
                <img src={recurso(p.imagen ?? "")} alt="" width={140} height={140} className="h-28 w-auto object-contain sm:h-36" />
                <a href={hrefProducto(p.id)} className="mt-3 text-balance font-display text-[16px] font-extrabold leading-tight hover:text-marca">{p.nombre}</a>
                <p className="mt-1 text-[13.5px] text-tinta-3">Desde <span className="font-semibold text-tinta">{dinero(desde(p))}</span></p>
              </div>
            ))}
            {claves.map((k, n) => (
              <div key={k} className="contents">
                <div className={`sticky left-0 px-4 py-2.5 text-[13px] font-semibold text-tinta-2 ${n % 2 ? "bg-white" : "bg-fondo"}`}>{k}</div>
                {productos.map(p => <div key={p.id} className={`whitespace-pre-line break-words px-3 py-2.5 text-[13.5px] ${n % 2 ? "" : "bg-fondo"}`}>{valor(p, k) || <span className="text-tinta-3">—</span>}</div>)}
              </div>
            ))}
          </div>
          {!claves.length && <p className="px-5 py-8 text-center text-tinta-2">Cargando las fichas…</p>}
        </div>
      </div>
    </div>
  );
}
