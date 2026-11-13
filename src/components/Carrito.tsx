/* Panel del carrito: productos, entrega, pago, totales con envío y envío del pedido por WhatsApp (o pago con Bold).
   La página nunca envía el mensaje: abre WhatsApp con el pedido escrito y la persona lo envía. */
import { useEffect, useId, useRef, useState } from "react";
import { CONFIG, nombreItem } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { abrirBold, boldActivo, clavePago, nuevaReferencia } from "../lib/bold";
import { dinero, lista } from "../lib/formato";
import { usePanelModal } from "../lib/panel";
import { FRANJAS, envioDe, leerDatosPedido, mensajePedido, nuevoNumeroPedido, reglaEnvio, subtotalDe, type DatosPedido } from "../lib/pedido";
import { enlaceCarrito, leerCarritoCompartido } from "../lib/carritoCompartido";
import { alCambiarPagina, hrefProducto, hrefDe } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { ZonaEntrega } from "../types";
import { activa } from "../lib/animaciones";
import { temblor, useMarco } from "../lib/movimiento";
import { Cotizacion, Enviado, Sugerencias } from "./CarritoExtras";
import { FotoProducto } from "./FotoProducto";
import { Pesos } from "./Pesos";
import { IconoCerrar, IconoCheck, IconoImprimir, IconoTarjeta, IconoWhatsApp } from "./Iconos";
import { Cohete } from "./Logo";

/** Cantidad de un producto en el carrito: al sumar, el número nuevo entra desde arriba; al restar, desde abajo */
function Cantidad({ valor, vivo }: { valor: number; vivo: boolean }) {
  const [paso, setPaso] = useState({ valor, dir: 0 });
  if (paso.valor !== valor) setPaso({ valor, dir: valor > paso.valor ? 1 : -1 });
  const dir = paso.valor !== valor ? (valor > paso.valor ? 1 : -1) : paso.dir;
  return (
    <output className="block h-5 w-7 overflow-hidden text-center font-mono text-sm leading-5" aria-live={vivo ? "polite" : "off"}>
      <span key={valor} className={`block ${dir > 0 ? "motion-safe:animate-rodar-arriba" : dir < 0 ? "motion-safe:animate-rodar-abajo" : ""}`}>{valor}</span>
    </output>
  );
}

/** Guía corta arriba del carrito: los tres pasos de la compra y en cuál va la persona (el primero ya está hecho porque
    tiene productos). `vez` cuenta las veces que se abre el carrito: el ✓ del primer paso se dibuja en cada apertura */
function GuiaPasos({ vez }: { vez: number }) {
  const pasos = ["Arma tu carrito", "Envía el pedido por WhatsApp", "Confirmamos y entregamos"];
  return (
    <ol aria-label="Pasos para comprar" className="grid shrink-0 grid-cols-3 gap-2 border-b border-linea bg-fondo px-4 py-3">
      {pasos.map((t, i) => (
        <li key={t} aria-current={i === 1 ? "step" : undefined} className="relative flex flex-col items-center gap-1.5 text-center">
          {/* Línea punteada hasta el paso siguiente: verde la que ya se recorrió */}
          {i < pasos.length - 1 && (
            <span aria-hidden="true" className={`absolute left-[calc(50%+16px)] top-[11px] w-[calc(100%-24px)] border-t-2 border-dotted ${i === 0 ? "border-marca/60" : "border-linea-fuerte"}`} />
          )}
          <span className={`relative flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-marca text-white" : i === 1 ? "bg-superficie text-marca ring-2 ring-marca" : "bg-superficie text-tinta-3 ring-1 ring-linea-fuerte"}`}>
            {i === 0 ? <IconoCheck key={vez} className="dibujar h-3.5 w-3.5 [--retraso:280ms]" /> : i + 1}
          </span>
          <span className={`text-[12px] leading-tight ${i === 1 ? "font-semibold text-tinta" : "text-tinta-2"}`}>{t}{i === 0 && <span className="sr-only"> (hecho)</span>}</span>
        </li>
      ))}
    </ol>
  );
}

/** Entrega en Bogotá o en otra ciudad. Animación 25: al cambiar, el marco verde se desliza de una opción a la otra */
function OpcionesEntrega({ zona, nombre, elegir }: { zona: ZonaEntrega; nombre: string; elegir: (z: ZonaEntrega) => void }) {
  const opciones: [ZonaEntrega, string][] = [["bogota", "Bogotá y alrededores"], ["nacional", "Otra ciudad"]];
  const caja = useRef<HTMLDivElement>(null);
  const medido = useMarco(caja, zona === "bogota" ? 0 : 1);
  const marco = activa(25) ? medido : null;
  return (
    <div ref={caja} className="relative grid grid-cols-2 gap-2">
      {opciones.map(([v, t]) => (
        <label key={v} data-opcion className={`flex cursor-pointer items-center gap-2 rounded border bg-superficie px-3 py-2.5 text-sm font-semibold ${zona === v && !marco ? "border-marca ring-1 ring-marca" : "border-linea-fuerte"}`}>
          <input type="radio" name={nombre} value={v} checked={zona === v} onChange={() => elegir(v)} className="accent-[#0B8457]" />{t}
        </label>
      ))}
      {marco && <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded border border-marca ring-1 ring-marca" style={marco} />}
    </div>
  );
}

const GUARDADO = "rocketfix-datos-pedido";
const datosIniciales = (): DatosPedido => {
  try { return leerDatosPedido(sessionStorage.getItem(GUARDADO)); } catch { return leerDatosPedido(null); }
};
/** Idea 35: el número del pedido se guarda en la sesión (al recargar sigue siendo el mismo) */
const NUMERO = "rf-numero-pedido";
const numeroInicial = () => {
  try {
    const n = sessionStorage.getItem(NUMERO);
    if (n && /^RF-[2-9A-Z]{5}$/.test(n)) return n;
  } catch { /* sin almacenamiento */ }
  return nuevoNumeroPedido();
};
/** Los avisos al abrir la tienda (carrito compartido o carrito guardado) salen una sola vez */
let avisoInicial = false;

export function Carrito() {
  const { lineas, unidades, carritoAbierto, cerrarCarrito, abrirCarrito, cambiar, quitar, vaciar, reponer, avisar } = useTienda();
  const [d, setD] = useState<DatosPedido>(datosIniciales);
  const [numero, setNumero] = useState(numeroInicial);
  useEffect(() => { try { sessionStorage.setItem(NUMERO, numero); } catch { /* sin almacenamiento */ } }, [numero]);
  // Después de enviar un pedido, si el carrito cambia es otro pedido: otro número
  const usado = useRef(false);
  useEffect(() => { if (usado.current) { usado.current = false; setNumero(nuevoNumeroPedido()); } }, [lineas]);

  // Idea 38: al abrir un enlace con ?carrito=, se pregunta antes de agregar esos productos.
  // Idea 41: si no, y la persona vuelve con productos en el carrito, se le recuerda una vez por visita
  useEffect(() => {
    if (avisoInicial) return;
    avisoInicial = true;
    const compartido = leerCarritoCompartido(location.search);
    const n = Object.values(compartido).reduce((s, q) => s + q, 0);
    if (n) {
      const url = new URL(location.href);
      url.searchParams.delete("carrito");
      history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      window.setTimeout(() => avisar(`Te compartieron un carrito con ${n} ${n === 1 ? "producto" : "productos"}`, { texto: "Agregarlos", hacer: () => { reponer(compartido); abrirCarrito(); } }), 900);
      return;
    }
    let yaAvisado = false;
    try { yaAvisado = sessionStorage.getItem("rf-aviso-carrito") === "1"; sessionStorage.setItem("rf-aviso-carrito", "1"); } catch { yaAvisado = true; }
    if (!yaAvisado && unidades > 0) {
      window.setTimeout(() => avisar(`Tienes ${unidades} ${unidades === 1 ? "producto" : "productos"} en tu carrito`, { texto: "Ver carrito", hacer: abrirCarrito }), 1500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [errores, setErrores] = useState<{ nombre?: boolean; dir?: boolean; texto?: string }>({});
  // Envíos con datos faltantes: en cada uno, los campos marcados tiemblan
  const [intento, setIntento] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  const id = useId();
  // Idea 21: pantalla de «listo» después de abrir WhatsApp con el pedido (se quita al cerrar el carrito o al cambiarlo)
  const [enviado, setEnviado] = useState(false);
  useEffect(() => { if (!carritoAbierto) setEnviado(false); }, [carritoAbierto]);
  useEffect(() => { setEnviado(false); }, [lineas]);

  useEffect(() => { try { sessionStorage.setItem(GUARDADO, JSON.stringify(d)); } catch { /* sin almacenamiento */ } }, [d]);

  // Abierto: bloquea el fondo, enfoca «cerrar» y Esc cierra; al cerrar, el foco vuelve a donde estaba (ver lib/panel.ts)
  usePanelModal(carritoAbierto, cerrarCarrito, panel, cerrar);

  // Cerrar al navegar (ej.: al tocar el nombre de un producto)
  useEffect(() => {
    return alCambiarPagina(cerrarCarrito);
  }, [cerrarCarrito]);

  const zona = d.entrega;
  const pagos = CONFIG.pagos[zona];
  const pago = pagos.includes(d.pago) ? d.pago : pagos[0] ?? "";
  const datos = { ...d, pago };
  const subtotal = subtotalDe(lineas);
  const envio = envioDe(zona, subtotal);
  const meta = CONFIG.envios[zona].gratisDesde;
  const total = subtotal + envio;
  const mensaje = mensajePedido(lineas, datos, undefined, numero);
  const nacional = zona === "nacional";

  // Al quitar un producto, su línea se desvanece hacia la derecha (180 ms) antes de salir; con «reducir movimiento» sale de una vez
  const [saliendo, setSaliendo] = useState<string[]>([]);
  // Mejora 8: al quitar un producto sale un aviso con «Deshacer» (6 s) que lo vuelve a poner con la misma cantidad
  const sacar = (clave: string) => {
    const l = lineas.find(x => x.clave === clave);
    const deshacer = () => {
      if (!l) return;
      reponer({ [clave]: l.cantidad });
      avisar(`Volviste a poner ${nombreItem(l.producto, l.opcion.nombre)}`);
    };
    if (l) avisar(`Quitaste ${nombreItem(l.producto, l.opcion.nombre)}`, { texto: "Deshacer", hacer: deshacer });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { quitar(clave); return; }
    setSaliendo(s => (s.includes(clave) ? s : [...s, clave]));
    window.setTimeout(() => { quitar(clave); setSaliendo(s => s.filter(x => x !== clave)); }, 180);
  };
  // Mejora 9: vaciar el carrito de una vez, también con «Deshacer»
  const vaciarTodo = () => {
    const antes = Object.fromEntries(lineas.map(l => [l.clave, l.cantidad]));
    vaciar();
    avisar("Vaciaste el carrito", { texto: "Deshacer", hacer: () => { reponer(antes); avisar("Volviste a poner tus productos"); } });
  };
  // Mejora 10: copiar el pedido (para pegarlo en WhatsApp Web en otro equipo, o en un correo)
  const [copiado, setCopiado] = useState(0);
  const copiarPedido = async () => {
    try { await navigator.clipboard.writeText(mensaje); setCopiado(n => n + 1); window.setTimeout(() => setCopiado(0), 2200); }
    catch { avisar("No se pudo copiar. Abre «Ver el mensaje» y cópialo a mano."); }
  };
  // Idea 38: enlace con los productos del carrito (sin datos personales: ni nombre ni dirección)
  const compartirCarrito = async () => {
    const url = enlaceCarrito(lineas);
    if (navigator.share) { navigator.share({ title: `Carrito de ${CONFIG.nombre}`, url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(url); avisar("Copiamos el enlace de tu carrito"); } catch { avisar(url); }
  };
  // Mejora 11: la cotización solo se imprime con su botón. Antes, imprimir cualquier página con productos en el carrito
  // (Ctrl+P) sacaba la cotización en vez de la página
  const imprimirCotizacion = () => {
    const raiz = document.documentElement;
    raiz.classList.add("imprimir-cotizacion");
    const quitarClase = () => { raiz.classList.remove("imprimir-cotizacion"); window.removeEventListener("afterprint", quitarClase); };
    window.addEventListener("afterprint", quitarClase);
    window.print();
    window.setTimeout(quitarClase, 1500);
  };

  // Cuando el pedido llega al envío gratis, «Gratis» da un salto y el aviso cambia. Si pasa con el carrito cerrado
  // (al agregar desde un producto), se celebra al abrirlo
  const envioAntes = useRef(envio);
  const porCelebrar = useRef(false);
  const [festejo, setFestejo] = useState(0);
  useEffect(() => {
    if (envioAntes.current > 0 && envio === 0 && subtotal > 0) porCelebrar.current = true;
    if (envio > 0) porCelebrar.current = false;
    envioAntes.current = envio;
    if (porCelebrar.current && carritoAbierto) { porCelebrar.current = false; setFestejo(n => n + 1); }
  }, [envio, subtotal, carritoAbierto]);

  // El producto que se agregó con el carrito cerrado se resalta al abrirlo: un fondo verde que se desvanece.
  // Si quedó abajo en la lista, la lista baja hasta él
  const cantidades = useRef<Record<string, number>>(Object.fromEntries(lineas.map(l => [l.clave, l.cantidad])));
  const porResaltar = useRef<string | null>(null);
  const [resaltada, setResaltada] = useState<{ clave: string; vez: number } | null>(null);
  useEffect(() => {
    if (!carritoAbierto) {
      const nueva = lineas.find(l => l.cantidad > (cantidades.current[l.clave] ?? 0));
      if (nueva) porResaltar.current = nueva.clave;
    }
    cantidades.current = Object.fromEntries(lineas.map(l => [l.clave, l.cantidad]));
  }, [lineas, carritoAbierto]);
  // Veces que se ha abierto el carrito (el ✓ de la guía se dibuja en cada apertura)
  const [aperturas, setAperturas] = useState(0);
  useEffect(() => {
    if (!carritoAbierto) return;
    setAperturas(n => n + 1);
    const clave = porResaltar.current;
    porResaltar.current = null;
    if (clave) setResaltada(r => ({ clave, vez: (r?.vez ?? 0) + 1 }));
  }, [carritoAbierto]);
  useEffect(() => {
    if (resaltada) panel.current?.querySelector(`[data-clave="${CSS.escape(resaltada.clave)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [resaltada]);

  // Al escribir en un campo que estaba marcado, se quita su marca y el aviso (se vuelve a validar al enviar)
  const poner = <K extends keyof DatosPedido>(k: K, v: DatosPedido[K]) => {
    setD(x => ({ ...x, [k]: v }));
    if (k === "nombre" || k === "dir") {
      const campo = k as "nombre" | "dir";
      setErrores(e => (e[campo] ? { ...e, [campo]: false, texto: undefined } : e));
    }
  };

  function validar() {
    const e = { nombre: !d.nombre.trim(), dir: !d.dir.trim() };
    const faltan = [e.nombre && "tu nombre", e.dir && (nacional ? "la ciudad y la dirección" : "la dirección de entrega")].filter(Boolean) as string[];
    setErrores({ ...e, texto: faltan.length ? `Completa ${lista(faltan)} para enviar el pedido.` : undefined });
    if (faltan.length) setIntento(n => n + 1);
    if (faltan.length) document.getElementById(`${id}-${e.nombre ? "nombre" : "dir"}`)?.focus();
    return !faltan.length;
  }

  async function pagarConBold() {
    if (!validar()) return;
    const ref = nuevaReferencia();
    // El pedido queda guardado para enviarlo por WhatsApp cuando Bold devuelva al cliente a la tienda
    try { localStorage.setItem(clavePago(ref), mensajePedido(lineas, datos, `Pagado en línea con Bold · referencia ${ref}`, numero)); } catch { /* sin almacenamiento */ }
    usado.current = true;
    try {
      const modo = await abrirBold(ref, total, `Pedido ${ref} · Total ${dinero(total)}`);
      if (modo === "copiado") avisar(`En Bold escribe el total: ${dinero(total)}. Ya lo copiamos para que lo pegues.`);
    } catch {
      avisar(`No se pudo abrir el pago en línea. Envíanos el pedido por WhatsApp al ${CONFIG.whatsappVisible}.`);
    }
  }

  const campo = (k: "nombre" | "dir") => `campo ${errores[k] ? "campo-invalido" : ""}${temblor(Boolean(errores[k]), intento)}`;

  // Cada vez que cambia el total, se ilumina en verde un instante
  const [cambiosTotal, setCambiosTotal] = useState({ total, n: 0 });
  if (cambiosTotal.total !== total) setCambiosTotal({ total, n: cambiosTotal.n + 1 });
  const vezTotal = cambiosTotal.total !== total ? cambiosTotal.n + 1 : cambiosTotal.n;

  // El cohete de la barra de envío gratis va en la punta de la barra (0 a 1)
  const avance = Math.min(1, subtotal / meta);

  // Animación 27: si la persona quita el último producto con el carrito abierto, el cohete aterriza en su plataforma
  const [aterrizajes, setAterrizajes] = useState({ hay: lineas.length > 0, n: 0 });
  if (aterrizajes.hay !== lineas.length > 0) setAterrizajes({ hay: lineas.length > 0, n: aterrizajes.n + (lineas.length === 0 && carritoAbierto ? 1 : 0) });
  // Animación 24: al abrir el carrito, sus productos entran uno tras otro
  const lineasEntran = carritoAbierto && activa(24);
  // Animación 26: cuando el nombre y la dirección ya están escritos, un destello cruza el botón de enviar
  const listo = Boolean(d.nombre.trim() && d.dir.trim());

  // Notas antes de enviar: que el pedido no es un pago, el derecho de retracto (arts. 46 y 50, Ley 1480) y la política de datos.
  // Se muestran en uno de dos lugares según el alto de la pantalla (ver más abajo)
  const notas = (
    <>
      <p className="text-center text-xs leading-relaxed text-tinta-3">
        Enviar el pedido no es un pago: se abre WhatsApp con el pedido escrito, lo envías y te confirmamos disponibilidad y total.
        {/* Idea 47: quién procesa el pago en línea */}
        {boldActivo() && " Si prefieres pagar ya, Bold acepta tarjeta, PSE y más; el pago lo procesa Bold en su propia ventana y la tienda no ve los datos de tu tarjeta."}
      </p>
      <p className="mt-1.5 text-center text-xs leading-relaxed text-tinta-3">
        Tienes <a href={hrefDe("cambios-y-devoluciones")} className="enlace">derecho de retracto</a> por 5 días hábiles desde la entrega. Al enviar el pedido aceptas el <a href={hrefDe("datos-personales")} className="enlace">tratamiento de tus datos</a>.
      </p>
    </>
  );

  // El contenedor mide lo mismo que la pantalla y recorta el panel cerrado: si sobresaliera, Chrome en celular alejaría toda la página
  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${carritoAbierto ? "" : "pointer-events-none"}`}>
      <div onClick={cerrarCarrito} aria-hidden="true"
        className={`absolute inset-0 bg-marca-noche/40 transition-opacity duration-300 ${carritoAbierto ? "opacity-100" : "opacity-0"}`} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={`${id}-titulo`}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col overflow-hidden bg-superficie shadow-flota transition-transform duration-300 ease-cajon ${carritoAbierto ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-center justify-between border-b border-linea px-5 py-4">
          <h2 id={`${id}-titulo`} className="text-xl font-extrabold">Tu pedido{unidades > 0 && <span className="ml-1.5 align-middle text-sm font-semibold text-tinta-3">({unidades} {unidades === 1 ? "producto" : "productos"})</span>}</h2>
          <button ref={cerrar} type="button" onClick={cerrarCarrito} aria-label="Cerrar carrito" className="cerrar-gira presionable -my-1 -mr-2 flex h-11 w-11 items-center justify-center rounded text-tinta-2 hover:bg-fondo hover:text-tinta"><IconoCerrar /></button>
        </header>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            {/* El cohete del logo flota suave sobre su plataforma, esperando el primer producto */}
            <span aria-hidden="true" className="mb-1 flex flex-col items-center">
              <span key={aterrizajes.n} className={aterrizajes.n && activa(27) ? "cohete-aterriza" : undefined}>
                <span className="block motion-safe:animate-flotar"><Cohete className="h-14 w-14 text-marca" /></span>
              </span>
              <span className="mt-2.5 h-[3px] w-16 rounded-full bg-linea-fuerte" />
            </span>
            <p className="text-lg font-semibold">Tu carrito está vacío</p>
            <p className="text-sm text-tinta-2">Agrega celulares, computadores o accesorios y aquí armamos el mensaje para WhatsApp.</p>
            <button type="button" onClick={cerrarCarrito} className="btn btn-borde mt-2">Seguir viendo productos</button>
            {/* Idea 20: tres de los más vendidos para empezar */}
            <Sugerencias />
          </div>
        ) : (
          <>
            {/* La guía de pasos va dentro de lo que se desliza: en un celular, con la guía y el pie fijos, al formulario
                le quedaban unos 100 px de alto y había que llenarlo por una rendija */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <GuiaPasos vez={aperturas} />
              <ul className="divide-y divide-linea px-5">
                {lineas.map(({ producto: p, opcion: o, clave, cantidad }, k) => {
                  const nombre = nombreItem(p, o.nombre);
                  const tope = p.stock != null && cantidad >= p.stock;
                  return (
                    <li key={clave} data-clave={clave} style={{ "--i": Math.min(k, 6) } as React.CSSProperties}
                      className={`relative isolate grid grid-cols-[64px_1fr] gap-3 py-4 transition-[opacity,transform] duration-[180ms] ease-salida ${saliendo.includes(clave) ? "pointer-events-none translate-x-3 opacity-0" : ""}${lineasEntran ? " linea-entra" : ""}`}>
                      {/* El último producto agregado: fondo verde claro que se desvanece al abrir el carrito */}
                      {resaltada?.clave === clave && <span key={resaltada.vez} aria-hidden="true" className="absolute inset-y-0 -left-5 -right-5 -z-10 bg-marca-suave opacity-0 motion-safe:animate-desvanecer" />}
                      <a href={hrefProducto(p.id)} className="escenario h-16 w-16 rounded border border-linea p-1" tabIndex={-1} aria-hidden="true"><FotoProducto producto={p} alt="" tamanos="64px" /></a>
                      <div className="min-w-0">
                        <a href={hrefProducto(p.id)} title={nombre} className="line-clamp-2 text-[14.5px] font-semibold leading-snug hover:text-marca">{nombre}</a>
                        <p className="mt-0.5 text-xs text-tinta-2">{dinero(o.precio)} c/u</p>
                        {/* Con montos grandes o en pantallas angostas, el total baja a su propio renglón (antes se salía de la pantalla) */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <div className="inline-flex items-center rounded border border-linea-fuerte" role="group" aria-label={`Cantidad de ${nombre}`}>
                            <button type="button" onClick={() => (cantidad === 1 ? sacar(clave) : cambiar(clave, -1))} aria-label="Quitar una unidad" className="presionable h-11 w-11 text-lg leading-none hover:bg-fondo">−</button>
                            <Cantidad valor={cantidad} vivo={carritoAbierto} />
                            <button type="button" onClick={() => cambiar(clave, 1)} disabled={tope} aria-label="Agregar una unidad" className="presionable h-11 w-11 text-lg leading-none hover:bg-fondo disabled:opacity-40">+</button>
                          </div>
                          <button type="button" onClick={() => sacar(clave)} className="min-h-[44px] px-1 text-[13px] font-semibold text-tinta-2 underline-offset-2 hover:text-red-700 hover:underline">Quitar</button>
                          <span className="ml-auto whitespace-nowrap font-semibold tabular-nums">{dinero(o.precio * cantidad)}</span>
                        </div>
                        {/* Mejora 12: si ya llegó al máximo disponible, se dice (antes el + solo se apagaba, sin explicar por qué) */}
                        {tope && <p className="mt-1 text-xs text-tinta-2">Es todo lo que hay disponible de este producto.</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex justify-end px-5 pb-2">
                <button type="button" onClick={vaciarTodo} className="min-h-[40px] px-1 text-[13px] font-semibold text-tinta-2 underline-offset-2 hover:text-red-700 hover:underline">Vaciar carrito</button>
              </div>

              <form className="grid gap-4 border-t border-linea bg-fondo px-5 py-5" noValidate onSubmit={e => e.preventDefault()}>
                <div>
                  <label htmlFor={`${id}-nombre`} className="rotulo">Tu nombre</label>
                  <input id={`${id}-nombre`} name="nombre" className={campo("nombre")} autoComplete="name" autoCapitalize="words" enterKeyHint="next" placeholder="Nombre y apellido" value={d.nombre}
                    aria-required="true" aria-invalid={errores.nombre || undefined} aria-describedby={errores.nombre ? `${id}-error` : undefined} onChange={e => poner("nombre", e.target.value)} />
                </div>
                <fieldset>
                  <legend className="rotulo">Entrega</legend>
                  <OpcionesEntrega zona={zona} nombre={`${id}-entrega`} elegir={v => poner("entrega", v)} />
                </fieldset>
                <div>
                  <label htmlFor={`${id}-dir`} className="rotulo">{nacional ? "Ciudad, dirección y barrio" : "Dirección y barrio"}</label>
                  <input id={`${id}-dir`} name="direccion" className={campo("dir")} autoComplete="street-address" enterKeyHint="next" value={d.dir} aria-required="true"
                    placeholder={nacional ? "Ciudad, calle, número y barrio" : "Calle, número y barrio"}
                    aria-invalid={errores.dir || undefined} aria-describedby={[errores.dir && `${id}-error`, `${id}-dir-ayuda`].filter(Boolean).join(" ")} onChange={e => poner("dir", e.target.value)} />
                  <p id={`${id}-dir-ayuda`} className="mt-1.5 text-xs text-tinta-2">{nacional ? CONFIG.envio : CONFIG.domicilio} {reglaEnvio(zona)}</p>
                </div>
                {/* Idea 34: en Bogotá, a qué hora prefiere recibirlo (se confirma por WhatsApp) */}
                {!nacional && (
                  <div>
                    <label htmlFor={`${id}-franja`} className="rotulo">Prefieres recibirlo <span className="opcional">(opcional)</span></label>
                    <select id={`${id}-franja`} name="franja" className="campo" value={d.franja ?? ""} onChange={e => poner("franja", e.target.value)}>
                      <option value="">Sin preferencia</option>
                      {FRANJAS.map(f => <option key={f} value={f}>En la {f.toLowerCase()}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor={`${id}-pago`} className="rotulo">Cómo vas a pagar</label>
                  <select id={`${id}-pago`} name="pago" className="campo" value={pago} onChange={e => poner("pago", e.target.value)}>
                    {pagos.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${id}-nota`} className="rotulo">Nota <span className="opcional">(opcional)</span></label>
                  <input id={`${id}-nota`} name="nota" autoComplete="off" enterKeyHint="done" className="campo" placeholder="Color, si necesitas factura u otra indicación" value={d.nota} onChange={e => poner("nota", e.target.value)} />
                </div>
                <details className="desplegable rounded border border-linea bg-superficie">
                  <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-tinta-2">Ver el mensaje que se va a enviar</summary>
                  <pre className="whitespace-pre-wrap border-t border-linea px-3 py-3 font-mono text-xs leading-relaxed text-tinta-2">{mensaje}</pre>
                </details>
                <div className="flex flex-wrap gap-2">
                  {/* Idea 22: la cotización en una hoja para imprimir o guardar en PDF (con los productos, el envío y el total) */}
                  <button type="button" onClick={imprimirCotizacion} className="btn btn-borde btn-sm"><IconoImprimir className="h-4 w-4" />Imprimir o guardar cotización en PDF</button>
                  <button type="button" onClick={copiarPedido} className="btn btn-borde btn-sm" aria-live="polite">
                    {copiado ? <><IconoCheck key={copiado} className="dibujar h-4 w-4 text-marca" />Pedido copiado</> : "Copiar el pedido"}
                  </button>
                  <button type="button" onClick={compartirCarrito} className="btn btn-borde btn-sm">Compartir este carrito</button>
                </div>
              </form>
              {/* En celular las notas van aquí, al final del formulario, y el pie fijo queda solo con el total y los botones */}
              <div className="bg-fondo px-5 pb-5 sm:[@media(min-height:780px)]:hidden">{notas}</div>
            </div>

            <footer className="border-t border-linea px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4">
              <dl className="grid gap-1 text-sm">
                <div className="flex justify-between"><dt className="text-tinta-2">Productos</dt><dd>{dinero(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-tinta-2">{nacional ? "Envío a otra ciudad" : "Envío en Bogotá"}</dt>
                  {/* La clave vuelve a montar «Gratis» en cada festejo para que el salto se repita */}
                  <dd key={envio ? "pago" : `gratis-${festejo}`} className={envio ? "" : `origin-right font-semibold text-marca ${festejo ? "motion-safe:animate-latido motion-safe:[animation-delay:200ms]" : ""}`}>{envio ? dinero(envio) : "Gratis"}</dd></div>
              </dl>
              <div className="mt-2">
                <p key={envio ? "falta" : `gratis-${festejo}`} className={`text-xs ${envio ? "text-tinta-2" : "font-semibold text-marca motion-safe:animate-entrar"}`}>{envio ? `Te faltan ${dinero(meta - subtotal)} para el envío gratis ${nacional ? "a otra ciudad" : "en Bogotá"}.` : "¡Tu pedido tiene envío gratis!"}</p>
                <div className="relative mt-2.5" aria-hidden="true">
                  <div className="h-1.5 overflow-hidden rounded-full bg-fondo">
                    {/* Se mueve con scaleX (no con el ancho), que no obliga a recalcular la página */}
                    <div className="h-full origin-left bg-marca transition-transform duration-300 ease-salida" style={{ transform: `scaleX(${avance})` }} />
                  </div>
                  {/* Un cohete pequeño va en la punta de la barra. Se ubica con left (no con una capa corrida con transform, que
                      se salía del panel y lo dejaba correrse de lado). Recorre la barra de borde a borde: a cualquier avance cubre la punta
                      de la parte llena sin salirse por los lados. Al llegar al envío gratis da un salto (la clave lo repite) */}
                  <div className="pointer-events-none absolute top-1/2 h-0 w-0 transition-[left] duration-300 ease-salida" style={{ left: `calc(${avance} * (100% - 1.5rem))` }}>
                    <span className="absolute left-0 top-0 block -translate-y-1/2">
                      <span key={festejo} className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300 ${envio ? "bg-superficie text-marca ring-1 ring-linea-fuerte" : "bg-marca text-white"} ${festejo ? "motion-safe:animate-brinco" : ""}`}>
                        <Cohete className="h-4 w-4 rotate-90" />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-linea pt-3">
                <span className="font-semibold">Total</span>
                {/* La clave cambia con el total: así se ilumina en verde cada vez que cambia */}
                <strong key={vezTotal} className={`font-display text-2xl tabular-nums ${vezTotal ? "motion-safe:animate-resaltar" : ""}`}><Pesos valor={total} /></strong>
              </div>
              {errores.texto && <p id={`${id}-error`} className="alerta mt-2" role="alert">{errores.texto}</p>}
              {/* El pedido por WhatsApp es el camino principal: ahí se confirma la disponibilidad antes de cobrar */}
              <div className="mt-3 grid gap-2">
                <a href={waLink(mensaje)} target="_blank" rel="noopener" onClick={e => { if (!validar()) e.preventDefault(); else { setEnviado(true); usado.current = true; } }} className={`btn btn-wa barrido w-full${listo ? " barrido-enviar" : ""}`}>
                  <IconoWhatsApp />Enviar pedido por WhatsApp
                </a>
                {boldActivo() && (
                  <button type="button" onClick={pagarConBold} className="btn btn-borde w-full"><IconoTarjeta />Pagar en línea con Bold</button>
                )}
              </div>
              {/* En pantallas anchas y altas (computador, tablet) las notas siguen bajo los botones */}
              <div className="mt-2 hidden sm:[@media(min-height:780px)]:block">{notas}</div>
            </footer>
            {enviado && <Enviado enlace={waLink(mensaje)} volver={() => setEnviado(false)} seguir={cerrarCarrito} />}
            <Cotizacion lineas={lineas} subtotal={subtotal} envio={envio} total={total} entrega={nacional ? "Envío a otra ciudad" : "Envío en Bogotá"} />
          </>
        )}
      </div>
    </div>
  );
}
