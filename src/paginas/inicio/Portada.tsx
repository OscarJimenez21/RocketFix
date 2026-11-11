import { Fragment, useEffect, useRef, useState } from "react";
import { CONFIG } from "../../data/catalogo";
import { ResumenCalificaciones } from "../../components/Calificaciones";
import { PuntoEstado, useAtencion } from "../../components/Contacto";
import { Despegue } from "../../components/Despegue";
import { IconoBolsa, IconoCamion, IconoMoto, IconoTarjeta, IconoWhatsApp } from "../../components/Iconos";
import { Cohete } from "../../components/Logo";
import { activa } from "../../lib/animaciones";
import { useVisto } from "../../lib/enPantalla";
import { dinero } from "../../lib/formato";
import { waLink } from "../../lib/whatsapp";
import { Vitrina } from "./Vitrina";

/** La portada entra en cascada solo la primera vez que se abre en la visita (al volver a Inicio ya está quieta) */
let portadaVista = false;

/** Eslogan de la marca (manual de marca, aprobado el 04/11/2026). Cada palabra va aparte para que entren una tras otra */
const ESLOGAN = ["Hacemos", "despegar", "tu", "tecnología"];

/** Animación 48: con mouse, un resplandor menta muy tenue sigue al puntero por el fondo verde (detrás del texto).
    Se escribe directo en el estilo (sin volver a dibujar la portada) y una sola vez por cuadro */
function useLuzMouse() {
  const luz = useRef<HTMLSpanElement>(null);
  const cuadro = useRef(0);
  const mover = (e: React.MouseEvent<HTMLElement>) => {
    const el = luz.current;
    if (!el || cuadro.current || !activa(48)) return;
    const { clientX, clientY, currentTarget } = e;
    cuadro.current = requestAnimationFrame(() => {
      cuadro.current = 0;
      const r = currentTarget.getBoundingClientRect();
      el.style.setProperty("--lx", `${clientX - r.left}px`);
      el.style.setProperty("--ly", `${clientY - r.top}px`);
      el.dataset.on = "";
    });
  };
  const salir = () => { if (luz.current) delete luz.current.dataset.on; };
  useEffect(() => () => cancelAnimationFrame(cuadro.current), []);
  return { luz, mover, salir };
}

/** Animación 51 (sorpresa): si alguien toca 5 veces seguidas el cohete del eslogan, el cohete da una vuelta completa y
    suelta una lluvia de estrellitas. No hace nada más: es un detalle escondido para quien lo encuentre */
function useSorpresa() {
  const cohete = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = cohete.current;
    if (!el) return;
    let toques: number[] = [];
    const tocar = () => {
      const ahora = Date.now();
      toques = [...toques.filter(t => ahora - t < 2000), ahora];
      if (toques.length < 5 || !activa(51) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      toques = [];
      el.animate([{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(200deg) scale(1.35)", offset: 0.5 }, { transform: "rotate(360deg) scale(1)" }],
        { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)" });
      const r = el.getBoundingClientRect();
      for (let k = 0; k < 14; k++) {
        const s = document.createElement("span");
        s.className = "chispa";
        s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px`;
        document.body.appendChild(s);
        const ang = (k / 14) * Math.PI * 2 + Math.random() * 0.4, d = 50 + Math.random() * 70;
        const a = s.animate(
          [{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(ang) * d}px), calc(-50% + ${Math.sin(ang) * d + 30}px)) scale(0.3)`, opacity: 0 }],
          { duration: 900 + Math.random() * 400, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" }
        );
        a.onfinish = () => s.remove();
      }
    };
    el.addEventListener("pointerdown", tocar);
    return () => el.removeEventListener("pointerdown", tocar);
  }, []);
  return cohete;
}

/** Borde de abajo de la portada: la página blanca sube en curva, como el horizonte de un planeta visto desde el cohete,
    con una línea menta de atmósfera que se apaga hacia los lados. Va encima del cielo (las fugaces pasan por detrás del
    planeta) y debajo del contenido. Con preserveAspectRatio="none" se estira a lo ancho; las líneas no se deforman
    (vector-effect) */
function Horizonte() {
  const curva = "M0 60 Q720 -60 1440 60";
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 -bottom-px h-[26px] w-full sm:h-[38px] lg:h-[52px]">
      <defs>
        <linearGradient id="rf-atmosfera" x1="0" x2="1">
          <stop offset="0" stopColor="#5BE0A9" stopOpacity="0" />
          <stop offset="0.5" stopColor="#5BE0A9" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5BE0A9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Resplandor ancho (la mitad de abajo queda tapada por el blanco), el planeta y la línea fina encima */}
      <path d={curva} fill="none" stroke="url(#rf-atmosfera)" strokeOpacity="0.22" strokeWidth="14" vectorEffect="non-scaling-stroke" />
      <path d={`${curva} Z`} fill="#fff" />
      <path d={curva} fill="none" stroke="url(#rf-atmosfera)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Portada: el eslogan grande, una línea que dice qué es la tienda, los dos botones y el estado de atención; a la derecha
    (abajo en celular), la vitrina. El cohete del logo cierra el eslogan en lugar del punto */
export function Portada() {
  const atencion = useAtencion();
  const { luz, mover, salir } = useLuzMouse();
  const sorpresa = useSorpresa();
  const [entra] = useState(() => !portadaVista);
  // Animación 1: el eslogan entra palabra por palabra (si está apagada, el título sube entero, como antes)
  const [porPalabras] = useState(() => !portadaVista && activa(1));
  useEffect(() => { portadaVista = true; }, []);
  // Cada pieza del texto entra 60 ms después de la anterior; el título solo sube (ver .entrada en index.css)
  const en = (orden: number) => (entra ? { extra: " entrada", style: { "--orden": orden } as React.CSSProperties } : { extra: "", style: undefined });
  return (
    // onMouseMove / onMouseLeave: solo mueven una luz decorativa (animación 48); no es un control
    <section onMouseMove={mover} onMouseLeave={salir} className="relative isolate overflow-hidden bg-marca-oscuro text-white">
      <Despegue />
      <span ref={luz} aria-hidden="true" className="luz-portada pointer-events-none absolute inset-0 -z-10" />
      <Horizonte />
      {/* Abajo deja espacio para la curva del horizonte (pb un poco más alto que pt) */}
      <div className="contenedor grid items-center gap-8 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12 lg:pb-24 lg:pt-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:gap-14">
        <div>
          <h1 tabIndex={-1} style={porPalabras ? undefined : en(0).style}
            className={`eslogan titulo-portada text-[clamp(2.25rem,10.4vw,3rem)] text-white sm:text-[64px] lg:text-[60px] xl:text-[74px]${porPalabras ? " eslogan-entra" : entra ? " entrada entrada-titulo" : ""}`}>
            {ESLOGAN.map((w, k) => {
              const ultima = k === ESLOGAN.length - 1;
              return (
                <Fragment key={w}>
                  {k > 0 && " "}
                  {/* La última palabra y el cohete no se separan de renglón */}
                  <span className={`palabra${ultima ? " whitespace-nowrap" : ""}`} style={{ "--p": k } as React.CSSProperties}>
                    {w}{ultima && <span ref={sorpresa} aria-hidden="true" className={`cohete-eslogan${entra ? " cohete-llega" : ""}`}><Cohete /></span>}
                  </span>
                </Fragment>
              );
            })}
          </h1>
          <p className={`mt-5 text-[17px] font-semibold text-marca-menta sm:text-lg${en(1).extra}`} style={en(1).style}>Tienda de tecnología y servicio técnico en Bogotá</p>
          {/* data-despegue: en celular el cohete del fondo pasa a la derecha de estos botones.
              En celular (menos de 480 px) van siempre uno debajo del otro. Antes dependía de si cabían: con la letra del
              sistema cabían en un renglón y, al llegar la letra de la marca (más ancha), el segundo bajaba y todo lo de
              abajo saltaba 56 px (CLS 0,097 a 412 px de ancho, medido el 10/11/2026) */}
          <div data-despegue className={`mt-8 flex flex-col items-start gap-3 min-[480px]:flex-row min-[480px]:flex-wrap${en(2).extra}`} style={en(2).style}>
            <a href="#categorias" className={`btn btn-primario${entra ? " barrido barrido-portada" : ""}`}>Comprar tecnología</a>
            <a href="#servicios" className="btn btn-claro">Solicitar servicio técnico</a>
          </div>
          <div className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80${en(3).extra}`} style={en(3).style}>
            <p className="flex items-center gap-2"><PuntoEstado abierto={atencion.abierto} claro />{atencion.texto}</p>
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-white hover:underline">
              <IconoWhatsApp className="h-[18px] w-[18px] text-wa-vivo" />{CONFIG.whatsappVisible}
            </a>
            <ResumenCalificaciones />
          </div>
        </div>
        <Vitrina />
      </div>
    </section>
  );
}

/** Ventajas debajo de la portada. La primera vez que se ven, cada ícono se mueve una vez a su manera: la moto avanza y
    frena, el camión rueda y la tarjeta gira (ver .ventajas en index.css) */
export function Ventajas() {
  const items = [
    { icono: <IconoMoto />, clase: "icono-moto", titulo: "Entrega el mismo día en Bogotá", texto: `Gratis desde ${dinero(CONFIG.envios.bogota.gratisDesde)}. Pagas contra entrega.` },
    { icono: <IconoCamion />, clase: "icono-camion", titulo: "Envíos a todo Colombia", texto: `Gratis desde ${dinero(CONFIG.envios.nacional.gratisDesde)}, con pago anticipado.` },
    { icono: <IconoTarjeta />, clase: "icono-tarjeta", titulo: "Paga como prefieras", texto: "Tarjeta, PSE, Bre-B, Daviplata, transferencia o efectivo." }
  ];
  const lista = useRef<HTMLUListElement>(null);
  const visto = useVisto(lista);
  return (
    <div className="border-b border-linea">
      <ul ref={lista} data-visto={visto || undefined} className="ventajas contenedor grid divide-y divide-linea sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((v, n) => (
          <li key={v.titulo} className="flex gap-3 py-4 sm:px-5 sm:first:pl-0">
            <span style={{ "--orden": n } as React.CSSProperties} className={`icono-ventaja mt-0.5 inline-block h-5 text-marca ${v.clase}`}>{v.icono}</span>
            <div><p className="text-sm font-semibold">{v.titulo}</p><p className="text-[13px] text-tinta-2">{v.texto}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Cómo comprar: va justo debajo de las ventajas, en una franja verde clara, para que se vea apenas la persona empieza a
    bajar. #como-comprar lleva aquí (desde el menú y el pie de página). Cada paso lleva su ícono y su número; la primera vez
    que se ve, los círculos se encienden uno tras otro y una línea punteada (como la trayectoria del cohete de la portada)
    se dibuja hasta el siguiente (ver .pasos en index.css) */
export function ComoComprar() {
  const pasos: [React.ReactNode, string, string][] = [
    [<IconoBolsa key="b" className="h-6 w-6" />, "Arma tu carrito", "Elige la versión de cada equipo y agrégalo. Puedes cambiar las cantidades antes de enviar."],
    [<IconoWhatsApp key="w" className="h-6 w-6" />, "Envía el pedido por WhatsApp", "El mensaje sale escrito con los productos, el total y la forma de entrega. Enviarlo no es un pago."],
    [<IconoMoto key="m" className="h-6 w-6" />, "Confirmamos y entregamos", `Te confirmamos disponibilidad y pago. En Bogotá y alrededores te lo llevamos el mismo día y puedes pagar contra entrega; al resto de Colombia lo enviamos con pago anticipado. Envío gratis en Bogotá desde ${dinero(CONFIG.envios.bogota.gratisDesde)} y al resto del país desde ${dinero(CONFIG.envios.nacional.gratisDesde)}.`]
  ];
  const lista = useRef<HTMLOListElement>(null);
  const visto = useVisto(lista);
  return (
    <section id="como-comprar" aria-labelledby="t-como" className="border-b border-linea bg-marca-suave">
      <div className="contenedor py-10 sm:py-12">
        <h2 id="t-como" className="titulo-seccion titulo-trazo">Cómo comprar</h2>
        <ol ref={lista} data-visto={visto || undefined} className="pasos pasos-claros mt-7 grid gap-6 md:grid-cols-3 md:gap-8">
          {pasos.map(([icono, t, d], i) => (
            <li key={t} style={{ "--orden": i } as React.CSSProperties} className="relative flex gap-4 md:flex-col md:gap-3">
              {/* Línea punteada hasta el círculo del paso siguiente: hacia abajo en celular, hacia la derecha desde 768 px */}
              {i < pasos.length - 1 && (
                <span aria-hidden="true" className="paso-ruta absolute left-[calc(1.5rem-2px)] top-[calc(3rem+5px)] h-[calc(100%-1.5rem-10px)] w-1 md:left-[calc(3rem+6px)] md:top-[calc(1.5rem-2px)] md:h-1 md:w-[calc(100%-1rem-12px)]" />
              )}
              <span className="paso-num relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                {icono}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-marca-oscuro text-[11px] font-bold text-white">{i + 1}</span>
              </span>
              <div className="min-w-0">
                <p className="font-display text-[17px] font-bold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-tinta-2">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
