/* 26/11/2026: íconos grandes por tema para la página del producto («Lo más destacado» y «De un vistazo»). Cuando un bloque no
   tiene una foto distinta (no se repiten fotos), su tarjeta muestra el ícono del tema y la cifra principal del texto.
   El tema se reconoce por el título y el texto del bloque (solo se usan los datos que ya tiene el producto). */
import { norm } from "../lib/formato";

export type Tema = "pantalla" | "chip" | "memoria" | "disco" | "bateria" | "camara" | "senal" | "grafica" | "sonido" | "sensor"
  | "teclado" | "luz" | "potencia" | "ventilador" | "compat" | "escudo" | "comodidad" | "estrella" | "medidas" | "carga" | "reloj";

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const DIBUJOS: Record<Tema, React.ReactNode> = {
  pantalla: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8.5 20h7M12 16v4" /></>,
  chip: <><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 10h4v4h-4zM9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" /></>,
  memoria: <><rect x="3" y="7" width="18" height="9" rx="1" /><path d="M7 10v3M11 10v3M15 10v3M6 16v2.5M10 16v2.5M14 16v2.5M18 16v2.5" /></>,
  disco: <><rect x="4" y="4" width="16" height="16" rx="2.5" /><circle cx="12" cy="12" r="4" /><path d="M12 12h.01M16.5 7.5h.01" /></>,
  bateria: <><rect x="2.5" y="7.5" width="17" height="9" rx="2" /><path d="M21.5 10.5v3M6 10.5v3M9.5 10.5v3M13 10.5v3" /></>,
  camara: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>,
  senal: <><path d="M4.5 10a11 11 0 0 1 15 0M7.5 13.3a6.6 6.6 0 0 1 9 0M10.4 16.5a2.2 2.2 0 0 1 3.2 0" /><path d="M12 19.5h.01" /></>,
  grafica: <><rect x="2.5" y="6" width="19" height="11" rx="1.5" /><circle cx="15" cy="11.5" r="3" /><path d="M6 9.5h3M6 13h3M5 17v2.5M9 17v2.5" /></>,
  sonido: <><path d="M4 9.5h3l4-3.5v12l-4-3.5H4z" /><path d="M15 9a4 4 0 0 1 0 6M17.8 6.5a7.5 7.5 0 0 1 0 11" /></>,
  sensor: <><rect x="7" y="3" width="10" height="18" rx="5" /><path d="M12 3v6M12 13v.01" /></>,
  teclado: <><rect x="2.5" y="6" width="19" height="12" rx="1.5" /><path d="M6 9.5h.01M9 9.5h.01M12 9.5h.01M15 9.5h.01M18 9.5h.01M6 12.5h.01M18 12.5h.01M8 15h8" /></>,
  luz: <><path d="M9 17h6M10 20h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z" /></>,
  potencia: <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" />,
  ventilador: <><circle cx="12" cy="12" r="2" /><path d="M12 10c0-4 1-6.5 3.5-6.5S18 7 13.5 10.5M14 12.5c3.5 2 5 4.3 3.7 6.4S12.6 19 12.5 14M10 12.5c-3.5 1.9-6.2 1.8-6.9-.6S6 7.5 10.3 10.2" /></>,
  compat: <><path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0z" /><path d="M12 16v5" /></>,
  escudo: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z" /><path d="m9 12 2 2 4-4" /></>,
  comodidad: <><path d="M7 3h7a2 2 0 0 1 2 2v7H7z" /><path d="M5 12h14v3H5zM8 15v6M16 15v6M12 15v3" /></>,
  estrella: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" />,
  medidas: <><path d="M3 15.5 15.5 3 21 8.5 8.5 21z" /><path d="m7 11.5 2 2M10 8.5l2 2M13 5.5l2 2" /></>,
  carga: <><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="m12.5 7-3 5.5h4l-3 5" /></>,
  reloj: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
};

export function IconoTema({ tema, className = "h-6 w-6" }: { tema: Tema; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} {...base}>{DIBUJOS[tema]}</svg>;
}

/** Tema de un bloque por su título (y, si no se reconoce, por su texto). El orden importa: «Batería y carga» es batería */
export function temaDe(titulo: string, texto = ""): Tema {
  const prueba = (t: string): Tema | null => {
    if (/grafic|rtx|gtx|radeon|tarjeta de video|cuda/.test(t)) return "grafica";
    if (/pantalla|display|monitor|oled|retina|promotion|resolucion|hz\b|pulgadas/.test(t)) return "pantalla";
    if (/bateria|autonomia|mah|horas de/.test(t)) return "bateria";
    if (/carga|cargador|magsafe|usb-c|adaptador|cable/.test(t)) return "carga";
    if (/camara|fotos|video 4k|lente|zoom/.test(t)) return "camara";
    if (/chip|procesador|nucleos|rendimiento|ryzen|core|snapdragon|dimensity|helio|unisoc|apple [am]\d|a\d\d pro|^m\d/.test(t)) return "chip";
    if (/memoria|ram\b|ddr/.test(t)) return "memoria";
    if (/almacenamiento|ssd|nvme|capacidad|mb\/s|disco/.test(t)) return "disco";
    if (/sonido|audio|parlante|bocina|altavoz|driver|cancelacion|ruido|microfono|dolby/.test(t)) return "sonido";
    if (/sensor|dpi|seguimiento|pixart|salud|frecuencia cardi/.test(t)) return "sensor";
    if (/teclado|switch|teclas|keyboard/.test(t)) return "teclado";
    if (/ilumina|rgb|argb|luz|led\b|lightsync/.test(t)) return "luz";
    if (/potencia|vatios|\d+ ?w\b|80 plus|energia|proteccion/.test(t)) return "potencia";
    if (/refrigera|ventilador|disipador|radiador|termic|pasta|calor|vapor/.test(t)) return "ventilador";
    if (/conect|bluetooth|wi-?fi|inalambric|5g|red\b|puertos|thunderbolt/.test(t)) return "senal";
    if (/compatib|funciona con|placas|socket|montaje|vesa/.test(t)) return "compat";
    if (/material|resistencia|titanio|aluminio|ip\d\d|agua|zafiro|seguro|militar/.test(t)) return "escudo";
    if (/comodidad|ergonom|ajuste|asiento|respaldo|reposabrazos|diseno abierto/.test(t)) return "comodidad";
    if (/medidas|dimensiones|peso|delgad|liviano|grosor/.test(t)) return "medidas";
    if (/hora|reloj|tiempo/.test(t)) return "reloj";
    return null;
  };
  return prueba(norm(titulo)) ?? prueba(norm(texto)) ?? "estrella";
}

/** La cifra principal de un texto («Hasta 37 horas…» → 37 horas), para las tarjetas sin foto. Si no hay, null */
export function cifraDe(texto: string): { valor: string; unidad: string } | null {
  // Primero las certificaciones de resistencia (IP68, IP57…), que dicen más que un peso o una medida
  const ip = texto.match(/\bIP[X\d]\d\b/);
  if (ip) return { valor: ip[0], unidad: "" };
  const m =texto.match(/(\d+(?:[.,]\d+)?(?:\s?×\s?\d+)?)\s*(mAh|MP|GHz|Hz|GB\/s|MB\/s|GB|TB|W\/mK|W|horas|nits|mm|°|DPI|ms|km\/h|km|kg|g|pulgadas|"|núcleos|CFM|rpm|m|dB|Wh|V|A|fps|K)\b/);
  if (!m || !m[1] || !m[2]) return null;
  const unidad = m[2] === '"' ? "pulgadas" : m[2];
  return { valor: m[1].replace(/\s/g, ""), unidad };
}
