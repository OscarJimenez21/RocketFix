/* Idea 34: precio grande con el «$» más pequeño y subido (como en las etiquetas de precio de las tiendas). El lector de
   pantalla lee el precio completo, igual que antes */
import { dinero } from "../lib/formato";

export function Pesos({ valor }: { valor: number }) {
  const texto = dinero(valor);
  const cifra = texto.replace(/^\s*\$\s*/, "");
  return (
    <span aria-label={texto} className="whitespace-nowrap">
      <span aria-hidden="true" className="mr-[0.08em] align-[0.34em] text-[0.58em] font-bold">$</span>
      <span aria-hidden="true">{cifra}</span>
    </span>
  );
}