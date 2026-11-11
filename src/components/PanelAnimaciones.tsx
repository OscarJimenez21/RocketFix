/* Panel para revisar las animaciones en prueba (40 el 05/11/2026; 56 desde el 11/11/2026). Solo existe al trabajar en local (npm run dev): App lo
   carga con import.meta.env.DEV, así que no llega a la página publicada.
   Cada casilla enciende o apaga una animación (pone o quita la clase sin-aN en <html>, ver lib/animaciones.ts) y se
   recuerda en este navegador. «Ver» lleva a donde se ve cada una; las que solo pasan al cargar la página recargan. */
import { useState } from "react";

const CLAVE = "rf-animaciones-apagadas";

type Fila = { n: number; grupo: string; nombre: string; como: string; ir: string; recargar?: boolean };

const LISTA: Fila[] = [
  { n: 1, grupo: "Portada", nombre: "El eslogan entra palabra por palabra", como: "Al abrir la portada", ir: "#inicio", recargar: true },
  { n: 2, grupo: "Portada", nombre: "El cohete llega al final del eslogan con su estela", como: "Al abrir la portada", ir: "#inicio", recargar: true },
  { n: 3, grupo: "Portada", nombre: "Estrellas que titilan en el fondo verde", como: "Mira el fondo de la portada", ir: "#inicio" },
  { n: 4, grupo: "Portada", nombre: "La vitrina cambia de producto deslizándose hacia un lado", como: "Espera 6 s o toca una miniatura", ir: "#inicio" },
  { n: 5, grupo: "Portada", nombre: "Destello en «Comprar tecnología»", como: "Al abrir la portada (a los 1,4 s)", ir: "#inicio", recargar: true },
  { n: 6, grupo: "Cabecera", nombre: "El cohete del logo se eleva", como: "Pasa el mouse por el logo", ir: "#inicio" },
  { n: 7, grupo: "Cabecera", nombre: "Sombra suave bajo la cabecera", como: "Baja por cualquier página", ir: "#inicio" },
  { n: 8, grupo: "Cabecera", nombre: "El botón de WhatsApp saluda una vez", como: "A los 4 s de abrir la primera página de la visita", ir: "#inicio", recargar: true },
  { n: 9, grupo: "Buscador", nombre: "Ejemplos de búsqueda que ruedan en el campo vacío", como: "Mira el buscador", ir: "#inicio" },
  { n: 10, grupo: "Buscador", nombre: "Las sugerencias entran una tras otra", como: "Toca el buscador o escribe", ir: "#inicio" },
  { n: 11, grupo: "Buscador", nombre: "La lupa se inclina y se pinta de verde", como: "Toca el buscador", ir: "#inicio" },
  { n: 12, grupo: "Tienda", nombre: "Las tarjetas entran en cascada al cambiar un filtro", como: "Toca una marca o cambia el orden", ir: "#celulares" },
  { n: 13, grupo: "Tienda", nombre: "Las tarjetas se elevan con el mouse encima", como: "Pasa el mouse por una tarjeta", ir: "#celulares" },
  { n: 14, grupo: "Tienda", nombre: "La pastilla del filtro da un saltito al elegirla", como: "Toca una marca", ir: "#celulares" },
  { n: 15, grupo: "Tienda", nombre: "Todos / Nuevos / CPO: la pastilla oscura se desliza", como: "Cambia entre Todos, Nuevos y CPO", ir: "#celulares" },
  { n: 16, grupo: "Tienda", nombre: "«Mostrando N de M»: el número rueda", como: "Toca «Ver más productos» o un filtro", ir: "#celulares" },
  { n: 17, grupo: "Producto", nombre: "La foto se acerca y sigue al mouse", como: "Pasa el mouse por la foto grande", ir: "#p/sa07" },
  { n: 18, grupo: "Producto", nombre: "La información entra en cascada al abrir", como: "Al abrir un producto", ir: "#p/sa07" },
  { n: 19, grupo: "Producto", nombre: "Las características cortas aparecen una por una", como: "Al abrir un producto", ir: "#p/sa07" },
  { n: 20, grupo: "Producto", nombre: "El precio rueda hacia arriba o hacia abajo", como: "Cambia de versión", ir: "#p/sa07" },
  { n: 21, grupo: "Producto", nombre: "Destello en «Agregar al carrito»", como: "Al abrir un producto", ir: "#p/sa07" },
  { n: 22, grupo: "Producto", nombre: "Los íconos de entrega se mueven (moto, camión, tarjeta)", como: "Al abrir un producto", ir: "#p/sa07" },
  { n: 23, grupo: "Producto", nombre: "Esqueleto con brillo mientras carga", como: "Recarga en la portada y abre un producto (solo se ve un instante, la primera vez)", ir: "#inicio", recargar: true },
  { n: 24, grupo: "Carrito", nombre: "Los productos entran uno tras otro al abrirlo", como: "Agrega algo y abre el carrito", ir: "#celulares" },
  { n: 25, grupo: "Carrito", nombre: "El marco de «Entrega» se desliza", como: "En el carrito, cambia Bogotá / Otra ciudad", ir: "#celulares" },
  { n: 26, grupo: "Carrito", nombre: "Destello en «Enviar pedido por WhatsApp»", como: "Escribe el nombre y la dirección", ir: "#celulares" },
  { n: 27, grupo: "Carrito", nombre: "El cohete aterriza al quitar el último producto", como: "Con el carrito abierto, quita el último producto", ir: "#celulares" },
  { n: 28, grupo: "Aviso", nombre: "✓ que se dibuja y línea que cuenta el tiempo", como: "Agrega un producto", ir: "#celulares" },
  { n: 29, grupo: "Menú y carrito", nombre: "La X de cerrar gira", como: "Pasa el mouse por la X", ir: "#inicio" },
  { n: 30, grupo: "Portada", nombre: "Los números de las categorías cuentan desde 0", como: "Baja hasta «Compra por categoría»", ir: "#inicio", recargar: true },
  { n: 31, grupo: "Portada", nombre: "Estela punteada bajo los títulos de sección", como: "Baja por la portada", ir: "#inicio" },
  { n: 32, grupo: "Portada", nombre: "Paralaje en las fotos de las bandas", como: "Baja despacio por las bandas grandes", ir: "#inicio" },
  { n: 33, grupo: "Portada", nombre: "La cuadrícula de la banda gamer se desliza", como: "Mira la banda «Lleva tu juego…»", ir: "#inicio" },
  { n: 34, grupo: "Portada", nombre: "Los celulares se abren en abanico", como: "Pasa el mouse por la banda de celulares", ir: "#inicio" },
  { n: 35, grupo: "Portada", nombre: "Los logos de las marcas se elevan", como: "Pasa el mouse por un logo", ir: "#inicio" },
  { n: 36, grupo: "Portada", nombre: "Punto rojo «REC» que parpadea", como: "Mira «Instalación de cámaras»", ir: "#servicios" },
  { n: 37, grupo: "Formularios", nombre: "El campo y su rótulo se pintan de verde al escribir", como: "Toca un campo del formulario", ir: "#orden" },
  { n: 38, grupo: "Blog", nombre: "El dibujo de la tarjeta se mece", como: "Pasa el mouse por una tarjeta", ir: "#blog" },
  { n: 39, grupo: "Artículos", nombre: "Línea de progreso de lectura arriba", como: "Baja por el artículo", ir: "#blog-camaras" },
  { n: 40, grupo: "Pie de página", nombre: "El botón de WhatsApp lanza dos ondas", como: "Baja hasta el pie de página", ir: "#inicio", recargar: true },
  { n: 41, grupo: "Portada", nombre: "El cielo de estrellas baja despacio todo el tiempo (dos capas a distinta velocidad)", como: "Mira el fondo de la portada unos segundos", ir: "#inicio" },
  { n: 42, grupo: "Portada", nombre: "Estrellas fugaces que cruzan la portada de vez en cuando", como: "Espera en la portada (de 1 a 5 a la vez, cada 1,5 a 6 s)", ir: "#inicio" },
  { n: 43, grupo: "Portada", nombre: "El cielo cambia con la hora (día, atardecer, noche)", como: "Prueba con ?cielo=noche, dia, amanecer o atardecer en la dirección", ir: "#inicio", recargar: true },
  { n: 44, grupo: "Pestaña", nombre: "«🚀 Tu carrito te espera» en el título de la pestaña", como: "Con algo en el carrito, cambia a otra pestaña", ir: "#celulares" },
  { n: 45, grupo: "Pestaña", nombre: "Número del carrito en el ícono de la pestaña", como: "Agrega un producto y mira el ícono de la pestaña", ir: "#celulares" },
  { n: 46, grupo: "Tienda", nombre: "Reflejo de vidrio que cruza la foto", como: "Pasa el mouse por una tarjeta", ir: "#celulares" },
  { n: 47, grupo: "Portada", nombre: "La vitrina flota despacio", como: "Mira la vitrina de 6 productos", ir: "#inicio" },
  { n: 48, grupo: "Portada", nombre: "Luz suave que sigue al mouse", como: "Mueve el mouse por la portada", ir: "#inicio" },
  { n: 49, grupo: "Producto", nombre: "El borde de la foto toma el color de la versión", como: "En un producto con colores, cambia de versión", ir: "#p/sa07" },
  { n: 50, grupo: "Todas", nombre: "Botón flotante «Volver arriba»: el cohete despega", como: "Baja por la página y tócalo", ir: "#celulares" },
  { n: 51, grupo: "Portada", nombre: "Sorpresa: el cohete del eslogan gira y suelta chispas", como: "Toca 5 veces seguidas el cohete del eslogan", ir: "#inicio" },
  { n: 52, grupo: "Temporadas", nombre: "Navidad, fiestas patrias, amor y amistad, Halloween", como: "Prueba con ?temporada=navidad en la dirección", ir: "#inicio", recargar: true },
  { n: 53, grupo: "Portada", nombre: "Un satélite cruza el cielo", como: "Espera en la portada (cada 35 a 70 s)", ir: "#inicio" },
  { n: 54, grupo: "Cabecera", nombre: "El cohete del logo saluda al volver", como: "Ve a otra pestaña 10 s y vuelve", ir: "#inicio" },
  { n: 55, grupo: "Todas", nombre: "WhatsApp flotante: el mensaje entra, el botón lanza ondas y el cohetico despega", como: "Espera 6 s en cualquier página (sale una vez por visita)", ir: "#inicio" },
  { n: 56, grupo: "Pie de página", nombre: "Cielo del pie: la estela del cohete se dibuja al verlo", como: "Baja hasta el pie de página (en computador)", ir: "#contacto", recargar: true }
];

function leer(): number[] {
  try { return JSON.parse(localStorage.getItem(CLAVE) || "[]") as number[]; } catch { return []; }
}

export default function PanelAnimaciones() {
  const [abierto, setAbierto] = useState(false);
  const [apagadas, setApagadas] = useState<number[]>(leer);

  const guardar = (lista: number[]) => {
    setApagadas(lista);
    try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
    for (const f of LISTA) document.documentElement.classList.toggle(`sin-a${f.n}`, lista.includes(f.n));
  };
  const cambiar = (n: number) => guardar(apagadas.includes(n) ? apagadas.filter(x => x !== n) : [...apagadas, n].sort((a, b) => a - b));
  const ver = (f: Fila) => {
    if (f.n === 8) try { sessionStorage.removeItem("rf-saludo"); } catch { /* sin almacenamiento */ }
    if (f.recargar) { history.replaceState(null, "", f.ir); location.reload(); return; }
    location.hash = f.ir;
  };

  const encendidas = LISTA.length - apagadas.length;
  return (
    <div className="fixed bottom-3 left-3 z-[80] text-tinta">
      {abierto && (
        <div className="mb-2 flex max-h-[min(78vh,640px)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-md border border-linea bg-white shadow-flota">
          <div className="border-b border-linea px-4 py-3">
            <p className="font-display text-base font-extrabold">Animaciones en prueba</p>
            <p className="mt-0.5 text-xs text-tinta-2">Desmarca las que no te gusten. Las que cambian con JavaScript se actualizan al recargar. Este panel solo existe en local.</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => guardar([])} className="btn btn-sm btn-borde min-h-[32px] text-xs">Encender todas</button>
              <button type="button" onClick={() => guardar(LISTA.map(f => f.n))} className="btn btn-sm btn-borde min-h-[32px] text-xs">Apagar todas</button>
              <button type="button" onClick={() => location.reload()} className="btn btn-sm btn-marca min-h-[32px] text-xs">Recargar</button>
            </div>
          </div>
          <ol className="flex-1 divide-y divide-linea overflow-y-auto overscroll-contain">
            {LISTA.map(f => (
              <li key={f.n} className="flex items-start gap-2.5 px-4 py-2.5">
                <input id={`anim-${f.n}`} type="checkbox" checked={!apagadas.includes(f.n)} onChange={() => cambiar(f.n)} className="mt-1 h-4 w-4 shrink-0 accent-[#0B8457]" />
                <label htmlFor={`anim-${f.n}`} className="min-w-0 flex-1 cursor-pointer text-[13px] leading-snug">
                  <span className="font-semibold">{f.n}. {f.nombre}</span>
                  <span className="block text-xs text-tinta-3">{f.grupo}: {f.como}</span>
                </label>
                <button type="button" onClick={() => ver(f)} className="shrink-0 text-xs font-semibold text-marca-texto hover:underline">Ver</button>
              </li>
            ))}
          </ol>
        </div>
      )}
      <button type="button" onClick={() => setAbierto(a => !a)} aria-expanded={abierto}
        className="presionable inline-flex h-10 items-center gap-2 rounded-full bg-tinta px-4 text-[13px] font-semibold text-white shadow-flota">
        Animaciones <span className="rounded-full bg-white/15 px-1.5 text-xs tabular-nums">{encendidas}/{LISTA.length}</span>
      </button>
    </div>
  );
}
