/* Página del producto: íconos para las características (pantalla, procesador, memoria, almacenamiento, batería, cámara,
   conexión y tarjeta de video) y el bloque «Lo principal» con las cuatro más importantes de la ficha del proveedor.
   Solo se usan los datos que ya tiene cada producto: si una característica no se reconoce, va sin ícono. */
import { norm } from "../lib/formato";

type Tipo = "pantalla" | "chip" | "memoria" | "disco" | "bateria" | "camara" | "senal" | "grafica";

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const DIBUJOS: Record<Tipo, React.ReactNode> = {
  pantalla: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8.5 20h7M12 16v4" /></>,
  chip: <><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 10h4v4h-4zM9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" /></>,
  memoria: <><rect x="3" y="7" width="18" height="9" rx="1" /><path d="M7 10v3M11 10v3M15 10v3M6 16v2.5M10 16v2.5M14 16v2.5M18 16v2.5" /></>,
  disco: <><rect x="4" y="4" width="16" height="16" rx="2.5" /><circle cx="12" cy="12" r="4" /><path d="M12 12h.01M16.5 7.5h.01" /></>,
  bateria: <><rect x="2.5" y="7.5" width="17" height="9" rx="2" /><path d="M21.5 10.5v3M6 10.5v3M9.5 10.5v3M13 10.5v3" /></>,
  camara: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>,
  senal: <><path d="M4.5 10a11 11 0 0 1 15 0M7.5 13.3a6.6 6.6 0 0 1 9 0M10.4 16.5a2.2 2.2 0 0 1 3.2 0" /><path d="M12 19.5h.01" /></>,
  grafica: <><rect x="2.5" y="6" width="19" height="11" rx="1.5" /><circle cx="15" cy="11.5" r="3" /><path d="M6 9.5h3M6 13h3M5 17v2.5M9 17v2.5" /></>
};

export function IconoCaracteristica({ tipo, className = "h-4 w-4" }: { tipo: Tipo; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} {...base}>{DIBUJOS[tipo]}</svg>;
}

/** Tipo de una característica corta del producto («SSD 512GB», «Pantalla 15,6" FHD», «5G»…). El orden importa:
    «RTX 5060 8GB» es tarjeta de video antes que memoria, y «16GB DDR5» es memoria antes que almacenamiento */
export function tipoDe(texto: string): Tipo | null {
  const t = norm(texto);
  if (/\b(rtx|gtx|radeon|rx ?\d{3,4}|arc a\d)/.test(t)) return "grafica";
  if (/core i\d|core ultra|ryzen|apple [am]\d|chip m\d|snapdragon|helio|dimensity|exynos|tensor g|procesador|unisoc|celeron|pentium/.test(t)) return "chip";
  if (/\d+ ?gb ?(lp)?ddr|\bddr\d|\bram\b|de memoria/.test(t)) return "memoria";
  if (/\bssd\b|nvme|\bhdd\b|almacenamiento|^\d+ ?(gb|tb)$|\b\d+ ?tb\b/.test(t)) return "disco";
  if (/mah|bateria/.test(t)) return "bateria";
  if (/\d+ ?mp\b|camara/.test(t)) return "camara";
  if (/pantalla|\d+([.,]\d+)? ?("|”|″|pulgadas)|\d+ ?hz\b|\b(amoled|oled|ips|fhd|qhd|uhd|4k|wuxga)\b/.test(t)) return "pantalla";
  if (/\b5g\b|\b4g\b|wi-?fi|bluetooth|esim|\bnfc\b/.test(t)) return "senal";
  return null;
}

/** Tipo de una fila de la ficha del proveedor, por el nombre de la característica */
function tipoDeClave(clave: string): Tipo | null {
  const k = norm(clave);
  if (/grafica|tarjeta de video|graficos/.test(k)) return "grafica";
  if (/procesador|^chip/.test(k)) return "chip";
  if (/memoria ram|^ram/.test(k)) return "memoria";
  if (/estado solido|almacenamiento|disco/.test(k)) return "disco";
  if (/bateria/.test(k)) return "bateria";
  if (/camara/.test(k)) return "camara";
  if (/pantalla|^monitor/.test(k)) return "pantalla";
  if (/conectividad|^red$/.test(k)) return "senal";
  return null;
}

/** Orden en que se muestran en «Lo principal» */
const ORDEN: Tipo[] = ["pantalla", "chip", "memoria", "disco", "grafica", "camara", "bateria", "senal"];

/** El valor, corto: hasta la primera coma o punto y coma (la ficha completa sigue en la tabla de abajo) */
const corto = (v: string) => (v.split(/[;,](?!\d)/)[0] ?? v).trim();

/** «Lo principal»: hasta cuatro características de la ficha del proveedor, con su ícono. Sin ficha (o si no tiene ninguna
    de estas), no sale nada */
export function LoPrincipal({ filas }: { filas: [string, string][] }) {
  const elegidas = new Map<Tipo, [string, string]>();
  for (const [k, v] of filas) {
    const tipo = tipoDeClave(k);
    if (tipo && !elegidas.has(tipo)) elegidas.set(tipo, [k, corto(v)]);
  }
  const lista = ORDEN.filter(t => elegidas.has(t)).slice(0, 4);
  if (lista.length < 2) return null;
  return (
    <div className="mb-8">
      <h2 className="text-xl font-extrabold">Lo principal</h2>
      {/* En computador, tantas columnas como características (2, 3 o 4): así la fila siempre llega al borde */}
      <ul className={`mt-3 grid grid-cols-2 gap-3 ${lista.length === 4 ? "lg:grid-cols-4" : lista.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {lista.map((t, i) => {
          const [k, v] = elegidas.get(t) ?? ["", ""];
          // En celular (2 columnas), si son 3 la última ocupa la fila completa en vez de quedar sola a la izquierda
          const sola = lista.length === 3 && i === 2 ? "col-span-2 lg:col-span-1" : "";
          return (
            <li key={t} className={`rounded-md border border-linea bg-superficie p-4 ${sola}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marca-suave text-marca"><IconoCaracteristica tipo={t} className="h-5 w-5" /></span>
              <p className="mt-3 text-[12.5px] font-semibold text-tinta-3">{k}</p>
              <p className="mt-0.5 line-clamp-3 text-sm font-semibold leading-snug text-tinta">{v}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
