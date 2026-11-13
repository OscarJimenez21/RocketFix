/* Formulario que arma un mensaje y abre WhatsApp (servicio técnico, cámaras, reparación). No guarda ni envía datos:
   la persona revisa el mensaje en WhatsApp y lo envía. Mismo formato de mensaje que la tienda original. */
import { useId, useState } from "react";
import { CONFIG } from "../data/catalogo";
import { festivo } from "../lib/festivos";
import { lista } from "../lib/formato";
import { temblor } from "../lib/movimiento";
import { waLink } from "../lib/whatsapp";
import { IconoWhatsApp } from "./Iconos";
import { hrefDe } from "../lib/rutas";

/** Hoy en Bogotá como AAAA-MM-DD (para no dejar elegir días pasados) */
const hoyISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
/** 2026-11-16 → «lunes 16 de noviembre» */
function fechaEscrita(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const d = new Date(`${iso}T12:00:00-05:00`);
  return new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long" }).format(d).replace(",", "");
}
/** Si el día elegido es festivo o domingo, se dice (la tienda confirma si atiende) */
function avisoFecha(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const nombre = festivo(new Date(`${iso}T12:00:00-05:00`));
  if (nombre) return `Ese día es festivo (${nombre}): te confirmamos si podemos atenderte.`;
  if (new Date(`${iso}T12:00:00-05:00`).getUTCDay() === 0) return "Ese día es domingo: te confirmamos si podemos atenderte.";
  return "";
}

export interface CampoForm {
  id: string;
  rotulo: string;
  /** Nombre del dato en el mensaje (ej.: "Nombre") */
  etiqueta: string;
  /** fecha (idea 54): calendario; en el mensaje va escrita («lunes 16 de noviembre») */
  tipo?: "texto" | "area" | "lista" | "fecha";
  opciones?: string[];
  inicial?: string;
  obligatorio?: boolean;
  /** Cómo se nombra el dato si falta (ej.: "tu nombre") */
  falta?: string;
  placeholder?: string;
  autocompletar?: string;
  ancho?: "completo" | "medio";
  opcional?: boolean;
}

interface Props {
  asunto: string;
  campos: CampoForm[];
  boton?: string;
  valores?: Record<string, string>;
  alCambiar?: (id: string, valor: string) => void;
}

export function FormularioWhatsApp({ asunto, campos, boton = "Enviar por WhatsApp", valores: externos, alCambiar }: Props) {
  const base = useId();
  const [propios, setPropios] = useState<Record<string, string>>(() =>
    Object.fromEntries(campos.map(c => [c.id, c.inicial ?? (c.tipo === "lista" ? c.opciones?.[0] ?? "" : "")])));
  const [malos, setMalos] = useState<string[]>([]);
  const [error, setError] = useState("");
  // Envíos con campos faltantes: en cada uno, los campos marcados tiemblan
  const [intento, setIntento] = useState(0);
  const valores = { ...propios, ...externos };
  const valor = (c: CampoForm) => valores[c.id] ?? (c.tipo === "lista" ? c.opciones?.[0] ?? "" : "");

  // Al escribir en un campo marcado se quita su marca y el aviso (se vuelve a validar al enviar)
  const poner = (id: string, v: string) => {
    setPropios(x => ({ ...x, [id]: v }));
    alCambiar?.(id, v);
    if (malos.includes(id)) { setMalos(m => m.filter(x => x !== id)); setError(""); }
  };

  // «Sin preferencia» no se escribe en el mensaje (es lo mismo que no decir nada)
  const enMensaje = (c: CampoForm) => { const v = valor(c).trim(); return c.tipo === "fecha" ? fechaEscrita(v) : v === "Sin preferencia" ? "" : v; };
  const mensaje = [`Hola ${CONFIG.nombre}, quiero ${asunto}.`, "", ...campos.map(c => [c.etiqueta, enMensaje(c)]).filter(([, v]) => v).map(([e, v]) => `${e}: ${v}`)].join("\n");

  const validar = () => {
    const faltan = campos.filter(c => c.obligatorio && !valor(c).trim());
    setMalos(faltan.map(c => c.id));
    setError(faltan.length ? `Completa ${lista(faltan.map(c => c.falta ?? c.etiqueta.toLowerCase()))} para enviar.` : "");
    if (faltan.length) setIntento(n => n + 1);
    if (faltan[0]) document.getElementById(`${base}-${faltan[0].id}`)?.focus();
    return !faltan.length;
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={e => e.preventDefault()}>
      {campos.map(c => {
        const id = `${base}-${c.id}`;
        const malo = malos.includes(c.id);
        const clase = `campo ${malo ? "campo-invalido" : ""}${temblor(malo, intento)}`;
        // Los obligatorios lo dicen al lector de pantalla desde el principio, y el campo marcado apunta al aviso de error
        const accesible = { name: c.id, "aria-required": c.obligatorio || undefined, "aria-invalid": malo || undefined, "aria-describedby": malo ? `${base}-error` : undefined };
        return (
          <div key={c.id} className={c.ancho === "completo" || c.tipo === "area" ? "sm:col-span-2" : ""}>
            <label htmlFor={id} className="rotulo">{c.rotulo}{c.opcional && <span className="opcional"> (opcional)</span>}</label>
            {c.tipo === "lista" ? (
              <select id={id} {...accesible} className={clase} value={valor(c)} onChange={e => poner(c.id, e.target.value)}>
                {c.opciones?.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : c.tipo === "area" ? (
              <textarea id={id} {...accesible} rows={3} className={clase} placeholder={c.placeholder} value={valor(c)}
                onChange={e => poner(c.id, e.target.value)} />
            ) : c.tipo === "fecha" ? (
              <>
                <input id={id} {...accesible} type="date" min={hoyISO()} className={clase} value={valor(c)} onChange={e => poner(c.id, e.target.value)} />
                {avisoFecha(valor(c)) && <p className="mt-1.5 text-xs text-tinta-2">{avisoFecha(valor(c))}</p>}
              </>
            ) : (
              <input id={id} {...accesible} className={clase} placeholder={c.placeholder} autoComplete={c.autocompletar ?? "off"} value={valor(c)}
                onChange={e => poner(c.id, e.target.value)} />
            )}
          </div>
        );
      })}
      <div className="sm:col-span-2">
        {error && <p id={`${base}-error`} className="alerta mb-3" role="alert">{error}</p>}
        <a href={waLink(mensaje)} target="_blank" rel="noopener" onClick={e => { if (!validar()) e.preventDefault(); }} className="btn btn-wa w-full sm:w-auto">
          <IconoWhatsApp />{boton}
        </a>
        <p className="mt-2 text-xs leading-relaxed text-tinta-3">Se abre WhatsApp con tu solicitud escrita. La solicitud queda hecha cuando envíes ese mensaje. Al enviarla aceptas el <a href={hrefDe("datos-personales")} className="enlace">tratamiento de tus datos personales</a>.</p>
      </div>
    </form>
  );
}
