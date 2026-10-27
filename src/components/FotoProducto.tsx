import { useState } from "react";
import { ilustracionDe } from "../data/catalogo";
import { recurso } from "../lib/formato";
import type { Producto } from "../types";
import { Ilustracion } from "./Ilustracion";

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
        <span className="etiqueta-mono text-[10px] text-tinta-3">Foto pendiente</span>
      </div>
    );
  }
  return (
    <img src={recurso(src)} alt={alt} width={800} height={800} loading={prioridad ? "eager" : "lazy"} decoding="async"
      onError={() => setFallo(true)} className={`h-full w-full object-contain ${className}`} />
  );
}
