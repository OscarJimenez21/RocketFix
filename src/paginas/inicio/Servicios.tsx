import { useMemo, useRef, useState } from "react";
import { PAQUETES, SERVICIOS } from "../../data/catalogo";
import { camposServicio } from "../../data/formularios";
import { FormularioWhatsApp } from "../../components/FormularioWhatsApp";
import { IconoTrabajo } from "../../components/IconoTrabajo";
import { Ilustracion } from "../../components/Ilustracion";
import { useRevelarHijos, useVisto } from "../../lib/enPantalla";
import { dinero, recurso } from "../../lib/formato";
import type { Servicio } from "../../types";
import { suave } from "../../lib/animaciones";
import { hrefDe } from "../../lib/rutas";

/** Instalación de cámaras: línea de negocio propia, con sus paquetes de referencia (los mismos del artículo) */
function Camaras({ servicio, cotizar }: { servicio: Servicio; cotizar: () => void }) {
  return (
    <article aria-labelledby="t-camaras" className="mt-4 overflow-hidden rounded-md bg-marca-oscuro text-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="p-6 sm:p-8">
        <p className="etiqueta flex items-center gap-2.5 text-marca-menta">
          {/* Animación 36: el punto rojo de «REC» parpadea, como en una cámara que está grabando */}
          <span aria-hidden="true" className="rec inline-flex items-center gap-1 rounded-sm bg-black/25 px-1.5 py-0.5 text-[11px] font-bold tracking-wider text-white/90">
            <span className="rec-punto h-2 w-2 rounded-full bg-red-500" />REC
          </span>
          Seguridad para tu hogar o negocio
        </p>
        <h3 id="t-camaras" className="mt-1 text-[22px] font-extrabold text-white sm:text-2xl">Instalación de cámaras de seguridad</h3>
        <p className="mt-2 text-white/80">{servicio.texto}</p>
        <ul className="mt-4 grid gap-2 text-sm text-white/90">
          {servicio.trabajos.map(t => <li key={t} className="flex gap-2.5"><IconoTrabajo texto={t} className="mt-0.5 h-[18px] w-[18px] shrink-0 text-marca-menta" />{t}</li>)}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={cotizar} className="btn btn-primario">Cotizar instalación</button>
          <a href={hrefDe("blog-camaras")} className="btn btn-claro">Paquetes y preguntas frecuentes</a>
        </div>
      </div>
      <div className="border-t border-white/10 bg-marca-noche/40 p-6 sm:p-8 lg:border-l lg:border-t-0">
        <p className="etiqueta text-white/70">Paquetes de referencia</p>
        <ul className="mt-2 divide-y divide-white/10">
          {PAQUETES.map(pk => (
            <li key={pk.nombre} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-12 shrink-0 items-center justify-center claro-siempre rounded bg-white"><Ilustracion nombre={pk.ilustracion} className="h-8 w-10 text-marca-medio" /></span>
                <div className="min-w-0"><p className="font-semibold">{pk.nombre}</p><p className="text-xs text-white/70">{pk.specs.join(" · ")}</p></div>
              </div>
              <p className="shrink-0 text-right"><span className="block text-xs text-white/60">Desde</span><b className="font-display tabular-nums">{dinero(pk.desde)}</b></p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-white/70">Valores de referencia con instalación incluida. El precio final depende de la distancia del cableado y de la altura de los puntos; te lo confirmamos en la visita técnica.</p>
      </div>
    </article>
  );
}

/** Encabezado de color de cada tarjeta de reparación, con un equipo recortado (public/fotos/recortes) */
type EstiloServicio = { caja: string; frase: string; texto: string; foto: string; posicion: string };
const ESTILO_SERVICIO: { pc: EstiloServicio; cel: EstiloServicio } & Record<string, EstiloServicio | undefined> = {
  pc: { caja: "bg-marca-oscuro text-white", frase: "text-marca-menta", texto: "text-white/80", foto: "p52396", posicion: "-bottom-2 h-[82%]" },
  cel: { caja: "bg-acento text-acento-tinta", frase: "text-acento-tinta/75", texto: "text-acento-tinta/80", foto: "ip18p", posicion: "-bottom-6 h-[98%]" }
};

/** Servicio técnico: tarjetas de reparación, la de cámaras y el formulario que arma la solicitud para WhatsApp */
export function Servicios() {
  const titulos = [...SERVICIOS.map(s => s.titulo), "Otro servicio"];
  const [elegido, setElegido] = useState(titulos[0] ?? "");
  const servicio = SERVICIOS.find(s => s.titulo === elegido);
  const campos = useMemo(() => camposServicio(servicio, titulos), [servicio]); // eslint-disable-line react-hooks/exhaustive-deps
  const solicitar = (titulo: string) => {
    setElegido(titulo);
    const caja = document.getElementById("orden");
    caja?.scrollIntoView({ behavior: suave(), block: "start" });
    caja?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
  };
  const reparacion = SERVICIOS.filter(s => !s.camaras);
  const camaras = SERVICIOS.find(s => s.camaras);
  // La primera vez que se ve cada tarjeta, el equipo sube a su lugar y los ✓ de «Qué hacemos» se marcan uno tras otro
  const tarjetas = useRef<HTMLDivElement>(null);
  useRevelarHijos(tarjetas);
  // Los 3 pasos de «Solicita un servicio» se encienden uno tras otro, como los de «Cómo comprar»
  const pasosOrden = useRef<HTMLOListElement>(null);
  const ordenVisto = useVisto(pasosOrden);
  return (
    <section id="servicios" aria-labelledby="t-servicios" className="curva-arriba textura-orbitas border-b border-linea bg-fondo">
      <div className="contenedor py-12 sm:py-14">
        <div className="max-w-2xl">
          <h2 id="t-servicios" className="titulo-seccion titulo-trazo">Reparamos tus equipos e instalamos cámaras de seguridad</h2>
          <p className="mt-2 text-tinta-2">Te decimos el valor antes de reparar. Coordinamos por WhatsApp cómo recibir tu equipo y vamos a tu casa o negocio para instalar cámaras.</p>
        </div>
        <div ref={tarjetas} className="mt-8 grid gap-4 md:grid-cols-2">
          {reparacion.map(s => {
            const e = ESTILO_SERVICIO[s.id] ?? ESTILO_SERVICIO.pc;
            return (
              <article key={s.id} className="flex flex-col overflow-hidden rounded-xl border border-linea bg-superficie shadow-tarjeta">
                {/* Encabezado de color: texto a la izquierda y el equipo recortado en su propia columna (no se montan).
                    Las tarjetas son angostas en celular y en md (dos columnas), y anchas en sm y lg. */}
                <div data-revelar className={`revelar relative isolate flex min-h-[210px] gap-2 overflow-hidden ${e.caja}`}>
                  <div className="relative z-10 min-w-0 flex-1 self-center py-6 pl-6 sm:py-7 sm:pl-7">
                    <h3 className="font-display text-[23px] font-extrabold leading-[1.02] text-current ancho-108 sm:text-[30px] md:text-[24px] lg:text-[30px]">{s.titulo}</h3>
                    <p className={`mt-2 text-sm leading-snug ${e.texto}`}>{s.texto}</p>
                  </div>
                  <div aria-hidden="true" className="relative w-[34%] shrink-0 sm:w-[40%] md:w-[34%] lg:w-[40%]">
                    <img src={recurso(`fotos/recortes/${e.foto}.webp`)} alt="" loading="lazy" decoding="async"
                      className={`aparece pointer-events-none absolute left-0 w-full object-contain object-bottom drop-shadow-[0_18px_20px_rgba(0,0,0,0.4)] ${e.posicion}`} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="etiqueta">Qué hacemos</p>
                  <ul data-revelar className="revelar mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                    {s.trabajos.map((t, k) => (
                      <li key={t} style={{ "--i": k } as React.CSSProperties} className="flex items-start gap-2.5 rounded-md bg-fondo px-3 py-2.5 text-sm leading-snug">
                        <span className="check-paso flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marca text-white"><IconoTrabajo texto={t} className="h-4 w-4" /></span><span className="self-center">{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
                    <button type="button" onClick={() => solicitar(s.titulo)} className="btn btn-marca">Solicitar cotización</button>
                    <a href={hrefDe(s.articulo)} className="enlace-suelto text-sm">Ver detalles y tiempos</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {camaras && <Camaras servicio={camaras} cotizar={() => solicitar(camaras.titulo)} />}
        <div id="orden" className="tarjeta mt-8 grid gap-6 p-5 sm:p-7 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10">
          <div>
            <h3 className="text-xl font-bold">Solicita un servicio</h3>
            <p className="mt-2 text-sm text-tinta-2">Cuéntanos qué necesitas. Te respondemos por WhatsApp con un valor aproximado o la fecha de la visita.</p>
            <ol ref={pasosOrden} data-visto={ordenVisto || undefined} className="pasos mt-4 grid gap-2.5 text-sm text-tinta-2">
              {["Llenas este formulario.", "Se abre WhatsApp con tu solicitud escrita. Envía ese mensaje para completar la solicitud.", "Te respondemos con el diagnóstico inicial o agendamos la visita."].map((t, n) => (
                <li key={t} style={{ "--orden": n } as React.CSSProperties} className="flex gap-2.5"><span className="paso-num flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">{n + 1}</span>{t}</li>
              ))}
            </ol>
          </div>
          <FormularioWhatsApp key={servicio?.camaras ? "cam" : "eq"} asunto="solicitar un servicio" campos={campos} boton="Enviar solicitud por WhatsApp"
            valores={{ servicio: elegido }} alCambiar={(id, v) => { if (id === "servicio") setElegido(v); }} />
        </div>
      </div>
    </section>
  );
}
