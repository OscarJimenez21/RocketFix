/* 26/11/2026 (idea 3, tomada de «Habla con un especialista» de la tienda de Apple): en la página del producto, un
   recuadro para preguntarle a una persona antes de comprar. Dice si estamos atendiendo ahora y el mensaje de WhatsApp
   ya lleva el nombre del producto y la versión elegida. */
import { CONFIG, nombreItem } from "../data/catalogo";
import type { Producto } from "../types";
import { waLink } from "../lib/whatsapp";
import { PuntoEstado, useAtencion } from "./Contacto";
import { IconoWhatsApp } from "./Iconos";

export function AsesorProducto({ producto, version }: { producto: Producto; version?: string }) {
  const atencion = useAtencion();
  const nombre = nombreItem(producto, version ?? "");
  return (
    <div className="mt-5 flex items-center gap-4 rounded-[18px] bg-marca-suave p-4">
      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-wa shadow-sm">
        <IconoWhatsApp className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[16px] font-extrabold leading-tight text-tinta">¿Dudas con este equipo? Habla con un asesor</p>
        <p className="mt-1 flex items-center gap-2 text-[13px] text-tinta-2"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</p>
      </div>
      <a href={waLink(`Hola ${CONFIG.nombre}, tengo una duda sobre ${nombre}: `)} target="_blank" rel="noopener"
        className="inline-flex min-h-[44px] shrink-0 items-center rounded-full bg-marca px-4 text-[14px] font-semibold text-white transition-colors hover:bg-marca-oscuro">
        Preguntar<span className="sr-only"> por WhatsApp sobre {nombre}</span>
      </a>
    </div>
  );
}
