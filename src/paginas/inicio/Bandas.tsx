/* Bandas grandes de la portada (gaming, celulares y computadores): texto con dos botones y, al lado, productos
   recortados que entran uno tras otro la primera vez que se ven */
import { useRef } from "react";
import { IconoWhatsApp } from "../../components/Iconos";
import { useEnPantalla, useVisto } from "../../lib/enPantalla";
import { recurso } from "../../lib/formato";
import { waLink } from "../../lib/whatsapp";
import { hrefDe } from "../../lib/rutas";

/** Banda grande de gaming: invita a armar el escritorio completo (consola, monitor, teclado, mouse y diadema) */
export function BandaGamer() {
  const fotos = useRef<HTMLDivElement>(null);
  const visto = useVisto(fotos);
  // Animación 33: la cuadrícula se desliza solo mientras la banda se ve
  const banda = useRef<HTMLDivElement>(null);
  const enPantalla = useEnPantalla(banda);
  // vel: cuánto se desplaza cada foto con el paralaje (animación 32); las de adelante, más
  const foto = (id: string, clase: string, orden: number, vel: number) => (
    <img src={recurso(`fotos/recortes/${id}.webp`)} alt="" loading="lazy" decoding="async" style={{ "--orden": orden, "--vel": vel } as React.CSSProperties}
      className={`aparece paralaje pointer-events-none absolute object-contain drop-shadow-[0_26px_26px_rgba(0,0,0,0.55)] ${clase}`} />
  );
  // Cuadrícula muy tenue de fondo, como un piso de estudio (sobra una celda arriba y a la izquierda para poder deslizarse)
  const cuadricula = { backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)", backgroundSize: "46px 46px" };
  return (
    <section aria-labelledby="t-gamer" className="contenedor pb-12">
      <div ref={banda} data-fuera={!enPantalla || undefined} className="relative isolate overflow-hidden rounded-xl bg-marca-noche text-white lg:grid lg:min-h-[480px] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <span aria-hidden="true" className="cuadricula-deriva absolute -left-[46px] -top-[46px] bottom-0 right-0 -z-10" style={cuadricula} />
        <div className="relative z-10 p-7 sm:p-10 lg:self-center lg:p-14">
          <h2 id="t-gamer" className="font-display text-[40px] font-extrabold leading-[0.95] text-white ancho-108 sm:text-[58px]">
            Lleva tu juego al siguiente nivel
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/85">
            Más FPS, más precisión y sonido que te mete en la partida. Arma tu combo con monitor, teclado, mouse y diadema, y te asesoramos por WhatsApp para que todo combine.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={hrefDe("perifericos")} className="btn btn-primario">Ver periféricos</a>
            <a href={hrefDe("consolas")} className="btn btn-claro">Ver consolas</a>
          </div>
        </div>
        <div ref={fotos} aria-hidden="true" data-visto={visto || undefined} className="revelar relative h-[300px] sm:h-[400px] lg:h-auto">
          <span className="absolute bottom-[5%] left-[6%] right-[4%] h-12 rounded-[50%] bg-black/45 blur-2xl" />
          {foto("p15412", "bottom-[19%] left-[6%] h-[62%] max-w-[66%]", 0, 0.5)}
          {foto("p31340", "bottom-[8%] right-[3%] h-[54%] max-w-[30%]", 1, 0.8)}
          {foto("p20008", "bottom-[4%] left-[4%] h-[30%] max-w-[54%]", 2, 1.2)}
          {foto("p19066", "bottom-[5%] left-[59%] h-[23%]", 3, 1.4)}
        </div>
      </div>
    </section>
  );
}

/** Banda de celulares: los modelos más llamativos de la tienda en fila (el iPhone 18 Pro Max al centro, adelante) */
export function BandaCelulares() {
  // [foto recortada, posición y tamaño, giro del abanico (animación 34), paralaje (animación 32)]; el orden es de atrás hacia adelante
  const fila: [string, string, number, number][] = [
    ["galeria-ss25u-2", "bottom-[16%] left-[1%] h-[48%]", -10, 0.4],
    ["galeria-ss26u-2", "bottom-[16%] right-[1%] h-[48%]", 10, 0.4],
    ["xrn15", "bottom-[12%] left-[13%] h-[57%]", -6, 0.7],
    ["ip18p", "bottom-[12%] right-[14%] h-[57%]", 6, 0.7],
    ["ip17pm", "bottom-[8%] left-[21%] h-[64%]", -3, 1],
    ["ip18pm", "bottom-[5%] left-[52%] h-[72%] -translate-x-1/2", 0, 1.3]
  ];
  const fotos = useRef<HTMLDivElement>(null);
  const visto = useVisto(fotos);
  return (
    <section aria-labelledby="t-banda-cel" className="contenedor pt-12">
      <div className="banda-cel relative isolate overflow-hidden rounded-xl bg-marca-medio text-white lg:grid lg:min-h-[480px] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative z-10 p-7 sm:p-10 lg:self-center lg:p-14">
          <p className="text-[15px] font-semibold text-marca-menta-clara">iPhone, Samsung, Xiaomi y Motorola</p>
          <h2 id="t-banda-cel" className="mt-3 font-display text-[40px] font-extrabold leading-[0.95] text-white ancho-108 sm:text-[58px]">
            Tu próximo celular te está esperando
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/85">
            Los modelos más buscados, en varias capacidades y colores. Elige el tuyo y te lo llevamos el mismo día en Bogotá.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={hrefDe("celulares")} className="btn btn-primario">Ver celulares</a>
            <a href={waLink("Hola Rocket Fix, quiero asesoría para comprar un celular")} target="_blank" rel="noopener" className="btn btn-claro"><IconoWhatsApp />Te asesoramos</a>
          </div>
        </div>
        <div ref={fotos} aria-hidden="true" data-visto={visto || undefined} className="abanico revelar relative h-[300px] sm:h-[420px] lg:h-auto">
          <span className="absolute bottom-[3%] left-[4%] right-[4%] h-12 rounded-[50%] bg-black/35 blur-2xl" />
          {fila.map(([id, clase, giro, vel], n) => (
            <img key={id} src={recurso(`fotos/recortes/${id}.webp`)} alt="" loading="lazy" decoding="async" style={{ "--orden": n, "--giro": `${giro}deg`, "--vel": vel } as React.CSSProperties}
              className={`aparece paralaje pointer-events-none absolute object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.45)] ${clase}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Banda de portátiles y computadores (fondo claro, para variar con las bandas oscuras) */
export function BandaComputadores() {
  // [foto recortada, posición y tamaño]; el orden es de atrás hacia adelante
  const fila: [string, string][] = [
    ["p52351", "bottom-[24%] left-[0%] h-[42%] max-w-[44%]"],
    ["p51291", "bottom-[12%] left-[40%] h-[78%]"],
    ["mbairm5", "bottom-[8%] right-[0%] h-[32%] max-w-[44%]"],
    ["p52393", "bottom-[4%] left-[5%] h-[46%] max-w-[50%]"]
  ];
  const cuadricula = { backgroundImage: "linear-gradient(rgba(11,132,87,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(11,132,87,.07) 1px, transparent 1px)", backgroundSize: "46px 46px" };
  const fotos = useRef<HTMLDivElement>(null);
  const visto = useVisto(fotos);
  return (
    <section aria-labelledby="t-banda-pc" className="contenedor pb-12">
      <div className="relative isolate overflow-hidden rounded-xl border border-linea bg-marca-suave lg:grid lg:min-h-[480px] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <span aria-hidden="true" className="absolute inset-0 -z-10" style={cuadricula} />
        <div className="relative z-10 p-7 sm:p-10 lg:self-center lg:p-14">
          <p className="text-[15px] font-semibold text-marca-medio">Portátiles y computadores</p>
          <h2 id="t-banda-pc" className="mt-3 font-display text-[40px] font-extrabold leading-[0.95] text-tinta ancho-108 sm:text-[58px]">
            Potencia para todo lo que haces
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-tinta-2">
            Portátiles para estudiar y trabajar, equipos gamer y PC de escritorio listos para usar. Te ayudamos a escoger el tuyo por WhatsApp, sin enredos.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={hrefDe("computadores")} className="btn btn-primario">Ver computadores</a>
            <a href={waLink("Hola Rocket Fix, quiero asesoría para comprar un computador")} target="_blank" rel="noopener" className="btn btn-borde"><IconoWhatsApp className="h-5 w-5 text-wa" />Te asesoramos</a>
          </div>
        </div>
        <div ref={fotos} aria-hidden="true" data-visto={visto || undefined} className="revelar relative h-[300px] sm:h-[420px] lg:h-auto">
          <span className="absolute bottom-[3%] left-[6%] right-[6%] h-12 rounded-[50%] bg-marca-noche/25 blur-2xl" />
          {fila.map(([id, clase], n) => (
            <img key={id} src={recurso(`fotos/recortes/${id}.webp`)} alt="" loading="lazy" decoding="async" style={{ "--orden": n, "--vel": 0.5 + n * 0.3 } as React.CSSProperties}
              className={`aparece paralaje pointer-events-none absolute object-contain drop-shadow-[0_22px_22px_rgba(3,36,27,0.35)] ${clase}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
