import { useEffect, useMemo, useState } from "react";
import { CONFIG, MAS_VENDIDOS, PRODUCTOS, SERVICIOS, deTienda, porId } from "../data/catalogo";
import { camposServicio } from "../data/formularios";
import { TIENDAS } from "../data/tiendas";
import { BotonCopiar, PuntoEstado, useAtencion } from "../components/Contacto";
import { FilaProductos } from "../components/FilaProductos";
import { FormularioWhatsApp } from "../components/FormularioWhatsApp";
import { FotoProducto } from "../components/FotoProducto";
import { IconoCamion, IconoMoto, IconoTarjeta, IconoWhatsApp } from "../components/Iconos";
import { Ilustracion } from "../components/Ilustracion";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { dinero } from "../lib/formato";
import { waLink } from "../lib/whatsapp";

function Portada() {
  const atencion = useAtencion();
  return (
    <section className="bg-marca-oscuro text-white">
      <div className="contenedor grid gap-8 py-10 md:grid-cols-[1fr_340px] md:items-center md:py-14">
        <div>
          <p className="etiqueta-mono text-marca-menta">Tienda y servicio técnico · Bogotá</p>
          <h1 tabIndex={-1} className="mt-3 max-w-2xl text-[34px] font-extrabold leading-[1.05] text-white sm:text-[44px]">
            Vendemos, reparamos e instalamos <span className="text-brillo">tecnología</span>
          </h1>
          <p className="mt-4 max-w-xl text-[16.5px] text-white/80">Celulares, computadores, gaming y accesorios con entrega a domicilio. Además, reparamos tus equipos e instalamos cámaras de seguridad.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href="#celulares" className="btn btn-primario">Ver celulares</a>
            <a href="#computadores" className="btn btn-claro">Ver computadores</a>
            <a href="#servicios" className="btn btn-claro">Servicio técnico</a>
          </div>
        </div>
        <aside aria-label="Horario de atención" className="rounded-md bg-white p-5 text-tinta">
          <p className="flex items-center gap-2 text-sm font-semibold"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="etiqueta-mono">Atención</dt><dd className="mt-0.5 text-tinta-2">{CONFIG.atencion}</dd></div>
            <div><dt className="etiqueta-mono">WhatsApp</dt><dd className="mt-0.5 flex items-center justify-between gap-2"><span className="font-display text-lg font-bold">{CONFIG.whatsappVisible}</span><BotonCopiar texto={CONFIG.whatsappVisible} /></dd></div>
          </dl>
          <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="btn btn-wa mt-4 w-full"><IconoWhatsApp />Escribir por WhatsApp</a>
        </aside>
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
      <Categorias />
      <section aria-labelledby="t-vendidos" className="contenedor pb-12">
        <div className="mb-5"><p className="etiqueta-mono">Lo más vendido</p><h2 id="t-vendidos" className="mt-1 text-2xl font-extrabold">Los que todos quieren</h2></div>
        <FilaProductos productos={vendidos} etiqueta="Productos más vendidos" />
      </section>
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
