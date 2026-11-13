/* Adorno del cohete del logo en cada temporada (mejora 6). Va pegado al cohete: si el cohete se mueve, el adorno también.
   Son dibujos pequeños; el logo (forma, colores y proporción) no cambia. */
import type { IdTemporada } from "../../lib/temporada";

const ADORNOS: Record<IdTemporada, { clase: string; dibujo: JSX.Element }> = {
  // Gorrito rojo con borde y pompón blancos sobre la punta
  navidad: {
    clase: "gorrito",
    dibujo: (
      <svg viewBox="0 0 20 16"><path d="M3 12C5 6 9 2.5 15 2.5l-1.8 4.2L17 12z" fill="#E53935" />
        <rect x="1.5" y="11" width="16.5" height="3.6" rx="1.8" fill="#FFFFFF" /><circle cx="15.6" cy="2.6" r="2.1" fill="#FFFFFF" /></svg>
    )
  },
  // Gorro de fiesta dorado
  findeano: {
    clase: "adorno-arriba",
    dibujo: (
      <svg viewBox="0 0 20 20"><path d="M10 2L16.5 18h-13z" fill="#FFC93C" />
        <path d="M7.4 9.5h5.2M5.6 14h8.8" stroke="#E5484D" strokeWidth="1.8" /><circle cx="10" cy="2.4" r="2.2" fill="#FFFFFF" /></svg>
    )
  },
  // Lápiz al lado
  clases: {
    clase: "adorno-lado",
    dibujo: (
      <svg viewBox="0 0 20 20"><g transform="rotate(35 10 10)"><rect x="7.6" y="0.5" width="4.8" height="3" rx="1" fill="#FF8FA3" />
        <rect x="7.6" y="3.5" width="4.8" height="10" fill="#FFD23F" /><path d="M7.6 13.5h4.8L10 19z" fill="#F3D2A2" /><path d="M9.2 17.2h1.6L10 19z" fill="#333" /></g></svg>
    )
  },
  // Globo amarrado
  nino: {
    clase: "adorno-globo",
    dibujo: (
      <svg viewBox="0 0 20 30"><path d="M10 15c-1 3 1.6 5 0 8s.8 4 0 7" stroke="#9AA3AF" strokeWidth=".9" fill="none" />
        <ellipse cx="10" cy="8" rx="6.5" ry="7.6" fill="#FF5A8A" /><path d="M8.8 15.4h2.4L10 16.8z" fill="#FF5A8A" />
        <ellipse cx="7.6" cy="5.2" rx="1.5" ry="2.4" fill="#fff" fillOpacity=".45" transform="rotate(-20 7.6 5.2)" /></svg>
    )
  },
  // Flor
  madre: {
    clase: "adorno-lado",
    dibujo: (
      <svg viewBox="0 0 20 20">{[0, 72, 144, 216, 288].map(g => <ellipse key={g} cx="10" cy="5.2" rx="3.4" ry="4.6" fill="#FF8FB8" transform={`rotate(${g} 10 10)`} />)}
        <circle cx="10" cy="10" r="3" fill="#FFD23F" /></svg>
    )
  },
  // Corbatín
  padre: {
    clase: "adorno-corbatin",
    dibujo: (
      <svg viewBox="0 0 30 18"><path d="M15 9L2 1.5v15zM15 9l13-7.5v15z" fill="#4D7CFE" />
        <rect x="12" y="5.5" width="6" height="7" rx="2" fill="#2F5BD3" /></svg>
    )
  },
  // Estrella dorada (temporada de prima, idea 94)
  prima: {
    clase: "adorno-lado",
    dibujo: (
      <svg viewBox="0 0 20 20"><path d="M10 1.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.4l-5.1 2.8L6 11.5 1.7 7.5l5.8-.7z" fill="#FFC93C" stroke="#E0A400" strokeWidth=".8" strokeLinejoin="round" /></svg>
    )
  },
  // Bandera de Colombia en su asta
  patria: {
    clase: "adorno-bandera",
    dibujo: (
      <svg viewBox="0 0 20 20"><rect x="1.5" y="1" width="1.4" height="18" rx=".7" fill="#C9CED6" />
        <g className="tela-adorno"><rect x="2.9" y="2" width="15" height="5" fill="#FCD116" /><rect x="2.9" y="7" width="15" height="2.5" fill="#003893" />
          <rect x="2.9" y="9.5" width="15" height="2.5" fill="#CE1126" /></g></svg>
    )
  },
  // Corazón
  amistad: {
    clase: "adorno-lado adorno-late",
    dibujo: (
      <svg viewBox="0 0 20 20"><path d="M10 17.5s-6.4-3.9-7.9-8C1 6.5 2.9 3.5 5.9 3.5c1.7 0 3 .9 4.1 2.4 1.1-1.5 2.4-2.4 4.1-2.4 3 0 4.9 3 3.8 6-1.5 4.1-7.9 8-7.9 8z" fill="#FF5A8A" /></svg>
    )
  },
  // Calabaza
  halloween: {
    clase: "adorno-lado",
    dibujo: (
      <svg viewBox="0 0 40 36"><path d="M20 8c0-3 1.5-5.5 4-7" stroke="#3E7D3A" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="12" cy="21" rx="10" ry="13" fill="#E86A1C" /><ellipse cx="28" cy="21" rx="10" ry="13" fill="#E86A1C" /><ellipse cx="20" cy="21" rx="10" ry="14" fill="#FF8A3D" />
        <path d="M11 17l4-5 3 5zM22 17l3-5 4 5zM9.5 23c3 5.5 18 5.5 21 0-4 3-17 3-21 0z" fill="#3B1D0A" /></svg>
    )
  }
};

export function AdornoLogo({ id }: { id: IdTemporada }) {
  const a = ADORNOS[id];
  return <span aria-hidden="true" className={`adorno-logo ${a.clase}`}>{a.dibujo}</span>;
}
