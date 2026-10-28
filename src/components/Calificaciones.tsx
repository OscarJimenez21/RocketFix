/* Calificaciones de clientes (#calificaciones). La página no tiene servidor ni guarda datos: el cliente califica aquí,
   se abre WhatsApp con su calificación escrita y Rocket Fix la recibe. Solo se publican calificaciones reales que el
   cliente autorizó: se agregan a src/data/resenas.json con el nombre y la inicial del apellido (nunca teléfono ni correo). */
import { useId, useState } from "react";
import { CONFIG, RESENAS } from "../data/catalogo";
import { lista } from "../lib/formato";
import { waLink } from "../lib/whatsapp";
import { IconoEstrella, IconoWhatsApp } from "./Iconos";
import type { Resena } from "../types";

const PALABRAS = ["", "Muy mala", "Mala", "Regular", "Buena", "Excelente"];
const TIPOS = ["Compré un producto", "Reparación de computador", "Reparación de celular", "Instalación de cámaras", "Otro"];
const POR_PAGINA = 6;

/** 4,8 (una cifra decimal, con coma) o 5 si es entero */
const numero = (n: number) => (Number.isInteger(n) ? String(n) : n.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
const mes = (fecha: string) => new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CO", { month: "long", year: "numeric" });

function resumen(resenas: Resena[]) {
  const total = resenas.length;
  const promedio = total ? Math.round((resenas.reduce((s, r) => s + r.estrellas, 0) / total) * 10) / 10 : 0;
  const conteo = [5, 4, 3, 2, 1].map(e => [e, resenas.filter(r => r.estrellas === e).length] as const);
  return { total, promedio, conteo };
}

/** Cinco estrellas; las de color cubren la parte del puntaje (4,5 pinta cuatro y media) */
export function Estrellas({ valor, className = "h-4 w-4", vacia = "text-linea-fuerte" }: { valor: number; className?: string; vacia?: string }) {
  const fila = (color: string) => <span className={`flex ${color}`}>{[0, 1, 2, 3, 4].map(i => <IconoEstrella key={i} className={`shrink-0 ${className}`} />)}</span>;
  return (
    <span role="img" aria-label={`${numero(valor)} de 5 estrellas`} className="relative inline-flex">
      {fila(vacia)}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(valor / 5) * 100}%` }}>{fila("text-acento")}</span>
    </span>
  );
}

/** Promedio y cantidad para la portada; no aparece mientras no haya calificaciones publicadas */
export function ResumenCalificaciones() {
  const { total, promedio } = resumen(RESENAS);
  if (!total) return null;
  return (
    <a href="#calificaciones" className="inline-flex items-center gap-2 font-semibold text-white hover:underline">
      <Estrellas valor={promedio} vacia="text-white/25" />
      {numero(promedio)} · {total} {total === 1 ? "calificación" : "calificaciones"}
    </a>
  );
}

function TarjetaResena({ r }: { r: Resena }) {
  return (
    <article className="tarjeta flex flex-col p-5">
      <Estrellas valor={r.estrellas} />
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-tinta">“{r.texto}”</p>
      <div className="mt-4 flex items-center gap-3 border-t border-linea pt-4">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca-suave font-bold text-marca-oscuro">{r.nombre.charAt(0)}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{r.nombre}</p>
          <p className="text-xs text-tinta-3">{[r.compra, mes(r.fecha)].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
    </article>
  );
}

function FormularioCalificacion() {
  const base = useId();
  const [estrellas, setEstrellas] = useState(0);
  const [encima, setEncima] = useState(0);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0] ?? "");
  const [equipo, setEquipo] = useState("");
  const [texto, setTexto] = useState("");
  const [publicar, setPublicar] = useState(false);
  const [malos, setMalos] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const quitar = (id: string) => setMalos(m => m.filter(x => x !== id));
  const marcada = encima || estrellas;

  const mensaje = [
    `Hola ${CONFIG.nombre}, quiero calificar mi experiencia.`, "",
    `Calificación: ${"★".repeat(estrellas)}${"☆".repeat(5 - estrellas)} (${estrellas} de 5 · ${PALABRAS[estrellas]})`,
    `Nombre: ${nombre.trim()}`,
    `Compra o servicio: ${[tipo, equipo.trim()].filter(Boolean).join(" · ")}`,
    `Comentario: ${texto.trim()}`,
    `¿La pueden publicar en la página?: ${publicar ? "Sí, con mi nombre y la inicial de mi apellido" : "No, es solo para ustedes"}`
  ].join("\n");

  const FALTA: Record<string, string> = { estrellas: "las estrellas", nombre: "tu nombre", texto: "tu comentario" };
  const validar = () => {
    const faltan = [!estrellas && "estrellas", !nombre.trim() && "nombre", !texto.trim() && "texto"].filter((x): x is string => Boolean(x));
    setMalos(faltan);
    if (faltan[0]) document.getElementById(`${base}-${faltan[0]}`)?.focus();
    return !faltan.length;
  };
  const clase = (id: string) => `campo ${malos.includes(id) ? "campo-invalido" : ""}`;

  return (
    <div className="tarjeta self-start p-5 shadow-tarjeta sm:p-7">
      <h3 className="text-xl font-bold">Califica tu experiencia</h3>
      <p className="mt-1.5 text-sm text-tinta-2">¿Compraste o reparaste un equipo con nosotros? Cuéntanos cómo te fue.</p>
      <form className="mt-5 grid gap-4" noValidate onSubmit={e => e.preventDefault()}>
        <fieldset>
          <legend className="rotulo">Tu calificación</legend>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="-ml-1 flex" onMouseLeave={() => setEncima(0)}>
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} onMouseEnter={() => setEncima(n)} className="cursor-pointer rounded p-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-marca">
                  <input type="radio" name={`${base}-estrellas`} id={n === 1 ? `${base}-estrellas` : undefined} value={n} checked={estrellas === n} className="sr-only"
                    aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}: ${PALABRAS[n]}`} onChange={() => { setEstrellas(n); quitar("estrellas"); }} />
                  <IconoEstrella className={`h-9 w-9 transition-colors ${n <= marcada ? "text-acento" : malos.includes("estrellas") ? "text-red-200" : "text-linea-fuerte"}`} />
                </label>
              ))}
            </div>
            <p className="text-sm font-semibold text-tinta-2" aria-hidden="true">{PALABRAS[marcada] || "Toca las estrellas"}</p>
          </div>
        </fieldset>
        <div>
          <label htmlFor={`${base}-nombre`} className="rotulo">Tu nombre</label>
          <input id={`${base}-nombre`} className={clase("nombre")} autoComplete="name" placeholder="Ej.: Laura Martínez" value={nombre} aria-invalid={malos.includes("nombre") || undefined}
            onChange={e => { setNombre(e.target.value); quitar("nombre"); }} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <label htmlFor={`${base}-tipo`} className="rotulo">¿Qué hiciste con nosotros?</label>
            <select id={`${base}-tipo`} className="campo" value={tipo} onChange={e => setTipo(e.target.value)}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${base}-equipo`} className="rotulo">Producto o equipo<span className="opcional"> (opcional)</span></label>
            <input id={`${base}-equipo`} className="campo" placeholder="Ej.: iPhone 15, portátil Lenovo" value={equipo} onChange={e => setEquipo(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor={`${base}-texto`} className="rotulo">Tu comentario</label>
          <textarea id={`${base}-texto`} rows={3} className={clase("texto")} placeholder="¿Cómo fue la atención, la entrega o la reparación?" value={texto}
            aria-invalid={malos.includes("texto") || undefined} onChange={e => { setTexto(e.target.value); quitar("texto"); }} />
        </div>
        <label className="flex items-start gap-2.5 text-sm leading-snug text-tinta-2">
          <input type="checkbox" checked={publicar} onChange={e => setPublicar(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-marca" />
          Autorizo a {CONFIG.nombre} a publicar mi calificación en esta página con mi nombre y la inicial de mi apellido.
        </label>
        <div>
          {malos.length > 0 && <p className="alerta mb-3" role="alert">Completa {lista(malos.map(m => FALTA[m] ?? m))} para enviar.</p>}
          <a href={waLink(mensaje)} target="_blank" rel="noopener" className="btn btn-wa w-full"
            onClick={e => { if (validar()) setEnviado(true); else e.preventDefault(); }}>
            <IconoWhatsApp />Enviar calificación por WhatsApp
          </a>
          {enviado
            ? <p role="status" className="mt-3 rounded bg-marca-suave px-3 py-2 text-sm text-marca-oscuro"><strong>¡Gracias!</strong> Envía el mensaje que se abrió en WhatsApp para que nos llegue tu calificación.</p>
            : <p className="mt-2 text-xs leading-relaxed text-tinta-3">Se abre WhatsApp con tu calificación escrita. Revisamos cada calificación y solo publicamos las que nos autorizas.</p>}
        </div>
      </form>
    </div>
  );
}

export function Calificaciones() {
  const { total, promedio, conteo } = resumen(RESENAS);
  const [limite, setLimite] = useState(POR_PAGINA);
  const recientes = [...RESENAS].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const pasos = ["Calificas aquí con estrellas y un comentario.", "Se abre WhatsApp con tu calificación escrita. Envía ese mensaje.", "La revisamos y, si nos autorizas, la publicamos en esta sección."];

  return (
    <section id="calificaciones" aria-labelledby="t-calificaciones" className="border-t border-linea bg-fondo">
      <div className="contenedor grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-12">
        <div className="min-w-0">
          <p className="etiqueta">Calificaciones de clientes</p>
          <h2 id="t-calificaciones" className="titulo-seccion mt-1">Lo que dicen nuestros clientes</h2>
          {total > 0 ? (
            <>
              <div className="tarjeta mt-6 grid gap-6 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10 sm:p-7">
                <div>
                  <p className="font-display text-[56px] font-extrabold leading-none ancho-108">{numero(promedio)}</p>
                  <div className="mt-2"><Estrellas valor={promedio} className="h-6 w-6" /></div>
                  <p className="mt-1.5 text-sm text-tinta-2">{total} {total === 1 ? "calificación" : "calificaciones"}</p>
                </div>
                <ul className="grid gap-2">
                  {conteo.map(([e, n]) => (
                    <li key={e} className="flex items-center gap-3 text-sm">
                      <span className="w-[4.75rem] shrink-0 whitespace-nowrap text-tinta-2">{e} {e === 1 ? "estrella" : "estrellas"}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-linea"><span className="block h-full rounded-full bg-acento" style={{ width: `${(n / total) * 100}%` }} /></span>
                      <span className="w-6 shrink-0 text-right tabular-nums text-tinta-3">{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {recientes.slice(0, limite).map((r, i) => <li key={`${r.nombre}-${r.fecha}-${i}`} className="flex"><TarjetaResena r={r} /></li>)}
              </ul>
              {recientes.length > limite && (
                <button type="button" onClick={() => setLimite(l => l + POR_PAGINA)} className="btn btn-borde mt-5">Ver más calificaciones (quedan {recientes.length - limite})</button>
              )}
            </>
          ) : (
            <div className="tarjeta mt-6 p-5 sm:p-7">
              <Estrellas valor={0} className="h-8 w-8" />
              <p className="mt-4 text-lg font-bold">Todavía no hay calificaciones publicadas. ¡La tuya puede ser la primera!</p>
              <p className="mt-2 text-sm leading-relaxed text-tinta-2">Aquí aparecerán las opiniones de quienes compran o reparan sus equipos con nosotros, para que cualquiera las pueda ver antes de comprar.</p>
              <ol className="mt-5 grid gap-2.5 text-sm text-tinta-2">
                {pasos.map((t, n) => (
                  <li key={t} className="flex gap-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marca-suave text-[11px] font-bold text-marca-oscuro">{n + 1}</span>{t}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <FormularioCalificacion />
      </div>
    </section>
  );
}
