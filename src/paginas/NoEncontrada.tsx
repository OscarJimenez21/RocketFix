import { Buscador } from "../components/Buscador";
import { Cohete } from "../components/Logo";
import { waLink } from "../lib/whatsapp";

/** Estrellas alrededor del cohete perdido: posición en el dibujo (180×120), radio y opacidad */
const ESTRELLAS: [number, number, number, number][] = [
  [14, 18, 1.6, 0.5], [46, 8, 1.2, 0.35], [92, 14, 1.4, 0.45], [168, 22, 1.6, 0.5], [158, 96, 1.2, 0.35], [28, 74, 1.2, 0.3], [112, 108, 1.4, 0.4]
];

/** El cohete del logo, perdido en el espacio: entra flotando y girando suave por su trayectoria punteada y se queda quieto.
    También sale cuando una búsqueda, una sección con filtros o una marca no tienen productos */
export function CohetePerdido({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative mx-auto h-[120px] w-[180px] ${className}`}>
      <svg viewBox="0 0 180 120" className="absolute inset-0 h-full w-full">
        {ESTRELLAS.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} className="fill-marca" opacity={o} />)}
        {/* Trayectoria con una vuelta, como si el cohete se hubiera desviado */}
        <path d="M 6 112 C 40 112, 44 70, 70 72 C 96 74, 92 104, 74 100 C 58 96, 74 56, 112 46" fill="none"
          className="stroke-marca" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.5 7" />
      </svg>
      {/* Gira 50° para que la punta siga la trayectoria; el de adentro hace la entrada */}
      <span className="absolute left-[108px] top-[8px] block h-12 w-12 rotate-[50deg]">
        <span className="block h-full w-full motion-safe:animate-deriva"><Cohete className="h-full w-full text-marca" /></span>
      </span>
    </div>
  );
}

export function NoEncontrada({ texto = "Esta página no existe o cambió de dirección." }: { texto?: string }) {
  return (
    <div className="contenedor py-16 text-center sm:py-20">
      <CohetePerdido />
      <h1 tabIndex={-1} className="mt-6 text-3xl font-extrabold">No la encontramos</h1>
      <p className="mt-3 text-tinta-2">{texto}</p>
      {/* Mejora: buscar desde aquí mismo, sin volver al inicio */}
      <div className="mx-auto mt-6 max-w-md text-left"><Buscador /></div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="#inicio" className="btn btn-marca">Ir al inicio</a>
        <a href={waLink()} target="_blank" rel="noopener" className="btn btn-borde">Preguntar por WhatsApp</a>
      </div>
    </div>
  );
}
