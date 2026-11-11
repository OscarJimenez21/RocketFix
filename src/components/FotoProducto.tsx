import { useLayoutEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { ilustracionDe } from "../data/catalogo";
import { recurso, srcsetFoto } from "../lib/formato";
import type { Producto } from "../types";
import { Ilustracion } from "./Ilustracion";

/** Foto que aparece con un fundido cuando termina de cargar, en vez de pintarse de golpe por partes. Si ya estaba en la
    memoria del navegador se ve de una vez (sin fundido). Las de `prioridad` (la foto principal, arriba de la página) se
    muestran apenas llegan, para no retrasar lo primero que ve la persona. Lleva su propia transición de opacidad y de
    transform: quien la use puede sumarle un `group-hover:scale-…` sin poner otra transición. */
export function Imagen({ src, srcSet, sizes, alt, prioridad = false, className = "", ...resto }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; prioridad?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [cargada, setCargada] = useState(false);
  // Antes de pintar: si la foto ya está lista (caché), no se oculta ni un cuadro
  useLayoutEffect(() => { const el = ref.current; setCargada(Boolean(el?.complete && el.naturalWidth)); }, [src, srcSet]);
  // El orden importa: React 18 pone los atributos en el orden en que van aquí, y el navegador empieza a bajar la foto apenas
  // recibe `src`. Por eso `src` va al final, después de loading, srcSet y sizes: si fuera primero, se bajaba la original
  // de 800 px y además la copia liviana (medido el 11/11/2026)
  return (
    <img ref={ref} alt={alt} loading={prioridad ? "eager" : "lazy"} decoding="async" {...(srcSet ? { srcSet, sizes } : null)} {...resto}
      // La foto principal se pide antes que las demás (en minúsculas: React 18 todavía no conoce fetchPriority)
      {...(prioridad ? { fetchpriority: "high" } : null)}
      src={src} onLoad={() => setCargada(true)}
      className={`transition-[opacity,transform] duration-300 ease-salida ${prioridad || cargada ? "" : "opacity-0"} ${className}`} />
  );
}

interface Props {
  producto: Producto;
  src?: string;
  alt?: string;
  className?: string;
  prioridad?: boolean;
  /** Ancho de la foto en pantalla (atributo `sizes`). Con él, el navegador baja la copia liviana que le alcanza
      (WebP de 300 o 600 px) en vez de la original de 800 px. No se pone en la foto que el HTML ya pidió por adelantado
      (la primera de la vitrina y la principal del producto), porque la bajaría dos veces. */
  tamanos?: string;
}

/** Foto de producto (las fotos son cuadradas de 800×800). Si falta o no carga, se muestra el dibujo de su tipo y "Foto pendiente". */
export function FotoProducto({ producto, src = producto.imagen, alt = producto.nombre, className = "", prioridad = false, tamanos }: Props) {
  const [fallo, setFallo] = useState(false);
  // Si una copia liviana no está (por ejemplo, una foto recién agregada), se vuelve a la original antes de rendirse
  const [sinLiviana, setSinLiviana] = useState(false);
  const srcSet = tamanos && !sinLiviana && src ? srcsetFoto(src) : undefined;
  if (!src || fallo) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-1 text-marca-medio ${className}`} role="img" aria-label={`${producto.nombre} (foto pendiente)`}>
        <Ilustracion nombre={ilustracionDe(producto)} className="w-1/2" />
        <span className="etiqueta text-tinta-3">Foto pendiente</span>
      </div>
    );
  }
  return (
    <Imagen src={recurso(src)} srcSet={srcSet} sizes={srcSet ? tamanos : undefined} alt={alt} width={800} height={800} prioridad={prioridad}
      onError={() => (srcSet ? setSinLiviana(true) : setFallo(true))} className={`h-full w-full object-contain ${className}`} />
  );
}
