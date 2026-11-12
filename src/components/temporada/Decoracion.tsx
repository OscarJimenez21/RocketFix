/* Decoración de cada temporada (lib/temporada.ts). Se baja aparte y solo cuando hay temporada: el resto del año no pesa nada.
   Va detrás del contenido y no se puede tocar (pointer-events: none). Todo se mueve con transform y opacity; con
   «reducir movimiento» las piezas quedan quietas en su lugar.
   donde: portada (cielo de la portada), seccion («por presupuesto»), pie (borde de arriba del pie de página), franja (franja de arriba) */
import type { ReactNode } from "react";
import { TEMPORADA, type IdTemporada } from "../../lib/temporada";
import "./decoracion.css";
import {
  Arana, Avion, BanderaColombia, Calabaza, Copo, Corazon, Corbatin, Esfera, Estrella, Flor, Globo, Lapiz, Libro, Murcielago, Petalo, Regla, Telarana
} from "./Piezas";

type Donde = "portada" | "seccion" | "pie" | "franja";

/** Números «al azar» pero siempre iguales (la decoración no cambia de lugar entre una visita y otra) */
function azar(semilla: number) {
  let s = semilla;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
/** El color k de una lista que se repite (k puede ser mayor que la lista) */
const tono = (lista: readonly string[], k: number) => lista[k % lista.length] ?? "#ffffff";
const AZULES = ["#7FC8FF", "#FFFFFF", "#4D7CFE"];
const entre = (r: () => number, a: number, b: number) => a + (b - a) * r();

/** Piezas que caen (o suben) por todo el alto, cada una en su carril (ver .carril en decoracion.css) */
function Lluvia({ n, semilla, sube = false, dur = [9, 16], pieza, vaiven = true, clase = "" }: {
  n: number; semilla: number; sube?: boolean; dur?: [number, number]; vaiven?: boolean; clase?: string; pieza: (r: () => number, k: number) => ReactNode
}) {
  const r = azar(semilla);
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const d = entre(r, dur[0], dur[1]);
        const estilo = { left: `${entre(r, 1, 99)}%`, "--y": `${-entre(r, 5, 95)}%`, "--d": `${d}s`, "--r": `${-entre(r, 0, d)}s`, "--v": `${entre(r, 2.5, 5)}s` } as React.CSSProperties;
        return (
          <span key={k} className={`carril ${sube ? "sube" : "cae"} ${k % 3 === 2 ? "solo-ancho" : ""} ${clase}`} style={estilo}>
            <span className={vaiven ? "vaiven" : ""}>{pieza(r, k)}</span>
          </span>
        );
      })}
    </>
  );
}

/** Piezas que cruzan de un lado al otro (murciélagos, avión de papel) */
function Cruce({ n, semilla, dur = [14, 22], alto = [8, 45], pieza }: { n: number; semilla: number; dur?: [number, number]; alto?: [number, number]; pieza: (r: () => number, k: number) => ReactNode }) {
  const r = azar(semilla);
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const d = entre(r, dur[0], dur[1]);
        const estilo = { top: `${entre(r, alto[0], alto[1])}%`, "--x": `${-entre(r, 10, 90)}%`, "--d": `${d}s`, "--r": `${-entre(r, 0, d)}s` } as React.CSSProperties;
        return <span key={k} className={`cruce ${k % 2 ? "solo-ancho" : ""}`} style={estilo}><span className="vuelo">{pieza(r, k)}</span></span>;
      })}
    </>
  );
}

/** Guirnalda colgada en arcos a lo ancho (luces, banderines, corazones…). Los arcos son curvas; cada pieza cuelga de un punto */
function Guirnalda({ arcos = 6, alto = 34, pieza, porArco = 4, hilo = "#ffffff55", semilla = 7, abajo = false }: {
  arcos?: number; alto?: number; porArco?: number; hilo?: string; semilla?: number; abajo?: boolean; pieza: (k: number, r: () => number) => ReactNode
}) {
  const r = azar(semilla);
  const ancho = 1000;
  const paso = ancho / arcos;
  const y0 = 3;
  const curva = Array.from({ length: arcos }, (_, k) => `${k ? "" : `M0 ${y0}`}Q${paso * k + paso / 2} ${alto * 2 - y0} ${paso * (k + 1)} ${y0}`).join("");
  const puntos: { x: number; y: number }[] = [];
  for (let k = 0; k < arcos; k++) {
    for (let j = 1; j <= porArco; j++) {
      const t = j / (porArco + 1);
      const x = paso * k + paso * t;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (alto * 2 - y0) + t * t * y0;
      puntos.push({ x, y });
    }
  }
  return (
    <div className={`guirnalda ${abajo ? "guirnalda-abajo" : ""}`} style={{ height: alto + 30 }}>
      <svg viewBox={`0 0 ${ancho} ${alto + 4}`} preserveAspectRatio="none" style={{ height: alto + 4 }}>
        <path d={curva} fill="none" stroke={hilo} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {puntos.map((p, k) => (
        <span key={k} className="colgante" style={{ left: `${(p.x / ancho) * 100}%`, top: p.y - 1, "--k": k } as React.CSSProperties}>{pieza(k, r)}</span>
      ))}
    </div>
  );
}

const LUCES_NAVIDAD = ["#FF4D4D", "#FFD36B", "#4CD97B", "#5BA8FF", "#FF8AD8"];
const LUCES_DORADAS = ["#FFD36B", "#FFF3C4", "#FFB938", "#FFFFFF"];
const Bombillo = ({ c }: { c: string }) => <span className="bombillo" style={{ "--c": c } as React.CSSProperties} />;
const Banderin = ({ c, s = 18 }: { c: string; s?: number }) => <svg width={s} height={s * 1.15} viewBox="0 0 20 23"><path d="M0 0h20L10 23z" fill={c} /></svg>;
const COLOMBIA = ["#FCD116", "#003893", "#CE1126"];
const CONFETI = ["#FFD23F", "#FF5A8A", "#5BC8FF", "#4CD97B", "#B48CFF", "#FF8A3D"];
const Confeti = ({ r }: { r: () => number }) => (
  <span className="confeti" style={{ background: CONFETI[Math.floor(r() * CONFETI.length)], width: entre(r, 5, 9), height: entre(r, 8, 13), "--g": `${entre(r, -40, 40)}deg` } as React.CSSProperties} />
);

/** Fuegos artificiales: rayos que salen de un punto, se apagan y vuelven a empezar */
function Fuegos({ semilla, n = 4 }: { semilla: number; n?: number }) {
  const r = azar(semilla);
  const colores = ["#FFD36B", "#FF5A8A", "#7FE3FF", "#FFFFFF", "#B48CFF"];
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const c = colores[k % colores.length];
        const estilo = { left: `${entre(r, 6, 94)}%`, top: `${entre(r, 8, 55)}%`, "--r": `${-entre(r, 0, 3.6)}s`, "--t": entre(r, 0.7, 1.25) } as React.CSSProperties;
        return (
          <span key={k} className={`fuego ${k % 2 ? "solo-ancho" : ""}`} style={estilo}>
            {Array.from({ length: 12 }, (_, j) => <span key={j} className="rayo" style={{ "--g": `${j * 30}deg`, background: `linear-gradient(to top, transparent, ${c})` } as React.CSSProperties} />)}
          </span>
        );
      })}
    </>
  );
}

function Portada({ id }: { id: IdTemporada }) {
  switch (id) {
    case "navidad":
      return (
        <>
          <Guirnalda arcos={7} porArco={4} pieza={k => <Bombillo c={tono(LUCES_NAVIDAD, k)} />} hilo="#2E5E3A" />
          <Lluvia n={30} semilla={11} pieza={(r, k) => (k % 4 === 0 ? <Copo s={entre(r, 10, 16)} /> : <span className="punto-nieve" style={{ width: entre(r, 3, 6), height: entre(r, 3, 6) }} />)} />
          <span className="colgado izq"><span className="hilo" style={{ height: 40 }} /><Esfera color="#E5484D" s={26} /></span>
          <span className="colgado der"><span className="hilo" style={{ height: 46 }} /><Esfera color="#FFD36B" s={26} /></span>
          <span className="colgado der2 solo-ancho"><span className="hilo" style={{ height: 96 }} /><Esfera color="#3FB86A" s={22} /></span>
        </>
      );
    case "findeano":
      return (
        <>
          <Guirnalda arcos={7} porArco={4} pieza={k => <Bombillo c={tono(LUCES_DORADAS, k)} />} hilo="#ffffff40" />
          <Fuegos semilla={5} n={5} />
          <Lluvia n={22} semilla={23} dur={[7, 12]} pieza={r => <Confeti r={r} />} />
        </>
      );
    case "patria":
      return (
        <>
          <Guirnalda arcos={6} porArco={5} alto={30} pieza={k => <Banderin c={tono(COLOMBIA, k)} />} hilo="#ffffff66" />
          <span className="bandera-portada solo-ancho"><BanderaColombia ancho={130} /></span>
          <Lluvia n={14} semilla={31} dur={[10, 16]} pieza={(r, k) => <Estrella s={entre(r, 8, 13)} color={COLOMBIA[k % 3]} />} />
        </>
      );
    case "amistad":
      return <Lluvia n={22} semilla={41} sube dur={[10, 18]} pieza={(r, k) => <Corazon s={entre(r, 12, 28)} color={["#FF5A8A", "#FF9EC4", "#E5484D", "#FFC2D9"][k % 4]} />} />;
    case "halloween":
      return (
        <>
          <span className="esquina izq"><Telarana s={150} /></span>
          <span className="esquina der solo-ancho"><Telarana s={120} lado="der" /></span>
          <span className="arana"><span className="hilo" /><Arana /></span>
          <Cruce n={5} semilla={53} pieza={(r) => <Murcielago s={entre(r, 34, 56)} />} />
          <span className="calabaza-suelo" style={{ left: "2%" }}><Calabaza s={64} /></span>
          <span className="calabaza-suelo solo-ancho" style={{ left: "8.5%" }}><Calabaza s={40} /></span>
          <span className="calabaza-suelo" style={{ right: "2.5%" }}><Calabaza s={54} /></span>
        </>
      );
    case "madre":
      return (
        <>
          <Lluvia n={24} semilla={61} dur={[11, 18]} pieza={(r, k) => (k % 4 === 0 ? <Flor s={entre(r, 20, 30)} petalo={["#FF8FB8", "#C9A7FF", "#FFD1E3"][k % 3]} /> : <Petalo s={entre(r, 14, 22)} color={["#FFB3D1", "#FF8FB8", "#FFE1EC"][k % 3]} />)} />
          <span className="ramo izq"><Flor s={34} /><Flor s={24} petalo="#FFD1E3" /><Flor s={28} petalo="#C9A7FF" /></span>
        </>
      );
    case "padre":
      return (
        <>
          <Guirnalda arcos={6} porArco={5} alto={30} pieza={k => <Banderin c={tono(AZULES, k)} />} hilo="#ffffff55" />
          <Lluvia n={12} semilla={71} sube dur={[13, 20]} pieza={(r, k) => (k % 3 === 0 ? <Corbatin s={entre(r, 24, 34)} color={["#4D7CFE", "#7FC8FF", "#FFD36B"][k % 3]} /> : <Estrella s={entre(r, 8, 13)} color="#FFD36B" />)} />
        </>
      );
    case "nino":
      return (
        <>
          <Lluvia n={13} semilla={81} sube vaiven dur={[12, 20]} pieza={(r, k) => <Globo s={entre(r, 22, 34)} color={["#FF5A8A", "#FFD23F", "#5BC8FF", "#4CD97B", "#B48CFF"][k % 5]} />} />
          <Lluvia n={18} semilla={83} dur={[8, 13]} pieza={r => <Confeti r={r} />} />
        </>
      );
    case "clases":
      return (
        <>
          <Cruce n={2} semilla={91} dur={[16, 22]} alto={[12, 40]} pieza={() => <Avion s={38} />} />
          <Lluvia n={12} semilla={93} sube dur={[16, 24]} pieza={(r, k) => [<Lapiz key="l" s={entre(r, 30, 42)} color={["#FFD23F", "#FF8A3D", "#5BC8FF"][k % 3]} />, <Regla key="r" />, <Libro key="b" />, <span key="a" className="a-mas">A+</span>][k % 4]} />
        </>
      );
  }
}

function Seccion({ id }: { id: IdTemporada }) {
  switch (id) {
    case "navidad":
      return (
        <>
          <Lluvia n={18} semilla={12} pieza={(r, k) => (k % 3 === 0 ? <Copo s={entre(r, 9, 14)} /> : <span className="punto-nieve" style={{ width: entre(r, 3, 5), height: entre(r, 3, 5) }} />)} />
          <span className="colgado der" style={{ top: 0 }}><span className="hilo" style={{ height: 30 }} /><Esfera color="#E5484D" s={26} /></span>
          <span className="colgado der2 solo-ancho" style={{ top: 0 }}><span className="hilo" style={{ height: 58 }} /><Esfera color="#FFD36B" s={22} /></span>
        </>
      );
    case "findeano":
      return <><Fuegos semilla={9} n={3} /><Lluvia n={14} semilla={29} pieza={r => <Confeti r={r} />} /></>;
    case "patria":
      return (
        <>
          <Guirnalda arcos={5} porArco={5} alto={26} pieza={k => <Banderin c={tono(COLOMBIA, k)} s={15} />} hilo="#ffffff66" />
          <span className="bandera-seccion solo-ancho"><BanderaColombia ancho={170} /></span>
        </>
      );
    case "amistad":
      return <Lluvia n={14} semilla={43} sube dur={[11, 18]} pieza={(r, k) => <Corazon s={entre(r, 10, 22)} color={["#FF9EC4", "#FF5A8A", "#FFC2D9"][k % 3]} />} />;
    case "halloween":
      return (
        <>
          <span className="esquina der"><Telarana s={130} lado="der" /></span>
          <Cruce n={3} semilla={57} alto={[6, 30]} pieza={r => <Murcielago s={entre(r, 22, 34)} />} />
          <span className="calabaza-suelo solo-ancho" style={{ right: "2%", bottom: 10 }}><Calabaza s={44} /></span>
        </>
      );
    case "madre":
      return <Lluvia n={14} semilla={63} dur={[12, 18]} pieza={(r, k) => <Petalo s={entre(r, 10, 15)} color={["#FFB3D1", "#FF8FB8", "#FFE1EC"][k % 3]} />} />;
    case "padre":
      return <Lluvia n={10} semilla={73} sube dur={[14, 20]} pieza={(r, k) => (k % 2 ? <Estrella s={entre(r, 8, 12)} color="#FFD36B" /> : <Corbatin s={entre(r, 22, 30)} color="#7FC8FF" />)} />;
    case "nino":
      return <Lluvia n={8} semilla={85} sube dur={[13, 20]} pieza={(r, k) => <Globo s={entre(r, 20, 30)} color={["#FF5A8A", "#FFD23F", "#5BC8FF", "#4CD97B"][k % 4]} />} />;
    case "clases":
      return <Lluvia n={8} semilla={95} sube dur={[16, 24]} pieza={(r, k) => [<Lapiz key="l" s={entre(r, 28, 38)} />, <span key="a" className="a-mas">A+</span>, <Regla key="r" s={44} />][k % 3]} />;
  }
}

/** Borde de arriba del pie de página: una guirnalda de la temporada */
function Pie({ id }: { id: IdTemporada }) {
  const comun = { arcos: 8, alto: 22, porArco: 4 };
  switch (id) {
    case "navidad": return <Guirnalda {...comun} pieza={k => <Bombillo c={tono(LUCES_NAVIDAD, k)} />} hilo="#2E5E3A" />;
    case "findeano": return <Guirnalda {...comun} pieza={k => <Bombillo c={tono(LUCES_DORADAS, k)} />} hilo="#ffffff40" />;
    case "patria": return <Guirnalda {...comun} porArco={5} pieza={k => <Banderin c={tono(COLOMBIA, k)} s={14} />} hilo="#ffffff66" />;
    case "amistad": return <Guirnalda {...comun} pieza={k => <Corazon s={13} color={k % 2 ? "#FF9EC4" : "#FF5A8A"} />} hilo="#ffffff55" />;
    case "halloween": return <Guirnalda {...comun} porArco={3} pieza={k => (k % 3 === 1 ? <Murcielago s={22} /> : <Calabaza s={20} cara={k % 2 === 0} />)} hilo="#ffffff40" />;
    case "madre": return <Guirnalda {...comun} pieza={k => <Flor s={15} petalo={["#FF8FB8", "#FFD1E3", "#C9A7FF"][k % 3]} />} hilo="#ffffff55" />;
    case "padre": return <Guirnalda {...comun} porArco={5} pieza={k => <Banderin c={tono(AZULES, k)} s={14} />} hilo="#ffffff55" />;
    case "nino": return <Guirnalda {...comun} porArco={5} pieza={k => <Banderin c={tono(CONFETI, k)} s={14} />} hilo="#ffffff55" />;
    case "clases": return <Guirnalda {...comun} porArco={3} pieza={k => (k % 2 ? <span className="a-mas pequeno">A+</span> : <Lapiz s={22} color={["#FFD23F", "#FF8A3D", "#5BC8FF"][k % 3]} />)} hilo="#ffffff55" />;
  }
}

/** Franja de arriba: piezas pequeñas a los lados y, en algunas, una cinta de colores abajo */
function Franja({ id }: { id: IdTemporada }) {
  const lados = (a: ReactNode, b: ReactNode = a) => (
    <>
      <span className="franja-lado izq">{a}</span>
      <span className="franja-lado der">{b}</span>
    </>
  );
  switch (id) {
    case "navidad": return <>{lados(<><Esfera s={14} color="#E5484D" /><Copo s={12} /><Esfera s={12} color="#FFD36B" /></>)}<span className="cinta baston" /></>;
    case "findeano": return lados(<><Estrella s={12} /><Estrella s={9} color="#fff" /><Estrella s={12} /></>);
    case "patria": return <>{lados(<BanderaColombia ancho={30} tiras={8} />)}<span className="cinta tricolor" /></>;
    case "amistad": return lados(<><Corazon s={13} /><Corazon s={10} color="#FFC2D9" /><Corazon s={13} /></>);
    case "halloween": return <>{lados(<><Calabaza s={20} /><Murcielago s={22} /></>, <><Murcielago s={22} /><Calabaza s={20} /></>)}<span className="cinta halloween" /></>;
    case "madre": return lados(<><Flor s={16} /><Flor s={12} petalo="#C9A7FF" /></>);
    case "padre": return lados(<Corbatin s={22} color="#7FC8FF" />);
    case "nino": return lados(<><Globo s={11} color="#FF5A8A" /><Globo s={11} color="#FFD23F" /><Globo s={11} color="#5BC8FF" /></>);
    case "clases": return lados(<><Lapiz s={20} /><span className="a-mas pequeno">A+</span></>);
  }
}

export default function Decoracion({ donde }: { donde: Donde }) {
  const t = TEMPORADA;
  if (!t) return null;
  const Pieza = { portada: Portada, seccion: Seccion, pie: Pie, franja: Franja }[donde];
  return <div aria-hidden="true" className={`deco deco-${donde}`} data-t={t.id}><Pieza id={t.id} /></div>;
}
