/* Portada de la tienda. Cada bloque está en su propio archivo de src/paginas/inicio/; aquí solo se arma el orden.
   (Antes todo vivía en este archivo, de 856 líneas.) */
import { useEffect } from "react";
import { MAS_VENDIDOS, porId, recienLlegados } from "../data/catalogo";
import { Calificaciones } from "../components/Calificaciones";
import { IconoLlama } from "../components/Iconos";
import type { Producto, TiendaId } from "../types";
import { BandaCelulares, BandaComputadores, BandaGamer } from "./inicio/Bandas";
import { Carrusel, Coleccion } from "./inicio/Carrusel";
import { Categorias } from "./inicio/Categorias";
import { Marcas } from "./inicio/Marcas";
import { ComoComprar, Portada, Ventajas } from "./inicio/Portada";
import { Servicios } from "./inicio/Servicios";
import { Confianza } from "./inicio/Confianza";
import { IdeasParaRegalar, PorPresupuesto } from "./inicio/Regalos";
import { TEMPORADA } from "../lib/temporada";
import { useVistos } from "../lib/vistos";
import { Recientes } from "../components/ProductoExtras";
import { BarraSecciones } from "./inicio/BarraSecciones";
import { Envios } from "./inicio/Envios";
import { TuCelular } from "./inicio/TuCelular";

// Las secciones de cada fila son siempre las mismas listas: así la fila no se vuelve a calcular en cada dibujo
// (con tiendas={["cel"]} llegaba una lista nueva cada vez y el useMemo de Coleccion nunca servía)
const SOLO_CEL: TiendaId[] = ["cel"];
const SOLO_PC: TiendaId[] = ["pc"];
const SOLO_COMP: TiendaId[] = ["comp"];
// Idea 92: lo que llegó en los últimos días (con foto), lo más nuevo primero. Se calcula una vez al abrir la tienda
const NUEVOS = recienLlegados().filter(p => p.imagen).slice(0, 12);

export function Inicio({ ancla }: { ancla?: string }) {
  // Idea 15: los productos que la persona vio hace poco (en este navegador), si son 2 o más
  const vistos = useVistos();
  const vendidos = MAS_VENDIDOS.map(id => porId[id]).filter((p): p is Producto => Boolean(p) && !p?.consultar);

  // #categorias, #servicios, #calificaciones, #contacto, #orden y #como-comprar llevan a su sección de la portada
  // Cuando corre el efecto la sección ya está en la página, así que se puede bajar de una vez
  useEffect(() => {
    if (ancla) document.getElementById(ancla)?.scrollIntoView({ block: "start" });
  }, [ancla]);

  return (
    <>
      <Portada />
      <Ventajas />
      {/* Por presupuesto: todo el año. En temporada (se encienden y se apagan solas por fecha) sube y cambia de textos */}
      {TEMPORADA && <PorPresupuesto />}
      <ComoComprar />
      <Envios />
      <Marcas />
      <Categorias />
      {!TEMPORADA && <PorPresupuesto />}
      <div id="recientes"><Recientes productos={vistos} /></div>
      {TEMPORADA?.ideas && <IdeasParaRegalar />}
      <BandaGamer />
      <Carrusel id="vendidos" etiqueta={<><IconoLlama className="h-4 w-4 text-acento" />Lo más vendido</>} titulo="Los que todos quieren" productos={vendidos} cinta="Top ventas" gris />
      {NUEVOS.length >= 4 && <Carrusel id="nuevos" etiqueta="Recién llegados" titulo="Lo último que llegó a la tienda" productos={NUEVOS} />}
      <BandaCelulares />
      <TuCelular />
      <Coleccion id="celulares" etiqueta="Celulares" titulo="Estrena celular" tiendas={SOLO_CEL} />
      <BandaComputadores />
      <Coleccion id="computadores" etiqueta="Computadores" titulo="Portátiles y PC para cada necesidad" tiendas={SOLO_PC} gris />
      <Coleccion id="componentes" etiqueta="Componentes" titulo="Arma o mejora tu PC" tiendas={SOLO_COMP} />
      <Servicios />
      <Confianza />
      <Calificaciones />
      <BarraSecciones />
    </>
  );
}
