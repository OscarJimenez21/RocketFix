import type { ReactNode } from "react";
import { RECORTE, TIENDAS } from "../data/tiendas";
import { recurso } from "../lib/formato";
import { conNombre, waLink } from "../lib/whatsapp";
import type { NotaCabecera } from "../types";
import { IconoCasa } from "./Iconos";
import { hrefDe } from "../lib/rutas";

export interface Miga { texto: string; href?: string }

/** Idea 4: «Inicio» lleva una casita y cada sección su producto recortado (el mismo del menú) */
function iconoMiga(m: Miga) {
  if (m.texto === "Inicio") return <IconoCasa className="h-3.5 w-3.5" />;
  const t = TIENDAS.find(s => m.href === hrefDe(s.vista));
  return t ? <img src={recurso(`fotos/recortes/${RECORTE[t.id]}.webp`)} alt="" decoding="async" width={18} height={18} className="h-[18px] w-[18px] object-contain" /> : null;
}

/** Ruta de navegación (Inicio › Celulares › …) */
export function Migas({ migas, className = "" }: { migas: Miga[]; className?: string }) {
  return (
    <nav aria-label="Ruta" className={`flex flex-wrap items-center gap-1.5 text-[13px] text-tinta-2 ${className}`}>
      {migas.map((m, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true" className="text-tinta-3">›</span>}
          {m.href
            ? <a href={m.href} className="toque inline-flex items-center gap-1 hover:text-tinta hover:underline">{iconoMiga(m)}{m.texto}</a>
            : <span aria-current="page" className="text-tinta">{m.texto}</span>}
        </span>
      ))}
    </nav>
  );
}

/** Cabecera de una página interna: ruta, título, introducción y una nota de ayuda a la derecha.
    19/11/2026: en celular la nota es una sola línea con su enlace (la tarjeta completa empujaba los productos fuera de la
    primera pantalla); desde tableta se ve la tarjeta como antes */
export function EncabezadoVista({ migas, titulo, lead, nota, extra }: { migas: Miga[]; titulo: string; lead?: string; nota?: NotaCabecera | null; extra?: ReactNode }) {
  const enlaceNota = nota && {
    href: nota.whatsapp !== null ? waLink(nota.whatsapp ? conNombre(nota.whatsapp) : undefined) : hrefDe(nota.href ?? "inicio"),
    ...(nota.whatsapp !== null ? { target: "_blank", rel: "noopener" } : {})
  };
  return (
    <div className="border-b border-linea bg-fondo">
      <div className="contenedor grid gap-5 py-5 md:grid-cols-[minmax(0,1fr)_300px] md:items-end md:gap-10 md:py-8">
        <div className="min-w-0">
          <Migas migas={migas} className="mb-2.5" />
          {/* 25/11/2026: título grande, como las páginas de la tienda de Apple */}
          <h1 tabIndex={-1} className={`text-balance font-display font-extrabold leading-[1.05] tracking-tight ${titulo.length > 40 ? "text-[28px] md:text-[40px]" : "text-[34px] md:text-[52px]"}`}>{titulo}</h1>
          {lead && <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-tinta-2 md:text-[18px]">{lead}</p>}
          {nota && enlaceNota && (
            <p className="mt-2 text-sm text-tinta-2 md:hidden">
              {nota.titulo} <a className="enlace-suelto text-sm" {...enlaceNota}>{nota.enlace.replace(/\s*→$/, "")} →</a>
            </p>
          )}
          {extra}
        </div>
        {nota && enlaceNota && (
          <aside className="tarjeta hidden p-4 text-sm md:block">
            <p className="font-semibold">{nota.titulo}</p>
            <p className="mt-1 text-tinta-2">{nota.texto}</p>
            <a className="enlace-suelto mt-0.5 text-sm" {...enlaceNota}>
              {nota.enlace.replace(/\s*→$/, "")} →
            </a>
          </aside>
        )}
      </div>
    </div>
  );
}
