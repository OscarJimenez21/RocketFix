/* Idea 25: «Encuentra tu celular». Se elige por marca o por presupuesto y abajo salen los celulares que cumplen, del más
   económico al más caro. Cada marca muestra desde cuánto hay. (Por tamaño de pantalla no se puede todavía: la lista de
   productos no trae ese dato; está solo en la ficha de cada uno.) */
import { useMemo, useState } from "react";
import { deTienda, desde } from "../../data/catalogo";
import { FilaProductos } from "../../components/FilaProductos";
import { dinero } from "../../lib/formato";
import { hrefMarca, hrefDe } from "../../lib/rutas";
import type { Producto } from "../../types";

const CELULARES = deTienda("cel").filter(p => !p.consultar).sort((a, b) => desde(a) - desde(b));

/** Marcas con 3 celulares o más, de la que tiene más a la que tiene menos */
const MARCAS = Object.entries(
  CELULARES.reduce<Record<string, Producto[]>>((m, p) => { if (p.marca) (m[p.marca] ??= []).push(p); return m; }, {})
).filter(([, l]) => l.length >= 3).sort((a, b) => b[1].length - a[1].length).slice(0, 8);

const PRESUPUESTOS: { texto: string; min: number; max: number }[] = [
  { texto: "Hasta $600.000", min: 0, max: 600_000 },
  { texto: "$600.000 a $1.500.000", min: 600_000, max: 1_500_000 },
  { texto: "$1.500.000 a $3.000.000", min: 1_500_000, max: 3_000_000 },
  { texto: "Más de $3.000.000", min: 3_000_000, max: Infinity }
];

type Modo = "marca" | "presupuesto";

export function TuCelular() {
  const [modo, setModo] = useState<Modo>("marca");
  const [marca, setMarca] = useState(MARCAS[0]?.[0] ?? "");
  const [rango, setRango] = useState(1);
  const lista = useMemo(() => {
    if (modo === "marca") return MARCAS.find(([m]) => m === marca)?.[1] ?? [];
    const r = PRESUPUESTOS[rango];
    return r ? CELULARES.filter(p => desde(p) >= r.min && desde(p) < r.max) : [];
  }, [modo, marca, rango]);
  if (!MARCAS.length) return null;

  const pestana = (m: Modo, texto: string) => (
    <button type="button" role="tab" aria-selected={modo === m} onClick={() => setModo(m)}
      className={`presionable min-h-[44px] rounded-full px-4 text-sm font-semibold ${modo === m ? "bg-oscuro text-white" : "text-tinta-2 hover:text-tinta"}`}>{texto}</button>
  );

  return (
    <section id="tu-celular" aria-labelledby="t-tu-celular" className="contenedor py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="t-tu-celular" className="titulo-seccion titulo-trazo">Encuentra tu celular</h2>
          <p className="mt-2 text-tinta-2">Elige la marca que prefieres o cuánto quieres invertir.</p>
        </div>
        <div role="tablist" aria-label="Buscar celular por" className="inline-flex rounded-full border border-linea-fuerte bg-fondo p-0.5">
          {pestana("marca", "Por marca")}
          {pestana("presupuesto", "Por presupuesto")}
        </div>
      </div>
      <div role="tabpanel" className="mt-5">
        <div className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {modo === "marca"
            ? MARCAS.map(([m, l]) => (
              <button key={m} type="button" aria-pressed={m === marca} onClick={() => setMarca(m)} className="chip">
                <span className="font-semibold">{m}</span><span className={m === marca ? "text-white/80" : "text-tinta-3"}>desde {dinero(desde(l[0] as Producto))}</span>
              </button>
            ))
            : PRESUPUESTOS.map((r, k) => {
              const n = CELULARES.filter(p => desde(p) >= r.min && desde(p) < r.max).length;
              return n ? (
                <button key={r.texto} type="button" aria-pressed={k === rango} onClick={() => setRango(k)} className="chip">
                  <span className="font-semibold">{r.texto}</span><span className={k === rango ? "text-white/80" : "text-tinta-3"}>{n}</span>
                </button>
              ) : null;
            })}
        </div>
        <div className="mt-6">
          <FilaProductos key={`${modo}-${marca}-${rango}`} productos={lista.slice(0, 12)} etiqueta="Celulares encontrados"
            encabezado={<p className="text-sm text-tinta-2">{lista.length} {lista.length === 1 ? "celular" : "celulares"}, del más económico al más caro</p>}
            verTodo={modo === "marca" ? { href: hrefMarca(marca), texto: `Ver todo ${marca}` } : { href: hrefDe("celulares"), texto: "Ver todos los celulares" }} />
        </div>
      </div>
    </section>
  );
}
