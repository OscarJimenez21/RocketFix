/* Catálogo en PDF para descargar desde la tienda (idea 69, 13/11/2026).
   Es el mismo PDF que se arma fuera del repositorio (.trabajo/catalogo-pdf). Cada vez que se rehace, se copia a
   public/catalogo-rocket-fix.pdf y se corrige aquí el peso (la prueba de ideas1311.test.ts avisa si no cuadra). */
import { recurso } from "./formato";

export const CATALOGO_PDF = {
  archivo: "catalogo-rocket-fix.pdf",
  href: recurso("catalogo-rocket-fix.pdf"),
  /** Peso redondeado en MB (millones de bytes), para que nadie lo descargue con datos sin saberlo */
  megas: 16,
  texto: "Catálogo en PDF"
} as const;

export const pesoCatalogo = `PDF, ${CATALOGO_PDF.megas} MB`;
