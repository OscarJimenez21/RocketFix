/* Portada de la tienda. Cada bloque está en su propio archivo de src/paginas/inicio/; aquí solo se arma el orden.
   (Antes todo vivía en este archivo, de 856 líneas.) */
import { useEffect } from "react";
import { MAS_VENDIDOS, porId } from "../data/catalogo";
import { Calificaciones } from "../components/Calificaciones";
import { IconoLlama } from "../components/Iconos";
import type { Producto, TiendaId } from "../types";
import { BandaCelulares, BandaComputadores, BandaGamer } from "./inicio/Bandas";
import { Carrusel, Coleccion } from "./inicio/Carrusel";
import { Categorias } from "./inicio/Categorias";
import { Marcas } from "./inicio/Marcas";
import { ComoComprar, Portada, Ventajas } from "./inicio/Portada";
import { Servicios } from "./inicio/Servicios";

// Las secciones de cada fila son siempre las mismas listas: así la fila no se vuelve a calcular en cada dibujo
// (con tiendas={["cel"]} llegaba una lista nueva cada vez y el useMemo de Coleccion nunca servía)
const SOLO_CEL: TiendaId[] = ["cel"];
const SOLO_PC: TiendaId[] = ["pc"];
const SOLO_COMP: TiendaId[] = ["comp"];

export function Inicio({ ancla }: { ancla?: string }) {
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
      <ComoComprar />
      <Marcas />
      <Categorias />
      <BandaGamer />
      <Carrusel id="vendidos" etiqueta={<><IconoLlama className="h-4 w-4 text-acento" />Lo más vendido</>} titulo="Los que todos quieren" productos={vendidos} cinta="Top ventas" gris />
      <BandaCelulares />
      <Coleccion id="celulares" etiqueta="Celulares" titulo="Estrena celular" tiendas={SOLO_CEL} />
      <BandaComputadores />
      <Coleccion id="computadores" etiqueta="Computadores" titulo="Portátiles y PC para cada necesidad" tiendas={SOLO_PC} gris />
      <Coleccion id="componentes" etiqueta="Componentes" titulo="Arma o mejora tu PC" tiendas={SOLO_COMP} />
      <Servicios />
      <Calificaciones />
    </>
  );
}
