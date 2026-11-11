import { useEffect, useRef, useState } from "react";
import { deTienda } from "../../data/catalogo";
import { tiendaPorId } from "../../data/tiendas";
import { IconoFlecha } from "../../components/Iconos";
import { activa, reducirMovimiento } from "../../lib/animaciones";
import { useRevelarHijos, useVisto } from "../../lib/enPantalla";
import { recurso } from "../../lib/formato";
import type { TiendaId } from "../../types";

/** Colores de las tarjetas de categoría (todos de la marca, planos: sin luces de adorno) */
export const TEMAS = {
  oscuro: { caja: "bg-marca-oscuro text-white", frase: "text-marca-menta", boton: "bg-white text-marca-oscuro" },
  noche: { caja: "bg-marca-noche text-white", frase: "text-marca-menta", boton: "bg-marca-menta text-marca-noche" },
  marca: { caja: "bg-marca text-white", frase: "text-white", boton: "bg-white text-marca-oscuro" },
  acento: { caja: "bg-acento text-acento-tinta", frase: "text-acento-tinta/80", boton: "bg-acento-tinta text-white" },
  menta: { caja: "bg-marca-menta text-marca-noche", frase: "text-marca-noche/75", boton: "bg-marca-noche text-white" },
  suave: { caja: "bg-marca-suave text-marca-oscuro", frase: "text-marca-medio", boton: "bg-marca text-white" }
} as const;

/** Tamaños del mosaico: en computador es una cuadrícula de 12 columnas; en celular, de 2 */
const FORMAS = {
  grande: { caja: "col-span-2 h-[300px] sm:h-[360px] lg:col-span-6 lg:row-span-2 lg:h-auto", texto: "max-w-[62%]", titulo: "text-[34px] sm:text-[46px]", foto: "h-[78%] max-w-[50%] sm:h-[84%]", corto: false },
  ancha: { caja: "col-span-2 h-[210px] sm:h-[230px] lg:col-span-6 lg:h-auto", texto: "max-w-[62%]", titulo: "text-[25px] sm:text-[34px]", foto: "h-[68%] max-w-[45%] sm:h-[86%] sm:max-w-[52%]", corto: false },
  normal: { caja: "h-[210px] sm:h-[230px] lg:col-span-3 lg:h-auto", texto: "max-w-full sm:max-w-[62%]", titulo: "text-[19px] sm:text-[25px]", foto: "h-[48%] max-w-[52%] sm:h-[58%] sm:max-w-[48%]", corto: true }
} as const;

/** Cada sección con su frase, su color y un producto recortado (public/fotos/recortes, sin fondo) */
const MOSAICO: { tienda: TiendaId; frase: string; tema: keyof typeof TEMAS; foto: string; forma: keyof typeof FORMAS }[] = [
  { tienda: "cel", frase: "Lo último en", tema: "oscuro", foto: "ip17pm", forma: "grande" },
  { tienda: "pc", frase: "Para estudiar, trabajar y jugar", tema: "acento", foto: "p52396", forma: "ancha" },
  { tienda: "comp", frase: "Arma o mejora tu PC", tema: "marca", foto: "p3789", forma: "normal" },
  { tienda: "per", frase: "Más precisión", tema: "menta", foto: "p31252", forma: "normal" },
  { tienda: "con", frase: "Más diversión", tema: "noche", foto: "p45585", forma: "normal" },
  { tienda: "tab", frase: "Más pantalla", tema: "suave", foto: "ipadpro", forma: "normal" },
  { tienda: "rel", frase: "Siempre conectado", tema: "acento", foto: "gw8c", forma: "normal" },
  { tienda: "aud", frase: "Sonido sin cables", tema: "menta", foto: "gbuds3fe", forma: "normal" },
  { tienda: "par", frase: "Lleva la música", tema: "marca", foto: "jblflip7", forma: "normal" },
  { tienda: "tv", frase: "Para tu sala", tema: "oscuro", foto: "tvs43u", forma: "normal" },
  { tienda: "acc", frase: "Carga y conecta", tema: "suave", foto: "p45648", forma: "normal" },
  { tienda: "mov", frase: "Muévete por la ciudad", tema: "noche", foto: "xpatineta", forma: "normal" }
];

/** Animación 30: el número de productos de una categoría cuenta desde 0 la primera vez que se ve (en 0,9 s, frenando al final) */
function Contador({ valor }: { valor: number }) {
  const caja = useRef<HTMLSpanElement>(null);
  const visto = useVisto(caja);
  const [cuenta] = useState(() => activa(30) && !reducirMovimiento());
  const [n, setN] = useState(cuenta ? 0 : valor);
  useEffect(() => {
    if (!cuenta || !visto) return;
    let cuadro = 0;
    const inicio = performance.now();
    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / 900);
      setN(Math.round(valor * (1 - (1 - p) ** 3)));
      if (p < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [cuenta, visto, valor]);
  return <span ref={caja} className="tabular-nums">{n}</span>;
}

/** Mosaico de categorías: tarjetas de colores con un producto que se asoma; todas llevan a su sección.
    El producto de cada tarjeta sube desde el borde la primera vez que la tarjeta aparece en pantalla (las que aparecen
    juntas, una tras otra; ver .aparece-mosaico en index.css) */
export function Categorias() {
  const mosaico = useRef<HTMLUListElement>(null);
  useRevelarHijos(mosaico);
  return (
    // overflow-x-clip: el producto que se sale de su tarjeta (animación 57) nunca hace que la página se corra de lado
    <section id="categorias" aria-labelledby="t-categorias" className="contenedor overflow-x-clip py-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h2 id="t-categorias" className="titulo-seccion titulo-trazo">Compra por categoría</h2>
      </div>
      <ul ref={mosaico} className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[215px] lg:grid-cols-12">
        {MOSAICO.map(m => {
          const t = tiendaPorId(m.tienda);
          if (!t) return null;
          const tema = TEMAS[m.tema], forma = FORMAS[m.forma];
          return (
            <li key={m.tienda} data-revelar className={`revelar ${forma.caja}`}>
              {/* mosaico-tarjeta: con el mouse encima, el producto se levanta y se sale un poco del cuadro (animación 57) */}
              <a href={`#${t.vista}`} data-forma={m.forma} className={`mosaico-tarjeta group relative isolate flex h-full overflow-hidden rounded-lg p-4 transition-transform duration-150 ease-salida active:scale-[0.98] sm:p-6 ${tema.caja}`}>
                <span className={`relative z-10 flex min-w-0 flex-col ${forma.texto}`}>
                  <span className={`text-[12.5px] font-semibold leading-snug sm:text-sm ${tema.frase}`}>{m.frase}</span>
                  <span className={`mt-1 font-display font-extrabold leading-[0.98] tracking-tight ancho-108 ${forma.titulo}`}>{t.titulo}</span>
                  {/* Mismo color de la frase (con opacidad, en las tarjetas verdes no se leía bien) */}
                  <span className={`mt-2 text-[13px] ${tema.frase}`}><Contador valor={deTienda(t.id).length} /> productos</span>
                  {/* En celular las tarjetas pequeñas solo muestran la flecha, para dejarle espacio a la foto */}
                  <span className={`mt-auto inline-flex w-max items-center gap-1.5 rounded-full text-[13px] font-bold transition-transform duration-200 ease-salida group-hover:translate-x-0.5 ${forma.corto ? "p-2.5 sm:px-4 sm:py-2" : "px-4 py-2"} ${tema.boton}`}>
                    <span className={forma.corto ? "hidden sm:inline" : ""}>Ver todo</span><IconoFlecha className="h-3.5 w-3.5" />
                  </span>
                </span>
                <img src={recurso(`fotos/recortes/${m.foto}.webp`)} alt="" loading="lazy" decoding="async"
                  className={`aparece-mosaico pointer-events-none absolute bottom-3 right-3 object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.32)] motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:scale-[1.04] sm:bottom-4 sm:right-5 ${forma.foto}`} />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
