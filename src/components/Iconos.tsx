/* Íconos de línea que se usan en la interfaz (solo los necesarios) */
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconoBuscar = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
);
export const IconoBolsa = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
/** Globo con auricular, como el ícono de WhatsApp (el auricular es el ícono "call" de Material, licencia Apache 2.0) */
export const IconoWhatsApp = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 3.4a8.6 8.6 0 0 0-7.43 12.93L3.4 20.6l4.38-1.15A8.6 8.6 0 1 0 12 3.4z" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round" />
    <path transform="translate(7.25 7.25) scale(.4)" fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);
/** Llama de "Lo más vendido" (la misma de la tienda anterior) */
export const IconoLlama = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.4-1.3 2.2-3.2C17.6 10.6 19 13 19 15.5 19 19.1 15.9 22 12 22s-7-2.9-7-6.5C5 10.6 9.8 7.6 12 2z" />
  </svg>
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
export const IconoMenu = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconoCheck = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.2}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
/** Estrella rellena de las calificaciones */
export const IconoEstrella = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round">
    <path d="M12 2.8l2.84 5.76 6.36.92-4.6 4.48 1.09 6.33L12 17.3l-5.69 2.99 1.09-6.33-4.6-4.48 6.36-.92z" />
  </svg>
);
export const IconoMoto =({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M8.5 17h6.5l2-7h2.5M15 5h3l1.5 5M5.5 17l3-6h6" /></svg>
);
