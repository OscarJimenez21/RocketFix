/* «Así trabajamos»: fotos reales de Rocket Fix (entregas, empaque, servicio técnico) para que quien compra por primera vez
   vea que detrás de la tienda hay personas. Solo fotos propias y reales: nunca de bancos de imágenes ni de otras tiendas.
   Las fotos se ponen en public/fotos/confianza/ y se listan en src/data/confianza.json, por ejemplo:
     { "fotos": [ { "archivo": "fotos/confianza/entrega.webp", "titulo": "Entregas en Bogotá", "texto": "…" } ] }
   Sin fotos, la sección no sale en la página publicada; al trabajar en local muestra tres espacios con lo que va en cada uno. */
import { useEffect, useRef, useState } from "react";
import confianza from "../../data/confianza.json";
import { IconoWhatsApp } from "../../components/Iconos";
import { recurso } from "../../lib/formato";
import { waLink } from "../../lib/whatsapp";

/* 19/11/2026: primeras fotos reales = un mantenimiento de PC (antes, desarmado, después), cuadradas, en 1200 y 640 px.
   `pequena` es la versión para celular; `alt` describe la foto para quien no la ve */
type Foto = { archivo: string; pequena?: string; titulo: string; texto?: string; alt?: string };
/* 19/11/2026: video propio de una reparación de placa de iPhone (60 s, 720 × 1280, sin sonido, en public/videos/).
   `mensaje` es lo que queda escrito en WhatsApp al tocar «Cotizar por WhatsApp» */
type Video = { archivo: string; poster: string; etiqueta?: string; titulo: string; texto: string; alt: string; mensaje: string };
const { fotos: FOTOS, video: VIDEO } = confianza as { fotos: Foto[]; video?: Video };

/** Lo que va en cada espacio mientras no hay fotos (solo en local) */
const ESPACIOS = [
  { titulo: "Entregas en Bogotá", texto: "Una foto de una entrega real: la moto, el paquete o el momento en que llega." },
  { titulo: "Así llega tu pedido", texto: "El empaque: la caja sellada, la factura y cómo protegemos el equipo." },
  { titulo: "Servicio técnico", texto: "El banco de trabajo o una reparación en proceso." }
];

/** El video corre solo, sin sonido, mientras se ve en pantalla, y se detiene al salir. No se descarga hasta que la persona
    llega cerca (la sección ya se arma tarde, y el video tiene preload="none"). Con «reducir movimiento» no arranca solo.
    El botón lo pausa o lo reanuda; si la persona lo pausó, no vuelve a arrancar solo al regresar */
function VideoTrabajo({ v }: { v: Video }) {
  const ref = useRef<HTMLVideoElement>(null);
  const pausadoAMano = useRef(false);
  const [andando, setAndando] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) { if (!pausadoAMano.current) video.play().catch(() => {}); }
      else video.pause();
    }, { threshold: 0.4 });
    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  const alternar = () => {
    const video = ref.current;
    if (!video) return;
    pausadoAMano.current = !video.paused;
    if (video.paused) video.play().catch(() => {}); else video.pause();
  };

  return (
    <div className="mt-7 grid items-center gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:gap-12">
      <div className="relative overflow-hidden rounded-lg bg-black">
        <video ref={ref} src={recurso(v.archivo)} poster={recurso(v.poster)} muted loop playsInline preload="none"
          aria-label={v.alt} width={720} height={1280} onPlay={() => setAndando(true)} onPause={() => setAndando(false)}
          className="aspect-[4/5] w-full object-cover md:aspect-[9/16]" />
        <button type="button" onClick={alternar} aria-label={andando ? "Pausar el video" : "Reproducir el video"}
          className="presionable absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            {andando ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
          </svg>
        </button>
      </div>
      <div>
        {v.etiqueta && <p className="etiqueta">{v.etiqueta}</p>}
        <h3 className="mt-2 font-display text-2xl font-bold sm:text-[28px]">{v.titulo}</h3>
        <p className="mt-3 max-w-[52ch] text-[15px] text-tinta-2">{v.texto}</p>
        <a href={waLink(v.mensaje)} target="_blank" rel="noopener" className="btn btn-wa mt-5"><IconoWhatsApp />Cotizar por WhatsApp</a>
      </div>
    </div>
  );
}

export function Confianza() {
  if (!FOTOS.length && !VIDEO && !import.meta.env.DEV) return null;
  return (
    <section aria-labelledby="t-confianza" className="border-t border-linea">
      <div className="contenedor py-12 sm:py-14">
        <h2 id="t-confianza" className="titulo-seccion titulo-trazo">Así trabajamos</h2>
        <p className="mt-2 max-w-[60ch] text-[15px] text-tinta-2">Somos una tienda de Bogotá. Estas son fotos y videos de nuestro día a día.</p>
        {VIDEO && <VideoTrabajo v={VIDEO} />}
        {/* En celular las fotos van en una fila que se desliza con el dedo (una debajo de otra medían casi 2 pantallas) */}
        <ul className={`-mx-4 ${VIDEO ? "mt-10" : "mt-7"} flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sin-barra sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0`}>
          {FOTOS.length
            ? FOTOS.map(f => (
              <li key={f.archivo} className="w-[78%] shrink-0 snap-start scroll-ml-4 sm:w-auto">
                <img src={recurso(f.archivo)} alt={f.alt || f.titulo} loading="lazy" decoding="async" width={1200} height={1200}
                  srcSet={f.pequena ? `${recurso(f.pequena)} 640w, ${recurso(f.archivo)} 1200w` : undefined}
                  sizes="(min-width: 640px) 400px, 100vw"
                  className="aspect-square w-full rounded-lg bg-fondo object-cover" />
                <p className="mt-3 font-display text-[17px] font-bold">{f.titulo}</p>
                {f.texto && <p className="mt-1 text-sm text-tinta-2">{f.texto}</p>}
              </li>
            ))
            : ESPACIOS.map(e => (
              <li key={e.titulo}>
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-2 border-dashed border-linea-fuerte bg-fondo p-6 text-center text-sm text-tinta-3">
                  Aquí va tu foto. Este espacio solo se ve al trabajar en local.
                </div>
                <p className="mt-3 font-display text-[17px] font-bold">{e.titulo}</p>
                <p className="mt-1 text-sm text-tinta-2">{e.texto}</p>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
