import { useState } from "react";
import textos from "../data/articulos-texto.json";
import { ARTICULOS, CABECERAS, CONFIG, PAQUETES } from "../data/catalogo";
import { FORMULARIOS_ARTICULO } from "../data/formularios";
import { BotonCopiar, PuntoEstado, useAtencion } from "../components/Contacto";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { FormularioWhatsApp } from "../components/FormularioWhatsApp";
import { IconoWhatsApp } from "../components/Iconos";
import { Ilustracion } from "../components/Ilustracion";
import { dinero } from "../lib/formato";
import { waLink } from "../lib/whatsapp";
import type { TiendaId } from "../types";
import { NoEncontrada } from "./NoEncontrada";
import { abrirTiendaEn } from "./Tienda";

const TEXTOS = textos as Record<string, string>;

// Los enlaces del texto con data-filtro="comp|ram" abren la sección ya filtrada, como en la tienda original
const alClicTexto = (e: React.MouseEvent) => {
  const enlace = (e.target as Element).closest<HTMLAnchorElement>("a[data-filtro]");
  const [tienda, cat] = enlace?.dataset.filtro?.split("|") ?? [];
  if (tienda && cat) abrirTiendaEn(tienda as TiendaId, cat);
};
const HUECO_PAQUETES = '<div class="pkgs" id="paquetes"></div>';

const irAlFormulario = () => {
  const caja = document.getElementById("form-articulo");
  caja?.scrollIntoView({ behavior: "smooth", block: "start" });
  caja?.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
};

/** Paquetes de cámaras del artículo de instalación (precios de referencia) */
function Paquetes({ cotizar }: { cotizar: (nombre: string) => void }) {
  return (
    <div className="not-prose grid gap-3 sm:grid-cols-3">
      {PAQUETES.map(pk => (
        <div key={pk.nombre} className="flex flex-col rounded-md border border-linea p-4">
          <Ilustracion nombre={pk.ilustracion} className="h-12 w-16 text-marca-medio" />
          <h3 className="mt-2 font-bold">{pk.nombre}</h3>
          <ul className="mt-1 text-sm text-tinta-2">{pk.specs.map(s => <li key={s}>{s}</li>)}</ul>
          <p className="mt-3 text-sm"><span className="text-tinta-3">Desde</span> <b className="font-display text-lg">{dinero(pk.desde)}</b></p>
          <button type="button" onClick={() => cotizar(pk.nombre)} className="btn btn-sm btn-borde mt-3">Cotizar este paquete</button>
        </div>
      ))}
    </div>
  );
}

export function Articulo({ id }: { id: string }) {
  const a = ARTICULOS.find(x => x.id === id);
  const atencion = useAtencion();
  const [paquete, setPaquete] = useState<string | undefined>();
  const html = TEXTOS[id];
  const form = FORMULARIOS_ARTICULO[id];
  if (!a || !html || !form) return <NoEncontrada />;
  const cab = CABECERAS[id];
  const [antes, despues] = html.includes(HUECO_PAQUETES) ? html.split(HUECO_PAQUETES) : [html, null];

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Blog", href: "#blog" }, { texto: a.etiqueta }]} titulo={a.titulo} lead={cab?.lead ?? a.resumen}
        extra={<p className="mt-3 text-sm text-tinta-3">Por {CONFIG.nombre} · Lectura de {a.minutos} min</p>} />
      <div className="contenedor grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* El texto del artículo es contenido propio de la tienda original */}
        <article className="prosa min-w-0 max-w-3xl" onClick={alClicTexto}>
          <div dangerouslySetInnerHTML={{ __html: antes ?? "" }} />
          {despues !== null && <><div className="mt-4"><Paquetes cotizar={n => { setPaquete(n); irAlFormulario(); }} /></div><div className="mt-4" dangerouslySetInnerHTML={{ __html: despues ?? "" }} /></>}
        </article>
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-md border border-linea p-5">
            <p className="font-semibold">¿Prefieres hablar ya?</p>
            <p className="mt-2 flex items-center gap-2 text-sm"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</p>
            <p className="mt-3 font-display text-xl font-bold">{CONFIG.whatsappVisible}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={waLink(`Hola ${CONFIG.nombre}, tengo una pregunta sobre ${a.titulo.toLowerCase()}.`)} target="_blank" rel="noopener" className="btn btn-sm btn-wa"><IconoWhatsApp className="h-4 w-4" />Abrir chat</a>
              <BotonCopiar texto={CONFIG.whatsappVisible} />
            </div>
            <button type="button" onClick={irAlFormulario} className="btn btn-sm btn-borde mt-3 w-full">Llenar la solicitud</button>
          </div>
          <nav aria-label="Otros artículos" className="mt-6">
            <p className="etiqueta-mono mb-2">Otros artículos</p>
            <ul className="grid gap-2 text-sm">{ARTICULOS.filter(x => x.id !== id).map(x => <li key={x.id}><a href={`#${x.id}`} className="enlace font-medium">{x.titulo}</a></li>)}</ul>
          </nav>
        </aside>
      </div>
      <section id="form-articulo" aria-labelledby="t-form" className="border-t border-linea bg-fondo">
        <div className="contenedor grid grid-cols-1 gap-6 py-10 md:grid-cols-[300px_minmax(0,1fr)]">
          <div>
            <p className="etiqueta-mono">Escríbenos</p>
            <h2 id="t-form" className="mt-1 text-2xl font-extrabold">{form.titulo}</h2>
            <p className="mt-2 text-sm text-tinta-2">{form.texto}</p>
          </div>
          <div className="rounded-md border border-linea bg-white p-5 md:p-6">
            <FormularioWhatsApp asunto={form.asunto} campos={form.campos} boton={form.boton}
              valores={paquete ? { paquete } : undefined} alCambiar={(campo, v) => { if (campo === "paquete") setPaquete(v); }} />
          </div>
        </div>
      </section>
    </>
  );
}
