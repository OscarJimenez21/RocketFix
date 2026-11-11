/* «Así trabajamos»: fotos reales de Rocket Fix (entregas, empaque, servicio técnico) para que quien compra por primera vez
   vea que detrás de la tienda hay personas. Solo fotos propias y reales: nunca de bancos de imágenes ni de otras tiendas.
   Las fotos se ponen en public/fotos/confianza/ y se listan en src/data/confianza.json, por ejemplo:
     { "fotos": [ { "archivo": "fotos/confianza/entrega.webp", "titulo": "Entregas en Bogotá", "texto": "…" } ] }
   Sin fotos, la sección no sale en la página publicada; al trabajar en local muestra tres espacios con lo que va en cada uno. */
import confianza from "../../data/confianza.json";
import { recurso } from "../../lib/formato";

type Foto = { archivo: string; titulo: string; texto?: string };
const FOTOS = (confianza as { fotos: Foto[] }).fotos;

/** Lo que va en cada espacio mientras no hay fotos (solo en local) */
const ESPACIOS = [
  { titulo: "Entregas en Bogotá", texto: "Una foto de una entrega real: la moto, el paquete o el momento en que llega." },
  { titulo: "Así llega tu pedido", texto: "El empaque: la caja sellada, la factura y cómo protegemos el equipo." },
  { titulo: "Servicio técnico", texto: "El banco de trabajo o una reparación en proceso." }
];

export function Confianza() {
  if (!FOTOS.length && !import.meta.env.DEV) return null;
  return (
    <section aria-labelledby="t-confianza" className="border-t border-linea">
      <div className="contenedor py-12 sm:py-14">
        <h2 id="t-confianza" className="titulo-seccion titulo-trazo">Así trabajamos</h2>
        <p className="mt-2 max-w-[60ch] text-[15px] text-tinta-2">Somos una tienda de Bogotá. Estas son fotos de nuestro día a día.</p>
        <ul className="mt-7 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {FOTOS.length
            ? FOTOS.map(f => (
              <li key={f.archivo}>
                <img src={recurso(f.archivo)} alt={f.titulo} loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-lg object-cover" />
                <p className="mt-3 font-display text-[17px] font-bold">{f.titulo}</p>
                {f.texto && <p className="mt-1 text-sm text-tinta-2">{f.texto}</p>}
              </li>
            ))
            : ESPACIOS.map(e => (
              <li key={e.titulo}>
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-2 border-dashed border-linea-fuerte bg-fondo p-6 text-center text-sm text-tinta-3">
                  Aquí va tu foto. Este espacio solo se ve al trabajar en local.
                </div>
                <p className="mt-3 font-display text-[17px] font-bold">{e.titulo}</p>
                <p className="mt-1 text-sm text-tinta-2">{e.texto}</p>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
