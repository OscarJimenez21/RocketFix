/* Textos de ayuda (data/ayuda.json): preguntas frecuentes, glosario, guías y usos. Los datos de la tienda (envíos, pagos,
   horario) no se escriben en el texto: van como {envioBogota}, {pagosBogota}… y se llenan con config.json, así nunca
   quedan desactualizados. [texto](ruta) es un enlace (a una página de la tienda o, con https://, a otro sitio). */
import ayudaJson from "../data/ayuda.json";
import { CONFIG } from "../data/catalogo";
import { dinero, lista } from "./formato";
import { filasHorario } from "./horario";

export interface PaginaAyuda { id: string; menu: string; titulo: string; lead: string; secciones?: { titulo: string; parrafos?: string[]; lista?: string[] }[] }
export interface Pregunta { tema: string; p: string; r: string }
export interface Termino { t: string; d: string }
export interface Uso { id: string; titulo: string; texto: string; tipos: string[] }

const ayuda = ayudaJson as { paginas: PaginaAyuda[]; faq: Pregunta[]; glosario: Termino[]; usos: Uso[] };
export const PAGINAS_AYUDA = ayuda.paginas;
export const PREGUNTAS = ayuda.faq;
export const GLOSARIO = ayuda.glosario;
export const USOS = ayuda.usos;
export const paginaAyuda = (id: string) => PAGINAS_AYUDA.find(p => p.id === id);

const VALORES: Record<string, () => string> = {
  envioBogota: () => dinero(CONFIG.envios.bogota.costo),
  gratisBogota: () => dinero(CONFIG.envios.bogota.gratisDesde),
  envioNacional: () => dinero(CONFIG.envios.nacional.costo),
  gratisNacional: () => dinero(CONFIG.envios.nacional.gratisDesde),
  pagosBogota: () => lista(CONFIG.pagos.bogota),
  pagosNacional: () => lista(CONFIG.pagos.nacional),
  domicilio: () => CONFIG.domicilio,
  envio: () => CONFIG.envio,
  whatsapp: () => CONFIG.whatsappVisible,
  horario: () => filasHorario().filter(([, h]) => h !== "Cerrado").map(([d, h]) => `${d}, de ${h}`).join("; ")
};

/** Cambia {dato} por su valor de config.json (un dato desconocido queda tal cual, para notarlo al revisar) */
export const rellenar = (t: string) => t.replace(/\{(\w+)\}/g, (todo, k: string) => VALORES[k]?.() ?? todo);

/** Parte un texto en trozos de texto y enlaces [texto](ruta) */
export function trozos(t: string): ({ texto: string } | { texto: string; ruta: string })[] {
  const out: ({ texto: string } | { texto: string; ruta: string })[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let i = 0;
  for (let m = re.exec(t); m; m = re.exec(t)) {
    if (m.index > i) out.push({ texto: t.slice(i, m.index) });
    out.push({ texto: m[1] ?? "", ruta: m[2] ?? "" });
    i = m.index + m[0].length;
  }
  if (i < t.length) out.push({ texto: t.slice(i) });
  return out;
}

/** Texto plano (sin la marca de los enlaces), para buscar o para el mensaje de WhatsApp */
export const plano = (t: string) => rellenar(t).replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");

/** Explicación corta de un estado del equipo (Nuevo, CPO, Usado, Open box) sacada del glosario */
export function explicacionEstado(estado: string): Termino | null {
  const n = estado.toLowerCase();
  return GLOSARIO.find(g => g.t.toLowerCase().startsWith(n)) ?? null;
}
