/* 25/11/2026 (usuario: «toma ideas de Apple, Mac Center, iShop…»): «Explora la línea», como la fila de modelos de las
   páginas de iPhone, iPad y Mac de apple.com. Los modelos de una marca lado a lado, cada uno con su foto, su precio
   «Desde» y sus cifras clave (las mismas de su página: pantalla, cámara, batería, chip…), una debajo de la otra para
   que se puedan comparar de un vistazo. Solo usa datos de las fichas; un modelo sin cifras no entra. */
import { useEffect, useMemo, useState } from "react";
import { desde, porId } from "../data/catalogo";
import { pedirDescripcion } from "../lib/descripcion";
import { dinero, recurso, srcsetFoto } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import type { Producto } from "../types";

type Cifra = [string, string, string];
const TOPE = 8;

export function ExploraLinea({ productos, titulo }: { productos: Producto[]; titulo: string }) {
  // Los de mayor precio primero (como Apple, que abre con el modelo «Pro»), con foto y precio
  // La lista depende de qué productos llegan, no del arreglo (la página de marca lo arma de nuevo en cada dibujo)
  const ids = productos.filter(p => p.imagen && !p.consultar).sort((a, b) => desde(b) - desde(a)).slice(0, TOPE * 2).map(p => p.id).join(",");
  const candidatos = useMemo(() => ids ? ids.split(",").map(id => porId[id]).filter((p): p is Producto => !!p) : [], [ids]);
  const [cifras, setCifras] = useState<Record<string, Cifra[]>>({});
  useEffect(() => {
    let vigente = true;
    void Promise.all(candidatos.map(p => pedirDescripcion(p.id).then(d => [p.id, (d.cifras ?? []).slice(0, 4)] as const)))
      .then(pares => { if (vigente) setCifras(Object.fromEntries(pares)); });
    return () => { vigente = false; };
  }, [candidatos]);
  const linea = candidatos.filter(p => (cifras[p.id]?.length ?? 0) >= 2).slice(0, TOPE);
  if (linea.length < 3) return null;
  const filas = Math.max(...linea.map(p => cifras[p.id]?.length ?? 0));
  return (
    <section aria-labelledby="t-linea" className="claro-siempre bg-white py-12 text-tinta sm:py-16">
      <div className="contenedor">
        <h2 id="t-linea" className="titulo-seccion text-balance">Explora la línea. <span className="text-tinta-3">{titulo}</span></h2>
      </div>
      <ul className="sin-barra mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:gap-6 lg:px-[max(1rem,calc(50%-600px))]">
        {linea.map(p => (
          <li key={p.id} className="flex w-[64vw] max-w-[250px] shrink-0 snap-start flex-col items-center text-center sm:w-[230px]">
            <a href={hrefProducto(p.id)} className="group flex flex-col items-center">
              <img src={recurso(p.imagen ?? "")} srcSet={srcsetFoto(p.imagen ?? "")} sizes="230px" alt="" loading="lazy" decoding="async" width={800} height={800}
                className="h-44 w-auto object-contain mix-blend-multiply transition-transform duration-300 ease-salida motion-safe:group-hover:-translate-y-1 sm:h-52" />
              <span className="mt-4 min-h-[2.6em] text-balance font-display text-[18px] font-extrabold leading-tight sm:text-[20px]">{p.nombre}</span>
            </a>
            <p className="mt-1 text-[14px] text-tinta-3">Desde <span className="font-semibold text-tinta">{dinero(desde(p))}</span></p>
            <a href={hrefProducto(p.id)} className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-marca px-5 text-[14px] font-semibold text-white transition-colors hover:bg-marca-oscuro">
              Ver más<span className="sr-only"> de {p.nombre}</span>
            </a>
            <dl className="mt-6 w-full border-t border-linea">
              {Array.from({ length: filas }, (_, k) => {
                const c = cifras[p.id]?.[k];
                return (
                  <div key={k} className="flex min-h-[96px] flex-col items-center justify-center border-b border-linea px-2 py-3">
                    {c ? (
                      <>
                        <dt className="order-2 mt-1 text-[12.5px] leading-snug text-tinta-3">{c[2]}</dt>
                        <dd className="order-1 font-display text-[26px] font-extrabold leading-none tracking-tight">{c[0]}{c[1] && <span className="ml-1 text-[14px] font-bold text-tinta-2">{c[1]}</span>}</dd>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
