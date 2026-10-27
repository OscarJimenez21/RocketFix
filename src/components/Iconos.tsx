/* Íconos de línea que se usan en la interfaz (solo los necesarios) */
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconoBuscar = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
);
export const IconoBolsa = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const IconoWhatsApp = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 5h16v11H9l-5 4z" /></svg>
);
export const IconoCerrar = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconoFlecha = ({ className = "h-5 w-5", dir = 1 }: P & { dir?: 1 | -1 }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} /></svg>
);
export const IconoCompartir = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 15V3M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
);
export const IconoCamion = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M2 6h12v10H2zM14 9h4.5l3.5 3.5V16h-8" /><circle cx="6" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /></svg>
);
export const IconoTarjeta = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
);
export const IconoMoto = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M8.5 17h6.5l2-7h2.5M15 5h3l1.5 5M5.5 17l3-6h6" /></svg>
);
