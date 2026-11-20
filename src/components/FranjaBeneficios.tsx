/* 20/11/2026 (usuario: «todo lo que hacen las que más venden, aplícalo»): franja delgada encima de la cabecera con los
   beneficios de siempre, como «Envío gratis desde…» de Mercado Libre o la franja de Alkosto y Falabella. Los textos
   salen de config.json (los mismos montos que se publican en Envíos); nada de descuentos ni promociones.
   - En computador van los cuatro a la vez. En celular no caben: se muestra uno y cambia cada 4 s (sin moverse de lado si
     la persona pidió menos movimiento; ahí se queda en el primero).
   - En temporada (diciembre, prima…) no sale: arriba va la franja de la temporada (FranjaTemporada). */
import { useEffect, useState } from "react";
import { CONFIG } from "../data/catalogo";
import { dinero } from "../lib/formato";
import { TEMPORADA } from "../lib/temporada";
import { IconoCamion, IconoMoto, IconoTarjeta } from "./Iconos";

// Cortos: en celular cada uno cabe en un renglón y en computador caben los cuatro en fila
const MENSAJES = [
  { icono: IconoMoto, texto: "Entrega el mismo día en Bogotá" },
  { icono: IconoCamion, texto: `Envío gratis en Bogotá desde ${dinero(CONFIG.envios.bogota.gratisDesde)}` },
  { icono: IconoCamion, texto: `Envío nacional gratis desde ${dinero(CONFIG.envios.nacional.gratisDesde)}` },
  { icono: IconoTarjeta, texto: `Contra entrega en Bogotá hasta ${dinero(CONFIG.contraEntregaHasta)}` }
];

export function FranjaBeneficios() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setN(v => (v + 1) % MENSAJES.length), 4000);
    return () => window.clearInterval(t);
  }, []);
  if (TEMPORADA) return null;
  return (
    <div className="bg-marca-noche text-white">
      {/* Celular: uno a la vez (alto fijo: al cambiar de texto no se mueve nada debajo) */}
      <p className="contenedor flex h-9 items-center justify-center gap-2 text-center text-[12.5px] font-semibold xl:hidden" aria-live="off">
        {MENSAJES.map((m, i) => i === n && (
          <span key={i} className="inline-flex min-w-0 items-center gap-1.5 motion-safe:animate-entrar">
            <m.icono className="h-4 w-4 shrink-0 text-marca-menta" /><span className="truncate">{m.texto}</span>
          </span>
        ))}
      </p>
      {/* En computador: los cuatro en fila */}
      <ul className="contenedor hidden h-9 items-center justify-between gap-6 text-[13px] font-semibold xl:flex">
        {MENSAJES.map(m => (
          <li key={m.texto} className="inline-flex items-center gap-1.5 whitespace-nowrap"><m.icono className="h-4 w-4 shrink-0 text-marca-menta" />{m.texto}</li>
        ))}
      </ul>
    </div>
  );
}
