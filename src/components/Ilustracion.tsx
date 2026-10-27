import ilustraciones from "../data/ilustraciones.json";

const ILUS = ilustraciones as Record<string, string>;

/** Dibujo de línea de la tienda original (servicios, artículos y productos sin foto). El SVG es contenido propio de la tienda. */
export function Ilustracion({ nombre, className = "" }: { nombre: string; className?: string }) {
  return (
    <svg className={`ilus ${className}`} viewBox="0 0 120 90" aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: ILUS[nombre] ?? ILUS.celular ?? "" }} />
  );
}
