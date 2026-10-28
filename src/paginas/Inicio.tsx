import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG, MAS_VENDIDOS, PAQUETES, PRODUCTOS, SERVICIOS, deTienda, desde, etiquetaDe, porId } from "../data/catalogo";
import { camposServicio } from "../data/formularios";
import { TIENDAS, tiendaPorId } from "../data/tiendas";
import { PuntoEstado, useAtencion } from "../components/Contacto";
import { FormularioWhatsApp } from "../components/FormularioWhatsApp";
import { FotoProducto } from "../components/FotoProducto";
import { IconoCamion, IconoCheck, IconoFlecha, IconoLlama, IconoMoto, IconoTarjeta, IconoWhatsApp } from "../components/Iconos";
import { Ilustracion } from "../components/Ilustracion";
import { dinero, recurso } from "../lib/formato";
import { hrefBusqueda, hrefProducto } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { Producto, Servicio, TiendaId } from "../types";

/** Productos de la vitrina de la portada, en este orden */
const VITRINA = ["ip18pm", "ss26u", "p45631", "mbairm5", "switch2", "appro3"];
const ESPERA_VITRINA = 6000;

/** Vitrina: un producto grande y los demás en miniatura. Cambia sola con un fundido; se detiene con el mouse encima o
    al usar el teclado, no se mueve si la persona pidió menos movimiento y deja de cambiar cuando la persona elige un producto
    (en celular no hay mouse que la detenga). */
function Vitrina() {
  const productos = useMemo(() => VITRINA.map(id => porId[id]).filter((p): p is Producto => Boolean(p)), []);
  const [i, setI] = useState(0);
  const [quieta, setQuieta] = useState(false);
  const [elegida, setElegida] = useState(false);
  const [reducir] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (quieta || elegida || reducir || productos.length < 2) return;
    const t = window.setTimeout(() => setI(x => (x + 1) % productos.length), ESPERA_VITRINA);
    return () => window.clearTimeout(t);
  }, [i, quieta, elegida, reducir, productos.length]);

  const p = productos[i];
  if (!p) return null;
  return (
    <div role="region" aria-roledescription="carrusel" aria-label="Productos destacados" className="tarjeta w-full overflow-hidden border-0 text-tinta"
      onMouseEnter={() => setQuieta(true)} onMouseLeave={() => setQuieta(false)} onFocus={() => setQuieta(true)} onBlur={() => setQuieta(false)}>
      <div className="relative aspect-[4/3]">
        {productos.map((x, j) => (
          <a key={x.id} href={hrefProducto(x.id)} tabIndex={j === i ? 0 : -1} aria-hidden={j !== i}
            className={`absolute inset-0 p-6 transition-opacity duration-500 sm:p-8 ${j === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <FotoProducto producto={x} alt={x.nombre} prioridad={j === 0} />
          </a>
        ))}
        <span className="absolute left-3 top-3 rounded-sm bg-fondo px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-tinta-2">{etiquetaDe(p)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-linea px-4 py-3.5 sm:px-5" aria-live={quieta || elegida ? "polite" : "off"}>
        <div className="min-w-0">
          <p className="truncate font-display text-[17px] font-bold">{p.nombre}</p>
          <p className="text-sm text-tinta-2">{p.opciones.length > 1 && "Desde "}<b className="font-display text-[15px] tabular-nums text-tinta">{dinero(desde(p))}</b></p>
        </div>
        <a href={hrefProducto(p.id)} className="btn btn-sm btn-marca shrink-0">Ver producto</a>
      </div>
      <div className="grid grid-cols-6 gap-1.5 border-t border-linea bg-fondo p-2 sm:gap-2 sm:p-2.5">
        {productos.map((x, j) => (
          <button key={x.id} type="button" onClick={() => { setI(j); setElegida(true); }} aria-label={`Ver ${x.nombre}`} aria-current={j === i || undefined}
            className={`aspect-square rounded border bg-white p-1 transition-colors ${j === i ? "border-marca ring-1 ring-marca" : "border-linea hover:border-linea-fuerte"}`}>
            <FotoProducto producto={x} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Portada() {
  const atencion = useAtencion();
  return (
    <section className="bg-marca-oscuro text-white">
      <div className="contenedor grid items-center gap-8 py-9 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12 lg:py-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:gap-14">
        <div>
          <p className="etiqueta text-marca-menta">Tienda de tecnología y servicio técnico · Bogotá</p>
          <h1 tabIndex={-1} className="mt-3 text-[31px] font-extrabold leading-[1.1] text-white sm:text-[40px] lg:text-[38px] xl:text-[46px]">
            Tecnología para tu día a día. <span className="text-marca-menta">Soluciones cuando las necesitas.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[16.5px] leading-relaxed text-white/80">
            Celulares, computadores, gaming y accesorios con entrega a domicilio. Compra con asesoría por WhatsApp y solicita servicio técnico para tu hogar o negocio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#categorias" className="btn btn-primario">Comprar tecnología</a>
            <a href="#servicios" className="btn btn-claro">Solicitar servicio técnico</a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            <p className="flex items-center gap-2"><PuntoEstado abierto={atencion.abierto} claro />{atencion.texto}</p>
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-semibold text-white hover:underline">
              <IconoWhatsApp className="h-[18px] w-[18px] text-wa-vivo" />{CONFIG.whatsappVisible}
            </a>
          </div>
        </div>
        <Vitrina />
      </div>
    </section>
  );
}

function Ventajas() {
  const items = [
    { icono: <IconoMoto />, titulo: "Entrega el mismo día en Bogotá", texto: `Gratis desde ${dinero(CONFIG.envios.bogota.gratisDesde)}. Pagas contra entrega.` },
    { icono: <IconoCamion />, titulo: "Envíos a todo Colombia", texto: `Gratis desde ${dinero(CONFIG.envios.nacional.gratisDesde)}, con pago anticipado.` },
    { icono: <IconoTarjeta />, titulo: "Paga como prefieras", texto: "Tarjeta, PSE, Bre-B, Daviplata, transferencia o efectivo." }
  ];
  return (
    <div className="border-b border-linea">
      <ul className="contenedor grid divide-y divide-linea sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map(v => (
          <li key={v.titulo} className="flex gap-3 py-4 sm:px-5 sm:first:pl-0">
            <span className="mt-0.5 text-marca">{v.icono}</span>
            <div><p className="text-sm font-semibold">{v.titulo}</p><p className="text-[13px] text-tinta-2">{v.texto}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PASO_CARRUSEL = 3500;

/** Tarjeta de las filas de la portada: foto grande, nombre y precio; toda la tarjeta lleva al producto */
function TarjetaVitrina({ producto: p, cinta, prioridad }: { producto: Producto; cinta?: string; prioridad: boolean }) {
  return (
    <a href={hrefProducto(p.id)} className="group flex h-full flex-col overflow-hidden rounded-lg border border-linea bg-white transition-shadow hover:shadow-tarjeta">
      <div className="relative aspect-square p-7 sm:p-8">
        <FotoProducto producto={p} alt={p.nombre} prioridad={prioridad} className="transition-transform duration-300 motion-safe:group-hover:scale-[1.04]" />
        {cinta && <span className="absolute left-3 top-3 rounded-sm bg-acento-suave px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-acento-texto">{cinta}</span>}
      </div>
      <div className="mt-auto border-t border-linea px-5 py-4">
        <p className="truncate text-[12px] font-semibold uppercase tracking-wide text-tinta-3">{etiquetaDe(p)}</p>
        <p className="mt-1 line-clamp-2 min-h-[2.75em] font-display text-[18px] font-bold leading-snug text-tinta">{p.nombre}</p>
        <p className="mt-2 text-sm text-tinta-2">{p.opciones.length > 1 && "Desde "}<b className="font-display text-[22px] tabular-nums text-tinta">{dinero(desde(p))}</b></p>
      </div>
    </a>
  );
}

/** Fila de productos de la portada (tarjetas grandes solo con foto, nombre y precio). Avanza sola; se detiene con el
    mouse encima, al usar el teclado o mientras la persona la desliza con el dedo, y no se mueve si la persona pidió
    menos movimiento. Al llegar al final vuelve al principio. */
function Carrusel({ id, etiqueta, titulo, productos, enlaces = [], cinta, gris = false }: {
  id: string; etiqueta: React.ReactNode; titulo: string; productos: Producto[]; enlaces?: { texto: string; href: string }[]; cinta?: string; gris?: boolean;
}) {
  const fila = useRef<HTMLUListElement>(null);
  const [quieta, setQuieta] = useState(false);
  const [reducir] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const reanudar = useRef<number>();

  const mover = (dir: 1 | -1) => {
    const el = fila.current;
    if (!el) return;
    const paso = (el.querySelector("li")?.getBoundingClientRect().width ?? 280) + 20;
    if (dir > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && el.scrollLeft <= 8) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * paso, behavior: "smooth" });
  };
  useEffect(() => {
    if (quieta || reducir || productos.length < 2) return;
    const t = window.setInterval(() => mover(1), PASO_CARRUSEL);
    return () => window.clearInterval(t);
  }, [quieta, reducir, productos.length]);
  // Con el dedo: se detiene mientras la persona desliza y vuelve a moverse unos segundos después
  const tocar = () => {
    setQuieta(true);
    window.clearTimeout(reanudar.current);
    reanudar.current = window.setTimeout(() => setQuieta(false), 8000);
  };
  useEffect(() => () => window.clearTimeout(reanudar.current), []);

  const flecha = "flex h-11 w-11 items-center justify-center rounded-full border border-linea-fuerte bg-white transition-colors hover:border-tinta-2";
  return (
    <section aria-labelledby={`t-${id}`} className={gris ? "border-y border-linea bg-fondo" : ""}>
      <div className="contenedor py-12 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="etiqueta flex items-center gap-1.5">{etiqueta}</p>
            <h2 id={`t-${id}`} className="titulo-seccion mt-1">{titulo}</h2>
            {enlaces.length > 0 && (
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {enlaces.map(e => <a key={e.href} href={e.href} className="enlace">{e.texto} →</a>)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => mover(-1)} aria-label="Ver productos anteriores" className={flecha}><IconoFlecha dir={-1} /></button>
            <button type="button" onClick={() => mover(1)} aria-label="Ver productos siguientes" className={flecha}><IconoFlecha /></button>
          </div>
        </div>
        <ul ref={fila} aria-label={titulo} tabIndex={0}
          onMouseEnter={() => setQuieta(true)} onMouseLeave={() => setQuieta(false)} onFocus={() => setQuieta(true)} onBlur={() => setQuieta(false)} onTouchStart={tocar}
          className="sin-barra -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
          {productos.map((p, n) => (
            <li key={p.id} className="w-[74%] shrink-0 snap-start sm:w-[44%] lg:w-[calc(25%-15px)]">
              <TarjetaVitrina producto={p} cinta={cinta} prioridad={n < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Colores de las tarjetas de categoría (todos de la marca). `brillo` es la luz suave de la esquina. */
const TEMAS = {
  oscuro: { caja: "bg-marca-oscuro text-white", frase: "text-marca-menta", boton: "bg-white text-marca-oscuro", brillo: "bg-marca-menta/25" },
  noche: { caja: "bg-marca-noche text-white", frase: "text-marca-menta", boton: "bg-marca-menta text-marca-noche", brillo: "bg-marca/50" },
  marca: { caja: "bg-marca text-white", frase: "text-white/85", boton: "bg-white text-marca-oscuro", brillo: "bg-marca-menta/45" },
  acento: { caja: "bg-acento text-acento-tinta", frase: "text-acento-tinta/80", boton: "bg-acento-tinta text-white", brillo: "bg-white/35" },
  menta: { caja: "bg-marca-menta text-marca-noche", frase: "text-marca-noche/75", boton: "bg-marca-noche text-white", brillo: "bg-white/45" },
  suave: { caja: "bg-marca-suave text-marca-oscuro", frase: "text-marca-medio", boton: "bg-marca text-white", brillo: "bg-white/80" }
} as const;

/** Tamaños del mosaico: en computador es una cuadrícula de 12 columnas; en celular, de 2 */
const FORMAS = {
  grande: { caja: "col-span-2 h-[300px] sm:h-[360px] lg:col-span-6 lg:row-span-2 lg:h-auto", texto: "max-w-[62%]", titulo: "text-[34px] sm:text-[46px]", foto: "h-[78%] max-w-[50%] sm:h-[84%]", corto: false },
  ancha: { caja: "col-span-2 h-[210px] sm:h-[230px] lg:col-span-6 lg:h-auto", texto: "max-w-[62%]", titulo: "text-[25px] sm:text-[34px]", foto: "h-[68%] max-w-[45%] sm:h-[86%] sm:max-w-[52%]", corto: false },
  normal: { caja: "h-[210px] sm:h-[230px] lg:col-span-3 lg:h-auto", texto: "max-w-full sm:max-w-[62%]", titulo: "text-[19px] sm:text-[25px]", foto: "h-[48%] max-w-[52%] sm:h-[58%] sm:max-w-[48%]", corto: true }
} as const;

/** Cada sección con su frase, su color y un producto recortado (public/fotos/recortes, sin fondo) */
const MOSAICO: { tienda: TiendaId; frase: string; tema: keyof typeof TEMAS; foto: string; forma: keyof typeof FORMAS }[] = [
  { tienda: "cel", frase: "Lo último en", tema: "oscuro", foto: "ip17pm", forma: "grande" },
  { tienda: "pc", frase: "Para estudiar, trabajar y jugar", tema: "acento", foto: "p52396", forma: "ancha" },
  { tienda: "comp", frase: "Arma o mejora tu PC", tema: "marca", foto: "p3787", forma: "normal" },
  { tienda: "per", frase: "Más precisión", tema: "menta", foto: "p31252", forma: "normal" },
  { tienda: "con", frase: "Más diversión", tema: "noche", foto: "switch2", forma: "normal" },
  { tienda: "tab", frase: "Más pantalla", tema: "suave", foto: "ipadpro", forma: "normal" },
  { tienda: "rel", frase: "Siempre conectado", tema: "acento", foto: "gw8c", forma: "normal" },
  { tienda: "aud", frase: "Sonido sin cables", tema: "menta", foto: "gbuds3fe", forma: "normal" },
  { tienda: "par", frase: "Lleva la música", tema: "marca", foto: "jblflip7", forma: "normal" },
  { tienda: "tv", frase: "Para tu sala", tema: "oscuro", foto: "tvs43u", forma: "normal" },
  { tienda: "acc", frase: "Carga y conecta", tema: "suave", foto: "p45648", forma: "normal" },
  { tienda: "mov", frase: "Muévete por la ciudad", tema: "noche", foto: "xpatineta", forma: "normal" }
];

/** Mosaico de categorías: tarjetas de colores con un producto que se asoma; todas llevan a su sección */
function Categorias() {
  return (
    <section id="categorias" aria-labelledby="t-categorias" className="contenedor py-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <p className="etiqueta">Todo en un solo lugar</p>
          <h2 id="t-categorias" className="titulo-seccion mt-1">Compra por categoría</h2>
        </div>
        <p className="text-sm text-tinta-2">{PRODUCTOS.length} productos en {TIENDAS.length} categorías</p>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[215px] lg:grid-cols-12">
        {MOSAICO.map(m => {
          const t = tiendaPorId(m.tienda);
          if (!t) return null;
          const tema = TEMAS[m.tema], forma = FORMAS[m.forma];
          return (
            <li key={m.tienda} className={forma.caja}>
              <a href={`#${t.vista}`} className={`group relative isolate flex h-full overflow-hidden rounded-lg p-4 sm:p-6 ${tema.caja}`}>
                <span aria-hidden="true" className={`absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full blur-3xl ${tema.brillo}`} />
                <span className={`relative z-10 flex min-w-0 flex-col ${forma.texto}`}>
                  <span className={`text-[12.5px] font-semibold leading-snug sm:text-sm ${tema.frase}`}>{m.frase}</span>
                  <span className={`mt-1 font-display font-extrabold leading-[0.98] tracking-tight ancho-108 ${forma.titulo}`}>{t.titulo}</span>
                  <span className="mt-2 text-[13px] opacity-75">{deTienda(t.id).length} productos</span>
                  {/* En celular las tarjetas pequeñas solo muestran la flecha, para dejarle espacio a la foto */}
                  <span className={`mt-auto inline-flex w-max items-center gap-1.5 rounded-full text-[13px] font-bold transition-transform group-hover:translate-x-0.5 ${forma.corto ? "p-2.5 sm:px-4 sm:py-2" : "px-4 py-2"} ${tema.boton}`}>
                    <span className={forma.corto ? "hidden sm:inline" : ""}>Ver todo</span><IconoFlecha className="h-3.5 w-3.5" />
                  </span>
                </span>
                <img src={recurso(`fotos/recortes/${m.foto}.webp`)} alt="" loading="lazy" decoding="async"
                  className={`pointer-events-none absolute bottom-3 right-3 object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.32)] transition-transform duration-300 motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:scale-[1.04] sm:bottom-4 sm:right-5 ${forma.foto}`} />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Todos los productos de una o varias secciones para una fila de la portada, alternando marcas para que la fila no
    quede de una sola marca seguida. Empiezan las marcas con más productos; dentro de cada marca, el orden de la tienda. */
function variados(tiendas: TiendaId[]) {
  const porMarca = new Map<string, Producto[]>();
  for (const p of tiendas.flatMap(id => deTienda(id)).filter(p => p.imagen)) {
    const lista = porMarca.get(p.marca || "") ?? [];
    lista.push(p);
    porMarca.set(p.marca || "", lista);
  }
  const marcas = [...porMarca.values()].sort((a, b) => b.length - a.length);
  const fila: Producto[] = [];
  while (marcas.some(l => l.length)) {
    for (const l of marcas) {
      const p = l.shift();
      if (p) fila.push(p);
    }
  }
  return fila;
}

/** Fila con todos los productos de una sección, con enlace a la sección */
function Coleccion({ id, etiqueta, titulo, tiendas, gris = false }: { id: string; etiqueta: string; titulo: string; tiendas: TiendaId[]; gris?: boolean }) {
  const productos = useMemo(() => variados(tiendas), [tiendas]);
  const enlaces = tiendas.map(tiendaPorId).filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map(t => ({ texto: tiendas.length > 1 ? `Ver ${t.menu.toLowerCase()}` : `Ver todo (${productos.length})`, href: `#${t.vista}` }));
  if (!productos.length) return null;
  return <Carrusel id={id} etiqueta={etiqueta} titulo={titulo} productos={productos} enlaces={enlaces} gris={gris} />;
}

/** Banda grande de gaming: invita a armar el escritorio completo (consola, monitor, teclado, mouse y diadema) */
function BandaGamer() {
  const foto = (id: string, clase: string) => (
    <img src={recurso(`fotos/recortes/${id}.webp`)} alt="" loading="lazy" decoding="async"
      className={`pointer-events-none absolute object-contain drop-shadow-[0_26px_26px_rgba(0,0,0,0.55)] ${clase}`} />
  );
  // Cuadrícula muy tenue de fondo, como un piso de estudio
  const cuadricula = { backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)", backgroundSize: "46px 46px" };
  return (
    <section aria-labelledby="t-gamer" className="contenedor pb-12">
      <div className="relative isolate overflow-hidden rounded-xl bg-marca-noche text-white lg:grid lg:min-h-[480px] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <span aria-hidden="true" className="absolute inset-0 -z-10" style={cuadricula} />
        <span aria-hidden="true" className="absolute -left-28 -top-28 -z-10 h-[28rem] w-[28rem] rounded-full bg-marca/45 blur-3xl" />
        <span aria-hidden="true" className="absolute -bottom-44 right-[8%] -z-10 h-[30rem] w-[30rem] rounded-full bg-acento/30 blur-3xl" />
        <div className="relative z-10 p-7 sm:p-10 lg:self-center lg:p-14">
          <p className="etiqueta text-marca-menta">Todo para jugar</p>
          <h2 id="t-gamer" className="mt-3 font-display text-[40px] font-extrabold leading-[0.95] text-white ancho-108 sm:text-[58px]">
            Arma tu <span className="text-marca-menta">setup gamer</span>
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/80">Consolas, monitores, teclados, mouse y diademas. Te asesoramos por WhatsApp para que todo combine.</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {["Consolas", "Monitores", "Teclados", "Mouse", "Diademas"].map(c => (
              <li key={c} className="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-semibold text-white/90">{c}</li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#perifericos" className="btn btn-primario">Ver periféricos</a>
            <a href="#consolas" className="btn btn-claro">Ver consolas</a>
          </div>
        </div>
        <div aria-hidden="true" className="relative h-[300px] sm:h-[400px] lg:h-auto">
          <span className="absolute bottom-[5%] left-[6%] right-[4%] h-12 rounded-[50%] bg-black/45 blur-2xl" />
          {foto("p45631", "bottom-[10%] left-[3%] h-[60%]")}
          {foto("p15412", "bottom-[19%] left-[17%] h-[60%] max-w-[64%]")}
          {foto("p31252", "bottom-[9%] right-[2%] h-[52%] max-w-[29%]")}
          {foto("p20008", "bottom-[4%] left-[16%] h-[29%] max-w-[52%]")}
          {foto("p19066", "bottom-[5%] left-[67%] h-[22%]")}
        </div>
      </div>
    </section>
  );
}

/** Marcas con más productos en la tienda; cada una lleva a su búsqueda. Desfilan de lado (se detienen con el mouse
    encima o al usar el teclado, y no se mueven si la persona pidió menos movimiento). */
function Marcas() {
  const marcas = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const p of PRODUCTOS) if (p.marca && p.marca.length > 2) cuenta.set(p.marca, (cuenta.get(p.marca) ?? 0) + 1);
    return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([m]) => m);
  }, []);
  return (
    <section aria-labelledby="t-marcas" className="overflow-hidden border-b border-linea py-9">
      <div className="contenedor flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <p className="etiqueta">Marcas que manejamos</p>
          <h2 id="t-marcas" className="titulo-seccion mt-1">Las marcas que buscas</h2>
        </div>
        <p className="text-sm text-tinta-2">Toca una marca para ver todos sus productos</p>
      </div>
      <div className="relative mt-6">
        <ul className="desfile flex w-max gap-3">
          {[...marcas, ...marcas].map((m, i) => {
            const copia = i >= marcas.length;
            return (
              <li key={`${m}-${i}`} aria-hidden={copia || undefined}>
                <a href={hrefBusqueda(m)} tabIndex={copia ? -1 : undefined}
                  className="flex h-16 items-center whitespace-nowrap rounded-lg border border-linea bg-white px-7 font-display text-[22px] font-extrabold tracking-tight text-tinta-2 transition-colors ancho-108 hover:border-marca hover:text-marca">
                  {m}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Instalación de cámaras: línea de negocio propia, con sus paquetes de referencia (los mismos del artículo) */
function Camaras({ servicio, cotizar }: { servicio: Servicio; cotizar: () => void }) {
  return (
    <article aria-labelledby="t-camaras" className="mt-4 overflow-hidden rounded-md bg-marca-oscuro text-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="p-6 sm:p-8">
        <p className="etiqueta text-marca-menta">Seguridad para tu hogar o negocio</p>
        <h3 id="t-camaras" className="mt-1 text-[22px] font-extrabold text-white sm:text-2xl">Instalación de cámaras de seguridad</h3>
        <p className="mt-2 text-white/80">{servicio.texto}</p>
        <ul className="mt-4 grid gap-2 text-sm text-white/90">
          {servicio.trabajos.map(t => <li key={t} className="flex gap-2"><IconoCheck className="mt-0.5 h-4 w-4 shrink-0 text-marca-menta" />{t}</li>)}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={cotizar} className="btn btn-primario">Cotizar instalación</button>
          <a href="#blog-camaras" className="btn btn-claro">Paquetes y preguntas frecuentes</a>
        </div>
      </div>
      <div className="border-t border-white/10 bg-marca-noche/40 p-6 sm:p-8 lg:border-l lg:border-t-0">
        <p className="etiqueta text-white/70">Paquetes de referencia</p>
        <ul className="mt-2 divide-y divide-white/10">
          {PAQUETES.map(pk => (
            <li key={pk.nombre} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-12 shrink-0 items-center justify-center rounded bg-white"><Ilustracion nombre={pk.ilustracion} className="h-8 w-10 text-marca-medio" /></span>
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

function Servicios() {
  const titulos = [...SERVICIOS.map(s => s.titulo), "Otro servicio"];
  const [elegido, setElegido] = useState(titulos[0] ?? "");
  const servicio = SERVICIOS.find(s => s.titulo === elegido);
  const campos = useMemo(() => camposServicio(servicio, titulos), [servicio]); // eslint-disable-line react-hooks/exhaustive-deps
  const solicitar = (titulo: string) => {
    setElegido(titulo);
    const caja = document.getElementById("orden");
    caja?.scrollIntoView({ behavior: "smooth", block: "start" });
    caja?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
  };
  const reparacion = SERVICIOS.filter(s => !s.camaras);
  const camaras = SERVICIOS.find(s => s.camaras);
  return (
    <section id="servicios" aria-labelledby="t-servicios" className="border-y border-linea bg-fondo">
      <div className="contenedor py-12 sm:py-14">
        <div className="max-w-2xl">
          <p className="etiqueta">Servicio técnico</p>
          <h2 id="t-servicios" className="titulo-seccion mt-1">Reparamos tus equipos e instalamos cámaras de seguridad</h2>
          <p className="mt-2 text-tinta-2">Te decimos el valor antes de reparar. Coordinamos por WhatsApp cómo recibir tu equipo y vamos a tu casa o negocio para instalar cámaras.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reparacion.map(s => (
            <article key={s.id} className="tarjeta flex flex-col p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded bg-marca-suave"><Ilustracion nombre={s.ilustracion} className="h-11 w-14 text-marca-medio" /></span>
                <div><h3 className="text-lg font-bold">{s.titulo}</h3><p className="mt-0.5 text-sm text-tinta-2">{s.texto}</p></div>
              </div>
              <ul className="mt-4 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
                {s.trabajos.map(t => <li key={t} className="flex gap-2"><IconoCheck className="mt-0.5 h-4 w-4 shrink-0 text-marca" />{t}</li>)}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
                <button type="button" onClick={() => solicitar(s.titulo)} className="btn btn-sm btn-marca">Solicitar cotización</button>
                <a href={`#${s.articulo}`} className="enlace text-sm">Ver detalles y tiempos</a>
              </div>
            </article>
          ))}
        </div>
        {camaras && <Camaras servicio={camaras} cotizar={() => solicitar(camaras.titulo)} />}
        <div id="orden" className="tarjeta mt-8 grid gap-6 p-5 sm:p-7 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10">
          <div>
            <h3 className="text-xl font-bold">Solicita un servicio</h3>
            <p className="mt-2 text-sm text-tinta-2">Cuéntanos qué necesitas. Te respondemos por WhatsApp con un valor aproximado o la fecha de la visita.</p>
            <ol className="mt-4 grid gap-2.5 text-sm text-tinta-2">
              {["Llenas este formulario.", "Se abre WhatsApp con tu solicitud escrita. Envía ese mensaje para completar la solicitud.", "Te respondemos con el diagnóstico inicial o agendamos la visita."].map((t, n) => (
                <li key={t} className="flex gap-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marca-suave text-[11px] font-bold text-marca-oscuro">{n + 1}</span>{t}</li>
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

function ComoComprar() {
  const pasos = [
    ["Arma tu carrito", "Elige la versión de cada equipo y agrégalo. Puedes cambiar las cantidades antes de enviar."],
    ["Envía el pedido por WhatsApp", "El mensaje sale escrito con los productos, el total y la forma de entrega. Enviarlo no es un pago."],
    ["Confirmamos y entregamos", `Te confirmamos disponibilidad y pago. En Bogotá y alrededores te lo llevamos el mismo día y puedes pagar contra entrega; al resto de Colombia lo enviamos con pago anticipado. Envío gratis en Bogotá desde ${dinero(CONFIG.envios.bogota.gratisDesde)} y al resto del país desde ${dinero(CONFIG.envios.nacional.gratisDesde)}.`]
  ];
  return (
    <section aria-labelledby="t-como" className="contenedor py-12">
      <h2 id="t-como" className="titulo-seccion">Cómo comprar</h2>
      <ol className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
        {pasos.map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marca-suave text-sm font-bold text-marca-oscuro">{i + 1}</span>
            <div><p className="font-semibold">{t}</p><p className="mt-1 text-sm leading-relaxed text-tinta-2">{d}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Inicio({ ancla }: { ancla?: string }) {
  const vendidos = MAS_VENDIDOS.map(id => porId[id]).filter((p): p is Producto => Boolean(p));

  // #categorias, #servicios, #contacto y #orden llevan a su sección de la portada
  // Cuando corre el efecto la sección ya está en la página, así que se puede bajar de una vez
  useEffect(() => {
    if (ancla) document.getElementById(ancla)?.scrollIntoView({ block: "start" });
  }, [ancla]);

  return (
    <>
      <Portada />
      <Ventajas />
      <Marcas />
      <Categorias />
      <BandaGamer />
      <Carrusel id="vendidos" etiqueta={<><IconoLlama className="h-4 w-4 text-acento" />Lo más vendido</>} titulo="Los que todos quieren" productos={vendidos} cinta="Top ventas" gris />
      <Coleccion id="celulares" etiqueta="Celulares" titulo="Estrena celular" tiendas={["cel"]} />
      <Coleccion id="computadores" etiqueta="Computadores" titulo="Portátiles y PC para cada necesidad" tiendas={["pc"]} gris />
      <Coleccion id="componentes" etiqueta="Componentes" titulo="Arma o mejora tu PC" tiendas={["comp"]} />
      <Servicios />
      <ComoComprar />
    </>
  );
}
