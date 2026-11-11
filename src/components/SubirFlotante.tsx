/* Animación 50: botón flotante para volver arriba. Aparece después de bajar un buen trecho (1,5 pantallas) y, al tocarlo,
   el cohete despega mientras la página sube. Va abajo a la derecha, justo encima del botón de WhatsApp (y de la barra de
   «Agregar» del producto si se ve). */
import { useEffect, useState } from "react";
import { activa } from "../lib/animaciones";
import { Cohete } from "./Logo";

export function SubirFlotante() {
  const [ver, setVer] = useState(false);
  const [despega, setDespega] = useState(false);
  const encendida = activa(50);

  useEffect(() => {
    if (!encendida) return;
    let cuadro = 0;
    const revisar = () => {
      cuadro = 0;
      setVer(window.scrollY > window.innerHeight * 1.5);
    };
    const alBajar = () => { if (!cuadro) cuadro = requestAnimationFrame(revisar); };
    revisar();
    window.addEventListener("scroll", alBajar, { passive: true });
    window.addEventListener("resize", alBajar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alBajar);
      window.removeEventListener("resize", alBajar);
      cancelAnimationFrame(cuadro);
    };
  }, [encendida]);

  // Al llegar arriba, el cohete vuelve a su lugar para la próxima vez
  useEffect(() => { if (!ver) setDespega(false); }, [ver]);

  if (!encendida) return null;

  const subir = () => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setDespega(true);
    window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
    // El foco vuelve al principio (al logo), para que quien usa el teclado siga desde arriba
    document.querySelector<HTMLElement>(".cabecera a")?.focus({ preventScroll: true });
  };

  return (
    <button type="button" onClick={subir} aria-label="Volver arriba" tabIndex={ver ? 0 : -1} aria-hidden={!ver || undefined}
      className={`presionable fixed bottom-[calc(5.25rem+max(var(--barra-abajo,0px),env(safe-area-inset-bottom,0px)))] right-[22px] z-40 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-linea bg-white text-marca shadow-flota transition-[opacity,transform] duration-300 ease-salida hover:border-marca sm:right-[30px] ${ver ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"} ${despega ? "subir-despega" : ""}`}>
      <Cohete className="h-6 w-6" />
    </button>
  );
}
