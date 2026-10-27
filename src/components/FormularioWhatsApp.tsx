/* Formulario que arma un mensaje y abre WhatsApp (servicio técnico, cámaras, reparación). No guarda ni envía datos:
   la persona revisa el mensaje en WhatsApp y lo envía. Mismo formato de mensaje que la tienda original. */
import { useId, useState } from "react";
import { CONFIG } from "../data/catalogo";
import { lista } from "../lib/formato";
import { waLink } from "../lib/whatsapp";
import { IconoWhatsApp } from "./Iconos";

export interface CampoForm {
  id: string;
  rotulo: string;
  /** Nombre del dato en el mensaje (ej.: "Nombre") */
  etiqueta: string;
  tipo?: "texto" | "area" | "lista";
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
  const valores = { ...propios, ...externos };
  const valor = (c: CampoForm) => valores[c.id] ?? (c.tipo === "lista" ? c.opciones?.[0] ?? "" : "");

  // Al escribir en un campo marcado se quita su marca y el aviso (se vuelve a validar al enviar)
  const poner = (id: string, v: string) => {
    setPropios(x => ({ ...x, [id]: v }));
    alCambiar?.(id, v);
    if (malos.includes(id)) { setMalos(m => m.filter(x => x !== id)); setError(""); }
  };

  const mensaje = [`Hola ${CONFIG.nombre}, quiero ${asunto}.`, "", ...campos.map(c => [c.etiqueta, valor(c).trim()]).filter(([, v]) => v).map(([e, v]) => `${e}: ${v}`)].join("\n");

  const validar = () => {
    const faltan = campos.filter(c => c.obligatorio && !valor(c).trim());
    setMalos(faltan.map(c => c.id));
    setError(faltan.length ? `Completa ${lista(faltan.map(c => c.falta ?? c.etiqueta.toLowerCase()))} para enviar.` : "");
    if (faltan[0]) document.getElementById(`${base}-${faltan[0].id}`)?.focus();
    return !faltan.length;
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={e => e.preventDefault()}>
      {campos.map(c => {
        const id = `${base}-${c.id}`;
        const clase = `campo ${malos.includes(c.id) ? "campo-invalido" : ""}`;
        return (
          <div key={c.id} className={c.ancho === "completo" || c.tipo === "area" ? "sm:col-span-2" : ""}>
            <label htmlFor={id} className="rotulo">{c.rotulo}{c.opcional && <span className="opcional"> (opcional)</span>}</label>
            {c.tipo === "lista" ? (
              <select id={id} className={clase} value={valor(c)} onChange={e => poner(c.id, e.target.value)}>
                {c.opciones?.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : c.tipo === "area" ? (
              <textarea id={id} rows={3} className={clase} placeholder={c.placeholder} value={valor(c)} aria-invalid={malos.includes(c.id) || undefined}
                onChange={e => poner(c.id, e.target.value)} />
            ) : (
              <input id={id} className={clase} placeholder={c.placeholder} autoComplete={c.autocompletar ?? "off"} value={valor(c)} aria-invalid={malos.includes(c.id) || undefined}
                onChange={e => poner(c.id, e.target.value)} />
            )}
          </div>
        );
      })}
      <div className="sm:col-span-2">
        {error && <p className="alerta mb-3" role="alert">{error}</p>}
        <a href={waLink(mensaje)} target="_blank" rel="noopener" onClick={e => { if (!validar()) e.preventDefault(); }} className="btn btn-wa w-full sm:w-auto">
          <IconoWhatsApp />{boton}
        </a>
        <p className="mt-2 text-xs leading-relaxed text-tinta-3">Se abre WhatsApp con tu solicitud escrita. La solicitud queda hecha cuando envíes ese mensaje.</p>
      </div>
    </form>
  );
}
