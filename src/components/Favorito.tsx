/* Corazón de favoritos (mejoras 7 y 8). Al guardar, el corazón se llena de rojo y late una vez (con «reducir movimiento»
   solo cambia de color). Lo que se guarda queda en este navegador: ver lib/favoritos.ts */
import { useState } from "react";
import { useTienda } from "../estado/TiendaContext";
import { alternarFavorito, useFavoritos } from "../lib/favoritos";
import { hrefDe } from "../lib/rutas";

export function IconoCorazon({ lleno = false, className = "h-5 w-5" }: { lleno?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={lleno ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.5 1.1 4.8 2.9C13.3 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4z" />
    </svg>
  );
}

export function BotonFavorito({ id, nombre, className = "" }: { id: string; nombre: string; className?: string }) {
  const favoritos = useFavoritos();
  const { avisar } = useTienda();
  const guardado = favoritos.includes(id);
  const [latido, setLatido] = useState(0);
  const tocar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ahora = alternarFavorito(id);
    if (ahora) setLatido(n => n + 1);
    avisar(ahora ? `Guardaste ${nombre} en tus favoritos` : `Quitaste ${nombre} de tus favoritos`);
  };
  return (
    <button type="button" onClick={tocar} aria-pressed={guardado} aria-label={guardado ? `Quitar ${nombre} de favoritos` : `Guardar ${nombre} en favoritos`}
      title={guardado ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`boton-favorito presionable claro-siempre flex h-10 w-10 items-center justify-center rounded-full border border-linea bg-white/95 shadow-sm hover:border-linea-fuerte ${guardado ? "text-[#E5484D]" : "text-tinta-2 hover:text-[#E5484D]"} ${className}`}>
      <span key={latido} className={latido ? "latido-corazon inline-flex" : "inline-flex"}><IconoCorazon lleno={guardado} /></span>
    </button>
  );
}

/** Acceso a la lista en la cabecera: solo aparece cuando hay al menos un favorito */
export function EnlaceFavoritos() {
  const n = useFavoritos().length;
  if (!n) return null;
  return (
    <a href={hrefDe("favoritos")} aria-label={`Tus favoritos, ${n} ${n === 1 ? "producto" : "productos"}`} title="Tus favoritos"
      className="presionable relative inline-flex h-11 w-11 items-center justify-center rounded text-[#E5484D] hover:bg-fondo max-[389px]:hidden">
      <IconoCorazon lleno />
      <span className="absolute right-0.5 top-0.5 min-w-[18px] rounded-full bg-[#E5484D] px-1 text-center text-[11px] font-bold leading-[18px] text-white tabular-nums">{n}</span>
    </a>
  );
}
