/* Animación 43: el cielo de la portada cambia con la hora de Bogotá (no con la del equipo de quien la ve, que puede estar
   en otro país). Madrugada y noche: más oscuro, más estrellas y más estrellas fugaces; amanecer y atardecer: un brillo
   cálido abajo; de día: más claro y con pocas estrellas. Se revisa cada 5 minutos por si la página queda abierta. */
import { useEffect, useState } from "react";

export type FaseCielo = "madrugada" | "amanecer" | "dia" | "atardecer" | "noche";

/** Hora de Bogotá (0 a 23,99) */
export function horaBogota(fecha = new Date()): number {
  const partes = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(fecha);
  const n = (t: string) => Number(partes.find(p => p.type === t)?.value ?? 0);
  return n("hour") + n("minute") / 60;
}

export function faseCielo(hora: number): FaseCielo {
  if (hora < 5) return "madrugada";
  if (hora < 7) return "amanecer";
  if (hora < 17) return "dia";
  if (hora < 19) return "atardecer";
  return "noche";
}

/** Cada cuánto salen estrellas fugaces según la hora (1 = normal; menos de 1, más seguidas) */
export const RITMO_FUGACES: Record<FaseCielo, number> = { madrugada: 0.7, amanecer: 1.1, dia: 1.5, atardecer: 1, noche: 0.75 };

/** Al trabajar en local se puede probar otra hora con ?cielo=noche (o madrugada, amanecer, dia, atardecer) */
function forzada(): FaseCielo | null {
  if (!import.meta.env.DEV) return null;
  const f = new URLSearchParams(location.search).get("cielo");
  return f && ["madrugada", "amanecer", "dia", "atardecer", "noche"].includes(f) ? (f as FaseCielo) : null;
}

export function useFaseCielo(): FaseCielo {
  const [fase, setFase] = useState<FaseCielo>(() => forzada() ?? faseCielo(horaBogota()));
  useEffect(() => {
    if (forzada()) return;
    const id = window.setInterval(() => setFase(faseCielo(horaBogota())), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  return fase;
}
