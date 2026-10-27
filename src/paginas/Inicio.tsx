import { useEffect, useMemo, useState } from "react";
import { CONFIG, MAS_VENDIDOS, PRODUCTOS, SERVICIOS, deTienda, desde, etiquetaDe, porId } from "../data/catalogo";
import { camposServicio } from "../data/formularios";
import { TIENDAS } from "../data/tiendas";
import { PuntoEstado, useAtencion } from "../components/Contacto";
import { FilaProductos } from "../components/FilaProductos";
import { FormularioWhatsApp } from "../components/FormularioWhatsApp";
import { FotoProducto } from "../components/FotoProducto";
import { IconoCamion, IconoLlama, IconoMoto, IconoTarjeta, IconoWhatsApp } from "../components/Iconos";
import { Ilustracion } from "../components/Ilustracion";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { dinero } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { Producto } from "../types";

/** Productos que pasan en la vitrina de la portada, en este orden */
const VITRINA = ["ip18pm", "ss26u", "p45631", "mbairm5", "switch2", "appro3"];
const ESPERA_VITRINA = 4500;

/** Vitrina de la portada: cambia sola de producto (se detiene con el mouse encima, al usar el teclado
    o si la persona pidió menos movimiento); los puntos de abajo eligen uno */
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
    <div role="region" aria-roledescription="carrusel" aria-label="Productos estrella" className="relative mx-auto w-full max-w-[440px]"
      onMouseEnter={() => setQuieta(true)} onMouseLeave={() => setQuieta(false)} onFocus={() => setQuieta(true)} onBlur={() => setQuieta(false)}>
      {/* Luz suave detrás de la vitrina */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-12 bg-[radial-gradient(closest-side,rgba(61,213,152,0.3),transparent)]" />
      <div className="relative overflow-hidden rounded-lg bg-white text-tinta shadow-flota">
        <div className="relative aspect-[5/4] sm:aspect-square">
          {productos.map((x, j) => (
            <a key={x.id} href={hrefProducto(x.id)} tabIndex={j === i ? 0 : -1} aria-hidden={j !== i}
              className={`absolute inset-0 p-8 transition-all duration-700 ease-out sm:p-10 ${j === i ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"}`}>
              <span className="animar-flotar block h-full w-full"><FotoProducto producto={x} alt={x.nombre} prioridad={j === 0} /></span>
            </a>
          ))}
          <span className="absolute left-4 top-4 rounded-sm bg-tinta px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-white">{etiquetaDe(p)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-linea px-5 py-4" aria-live={quieta ? "polite" : "off"}>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">{p.nombre}</p>
            <p className="text-sm text-tinta-2">{p.opciones.length > 1 && "Desde "}<b className="font-display text-base text-tinta">{dinero(desde(p))}</b></p>
          </div>
          <a href={hrefProducto(p.id)} className="btn btn-sm btn-primario shrink-0">Ver producto</a>
        </div>
        {/* Barra que avanza hasta el siguiente producto */}
        {!reducir && !quieta && (
          <span key={i} aria-hidden="true" className="animar-avance absolute inset-x-0 bottom-0 block h-1 origin-left bg-acento" style={{ animationDuration: `${ESPERA_VITRINA}ms` }} />
        )}
      </div>
      <div className="mt-5 flex justify-center gap-2">
        {productos.map((x, j) => (
          <button key={x.id} type="button" onClick={() => setI(j)} aria-label={`Ver ${x.nombre}`} aria-current={j === i || undefined}
            className={`h-2.5 rounded-full transition-all ${j === i ? "w-7 bg-brillo" : "w-2.5 bg-white/35 hover:bg-white/60"}`} />
        ))}
      </div>
    </div>
  );
}

function Portada() {
  const atencion = useAtencion();
  return (
    <section className="relative overflow-hidden bg-marca-oscuro text-white">
      <div aria-hidden="true" className="fondo-puntos absolute inset-0" />
      <div className="contenedor relative grid items-center gap-10 py-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:py-20 lg:py-24">
        <div>
          <p className="etiqueta-mono flex items-center gap-2.5 text-marca-menta"><span aria-hidden="true" className="h-px w-8 bg-marca-menta" />Tienda y servicio técnico · Bogotá</p>
          <h1 tabIndex={-1} className="ancho-122 mt-4 text-[40px] font-extrabold leading-[1.02] text-white sm:text-[54px] lg:text-[66px]">
            Vendemos, reparamos e instalamos <span className="text-brillo">tecnología</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/80 sm:text-lg">Celulares, computadores, gaming y accesorios con entrega a domicilio. Además, reparamos tus equipos e instalamos cámaras de seguridad.</p>
          <div className="mt-7 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <a href="#celulares" className="btn btn-primario sm:px-6 sm:text-base">Ver celulares</a>
            <a href="#computadores" className="btn btn-claro sm:px-6 sm:text-base">Ver computadores</a>
            <a href="#servicios" className="btn btn-claro sm:px-6 sm:text-base">Servicio técnico</a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-white/15 pt-5 text-sm sm:mt-8 sm:pt-6">
            <p className="flex items-center gap-2 font-semibold"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</p>
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-semibold text-white hover:text-marca-menta">
              <IconoWhatsApp className="h-5 w-5 text-wa-vivo" />{CONFIG.whatsappVisible}
            </a>
            <p className="text-white/70"><b className="font-display text-base text-white">{PRODUCTOS.length}</b> productos en {TIENDAS.length} categorías</p>
          </div>
        </div>
        <Vitrina />
      </div>
    </section>
  );
}

function MasVendidos({ productos }: { productos: Producto[] }) {
  return (
    <section aria-labelledby="t-vendidos" className="border-b border-linea bg-acento-suave">
      <div className="contenedor py-10 sm:py-12">
        <FilaProductos productos={productos} etiqueta="Productos más vendidos" cinta="Top ventas" encabezado={
          <>
            <p className="etiqueta-mono">Lo más vendido</p>
            <h2 id="t-vendidos" className="mt-1 text-2xl font-extrabold sm:text-[30px]">
              Los que todos quieren <IconoLlama className="animar-llama inline-block h-7 w-7 align-[-5px] text-acento sm:h-8 sm:w-8" />
            </h2>
          </>
        } />
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

function Categorias() {
  return (
    <section aria-labelledby="t-categorias" className="contenedor py-12">
      <h2 id="t-categorias" className="text-2xl font-extrabold">Compra por categoría</h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TIENDAS.map(t => {
          const p = porId[t.foto] ?? deTienda(t.id).find(x => x.imagen);
          return (
            <li key={t.id}>
              <a href={`#${t.vista}`} className="group flex h-full flex-col rounded-md border border-linea bg-white p-3 transition-colors hover:border-marca">
                <span className="block aspect-[4/3] p-2">{p && <FotoProducto producto={p} alt="" className="transition-transform duration-300 group-hover:scale-[1.04]" />}</span>
                <span className="mt-2 font-semibold">{t.titulo}</span>
                <span className="text-xs text-tinta-3">{deTienda(t.id).length} productos</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Servicios() {
  const titulos = [...SERVICIOS.map(s => s.titulo), "Otro servicio"];
  const [elegido, setElegido] = useState(titulos[0] ?? "");
  const servicio = SERVICIOS.find(s => s.titulo === elegido);
  const campos = useMemo(() => camposServicio(servicio, titulos), [servicio]); // eslint-disable-line react-hooks/exhaustive-deps
  const solicitar = (titulo: string) => {
    setElegido(titulo);
    document.getElementById("orden")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section id="servicios" aria-labelledby="t-servicios" className="border-y border-linea bg-fondo">
      <div className="contenedor py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="etiqueta-mono">Servicio técnico</p>
            <h2 id="t-servicios" className="mt-1 text-2xl font-extrabold">Reparamos e instalamos</h2>
          </div>
          <p className="max-w-md text-sm text-tinta-2">Coordinamos contigo por WhatsApp cómo recibir tu equipo, y vamos a tu casa o negocio para instalar cámaras.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SERVICIOS.map(s => (
            <article key={s.id} className="flex flex-col rounded-md border border-linea bg-white p-5">
              <Ilustracion nombre={s.ilustracion} className="h-14 w-[72px] text-marca-medio" />
              <h3 className="mt-3 text-lg font-bold">{s.titulo}</h3>
              <p className="mt-1 text-sm text-tinta-2">{s.texto}</p>
              <ul className="mt-3 grid gap-1.5 text-sm">
                {s.trabajos.map(t => <li key={t} className="flex gap-2"><span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-marca" />{t}</li>)}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
                <button type="button" onClick={() => solicitar(s.titulo)} className="btn btn-sm btn-borde">Solicitar este servicio</button>
                <a href={`#${s.articulo}`} className="enlace text-sm">Leer el artículo</a>
              </div>
            </article>
          ))}
        </div>
        <div id="orden" className="mt-8 grid gap-6 rounded-md border border-linea bg-white p-5 md:grid-cols-[280px_1fr] md:p-7">
          <div>
            <h3 className="text-xl font-bold">Solicita un servicio</h3>
            <p className="mt-2 text-sm text-tinta-2">Cuéntanos qué necesitas. Con estos datos te respondemos por WhatsApp con un valor aproximado o la fecha de la visita.</p>
            <ol className="mt-4 grid gap-2 text-sm text-tinta-2">
              {["Llenas este formulario.", "Se abre WhatsApp con tu solicitud escrita y la envías.", "Te respondemos con el diagnóstico inicial o agendamos la visita."].map((t, i) => (
                <li key={t} className="flex gap-2.5"><span className="font-mono text-xs font-semibold text-marca">{i + 1}</span>{t}</li>
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
    ["Envía el pedido por WhatsApp", "El mensaje sale escrito con los productos, el total y la forma de entrega."],
    ["Confirmamos y entregamos", `Te confirmamos disponibilidad y pago. En Bogotá y alrededores te lo llevamos el mismo día y puedes pagar contra entrega; al resto de Colombia lo enviamos con pago anticipado. Envío gratis en Bogotá desde ${dinero(CONFIG.envios.bogota.gratisDesde)} y al resto del país desde ${dinero(CONFIG.envios.nacional.gratisDesde)}.`]
  ];
  return (
    <section aria-labelledby="t-como" className="mt-12 border-t border-linea pt-10">
      <h2 id="t-como" className="text-xl font-extrabold">Cómo comprar</h2>
      <ol className="mt-5 grid gap-6 md:grid-cols-3">
        {pasos.map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marca-suave font-mono text-sm font-semibold text-marca">{i + 1}</span>
            <div><p className="font-semibold">{t}</p><p className="mt-1 text-sm text-tinta-2">{d}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Inicio({ ancla }: { ancla?: string }) {
  const vendidos = MAS_VENDIDOS.map(id => porId[id]).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const destacados = PRODUCTOS.filter(p => p.destacado).slice(0, 4);

  // #servicios, #contacto y #orden llevan a su sección de la portada
  useEffect(() => {
    if (ancla) requestAnimationFrame(() => document.getElementById(ancla)?.scrollIntoView({ block: "start" }));
  }, [ancla]);

  return (
    <>
      <Portada />
      <Ventajas />
      <MasVendidos productos={vendidos} />
      <Categorias />
      <Servicios />
      <div className="contenedor py-12">
        <section aria-labelledby="t-destacados">
          <h2 id="t-destacados" className="text-2xl font-extrabold">Productos destacados</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {destacados.map(p => <li key={p.id}><TarjetaProducto producto={p} /></li>)}
          </ul>
        </section>
        <ComoComprar />
      </div>
    </>
  );
}
