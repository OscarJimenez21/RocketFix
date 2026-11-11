/* Comportamiento compartido de los paneles que se abren encima de la página (el carrito y el menú). Antes cada uno tenía
   su copia de estas reglas, con pequeñas diferencias entre las dos:
   - Abierto: la página de atrás no se puede usar ni desplazar, el foco entra al panel y Esc lo cierra.
   - Al cerrar: el foco vuelve a donde estaba (el botón que abrió el panel).
   - Cerrado: el panel no se puede enfocar ni lo leen los lectores de pantalla. */
import { useEffect, type RefObject } from "react";

/** `cerrar` debe ser siempre la misma función (useCallback): si cambiara en cada dibujo, el panel se reiniciaría y el foco
    saltaría al botón de cerrar */
export function usePanelModal(abierto: boolean, cerrar: () => void, panel: RefObject<HTMLElement>, primerFoco: RefObject<HTMLElement>) {
  useEffect(() => { if (panel.current) panel.current.inert = !abierto; }, [abierto, panel]);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement;
    const elPanel = panel.current;
    const pagina = document.getElementById("pagina");
    document.documentElement.style.overflow = "hidden";
    if (pagina) pagina.inert = true;
    const reloj = window.setTimeout(() => primerFoco.current?.focus(), 30);
    const alTecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    document.addEventListener("keydown", alTecla);
    return () => {
      window.clearTimeout(reloj);
      document.documentElement.style.overflow = "";
      if (pagina) pagina.inert = false;
      document.removeEventListener("keydown", alTecla);
      // Safari no enfoca los botones al hacer clic: si no había foco previo, se suelta el del panel que se cierra
      if (previo instanceof HTMLElement && previo !== document.body) previo.focus();
      else if (document.activeElement instanceof HTMLElement && elPanel?.contains(document.activeElement)) document.activeElement.blur();
    };
  }, [abierto, cerrar, panel, primerFoco]);
}
