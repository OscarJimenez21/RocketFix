import { useEffect, useMemo, useState } from "react";
import { CONFIG, MAS_VENDIDOS, PAQUETES, PRODUCTOS, SERVICIOS, deTienda, desde, etiquetaDe, porId } from "../data/catalogo";
import { camposServicio } from "../data/formularios";
import { PRINCIPALES, TIENDAS, tiendaPorId } from "../data/tiendas";
import { PuntoEstado, useAtencion } from "../components/Contacto";
import { FilaProductos } from "../components/FilaProductos";
import { FormularioWhatsApp } from "../components/FormularioWhatsApp";
import { FotoProducto } from "../components/FotoProducto";
import { IconoCamion, IconoCheck, IconoLlama, IconoMoto, IconoTarjeta, IconoWhatsApp } from "../components/Iconos";
import { Ilustracion } from "../components/Ilustracion";
import { dinero } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { Producto, Servicio } from "../types";

/** Productos de la vitrina de la portada, en este orden */
const VITRINA = ["ip18pm", "ss26u", "p45631", "mbairm5", "switch2", "appro3"];
const ESPERA_VITRINA = 6000;

/** Vitrina: un producto grande y los demás en miniatura. Cambia sola con un fundido (se detiene con el mouse encima,
    al usar el teclado o si la persona pidió menos movimiento). */
function Vitrina() {
  const productos = useMemo(() => VITRINA.map(id => porId[id]).filter((p): p is Producto => Boolean(p)), []);
  const [i, setI] = useState(0);
  const [quieta, setQuieta] = useState(false);
  const [reducir] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (quieta || reducir || productos.length < 2) return;
    const t = window.setTimeout(() => setI(x => (x + 1) % productos.length), ESPERA_VITRINA);
    return () => window.clearTimeout(t);
  }, [i, quieta, reducir, productos.length]);

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
      <div className="flex items-center justify-between gap-3 border-t border-linea px-4 py-3.5 sm:px-5" aria-live={quieta ? "polite" : "off"}>
        <div className="min-w-0">
          <p className="truncate font-display text-[17px] font-bold">{p.nombre}</p>
          <p className="text-sm text-tinta-2">{p.opciones.length > 1 && "Desde "}<b className="font-display text-[15px] tabular-nums text-tinta">{dinero(desde(p))}</b></p>
        </div>
        <a href={hrefProducto(p.id)} className="btn btn-sm btn-marca shrink-0">Ver producto</a>
      </div>
      <div className="grid grid-cols-6 gap-1.5 border-t border-linea bg-fondo p-2 sm:gap-2 sm:p-2.5">
        {productos.map((x, j) => (
          <button key={x.id} type="button" onClick={() => setI(j)} aria-label={`Ver ${x.nombre}`} aria-current={j === i || undefined}
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

function MasVendidos({ productos }: { productos: Producto[] }) {
  return (
    <section aria-labelledby="t-vendidos" className="border-b border-linea bg-fondo">
      <div className="contenedor py-10 sm:py-12">
        <FilaProductos productos={productos} etiqueta="Productos más vendidos" cinta="Top ventas" encabezado={
          <>
            <p className="etiqueta flex items-center gap-1.5"><IconoLlama className="h-4 w-4 text-acento" />Lo más vendido</p>
            <h2 id="t-vendidos" className="titulo-seccion mt-1">Los que todos quieren</h2>
          </>
        } />
      </div>
    </section>
  );
}

/** Las seis secciones principales con foto; las demás como accesos rápidos, para que la portada no sea un directorio */
function Categorias() {
  const principales = PRINCIPALES.map(tiendaPorId).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const otras = TIENDAS.filter(t => !PRINCIPALES.includes(t.id));
  return (
    <section id="categorias" aria-labelledby="t-categorias" className="contenedor py-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h2 id="t-categorias" className="titulo-seccion">Compra por categoría</h2>
        <p className="text-sm text-tinta-2">{PRODUCTOS.length} productos en {TIENDAS.length} categorías</p>
      </div>
      <ul className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-6">
        {principales.map(t => {
          const p = porId[t.foto] ?? deTienda(t.id).find(x => x.imagen);
          return (
            <li key={t.id}>
              <a href={`#${t.vista}`} className="tarjeta flex h-full flex-col items-center p-2.5 text-center transition-colors hover:border-marca sm:p-3">
                <span className="block aspect-square w-full p-1 sm:p-2">{p && <FotoProducto producto={p} alt="" />}</span>
                <span className="mt-1.5 text-[13.5px] font-semibold leading-tight sm:text-[15px]">{t.menu}</span>
                <span className="mt-0.5 text-xs text-tinta-3">{deTienda(t.id).length} productos</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-tinta-2">También:</span>
        {otras.map(t => (
          <a key={t.id} href={`#${t.vista}`} className="chip">{t.menu}<span className="text-xs tabular-nums text-tinta-3">{deTienda(t.id).length}</span></a>
        ))}
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
      <MasVendidos productos={vendidos} />
      <Categorias />
      <Servicios />
      <ComoComprar />
    </>
  );
}
