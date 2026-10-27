/** Logo original de Rocket Fix: el cohete (llama naranja) y la palabra "Rocket Fix", sin cambios de forma ni proporción */
export function Cohete({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M16 3c4.5 3.5 6.5 8.5 6 14.5L19.5 22h-7L10 17.5C9.5 11.5 11.5 6.5 16 3z" />
      <circle cx="16" cy="12.5" r="2.5" />
      <path d="M10 17l-3.5 4.5 1 3.5 5-3M22 17l3.5 4.5-1 3.5-5-3" />
      <path d="M14 25l2 4 2-4" stroke="#FF6B2C" />
    </svg>
  );
}

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    // Más pequeño en pantallas angostas (menos de 640 px, y aún más bajo 360 px) para que la cabecera quepa en una fila
    <span className="inline-flex items-center gap-1.5 sm:gap-2">
      <Cohete className={`h-7 w-7 max-[359px]:h-6 max-[359px]:w-6 sm:h-8 sm:w-8 ${claro ? "text-marca-menta" : "text-marca"}`} />
      <span className={`ancho-122 font-display text-[17px] font-[850] uppercase leading-none tracking-tight max-[359px]:text-[15px] sm:text-[19px] ${claro ? "text-white" : "text-tinta"}`}>
        Rocket <span className={claro ? "text-marca-menta" : "text-marca"}>Fix</span>
      </span>
    </span>
  );
}
