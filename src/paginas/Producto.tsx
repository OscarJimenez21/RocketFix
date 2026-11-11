import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { CONFIG, TIENDA_VISTA, VISTAS, conPrecioPrimero, deTienda, etiquetaDe, nombreCat, nombreItem, porId, textoConsulta } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { Migas } from "../components/EncabezadoVista";
import { IconoCaracteristica, LoPrincipal, tipoDe } from "../components/Destacados";
import { Galeria } from "../components/Galeria";
import { IconoCamion, IconoCheck, IconoCompartir, IconoMoto, IconoTarjeta, IconoWhatsApp } from "../components/Iconos";
import { EtiquetaAgregar, NotaProducto, TarjetaProducto, useAgregado } from "../components/TarjetaProducto";
import { activa } from "../lib/animaciones";
import { armarDescripcion, useDescripcion } from "../lib/descripcion";
import { useVisto } from "../lib/enPantalla";
import { dinero, recurso } from "../lib/formato";
import { useDireccion, useMarco } from "../lib/movimiento";
import { tinteDe } from "../lib/tinte";
import { volarAlCarrito } from "../lib/vuelo";
import { waLink } from "../lib/whatsapp";
import type { Producto as TipoProducto } from "../types";
import { NoEncontrada } from "./NoEncontrada";

/** Versiones del producto: al elegir otra, el marco verde se desliza hasta ella en vez de saltar */
function Versiones({ producto: p, elegida, elegir }: { producto: TipoProducto; elegida: number; elegir: (j: number) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const marco = useMarco(caja, elegida);
  return (
    <div ref={caja} className="relative grid gap-2 sm:grid-cols-2">
      {marco && <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded border border-marca bg-marca-suave ring-1 ring-marca" style={marco} />}
      {p.opciones.map((op, j) => (
        <button key={j} data-opcion type="button" aria-pressed={j === elegida} onClick={() => elegir(j)}
          className={`presionable relative flex min-h-[44px] items-center justify-between gap-3 rounded border px-3.5 py-2.5 text-left text-sm ${j === elegida ? (marco ? "border-transparent" : "border-marca bg-marca-suave ring-1 ring-marca") : "border-linea-fuerte hover:border-tinta-2"}`}>
          <span>{op.nombre}</span>{!p.consultar && <b className="whitespace-nowrap font-display tabular-nums">{dinero(op.precio)}</b>}
        </button>
      ))}
    </div>
  );
}

/** Celular y tableta: cuando el botón «Agregar al carrito» de la ficha sale por arriba de la pantalla, sube una barra fija
    abajo con el precio y el botón. Baja cuando el botón vuelve a verse o cuando aparece el pie de página.
    Mientras se ve, el aviso «Agregaste…» sale encima de ella (--barra-abajo) */
function BarraAgregar({ boton, nombre, precio, tope, alAgregar, etiqueta }: {
  boton: RefObject<HTMLButtonElement>; nombre: string; precio: number; tope: boolean; alAgregar: (e: React.MouseEvent<HTMLButtonElement>) => void; etiqueta: ReactNode;
}) {
  const barra = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Se revisa al mover la página (una vez por cuadro). Con IntersectionObserver no bastaba: si la página baja de golpe
  // (un salto o un deslizamiento muy rápido), el botón pasa de abajo a arriba sin «verse» y no avisaba.
  // El botón tapado por la cabecera fija ya cuenta como fuera de la pantalla
  useEffect(() => {
    const b = boton.current, pie = document.getElementById("contacto"), cabecera = document.querySelector("header");
    if (!b) return;
    let cuadro = 0;
    const revisar = () => {
      cuadro = 0;
      const arriba = b.getBoundingClientRect().bottom < (cabecera?.getBoundingClientRect().bottom ?? 0);
      const conPie = pie ? pie.getBoundingClientRect().top < window.innerHeight : false;
      setVisible(arriba && !conPie);
    };
    const alMover = () => { if (!cuadro) cuadro = requestAnimationFrame(revisar); };
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    revisar();
    return () => { window.removeEventListener("scroll", alMover); window.removeEventListener("resize", alMover); cancelAnimationFrame(cuadro); };
  }, [boton]);
  useEffect(() => {
    if (barra.current) barra.current.inert = !visible;
    document.documentElement.style.setProperty("--barra-abajo", visible && barra.current ? `${barra.current.offsetHeight}px` : "0px");
  }, [visible]);
  useEffect(() => () => { document.documentElement.style.removeProperty("--barra-abajo"); }, []);
  return (
    <div ref={barra} className={`fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-flota transition-transform duration-300 ease-salida lg:hidden ${visible ? "translate-y-0" : "translate-y-[calc(100%+24px)]"}`}>
      <div className="mx-auto flex max-w-pagina items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-tinta-2">{nombre}</p>
          <p key={precio} className="font-display text-lg font-extrabold leading-tight tabular-nums motion-safe:animate-entrar">{dinero(precio)}</p>
        </div>
        <button type="button" onClick={alAgregar} disabled={tope} className="btn btn-primario shrink-0">{etiqueta}</button>
      </div>
    </div>
  );
}

/** Animación 20: el precio rueda hacia arriba si la versión elegida es más cara y hacia abajo si es más barata */
function Precio({ valor }: { valor: number }) {
  const dir = useDireccion(valor);
  const clase = !activa(20) || !dir ? "motion-safe:animate-entrar" : dir > 0 ? "precio-sube" : "precio-baja";
  return <p key={valor} className={`font-display text-[34px] font-extrabold leading-none tabular-nums ${clase}`}>{dinero(valor)}</p>;
}

export default function Producto({ id }: { id: string }) {
  const p = porId[id];
  const { version, elegirVersion, cantidadDe, agregar, avisar, abrirCarrito } = useTienda();
  const [copiado, setCopiado] = useState(false);
  const { vez, recien, marcar } = useAgregado();
  const boton = useRef<HTMLButtonElement>(null);
  // Animación 22: los íconos de entrega se mueven la primera vez que se ven
  const entregaLista = useRef<HTMLUListElement>(null);
  const entregaVista = useVisto(entregaLista);
  // La descripción del proveedor llega aparte (un archivo por producto); null mientras llega
  const descripcion = useDescripcion(id);

  useEffect(() => {
    if (p) document.title = `${p.nombre} · ${CONFIG.nombre}`;
  }, [p]);

  // Primero los de la misma categoría y marca, luego el resto de la sección; los que tienen precio antes que los de
  // «Preguntar disponibilidad». Se calcula una vez por producto (antes se filtraba y ordenaba la sección entera en cada
  // dibujo, por ejemplo cada vez que se agregaba algo al carrito)
  const relacionados = useMemo(() => {
    if (!p) return [];
    const puntos = (r: TipoProducto) => (r.categoria === p.categoria ? 2 : 0) + (r.marca && r.marca === p.marca ? 1 : 0);
    return deTienda(p.tienda).filter(r => r.id !== p.id).sort((a, b) => conPrecioPrimero(a, b) || puntos(b) - puntos(a)).slice(0, 4);
  }, [p]);

  if (!p) return <NoEncontrada texto="Este producto ya no está en la tienda." />;

  const i = Math.min(version(p.id), p.opciones.length - 1);
  const o = p.opciones[i] ?? p.opciones[0];
  const q = cantidadDe(p.id, i);
  const tope = p.stock != null && q >= p.stock;
  const vista = TIENDA_VISTA[p.tienda];
  const d = armarDescripcion(p, descripcion ?? {});
  const cat = p.tienda !== "cel" && p.categoria ? nombreCat[p.categoria] : null;

  const alAgregar = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!agregar(p.id, i)) return;
    marcar();
    // La foto despega hacia el carrito (desde la foto grande o, si ya no se ve entera, desde el botón)
    volarAlCarrito([document.querySelector("[data-foto-principal]"), e.currentTarget], p.imagen && recurso(p.imagen));
    avisar(`Agregaste ${nombreItem(p, o.nombre)} al carrito`);
  };
  const compartir = async () => {
    // Se comparte la página propia del producto: al pegarla en WhatsApp sale con su foto, nombre y precio
    const url = `${location.origin}${import.meta.env.BASE_URL}p/${p.id}/`;
    if (navigator.share) { navigator.share({ title: p.nombre, text: `${p.nombre} en ${CONFIG.nombre}`, url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { avisar(url); }
  };
  const entrega = [
    { icono: <IconoMoto className="h-[18px] w-[18px]" />, clase: "icono-moto", texto: `Entrega el mismo día en Bogotá y alrededores, gratis desde ${dinero(CONFIG.envios.bogota.gratisDesde)}` },
    { icono: <IconoCamion className="h-[18px] w-[18px]" />, clase: "icono-camion", texto: `Envíos a todo Colombia, gratis desde ${dinero(CONFIG.envios.nacional.gratisDesde)}` },
    { icono: <IconoTarjeta className="h-[18px] w-[18px]" />, clase: "icono-tarjeta", texto: "Paga con tarjeta, Bre-B, Daviplata, transferencia o efectivo" }
  ];

  return (
    <>
      <div className="contenedor pt-5">
        <Migas migas={[{ texto: "Inicio", href: "#inicio" }, { texto: VISTAS[vista] ?? "", href: `#${vista}` }, ...(cat ? [{ texto: cat }] : [])]} />
      </div>
      <div className="contenedor grid gap-8 pb-10 pt-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <Galeria producto={p} tinte={p.opciones.length > 1 && activa(49) ? tinteDe(o.nombre) : null} />

        {/* cascada-info: al abrir el producto, cada bloque de esta columna entra 50 ms después del anterior (animación 18) */}
        <div className="cascada-info min-w-0">
          <p className="etiqueta text-tinta-3">{etiquetaDe(p)}</p>
          <h1 tabIndex={-1} className="mt-1.5 text-[26px] font-extrabold leading-tight md:text-[32px]">{p.nombre}</h1>
          {p.specs.length > 0 && (
            // specs-cascada: las características cortas aparecen una por una (animación 19)
            // Cada característica lleva su ícono cuando se reconoce (pantalla, procesador, memoria…; ver Destacados.tsx)
            <ul className="specs-cascada mt-3 flex flex-wrap gap-1.5">
              {p.specs.map((s, k) => {
                const tipo = tipoDe(s);
                return (
                  <li key={s} style={{ "--i": k } as React.CSSProperties} className="inline-flex items-center gap-1.5 rounded-sm bg-fondo px-2 py-1 text-[13px] text-tinta-2">
                    {tipo && <IconoCaracteristica tipo={tipo} className="h-3.5 w-3.5 shrink-0 text-marca" />}{s}
                  </li>
                );
              })}
            </ul>
          )}
          {p.nota && <NotaProducto nota={p.nota} className="mt-3" />}

          {p.opciones.length > 1 && (
            <fieldset className="mt-6">
              <legend className="etiqueta mb-2">{p.etiqueta || "Versión"}</legend>
              <Versiones producto={p} elegida={i} elegir={j => elegirVersion(p.id, j)} />
            </fieldset>
          )}

          {p.consultar ? (
            <div className="tarjeta mt-6 p-5">
              <p className="font-display text-[28px] font-extrabold leading-tight">Preguntar disponibilidad</p>
              <p className="mt-2 text-[13px] text-tinta-3">Por ahora no tenemos precio publicado para este producto. Escríbenos por WhatsApp y te confirmamos si está disponible y su precio.</p>
              <a href={waLink(textoConsulta(p, o.nombre))} target="_blank" rel="noopener" className="btn btn-wa mt-4 w-full sm:w-auto">
                <IconoWhatsApp className="h-[18px] w-[18px]" />Preguntar disponibilidad por WhatsApp
              </a>
            </div>
          ) : (
            <div className="tarjeta mt-6 p-5">
              {/* Al cambiar de versión, el precio nuevo entra rodando (la clave lo vuelve a montar) */}
              <Precio valor={o.precio} />
              <p className="mt-2 text-[13px] text-tinta-3">Precio en pesos colombianos. Antes de cualquier pago te confirmamos disponibilidad por WhatsApp.</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {/* barrido-agregar: un destello lo cruza una vez al abrir el producto (animación 21) */}
                <button ref={boton} type="button" onClick={alAgregar} disabled={tope} className="btn btn-primario barrido barrido-agregar w-full"><EtiquetaAgregar vez={vez} recien={recien} cantidad={q} tope={tope} sufijo=" al carrito" /></button>
                <a href={waLink(`Hola ${CONFIG.nombre}, me interesa ${nombreItem(p, o.nombre)} (${dinero(o.precio)}). ¿Está disponible?`)} target="_blank" rel="noopener"
                  className="btn btn-borde w-full"><IconoWhatsApp className="h-[18px] w-[18px] text-wa" />Preguntar por WhatsApp</a>
              </div>
              {q > 0 && <p className="mt-3 text-sm font-semibold text-marca"><span key={q} className="inline-block motion-safe:animate-entrar">{q} en el carrito</span> ·<button type="button" onClick={abrirCarrito} className="underline underline-offset-2">Ver carrito</button></p>}
            </div>
          )}

          {/* ventajas y entrega-iconos: la moto avanza, el camión rueda y la tarjeta gira, como en la portada (animación 22) */}
          <ul ref={entregaLista} data-visto={entregaVista || undefined} className="ventajas entrega-iconos mt-5 grid gap-2.5 text-sm text-tinta-2">
            {entrega.map((e, n) => (
              <li key={e.texto} className="flex items-start gap-2.5">
                <span style={{ "--orden": n } as React.CSSProperties} className={`icono-ventaja mt-px inline-block shrink-0 text-marca ${e.clase}`}>{e.icono}</span>{e.texto}
              </li>
            ))}
          </ul>
          <button type="button" onClick={compartir} className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-tinta-2 hover:text-tinta">
            {/* Al copiar el enlace, la flecha se cambia por un ✓ que se dibuja */}
            {copiado
              ? <><IconoCheck className="dibujar h-4 w-4 text-marca" /><span className="inline-block motion-safe:animate-entrar">Enlace copiado</span></>
              : <><IconoCompartir />Compartir este producto</>}
          </button>
        </div>
      </div>
      {!p.consultar && (
        <BarraAgregar boton={boton} nombre={nombreItem(p, o.nombre)} precio={o.precio} tope={tope} alAgregar={alAgregar}
          etiqueta={<EtiquetaAgregar vez={vez} recien={recien} cantidad={q} tope={tope} />} />
      )}

      <section aria-labelledby="h-desc" aria-busy={descripcion === null} className="border-t border-linea bg-fondo">
        {descripcion === null ? (
          // Mientras llega la descripción: la forma de la sección, para que no aparezca de golpe (suele tardar milésimas)
          <div className="contenedor grid min-h-[320px] gap-8 py-10 lg:grid-cols-2 lg:gap-12">
            <div><h2 id="h-desc" className="text-xl font-extrabold">Descripción</h2><div aria-hidden="true" className="esqueleto mt-3 h-24 w-full" /></div>
            <div aria-hidden="true" className="esqueleto h-48 w-full" />
          </div>
        ) : (
        <div className="contenedor py-10">
          <LoPrincipal filas={descripcion.ficha ?? []} />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <h2 id="h-desc" className="text-xl font-extrabold">Descripción</h2>
            <p className="mt-3 leading-relaxed text-tinta-2">{d.resumen}</p>
            <h3 className="etiqueta mt-6">Qué incluye la caja</h3>
            <p className="mt-2 text-tinta-2">{d.incluye}</p>
            <p className="mt-3 text-[13px] text-tinta-3">El contenido puede variar según el fabricante. Si necesitas algo puntual, pregúntanos antes de comprar.</p>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold">Características</h2>
            <dl className="mt-3 overflow-hidden rounded-md border border-linea bg-white text-sm">
              {d.filas.map(([k, v], n) => (
                <div key={`${k}-${n}`} className={`grid grid-cols-[minmax(110px,38%)_1fr] gap-3 px-4 py-2.5 ${n ? "border-t border-linea" : ""}`}>
                  <dt className="font-semibold text-tinta-2">{k}</dt><dd className="break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        </div>
        )}
      </section>

      {relacionados.length > 0 && (
        <section aria-labelledby="t-relacionados" className="contenedor py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 id="t-relacionados" className="text-xl font-extrabold">También te puede interesar</h2>
            <a href={`#${vista}`} className="enlace-suelto shrink-0 text-sm">Ver {VISTAS[vista]?.toLowerCase()}</a>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{relacionados.map(r => <li key={r.id}><TarjetaProducto producto={r} /></li>)}</ul>
        </section>
      )}
    </>
  );
}
