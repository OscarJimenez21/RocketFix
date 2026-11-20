/* Portada de la tienda. Cada bloque está en su propio archivo de src/paginas/inicio/; aquí solo se arma el orden.
   (Antes todo vivía en este archivo, de 856 líneas.) */
import { useEffect, useState } from "react";
import { Diferido, reiniciarDiferidos } from "../components/Diferido";
import { MAS_VENDIDOS, VITRINA, porId, recienLlegados } from "../data/catalogo";
import { Calificaciones } from "../components/Calificaciones";
import { IconoLlama } from "../components/Iconos";
import type { Producto, TiendaId } from "../types";
import { BandaCelulares, BandaComputadores, BandaGamer } from "./inicio/Bandas";
import { Carrusel, Coleccion, TOPE_FILA, variados } from "./inicio/Carrusel";
import { Atajos, Categorias } from "./inicio/Categorias";
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
import { useDespuesDePintar, vaARegresar } from "../lib/rutas";

// Las secciones de cada fila son siempre las mismas listas: así la fila no se vuelve a calcular en cada dibujo
// (con tiendas={["cel"]} llegaba una lista nueva cada vez y el useMemo de Coleccion nunca servía)
const SOLO_CEL: TiendaId[] = ["cel"];
const SOLO_PC: TiendaId[] = ["pc"];
const SOLO_COMP: TiendaId[] = ["comp"];
// Idea 92: lo que llegó en los últimos días (con foto), lo más nuevo primero. Se calcula una vez al abrir la tienda
// 17/11/2026: 20 en vez de 12, como las demás filas
const NUEVOS = recienLlegados().filter(p => p.imagen).slice(0, TOPE_FILA);
/** «Lo más vendido»: los más vendidos de contenido.json (con la cinta «Top ventas») y, para llegar a 20, los destacados
    de la vitrina y luego celulares y computadores, sin cinta (17/11/2026). Solo con foto y precio, sin repetir */
const VENDIDOS_CINTA = new Set(MAS_VENDIDOS);
const VENDIDOS: Producto[] = (() => {
  const vistos = new Set<string>();
  const candidatos = [...[...MAS_VENDIDOS, ...VITRINA].map(id => porId[id]), ...variados(["cel", "pc"])];
  return candidatos.filter((p): p is Producto => Boolean(p && p.imagen && !p.consultar && !vistos.has(p.id) && vistos.add(p.id))).slice(0, TOPE_FILA);
})();

export function Inicio({ ancla }: { ancla?: string }) {
  // Idea 15: los productos que la persona vio hace poco (en este navegador), si son 2 o más
  const vistos = useVistos();
  // 15/11/2026: la parte de arriba (portada, ventajas, cómo comprar) se pinta primero y el resto de secciones justo
  // después, en pedazos que no traban la página. En un celular lento la portada aparecía a los 4,7 s porque se armaban
  // todas las secciones (con más de 150 precios) antes de mostrar nada. No se quita ninguna sección ni animación: todas
  // llegan antes de que la persona baje hasta ellas. Si se abre en una sección (#categorias…) se arma todo de una vez.
  const resto = useDespuesDePintar() || Boolean(ancla);

  // #categorias, #servicios, #calificaciones, #contacto, #orden y #como-comprar llevan a su sección de la portada
  // Cuando corre el efecto la sección ya está en la página, así que se puede bajar de una vez
  useEffect(() => {
    if (ancla) document.getElementById(ancla)?.scrollIntoView({ block: "start" });
  }, [ancla]);

  return (
    <>
      <Portada />
      {/* 20/11/2026: accesos redondos a cada sección, como en las tiendas grandes de Colombia */}
      <Atajos />
      <Ventajas />
      {/* Por presupuesto: todo el año. En temporada (se encienden y se apagan solas por fecha) sube y cambia de textos */}
      {TEMPORADA && <PorPresupuesto />}
      {/* Mientras llega el resto, un espacio alto guarda su lugar: así el pie no se asoma ni salta en pantallas grandes */}
      {resto ? <Resto vistos={vistos} ancla={ancla} /> :<div aria-hidden="true" className="min-h-[200vh]" />}
    </>
  );
}

/** Todas las secciones de la portada debajo de las ventajas.
    19/11/2026: los productos primero. En celular la portada medía 26 pantallas y la primera fila de productos llegaba
    después de unas 3 pantallas (cómo comprar, el mapa de envíos y las marcas iban antes). Ahora, justo después de la
    portada: lo más vendido y las categorías; cómo comprar sigue cerca, y envíos baja junto al servicio técnico */
function Resto({ vistos, ancla }: { vistos: Producto[]; ancla?: string }) {
  // 19/11/2026: debajo de las categorías, la portada se arma por tramos a medida que la persona baja (Diferido). Los
  // altos son los medidos ese día en celular (375 px) y computador (1280 px). Con un #ancla o al regresar, todo de una vez
  const [alRegresar] = useState(vaARegresar);
  const ya = alRegresar || Boolean(ancla);
  useEffect(() => reiniciarDiferidos, []);
  return (
    <>
      <Carrusel id="vendidos" etiqueta={<><IconoLlama className="h-4 w-4 text-acento" />Lo más vendido</>} titulo="Los que todos quieren" productos={VENDIDOS} cinta="Top ventas" cintaEn={VENDIDOS_CINTA} gris />
      <Categorias />
      <div id="recientes"><Recientes productos={vistos} /></div>
      <Diferido ya={ya} ids={["como-comprar", "presupuesto"]} alto="min-h-[1430px] md:min-h-[1290px]">
        {!TEMPORADA && <PorPresupuesto />}
        {TEMPORADA?.ideas && <IdeasParaRegalar />}
        <ComoComprar />
      </Diferido>
      <Diferido ya={ya} ids={["t-nuevos", "marcas"]} alto="min-h-[1480px] md:min-h-[1440px]">
        {NUEVOS.length >= 4 && <Carrusel id="nuevos" etiqueta="Recién llegados" titulo="Lo último que llegó a la tienda" productos={NUEVOS} />}
        <BandaGamer />
        <Marcas />
      </Diferido>
      <Diferido ya={ya} ids={["tu-celular", "t-celulares"]} alto="min-h-[2240px] md:min-h-[2160px]">
        <BandaCelulares />
        <TuCelular />
        <Coleccion id="celulares" etiqueta="Celulares" titulo="Estrena celular" tiendas={SOLO_CEL} />
      </Diferido>
      <Diferido ya={ya} ids={["t-computadores", "t-componentes"]} alto="min-h-[2080px] md:min-h-[1940px]">
        <BandaComputadores />
        <Coleccion id="computadores" etiqueta="Computadores" titulo="Portátiles y PC para cada necesidad" tiendas={SOLO_PC} gris />
        <Coleccion id="componentes" etiqueta="Componentes" titulo="Arma o mejora tu PC" tiendas={SOLO_COMP} />
      </Diferido>
      <Diferido ya={ya} ids={["envios", "servicios", "calificaciones"]} alto="min-h-[5150px] md:min-h-[3800px]">
        <Envios />
        <Servicios abrir={ancla === "orden"} />
        <Confianza />
        <Calificaciones abrir={ancla === "calificaciones"} />
      </Diferido>
      <BarraSecciones />
    </>
  );
}
