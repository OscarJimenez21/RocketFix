/* Piezas de contacto compartidas (cabecera, portada, artículos y pie de página) */
import { useEffect, useState } from "react";
import { estadoAtencion } from "../lib/horario";
import { IconoCheck } from "./Iconos";

/** Abierto / cerrado según el horario; se actualiza cada minuto */
export function useAtencion() {
  const [estado, setEstado] = useState(() => estadoAtencion());
  useEffect(() => {
    const t = window.setInterval(() => setEstado(estadoAtencion()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return estado;
}

/** Punto verde (abierto) o gris (cerrado). `claro`: sobre fondo oscuro. Abierto, un anillo sale del punto cada 2,4 s,
    como un latido suave (no se mueve si la persona pidió menos movimiento) */
export function PuntoEstado({ abierto, claro = false }: { abierto: boolean; claro?: boolean }) {
  return (
    <span aria-hidden="true" className="relative inline-flex h-2 w-2 shrink-0">
      {abierto && <span className="absolute inset-0 rounded-full bg-marca-claro opacity-0 motion-safe:animate-pulso" />}
      <span className={`relative inline-block h-2 w-2 rounded-full ${abierto ? "bg-marca-claro" : claro ? "bg-white/50" : "bg-tinta-3"}`} />
    </span>
  );
}

/** Copia el número de WhatsApp. `className`: variante del botón (btn-borde sobre fondo claro, btn-claro sobre oscuro) */
export function BotonCopiar({ texto, className = "btn-borde" }: { texto: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin permiso */ }
  };
  // «Copiado» entra con un fundido corto y un ✓ que se dibuja, para que se note que funcionó
  return (
    <button type="button" onClick={copiar} className={`btn btn-sm ${className}`}>
      {copiado ? <span className="inline-flex items-center gap-1.5 motion-safe:animate-entrar"><IconoCheck className="dibujar h-4 w-4" />Copiado</span> : "Copiar número"}
    </button>
  );
}
