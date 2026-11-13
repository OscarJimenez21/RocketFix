/* Botón flotante de WhatsApp (abajo a la derecha, en todas las páginas): abre el chat de la tienda. Lleva un cohetico
   como el del logo. A los pocos segundos de la visita sale un mensaje invitando a escribir:
     · En computador: una tarjeta tipo chat con el logo, el estado de atención (según el horario), el mensaje y «Iniciar chat».
     · En celular: una burbuja corta, para no tapar la página.
   El mensaje se puede cerrar con la X; cerrado, no vuelve a salir en 3 días. Sale una sola vez por visita.
   Animación 55: la entrada del mensaje, la onda del botón y el cohetico que despega con el mouse encima. */
import { useEffect, useState } from "react";
import { CONFIG } from "../data/catalogo";
import { estadoAtencion } from "../lib/horario";
import { waLink } from "../lib/whatsapp";
import { IconoCerrar, IconoWhatsApp } from "./Iconos";
import { Cohete } from "./Logo";

const CERRADO = "rf-wa-aviso-cerrado";
const VISTO = "rf-wa-aviso-visto";
const TRES_DIAS = 3 * 24 * 60 * 60 * 1000;
const ESPERA = 6000;
const MENSAJE = "Si quieres comunicarte con nosotros, inicia tu chat aquí.";
/** Idea 95: preguntas rápidas (texto del botón, mensaje que se escribe en WhatsApp) */
const RAPIDAS = [
  ["Disponibilidad", "quiero saber si tienen disponible "],
  ["Envíos", "quiero saber cuánto tarda y cuánto vale el envío a "],
  ["Reparación", "quiero cotizar la reparación de mi "],
  ["Mi pedido", "quiero saber en qué va mi pedido "]
] as const;

function puedeMostrar() {
  try {
    if (sessionStorage.getItem(VISTO)) return false;
    const cerrado = Number(localStorage.getItem(CERRADO) || 0);
    return !cerrado || Date.now() - cerrado > TRES_DIAS;
  } catch {
    return true;
  }
}

export function WhatsAppFlotante() {
  const [aviso, setAviso] = useState(false);
  const enlace = waLink(`Hola ${CONFIG.nombre}, `);

  useEffect(() => {
    if (!puedeMostrar()) return;
    const t = window.setTimeout(() => {
      setAviso(true);
      try { sessionStorage.setItem(VISTO, "1"); } catch { /* sin almacenamiento */ }
    }, ESPERA);
    return () => window.clearTimeout(t);
  }, []);

  // En celular la burbuja se va sola a los 12 s (en computador se queda hasta que la cierren)
  useEffect(() => {
    if (!aviso || window.matchMedia("(min-width: 768px)").matches) return;
    const t = window.setTimeout(() => setAviso(false), 12000);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const cerrar = () => {
    setAviso(false);
    try { localStorage.setItem(CERRADO, String(Date.now())); } catch { /* sin almacenamiento */ }
  };

  const estado = estadoAtencion();

  return (
    <>
      {aviso && (
        <>
          {/* Computador: tarjeta tipo chat */}
          <div role="dialog" aria-label="Escríbenos por WhatsApp"
            className="wa-aviso fixed bottom-[calc(1rem+max(var(--barra-abajo,0px),env(safe-area-inset-bottom,0px)))] right-[92px] z-40 hidden w-[330px] overflow-hidden rounded-xl border border-linea bg-superficie text-tinta shadow-flota md:block">
            <div className="flex items-center gap-3 bg-[#0F3D2E] px-4 py-3 text-white">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Cohete className="h-6 w-6 text-marca-menta" />
                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0F3D2E] ${estado.abierto ? "bg-wa-vivo" : "bg-white/50"}`} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-bold leading-tight">{CONFIG.nombre}</span>
                <span className="block truncate text-xs text-white/75">{estado.texto}</span>
              </span>
              <button type="button" onClick={cerrar} aria-label="Cerrar mensaje"
                className="presionable -mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
                <IconoCerrar className="h-4 w-4" />
              </button>
            </div>
            <div className="wa-fondo px-4 pb-4 pt-4">
              <p className="wa-burbuja relative max-w-[88%] rounded-lg rounded-tl-none bg-superficie px-3.5 py-2.5 text-[14px] leading-snug shadow-sm">
                ¡Hola! 👋 {MENSAJE}
              </p>
              {/* Idea 96: fuera del horario, se dice cuándo respondemos (el mensaje se puede dejar escrito igual) */}
              {!estado.abierto && (
                <p className="wa-burbuja relative mt-2 max-w-[88%] rounded-lg rounded-tl-none bg-superficie px-3.5 py-2.5 text-[13px] leading-snug text-tinta-2 shadow-sm">
                  Ahora estamos cerrados. Déjanos tu mensaje y te respondemos cuando volvamos a abrir.
                </p>
              )}
              {/* Idea 95: preguntas rápidas que abren WhatsApp con el mensaje escrito */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {RAPIDAS.map(([t, m]) => (
                  <a key={t} href={waLink(`Hola ${CONFIG.nombre}, ${m}`)} target="_blank" rel="noopener" onClick={() => setAviso(false)}
                    className="rounded-full border border-wa/40 bg-superficie px-3 py-1.5 text-[13px] font-semibold text-tinta hover:border-wa">{t}</a>
                ))}
              </div>
              <a href={enlace} target="_blank" rel="noopener" onClick={() => setAviso(false)} className="btn btn-wa mt-4 w-full">
                <IconoWhatsApp className="h-5 w-5" />Iniciar chat
              </a>
            </div>
          </div>

          {/* Celular: burbuja corta */}
          <div className="wa-aviso fixed bottom-[calc(1.5rem+max(var(--barra-abajo,0px),env(safe-area-inset-bottom,0px)))] right-[84px] z-40 flex max-w-[calc(100vw-100px)] items-center rounded-full border border-linea bg-superficie pl-4 text-[13px] font-semibold text-tinta shadow-flota md:hidden">
            <a href={enlace} target="_blank" rel="noopener" onClick={() => setAviso(false)} className="py-2.5 leading-tight">
              ¿Hablamos? Inicia tu chat aquí
            </a>
            <button type="button" onClick={cerrar} aria-label="Cerrar mensaje" className="flex h-10 w-10 shrink-0 items-center justify-center text-tinta-3">
              <IconoCerrar className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      <a href={enlace} target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"
        className={`wa-flotante presionable group fixed bottom-[calc(1rem+max(var(--barra-abajo,0px),env(safe-area-inset-bottom,0px)))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-wa-vivo text-white shadow-flota sm:right-6 ${aviso ? "wa-llama" : ""}`}>
        <IconoWhatsApp className="h-7 w-7" />
        {/* El cohetico de Rocket Fix en la esquina */}
        <span aria-hidden="true" className="wa-cohete absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0F3D2E]">
          <Cohete className="h-4 w-4 rotate-45 text-marca-menta" />
        </span>
      </a>
    </>
  );
}
