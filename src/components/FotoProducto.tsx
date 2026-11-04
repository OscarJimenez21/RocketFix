import { useLayoutEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { ilustracionDe } from "../data/catalogo";
import { recurso } from "../lib/formato";
import type { Producto } from "../types";
import { Ilustracion } from "./Ilustracion";

/** Foto que aparece con un fundido cuando termina de cargar, en vez de pintarse de golpe por partes. Si ya estaba en la
    memoria del navegador se ve de una vez (sin fundido). Las de `prioridad` (la foto principal, arriba de la página) se
    muestran apenas llegan, para no retrasar lo primero que ve la persona. Lleva su propia transición de opacidad y de
    transform: quien la use puede sumarle un `group-hover:scale-…` sin poner otra transición. */
export function Imagen({ src, prioridad = false, className = "", ...resto }: ImgHTMLAttributes<HTMLImageElement> & { src: string; prioridad?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [cargada, setCargada] = useState(false);
  // Antes de pintar: si la foto ya está lista (caché), no se oculta ni un cuadro
  useLayoutEffect(() => { const el = ref.current; setCargada(Boolean(el?.complete && el.naturalWidth)); }, [src]);
  return (
    <img ref={ref} src={src} loading={prioridad ? "eager" : "lazy"} decoding="async" {...resto} onLoad={() => setCargada(true)}
      className={`transition-[opacity,transform] duration-300 ease-salida ${prioridad || cargada ? "" : "opacity-0"} ${className}`} />
  );
}

interface Props {
  producto: Producto;
  src?: string;
  alt?: string;
  className?: string;
  prioridad?: boolean;
}

/** Foto de producto (las fotos son cuadradas de 800×800). Si falta o no carga, se muestra el dibujo de su tipo y "Foto pendiente". */
export function FotoProducto({ producto, src = producto.imagen, alt = producto.nombre, className = "", prioridad = false }: Props) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-1 text-marca-medio ${className}`} role="img" aria-label={`${producto.nombre} (foto pendiente)`}>
        <Ilustracion nombre={ilustracionDe(producto)} className="w-1/2" />
        <span className="etiqueta text-tinta-3">Foto pendiente</span>
      </div>
    );
  }
  return (
    <Imagen src={recurso(src)} alt={alt} width={800} height={800} prioridad={prioridad}
      onError={() => setFallo(true)} className={`h-full w-full object-contain ${className}`} />
  );
}
