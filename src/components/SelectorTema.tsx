/* Idea 30: selector del modo noche. Tres opciones en una pastilla: Día, Noche y Automático (sigue el ajuste del
   equipo). Va en el menú lateral y en el pie de página; la cabecera en computador tiene un botón rápido (BotonTema) */
import { useAjuste } from "../lib/accesibilidad";
import { useTema, type Tema } from "../lib/tema";
import { IconoLuna, IconoSol, IconoTelefono } from "./Iconos";

/** Centro del botón tocado: de ahí se abre el círculo con los colores nuevos (animación 73) */
const centroDe = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const OPCIONES: { valor: Tema; nombre: string; icono: JSX.Element }[] = [
  { valor: "claro", nombre: "Día", icono: <IconoSol className="h-4 w-4" /> },
  { valor: "noche", nombre: "Noche", icono: <IconoLuna className="h-4 w-4" /> },
  { valor: "auto", nombre: "Automático", icono: <IconoTelefono className="h-4 w-4" /> }
];

export function SelectorTema({ oscuro = false }: { oscuro?: boolean }) {
  const [tema, elegir] = useTema();
  return (
    <div role="radiogroup" aria-label="Colores de la página"
      className={`selector-tema relative inline-flex rounded-full border p-0.5 ${oscuro ? "border-white/20 bg-white/5" : "border-linea-fuerte bg-fondo"}`}>
      {OPCIONES.map(o => {
        const activo = tema === o.valor;
        return (
          <button key={o.valor} type="button" role="radio" aria-checked={activo} onClick={e => elegir(o.valor, centroDe(e))}
            title={o.valor === "auto" ? "Sigue el ajuste claro u oscuro de tu teléfono o computador" : o.nombre}
            className={`presionable inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ${
              activo
                ? oscuro ? "bg-marca-menta text-marca-noche" : "bg-superficie text-tinta shadow-sm"
                : oscuro ? "text-white/75 hover:text-white" : "text-tinta-2 hover:text-tinta"}`}>
            <span key={activo ? "si" : "no"} className={activo ? "icono-tema" : ""}>{o.icono}</span>
            {/* En pantallas pequeñas «Automático» va solo con el ícono (el nombre queda para lectores de pantalla) */}
            <span className={o.valor === "auto" ? "sr-only sm:not-sr-only" : ""}>{o.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Ideas 84 y 85: «Letra más grande» y «Más contraste», como interruptores (en el menú lateral y en el pie) */
export function AjustesLectura({ oscuro = false }: { oscuro?: boolean }) {
  const [letra, setLetra] = useAjuste("letra");
  const [contraste, setContraste] = useAjuste("contraste");
  const boton = (activo: boolean) => `presionable inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3 text-[13px] font-semibold ${
    activo
      ? oscuro ? "border-marca-menta bg-marca-menta text-marca-noche" : "border-marca bg-marca text-white"
      : oscuro ? "border-white/20 text-white/80 hover:text-white" : "border-linea-fuerte text-tinta-2 hover:text-tinta"}`;
  return (
    <div role="group" aria-label="Ajustes de lectura" className="mt-2.5 flex flex-wrap gap-2">
      <button type="button" aria-pressed={letra} onClick={() => setLetra(!letra)} className={boton(letra)}>
        <span aria-hidden="true" className="font-display text-[15px] leading-none">A<span className="text-[11px]">A</span></span>Letra más grande
      </button>
      <button type="button" aria-pressed={contraste} onClick={() => setContraste(!contraste)} className={boton(contraste)}>
        <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border-2 border-current [background:linear-gradient(90deg,currentColor_50%,transparent_50%)]" />Más contraste
      </button>
    </div>
  );
}

/** Botón rápido de la cabecera (computador): cambia entre día y noche con un toque */
export function BotonTema() {
  const [tema, elegir] = useTema();
  const noche = tema === "noche" || (tema === "auto" && document.documentElement.dataset.tema === "noche");
  return (
    <button type="button" onClick={e => elegir(noche ? "claro" : "noche", centroDe(e))}
      aria-label={noche ? "Usar colores de día" : "Usar modo noche"} title={noche ? "Colores de día" : "Modo noche"}
      className="presionable hidden h-11 w-11 items-center justify-center rounded-full text-tinta-2 hover:bg-fondo hover:text-tinta lg:flex">
      {/* Animación 74: el sol o la luna entra girando */}
      <span key={noche ? "sol" : "luna"} className="icono-tema">{noche ? <IconoSol /> : <IconoLuna />}</span>
    </button>
  );
}
