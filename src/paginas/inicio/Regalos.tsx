/* Temporada de regalos (solo en diciembre, ver REGALOS en lib/temporada.ts): dos secciones de la portada.
   · «Regalos por presupuesto»: cuatro rangos de precio y una fila con productos de ese rango.
   · «Ideas para regalar»: cuatro tarjetas (gamer, trabajo, estudio, casa) y una fila con productos para esa persona.
   Las filas usan la tarjeta normal de la tienda (con su botón «Agregar»), con los precios de siempre. */
import { useMemo, useState } from "react";
import { FilaProductos } from "../../components/FilaProductos";
import { IconoCheck, IconoRegalo } from "../../components/Iconos";
import { recurso } from "../../lib/formato";
import { PERSONAS, RANGOS, porPersona, porRango } from "../../lib/regalos";
import { REGALOS } from "../../lib/temporada";
import { TEMAS } from "./Categorias";

/** Estrellas doradas y blancas de la franja de regalos: solo en los bordes, nunca detrás de los títulos ni de las tarjetas
    (posición en %, tamaño en px y color) */
const ESTRELLAS: [number, number, number, string][] = [
  [2, 10, 3, "#FFD36B"], [6, 34, 2, "#fff"], [97, 8, 3, "#FFE9A8"], [93, 22, 2, "#fff"], [99, 40, 2, "#FFD36B"],
  [1.5, 62, 2, "#FFE9A8"], [98.5, 70, 3, "#FFD36B"], [3, 88, 2, "#fff"], [96, 92, 2, "#FFE9A8"], [60, 4, 2, "#fff"], [78, 6, 2.5, "#FFD36B"]
];

export function RegalosPorPresupuesto() {
  const [rango, setRango] = useState<string>(RANGOS[1].id);
  const productos = useMemo(() => porRango(rango), [rango]);
  const actual = RANGOS.find(r => r.id === rango) ?? RANGOS[1];
  return (
    <section id="regalos" aria-labelledby="t-regalos" className="relative isolate overflow-hidden bg-marca-noche text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {ESTRELLAS.map(([x, y, s, c], k) => (
          <span key={k} className="absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, background: c, boxShadow: `0 0 ${s * 3}px ${c}` }} />
        ))}
      </div>
      <div className="contenedor py-12 sm:py-14">
        <p className="etiqueta flex items-center gap-1.5 text-[#FFD36B]"><IconoRegalo className="h-4 w-4" />{REGALOS?.navidad ? "Regalos de Navidad" : "Regalos de fin de año"}</p>
        <h2 id="t-regalos" className="titulo-seccion mt-1 text-white">Regalos para cada presupuesto</h2>
        <p className="mt-2 max-w-[60ch] text-[15px] text-white/75">Elige cuánto quieres gastar y te mostramos ideas en ese rango, con el precio de siempre.</p>
        {/* Rangos: en celular se deslizan de lado */}
        <div role="group" aria-label="Presupuesto" className="sin-barra -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {RANGOS.map(r => {
            const elegido = r.id === rango;
            return (
              <button key={r.id} type="button" aria-pressed={elegido} onClick={() => setRango(r.id)}
                className={`presionable inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 ${elegido ? "border-[#FFD36B] bg-[#FFD36B] text-marca-noche" : "border-white/30 text-white hover:border-white/70"}`}>
                {elegido && <IconoCheck className="h-4 w-4" />}{r.texto}
              </button>
            );
          })}
        </div>
        <div key={rango} className="mt-6 motion-safe:animate-entrar">
          <FilaProductos productos={productos} etiqueta={`Regalos de ${actual.texto.toLowerCase()}`}
            encabezado={<p className="text-sm text-white/75"><span className="font-semibold tabular-nums text-white">{productos.length}</span> ideas · {actual.texto}</p>} />
        </div>
      </div>
    </section>
  );
}

export function IdeasParaRegalar() {
  const [persona, setPersona] = useState<string>(PERSONAS[0]?.id ?? "gamer");
  const productos = useMemo(() => porPersona(persona), [persona]);
  const actual = PERSONAS.find(x => x.id === persona) ?? PERSONAS[0];
  return (
    <section id="ideas-regalo" aria-labelledby="t-ideas" className="contenedor py-12 sm:py-14">
      <p className="etiqueta flex items-center gap-1.5"><IconoRegalo className="h-4 w-4 text-acento" />Ideas para regalar</p>
      <h2 id="t-ideas" className="titulo-seccion titulo-trazo mt-1">¿Para quién es el regalo?</h2>
      <div role="group" aria-label="Para quién es el regalo" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {PERSONAS.map(x => {
          const tema = TEMAS[x.tema];
          const elegida = x.id === persona;
          return (
            <button key={x.id} type="button" aria-pressed={elegida} onClick={() => setPersona(x.id)}
              className={`idea-regalo group relative isolate flex h-[184px] overflow-hidden rounded-lg p-4 text-left transition-[transform,box-shadow] duration-150 ease-salida active:scale-[0.98] sm:h-[170px] sm:p-5 ${tema.caja} ${elegida ? "ring-[3px] ring-acento ring-offset-2" : ""}`}>
              <span className="relative z-10 flex min-w-0 max-w-[54%] flex-col">
                <span className="font-display text-[19px] font-extrabold leading-tight tracking-tight sm:text-[23px]">{x.titulo}</span>
                <span className={`mt-1 text-[12.5px] leading-snug sm:text-[13px] ${tema.frase}`}>{x.frase}</span>
                {elegida && <span className={`mt-auto inline-flex w-max items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${tema.boton}`}><IconoCheck className="h-3.5 w-3.5" />Viendo</span>}
              </span>
              <img src={recurso(`fotos/recortes/${x.foto}.webp`)} alt="" loading="lazy" decoding="async"
                className="pointer-events-none absolute bottom-3 right-2 h-[58%] max-w-[38%] object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-salida motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-[1.05]" />
            </button>
          );
        })}
      </div>
      <div key={persona} className="mt-8 motion-safe:animate-entrar">
        <FilaProductos productos={productos} etiqueta={`Ideas ${actual?.titulo.toLowerCase() ?? ""}`}
          encabezado={<p className="text-sm text-tinta-2"><span className="font-semibold tabular-nums text-tinta">{productos.length}</span> ideas {actual?.titulo.toLowerCase()}</p>} />
      </div>
    </section>
  );
}
