/* Dibujos de las temporadas (lib/temporada.ts). Son SVG pequeños, sin fotos ni archivos aparte. */

export function Copo({ s = 10 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
      <path d="M10 1v18M2.2 5.5l15.6 9M2.2 14.5l15.6-9M10 1l-2 2.2M10 1l2 2.2M10 19l-2-2.2M10 19l2-2.2" />
    </svg>
  );
}

export function Corazon({ s = 16, color = "#FF5A8A" }: { s?: number; color?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20">
      <path d="M10 17.5s-6.4-3.9-7.9-8C1 6.5 2.9 3.5 5.9 3.5c1.7 0 3 .9 4.1 2.4 1.1-1.5 2.4-2.4 4.1-2.4 3 0 4.9 3 3.8 6-1.5 4.1-7.9 8-7.9 8z" fill={color} />
      <path d="M5.2 6.6c.5-.9 1.3-1.3 2.1-1.2" stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Globo({ s = 30, color = "#FF5A8A" }: { s?: number; color?: string }) {
  return (
    <svg width={s} height={s * 1.9} viewBox="0 0 20 38">
      <path d="M10 20.5c-.6 3 1.4 5 0 8.5s1.2 5.5 0 9" stroke="#fff" strokeOpacity=".55" strokeWidth=".8" fill="none" />
      <ellipse cx="10" cy="10" rx="8" ry="9.6" fill={color} />
      <path d="M8.6 19.4h2.8l-1.4 1.6z" fill={color} />
      <ellipse cx="7" cy="6.4" rx="1.8" ry="3" fill="#fff" fillOpacity=".38" transform="rotate(-20 7 6.4)" />
    </svg>
  );
}

export function Petalo({ s = 14, color = "#FFB3D1" }: { s?: number; color?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20">
      <path d="M10 1c5 4 6.5 9.5 0 18C3.5 10.5 5 5 10 1z" fill={color} />
      <path d="M10 4v12" stroke="#fff" strokeOpacity=".45" strokeWidth=".9" />
    </svg>
  );
}

export function Flor({ s = 26, petalo = "#FF8FB8", centro = "#FFD23F" }: { s?: number; petalo?: string; centro?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20">
      {[0, 72, 144, 216, 288].map(g => <ellipse key={g} cx="10" cy="5.2" rx="3.4" ry="4.6" fill={petalo} transform={`rotate(${g} 10 10)`} />)}
      <circle cx="10" cy="10" r="3" fill={centro} />
    </svg>
  );
}

export function Calabaza({ s = 40, cara = true }: { s?: number; cara?: boolean }) {
  return (
    <svg width={s} height={s * 0.9} viewBox="0 0 40 36">
      <path d="M20 8c0-3 1.5-5.5 4-7" stroke="#3E7D3A" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="12" cy="21" rx="10" ry="13" fill="#E86A1C" />
      <ellipse cx="28" cy="21" rx="10" ry="13" fill="#E86A1C" />
      <ellipse cx="20" cy="21" rx="10" ry="14" fill="#FF8A3D" />
      {cara && (
        <g className="cara-calabaza" fill="#FFD36B">
          <path d="M11 17l4-5 3 5zM22 17l3-5 4 5z" />
          <path d="M9.5 23c3 5.5 18 5.5 21 0-2 1.6-3.6 2-5 2.1l-1.2 2-1.8-1.9c-1.6.1-3.4.1-5 0l-1.8 1.9-1.2-2c-1.4-.1-3-.5-5-2.1z" />
        </g>
      )}
    </svg>
  );
}

export function Murcielago({ s = 34 }: { s?: number }) {
  return (
    <svg width={s} height={s * 0.5} viewBox="0 0 40 20" className="murcielago">
      <g className="alas" fill="#14091F">
        <path d="M20 8c-2-3-6-5-11-5 1 2 1 4 0 6-3-1-6 0-9 2 4 1 7 4 8 8 2-3 6-5 12-5z" />
        <path d="M20 8c2-3 6-5 11-5-1 2-1 4 0 6 3-1 6 0 9 2-4 1-7 4-8 8-2-3-6-5-12-5z" />
      </g>
      <ellipse cx="20" cy="11" rx="3.2" ry="4.4" fill="#14091F" />
      <path d="M17.6 7.4l.8-2.4 1 2M22.4 7.4l-.8-2.4-1 2" fill="#14091F" />
    </svg>
  );
}

export function Telarana({ s = 120, lado = "izq" }: { s?: number; lado?: "izq" | "der" }) {
  const hilos = [0, 18, 36, 54, 72, 90];
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke="#fff" strokeOpacity=".32" strokeWidth=".9" style={lado === "der" ? { transform: "scaleX(-1)" } : undefined}>
      {hilos.map(g => <path key={g} d={`M0 0L${100 * Math.cos((g * Math.PI) / 180)} ${100 * Math.sin((g * Math.PI) / 180)}`} />)}
      {[22, 42, 62, 82].map(r => (
        <path key={r} d={hilos.slice(0, -1).map((g, k) => {
          const a = (g * Math.PI) / 180, b = ((hilos[k + 1] ?? g) * Math.PI) / 180;
          const m = ((g + 9) * Math.PI) / 180;
          return `${k ? "" : `M${r * Math.cos(a)} ${r * Math.sin(a)}`}Q${r * 0.84 * Math.cos(m)} ${r * 0.84 * Math.sin(m)} ${r * Math.cos(b)} ${r * Math.sin(b)}`;
        }).join("")} />
      ))}
    </svg>
  );
}

export function Arana({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="#14091F" strokeWidth="1.4" strokeLinecap="round">
      <path d="M6 8L1 5M6 10H0M6 12l-5 3M14 8l5-3M14 10h6M14 12l5 3" />
      <ellipse cx="10" cy="10" rx="4.5" ry="5" fill="#14091F" stroke="none" />
      <circle cx="8.6" cy="8.6" r=".9" fill="#FF8A3D" stroke="none" /><circle cx="11.4" cy="8.6" r=".9" fill="#FF8A3D" stroke="none" />
    </svg>
  );
}

export function Esfera({ s = 30, color = "#E5484D" }: { s?: number; color?: string }) {
  return (
    <svg width={s} height={s * 1.25} viewBox="0 0 20 25">
      <rect x="7.5" y="0" width="5" height="4" rx="1" fill="#D9B45A" />
      <circle cx="10" cy="14" r="9.5" fill={color} />
      <path d="M1.5 12.5c5 2.2 12 2.2 17 0" stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" fill="none" strokeDasharray="1.5 2" />
      <ellipse cx="6.6" cy="9.6" rx="2.2" ry="3.2" fill="#fff" fillOpacity=".35" transform="rotate(-30 6.6 9.6)" />
    </svg>
  );
}

export function Corbatin({ s = 30, color = "#4D7CFE" }: { s?: number; color?: string }) {
  return (
    <svg width={s} height={s * 0.6} viewBox="0 0 30 18">
      <path d="M15 9L2 1.5v15zM15 9l13-7.5v15z" fill={color} />
      <path d="M15 9L5 4.5v9z" fill="#000" fillOpacity=".12" />
      <rect x="12" y="5.5" width="6" height="7" rx="2" fill={color} stroke="#000" strokeOpacity=".18" />
    </svg>
  );
}

export function Estrella({ s = 14, color = "#FFD36B" }: { s?: number; color?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20"><path d="M10 0l2.6 7.4L20 10l-7.4 2.6L10 20l-2.6-7.4L0 10l7.4-2.6z" fill={color} /></svg>
  );
}

export function Lapiz({ s = 40, color = "#FFD23F" }: { s?: number; color?: string }) {
  return (
    <svg width={s * 0.3} height={s} viewBox="0 0 12 40">
      <rect x="1" y="0" width="10" height="5" rx="1.5" fill="#FF8FA3" />
      <rect x="1" y="5" width="10" height="2.2" fill="#C9CED6" />
      <rect x="1" y="7.2" width="10" height="24" fill={color} />
      <path d="M4.3 7.2v24M7.7 7.2v24" stroke="#000" strokeOpacity=".1" />
      <path d="M1 31.2h10L6 40z" fill="#F3D2A2" />
      <path d="M4.4 36.6h3.2L6 40z" fill="#3B3B3B" />
    </svg>
  );
}

export function Regla({ s = 54 }: { s?: number }) {
  return (
    <svg width={s} height={s * 0.22} viewBox="0 0 54 12">
      <rect x="0" y="0" width="54" height="12" rx="1.5" fill="#7FC8FF" />
      {Array.from({ length: 13 }, (_, k) => <path key={k} d={`M${3 + k * 4} 0v${k % 2 ? 3 : 5.5}`} stroke="#13305A" strokeOpacity=".6" />)}
    </svg>
  );
}

export function Libro({ s = 34 }: { s?: number }) {
  return (
    <svg width={s} height={s * 0.8} viewBox="0 0 34 27">
      <path d="M17 4C12 1 6 1 1 2.5v21C6 22 12 22 17 25z" fill="#fff" />
      <path d="M17 4c5-3 11-3 16-1.5v21C28 22 22 22 17 25z" fill="#E8EEF6" />
      <path d="M4.5 7.5c3-.6 6-.4 9 .8M4.5 11.5c3-.6 6-.4 9 .8M4.5 15.5c3-.6 6-.4 9 .8M20.5 8.3c3-1.2 6-1.4 9-.8M20.5 12.3c3-1.2 6-1.4 9-.8" stroke="#9AA3AF" strokeWidth=".9" fill="none" />
      <path d="M17 4v21" stroke="#9AA3AF" strokeWidth=".9" />
    </svg>
  );
}

export function Avion({ s = 36 }: { s?: number }) {
  return (
    <svg width={s} height={s * 0.6} viewBox="0 0 40 24">
      <path d="M0 10L40 0 14 15z" fill="#fff" />
      <path d="M14 15L40 0 22 24z" fill="#DCE6F2" />
      <path d="M14 15l1.5 7.5L22 24" fill="#B9C6D6" />
    </svg>
  );
}

/** Bandera de Colombia que ondea: franjas de 1/2, 1/4 y 1/4. Ondea por tiras (cada una sube y baja un poco después de la anterior) */
export function BanderaColombia({ ancho = 150, tiras = 18 }: { ancho?: number; tiras?: number }) {
  const alto = Math.round(ancho * (2 / 3));
  return (
    <div className="bandera" style={{ width: ancho + 6, height: alto + 40 }}>
      <span className="bandera-asta" />
      <div className="bandera-tela" style={{ width: ancho, height: alto }}>
        {Array.from({ length: tiras }, (_, k) => (
          <span key={k} className="bandera-tira" style={{ "--k": k, width: `${100 / tiras + 0.4}%`, left: `${(k * 100) / tiras}%`, "--sombra": `${0.1 * Math.sin(k / 2)}` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
