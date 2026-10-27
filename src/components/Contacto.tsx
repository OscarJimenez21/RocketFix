/* Piezas de contacto compartidas (cabecera, portada, artículos y pie de página) */
import { useEffect, useState } from "react";
import { estadoAtencion } from "../lib/horario";

/** Abierto / cerrado según el horario; se actualiza cada minuto */
export function useAtencion() {
  const [estado, setEstado] = useState(() => estadoAtencion());
  useEffect(() => {
    const t = window.setInterval(() => setEstado(estadoAtencion()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return estado;
}

/** Punto verde (abierto) o gris (cerrado). `claro`: sobre fondo oscuro */
export function PuntoEstado({ abierto, claro = false }: { abierto: boolean; claro?: boolean }) {
  return <span aria-hidden="true" className={`inline-block h-2 w-2 shrink-0 rounded-full ${abierto ? "bg-marca-claro" : claro ? "bg-white/50" : "bg-tinta-3"}`} />;
}

/** Copia el número de WhatsApp. `className`: variante del botón (btn-borde sobre fondo claro, btn-claro sobre oscuro) */
export function BotonCopiar({ texto, className = "btn-borde" }: { texto: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin permiso */ }
  };
  return <button type="button" onClick={copiar} className={`btn btn-sm ${className}`}>{copiado ? "Copiado" : "Copiar número"}</button>;
}
