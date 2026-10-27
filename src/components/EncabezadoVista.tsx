import type { ReactNode } from "react";
import { conNombre, waLink } from "../lib/whatsapp";
import type { NotaCabecera } from "../types";

export interface Miga { texto: string; href?: string }

/** Ruta de navegación (Inicio › Celulares › …) */
export function Migas({ migas, className = "" }: { migas: Miga[]; className?: string }) {
  return (
    <nav aria-label="Ruta" className={`flex flex-wrap items-center gap-1.5 text-[13px] text-tinta-2 ${className}`}>
      {migas.map((m, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true" className="text-tinta-3">›</span>}
          {m.href ? <a href={m.href} className="hover:text-tinta hover:underline">{m.texto}</a> : <span aria-current="page" className="text-tinta">{m.texto}</span>}
        </span>
      ))}
    </nav>
  );
}

/** Cabecera de una página interna: ruta, título, introducción y una nota de ayuda a la derecha */
export function EncabezadoVista({ migas, titulo, lead, nota, extra }: { migas: Miga[]; titulo: string; lead?: string; nota?: NotaCabecera | null; extra?: ReactNode }) {
  return (
    <div className="border-b border-linea bg-fondo">
      <div className="contenedor grid gap-5 py-6 md:grid-cols-[minmax(0,1fr)_300px] md:items-end md:gap-10 md:py-8">
        <div className="min-w-0">
          <Migas migas={migas} className="mb-2.5" />
          <h1 tabIndex={-1} className="text-[26px] font-extrabold leading-tight md:text-[32px]">{titulo}</h1>
          {lead && <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-tinta-2">{lead}</p>}
          {extra}
        </div>
        {nota && (
          <aside className="tarjeta p-4 text-sm">
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
