/* Idea 27: «Envíos a toda Colombia». Mapa dibujado de Colombia (simplificado, solo de adorno) con Bogotá y las ciudades
   principales; las líneas punteadas salen de Bogotá. Al lado, las dos formas de entrega con los valores de config.json.
   Las ciudades laten suavemente la primera vez que el mapa se ve (animación 67) */
import { useRef } from "react";
import { CONFIG } from "../../data/catalogo";
import { IconoCamion, IconoMoto } from "../../components/Iconos";
import { useVisto } from "../../lib/enPantalla";
import { dinero } from "../../lib/formato";

const CONTORNO = "M58.2 123.6L93.0 102.0L111.0 87.0L112.5 72.0L133.5 54.0L153.0 51.0L162.0 45.0L190.5 37.5L210.0 24.0L228.0 10.5L240.0 27.0L213.0 51.0L192.0 72.0L186.0 108.0L205.5 132.0L205.5 147.0L213.0 162.0L249.0 172.5L276.0 174.0L297.0 187.5L354.0 199.5L343.5 222.0L345.0 252.0L358.5 294.0L367.5 321.0L372.0 348.0L351.0 333.0L315.0 327.0L285.0 348.0L277.5 364.5L291.0 390.0L297.0 420.0L282.0 462.0L280.5 510.0L261.0 459.0L231.0 450.0L201.0 426.0L174.0 412.5L141.0 394.5L111.0 378.0L81.0 372.0L49.5 358.5L13.5 342.0L19.5 327.0L30.0 306.0L51.0 285.0L60.0 267.0L57.0 246.0L55.5 216.0L57.0 195.0L42.0 168.0L48.0 156.0L60.0 141.0Z";
const BOGOTA = { x: 156.9, y: 242.7 };
const CIUDADES: { nombre: string; x: number; y: number; lado?: "izq" }[] = [
  { nombre: "Barranquilla", x: 135, y: 55.2 },
  { nombre: "Cartagena", x: 113.7, y: 72.3, lado: "izq" },
  { nombre: "Bucaramanga", x: 185.4, y: 170.4 },
  { nombre: "Medellín", x: 112.2, y: 196.5, lado: "izq" },
  { nombre: "Pereira", x: 108.3, y: 239.7, lado: "izq" },
  { nombre: "Cali", x: 83.1, y: 280.5, lado: "izq" },
  { nombre: "Villavicencio", x: 170.1, y: 259.8 },
  { nombre: "Pasto", x: 60.6, y: 347.7 },
  { nombre: "Leticia", x: 280.8, y: 505 }
];

/** Curva suave de Bogotá a la ciudad (se arquea hacia un lado, como una ruta) */
const ruta = (c: { x: number; y: number }) => {
  const mx = (BOGOTA.x + c.x) / 2, my = (BOGOTA.y + c.y) / 2;
  const dx = c.x - BOGOTA.x, dy = c.y - BOGOTA.y;
  return `M${BOGOTA.x} ${BOGOTA.y}Q${(mx - dy * 0.18).toFixed(1)} ${(my + dx * 0.18).toFixed(1)} ${c.x} ${c.y}`;
};

export function Envios() {
  const mapa = useRef<SVGSVGElement>(null);
  const visto = useVisto(mapa);
  const b = CONFIG.envios.bogota, n = CONFIG.envios.nacional;
  return (
    <section id="envios" aria-labelledby="t-envios" className="textura-orbitas curva-abajo bg-fondo pt-4">
      <div className="contenedor grid items-center gap-8 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12">
        <svg ref={mapa} data-visto={visto || undefined} viewBox="0 0 390 520" role="img" aria-label="Mapa de Colombia con Bogotá y las principales ciudades a las que enviamos"
          className="mapa-envios mx-auto w-full max-w-[340px]">
          <path d={CONTORNO} className="fill-superficie stroke-marca/40" strokeWidth={2} strokeLinejoin="round" />
          {CIUDADES.map(c => <path key={c.nombre} d={ruta(c)} fill="none" className="mapa-ruta stroke-marca/55" strokeWidth={1.6} strokeLinecap="round" strokeDasharray="1 6" />)}
          {CIUDADES.map((c, i) => (
            <g key={c.nombre} style={{ "--orden": i } as React.CSSProperties}>
              <circle cx={c.x} cy={c.y} r={9} className="mapa-pulso fill-marca/25" />
              <circle cx={c.x} cy={c.y} r={4} className="fill-marca" />
              <text x={c.lado === "izq" ? c.x - 9 : c.x + 9} y={c.y + 4} textAnchor={c.lado === "izq" ? "end" : "start"} className="fill-tinta-2 text-[13px] font-semibold">{c.nombre}</text>
            </g>
          ))}
          <circle cx={BOGOTA.x} cy={BOGOTA.y} r={16} className="mapa-pulso fill-acento/30" />
          <circle cx={BOGOTA.x} cy={BOGOTA.y} r={7} className="fill-acento stroke-superficie" strokeWidth={2.5} />
          <text x={BOGOTA.x + 14} y={BOGOTA.y - 10} className="fill-tinta text-[15px] font-extrabold">Bogotá</text>
        </svg>
        <div>
          <h2 id="t-envios" className="titulo-seccion titulo-trazo">Envíos a toda Colombia</h2>
          <p className="mt-2 text-tinta-2">Desde Bogotá, a tu casa o tu negocio.</p>
          <ul className="mt-6 grid gap-4">
            <li className="tarjeta flex gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-acento-suave text-acento-texto"><IconoMoto className="h-6 w-6" /></span>
              <div>
                <p className="font-bold">Bogotá y alrededores</p>
                <p className="mt-1 text-sm text-tinta-2">Despacho el mismo día con motorizado.</p>
                <p className="mt-2 text-sm"><b className="tabular-nums">{dinero(b.costo)}</b> <span className="text-tinta-2">· gratis desde</span> <b className="tabular-nums">{dinero(b.gratisDesde)}</b></p>
              </div>
            </li>
            <li className="tarjeta flex gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-marca-suave text-marca-texto"><IconoCamion className="h-6 w-6" /></span>
              <div>
                <p className="font-bold">Resto del país</p>
                <p className="mt-1 text-sm text-tinta-2">Por transportadora: Envía, Interrapidísimo o Servientrega, con pago anticipado. Te confirmamos el tiempo de entrega por WhatsApp.</p>
                <p className="mt-2 text-sm"><b className="tabular-nums">{dinero(n.costo)}</b> <span className="text-tinta-2">· gratis desde</span> <b className="tabular-nums">{dinero(n.gratisDesde)}</b></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
