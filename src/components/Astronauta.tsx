/* Idea 35: astronauta que flota buscando con una lupa, para cuando la búsqueda no encuentra nada (el cohete perdido sigue
   en la página no encontrada). Colores de la marca; con «reducir movimiento» queda quieto */
export function Astronauta({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" role="img" aria-label="Un astronauta flota buscando con una lupa" className={`mx-auto h-36 w-auto ${className}`}>
      {/* estrellas */}
      <g className="fill-marca/30">
        <circle cx="24" cy="30" r="2.5" /><circle cx="196" cy="22" r="2" /><circle cx="204" cy="118" r="2.5" /><circle cx="14" cy="122" r="2" /><circle cx="168" cy="150" r="1.6" />
      </g>
      <path d="M40 150c30-6 40-40 70-52" fill="none" className="stroke-marca/40" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <g className="motion-safe:animate-flotar" style={{ transformOrigin: "110px 80px" }}>
        <g transform="rotate(-12 110 82)">
          {/* mochila */}
          <rect x="78" y="70" width="22" height="40" rx="6" className="fill-marca-oscuro" />
          {/* piernas */}
          <rect x="96" y="104" width="15" height="30" rx="7" className="fill-white stroke-marca-oscuro" strokeWidth="2.5" />
          <rect x="114" y="104" width="15" height="30" rx="7" className="fill-white stroke-marca-oscuro" strokeWidth="2.5" />
          <path d="M96 126h15M114 126h15" className="stroke-acento" strokeWidth="3" />
          {/* cuerpo */}
          <rect x="90" y="66" width="46" height="46" rx="14" className="fill-white stroke-marca-oscuro" strokeWidth="2.5" />
          <rect x="103" y="80" width="20" height="13" rx="3" className="fill-marca-suave stroke-marca-oscuro" strokeWidth="2" />
          <circle cx="109" cy="86.5" r="2" className="fill-acento" /><circle cx="117" cy="86.5" r="2" className="fill-marca" />
          {/* brazo con la lupa */}
          <path d="M134 78c12-2 20-10 24-20" fill="none" className="stroke-marca-oscuro" strokeWidth="13" strokeLinecap="round" />
          <path d="M134 78c12-2 20-10 24-20" fill="none" className="stroke-white" strokeWidth="8" strokeLinecap="round" />
          <circle cx="166" cy="44" r="13" className="fill-marca-menta/35 stroke-marca-oscuro" strokeWidth="3.5" />
          <path d="M157 53l-6 7" className="stroke-marca-oscuro" strokeWidth="5" strokeLinecap="round" />
          {/* otro brazo */}
          <path d="M92 84c-10 4-14 12-14 20" fill="none" className="stroke-marca-oscuro" strokeWidth="13" strokeLinecap="round" />
          <path d="M92 84c-10 4-14 12-14 20" fill="none" className="stroke-white" strokeWidth="8" strokeLinecap="round" />
          {/* casco */}
          <circle cx="113" cy="48" r="24" className="fill-white stroke-marca-oscuro" strokeWidth="2.5" />
          <rect x="97" y="37" width="32" height="22" rx="11" className="fill-marca-noche" />
          <path d="M103 43c3-3 7-4 11-4" fill="none" className="stroke-white/70" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="137" cy="48" r="3.5" className="fill-acento" />
        </g>
      </g>
    </svg>
  );
}
