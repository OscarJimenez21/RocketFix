import type { ReactNode } from "react";
import { conNombre, waLink } from "../lib/whatsapp";
import type { NotaCabecera } from "../types";

export interface Miga { texto: string; href?: string }

/** Cabecera de una página interna: ruta, título, introducción y una nota de ayuda a la derecha */
export function EncabezadoVista({ migas, titulo, lead, nota, extra }: { migas: Miga[]; titulo: string; lead?: string; nota?: NotaCabecera | null; extra?: ReactNode }) {
  return (
    <div className="border-b border-linea bg-fondo">
      <div className="contenedor grid gap-6 py-7 md:grid-cols-[1fr_320px] md:items-end md:py-9">
        <div>
          <nav aria-label="Ruta" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-tinta-2">
            {migas.map((m, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true" className="text-tinta-3">/</span>}
                {m.href ? <a href={m.href} className="hover:text-tinta hover:underline">{m.texto}</a> : <span aria-current="page">{m.texto}</span>}
              </span>
            ))}
          </nav>
          <h1 tabIndex={-1} className="text-[28px] font-extrabold leading-tight md:text-[34px]">{titulo}</h1>
          {lead && <p className="mt-2 max-w-2xl text-[15.5px] text-tinta-2">{lead}</p>}
          {extra}
        </div>
        {nota && (
          <aside className="rounded-md border border-linea bg-white p-4 text-sm">
            <p className="font-semibold">{nota.titulo}</p>
            <p className="mt-1 text-tinta-2">{nota.texto}</p>
            <a className="enlace mt-2 inline-block text-sm"
              href={nota.whatsapp !== null ? waLink(nota.whatsapp ? conNombre(nota.whatsapp) : undefined) : `#${nota.href ?? "inicio"}`}
              {...(nota.whatsapp !== null ? { target: "_blank", rel: "noopener" } : {})}>
              {nota.enlace.replace(/\s*→$/, "")} →
            </a>
          </aside>
        )}
      </div>
    </div>
  );
}
