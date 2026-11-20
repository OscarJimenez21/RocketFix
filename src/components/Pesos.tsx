/* Idea 34: precio grande con el «$» más pequeño y subido (como en las etiquetas de precio de las tiendas). El lector de
   pantalla lee el precio completo, igual que antes */
import { dinero } from "../lib/formato";

export function Pesos({ valor }: { valor: number }) {
  const texto = dinero(valor);
  const cifra = texto.replace(/^\s*\$\s*/, "");
  return (
    // 19/11/2026: el precio completo va en un texto oculto (un aria-label en un <span> sin rol no lo leen todos los
    // lectores de pantalla; lo marcó la revisión de accesibilidad)
    <span className="whitespace-nowrap">
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true" className="mr-[0.08em] align-[0.34em] text-[0.58em] font-bold">$</span>
      <span aria-hidden="true">{cifra}</span>
    </span>
  );
}