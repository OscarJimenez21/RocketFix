import { useEffect, useRef, useState } from "react";
import { useTienda } from "../estado/TiendaContext";
import { activa } from "../lib/animaciones";
import { IconoCheck } from "./Iconos";

/** Aviso breve abajo de la pantalla (ej.: "Agregaste … al carrito"), con botón para ver el carrito.
    Sale igual que entró (baja y se desvanece): guarda el último texto mientras se va, para no desaparecer de golpe. */
export function Aviso() {
  const { aviso, avisoVez, avisar, abrirCarrito, carritoAbierto } = useTienda();
  // Animación 28: al agregar, un ✓ que se dibuja y una línea abajo que se acorta hasta que el aviso se va (4,2 s)
  const conLinea = activa(28);
  const [texto, setTexto] = useState(aviso);
  useEffect(() => { if (aviso) setTexto(aviso); }, [aviso]);
  const visible = Boolean(aviso) && !carritoAbierto;
  const agregado = texto.startsWith("Agregaste");
  // Mientras está escondido no se puede tocar ni enfocar el botón «Ver carrito»
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => { if (caja.current) caja.current.inert = !visible; }, [visible]);
  return (
    <>
      {/* Lo que leen los lectores de pantalla (solo el aviso nuevo, no el que se está yendo) */}
      <div role="status" aria-live="polite" className="sr-only">{aviso}</div>
      <div ref={caja}
        className={`fixed bottom-[calc(1rem+max(var(--barra-abajo,0px),env(safe-area-inset-bottom,0px)))] left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-[opacity,transform] duration-200 ease-salida ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        {texto && (
          <div className="relative flex items-center gap-3 overflow-hidden rounded-md bg-oscuro px-4 py-3 text-sm text-white shadow-flota">
            {conLinea && agregado && <IconoCheck key={`ok-${avisoVez}`} className="dibujar h-4 w-4 shrink-0 text-marca-menta [--retraso:120ms]" />}
            <span aria-hidden="true" className="flex-1">{texto}</span>
            {agregado && <button type="button" onClick={() => { avisar(""); abrirCarrito(); }} className="shrink-0 font-semibold text-marca-menta hover:underline">Ver carrito</button>}
            {conLinea && aviso && <span key={avisoVez} aria-hidden="true" className="aviso-cuenta absolute inset-x-0 bottom-0 h-[3px] bg-marca-menta/70" />}
          </div>
        )}
      </div>
    </>
  );
}
