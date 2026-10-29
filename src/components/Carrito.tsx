/* Panel del carrito: productos, entrega, pago, totales con envío y envío del pedido por WhatsApp (o pago con Bold).
   La página nunca envía el mensaje: abre WhatsApp con el pedido escrito y la persona lo envía. */
import { useEffect, useId, useRef, useState } from "react";
import { CONFIG, nombreItem } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { abrirBold, boldActivo, nuevaReferencia } from "../lib/bold";
import { dinero, lista } from "../lib/formato";
import { envioDe, mensajePedido, reglaEnvio, subtotalDe, type DatosPedido } from "../lib/pedido";
import { hrefProducto } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { ZonaEntrega } from "../types";
import { FotoProducto } from "./FotoProducto";
import { IconoCerrar, IconoTarjeta, IconoWhatsApp } from "./Iconos";

const GUARDADO = "rocketfix-datos-pedido";
const datosIniciales = (): DatosPedido => {
  try {
    const d = JSON.parse(sessionStorage.getItem(GUARDADO) || "null") as DatosPedido | null;
    if (d) return d;
  } catch { /* sin almacenamiento */ }
  return { nombre: "", entrega: "bogota", dir: "", pago: CONFIG.pagos.bogota[0] ?? "", nota: "" };
};

export function Carrito() {
  const { lineas, carritoAbierto, cerrarCarrito, cambiar, quitar, avisar } = useTienda();
  const [d, setD] = useState<DatosPedido>(datosIniciales);
  const [errores, setErrores] = useState<{ nombre?: boolean; dir?: boolean; texto?: string }>({});
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  const foco = useRef<Element | null>(null);
  const id = useId();

  useEffect(() => { try { sessionStorage.setItem(GUARDADO, JSON.stringify(d)); } catch { /* sin almacenamiento */ } }, [d]);

  // Al abrir: bloquea el fondo, enfoca "cerrar" y recuerda dónde estaba el foco; Esc cierra
  useEffect(() => {
    if (!carritoAbierto) return;
    foco.current = document.activeElement;
    document.documentElement.style.overflow = "hidden";
    const pagina = document.getElementById("pagina");
    if (pagina) pagina.inert = true;
    setTimeout(() => cerrar.current?.focus(), 30);
    const alTecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrarCarrito(); };
    document.addEventListener("keydown", alTecla);
    return () => {
      document.documentElement.style.overflow = "";
      if (pagina) pagina.inert = false;
      document.removeEventListener("keydown", alTecla);
      // Safari no enfoca los botones al hacer clic: si no había foco previo, se suelta el del panel que se cierra
      if (foco.current instanceof HTMLElement && foco.current !== document.body) foco.current.focus();
      else if (document.activeElement instanceof HTMLElement && panel.current?.contains(document.activeElement)) document.activeElement.blur();
    };
  }, [carritoAbierto, cerrarCarrito]);

  // Cerrado, el panel no se puede enfocar ni lo leen los lectores de pantalla
  useEffect(() => { if (panel.current) panel.current.inert = !carritoAbierto; }, [carritoAbierto]);

  // Cerrar al navegar (ej.: al tocar el nombre de un producto)
  useEffect(() => {
    window.addEventListener("hashchange", cerrarCarrito);
    return () => window.removeEventListener("hashchange", cerrarCarrito);
  }, [cerrarCarrito]);

  const zona = d.entrega;
  const pagos = CONFIG.pagos[zona];
  const pago = pagos.includes(d.pago) ? d.pago : pagos[0] ?? "";
  const datos = { ...d, pago };
  const subtotal = subtotalDe(lineas);
  const envio = envioDe(zona, subtotal);
  const meta = CONFIG.envios[zona].gratisDesde;
  const total = subtotal + envio;
  const mensaje = mensajePedido(lineas, datos);
  const nacional = zona === "nacional";

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
    if (faltan.length) document.getElementById(`${id}-${e.nombre ? "nombre" : "dir"}`)?.focus();
    return !faltan.length;
  }

  async function pagarConBold() {
    if (!validar()) return;
    const ref = nuevaReferencia();
    // El pedido queda guardado para enviarlo por WhatsApp cuando Bold devuelva al cliente a la tienda
    try { localStorage.setItem("rf-pago-" + ref, mensajePedido(lineas, datos, `Pagado en línea con Bold · referencia ${ref}`)); } catch { /* sin almacenamiento */ }
    try {
      const modo = await abrirBold(ref, total, `Pedido ${ref} · Total ${dinero(total)}`);
      if (modo === "copiado") avisar(`En Bold escribe el total: ${dinero(total)}. Ya lo copiamos para que lo pegues.`);
    } catch {
      avisar(`No se pudo abrir el pago en línea. Envíanos el pedido por WhatsApp al ${CONFIG.whatsappVisible}.`);
    }
  }

  const campo = (k: "nombre" | "dir") => `campo ${errores[k] ? "campo-invalido" : ""}`;

  // El contenedor mide lo mismo que la pantalla y recorta el panel cerrado: si sobresaliera, Chrome en celular alejaría toda la página
  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${carritoAbierto ? "" : "pointer-events-none"}`}>
      <div onClick={cerrarCarrito} aria-hidden="true"
        className={`absolute inset-0 bg-marca-noche/40 transition-opacity ${carritoAbierto ? "opacity-100" : "opacity-0"}`} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={`${id}-titulo`}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white shadow-flota transition-transform duration-300 ease-cajon ${carritoAbierto ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-center justify-between border-b border-linea px-5 py-4">
          <h2 id={`${id}-titulo`} className="text-xl font-extrabold">Tu pedido</h2>
          <button ref={cerrar} type="button" onClick={cerrarCarrito} aria-label="Cerrar carrito" className="-my-1 -mr-2 flex h-11 w-11 items-center justify-center rounded text-tinta-2 hover:bg-fondo hover:text-tinta"><IconoCerrar /></button>
        </header>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-lg font-semibold">Tu carrito está vacío</p>
            <p className="text-sm text-tinta-2">Agrega celulares, computadores o accesorios y aquí armamos el mensaje para WhatsApp.</p>
            <button type="button" onClick={cerrarCarrito} className="btn btn-borde mt-2">Seguir viendo productos</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="divide-y divide-linea px-5">
                {lineas.map(({ producto: p, opcion: o, clave, cantidad }) => {
                  const nombre = nombreItem(p, o.nombre);
                  const tope = p.stock != null && cantidad >= p.stock;
                  return (
                    <li key={clave} className="grid grid-cols-[64px_1fr] gap-3 py-4">
                      <a href={hrefProducto(p.id)} className="h-16 w-16 rounded border border-linea bg-white p-1" tabIndex={-1} aria-hidden="true"><FotoProducto producto={p} alt="" /></a>
                      <div className="min-w-0">
                        <a href={hrefProducto(p.id)} className="line-clamp-2 text-[14.5px] font-semibold leading-snug hover:text-marca">{nombre}</a>
                        <p className="mt-0.5 text-xs text-tinta-2">{dinero(o.precio)} c/u</p>
                        {/* Con montos grandes o en pantallas angostas, el total baja a su propio renglón (antes se salía de la pantalla) */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <div className="inline-flex items-center rounded border border-linea-fuerte" role="group" aria-label={`Cantidad de ${nombre}`}>
                            <button type="button" onClick={() => cambiar(clave, -1)} aria-label="Quitar una unidad" className="h-11 w-11 text-lg leading-none hover:bg-fondo">−</button>
                            <output className="w-7 text-center font-mono text-sm" aria-live="polite">{cantidad}</output>
                            <button type="button" onClick={() => cambiar(clave, 1)} disabled={tope} aria-label="Agregar una unidad" className="h-11 w-11 text-lg leading-none hover:bg-fondo disabled:opacity-40">+</button>
                          </div>
                          <button type="button" onClick={() => quitar(clave)} className="min-h-[44px] px-1 text-[13px] font-semibold text-tinta-2 underline-offset-2 hover:text-red-700 hover:underline">Quitar</button>
                          <span className="ml-auto whitespace-nowrap font-semibold tabular-nums">{dinero(o.precio * cantidad)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <form className="grid gap-4 border-t border-linea bg-fondo px-5 py-5" noValidate onSubmit={e => e.preventDefault()}>
                <div>
                  <label htmlFor={`${id}-nombre`} className="rotulo">Tu nombre</label>
                  <input id={`${id}-nombre`} className={campo("nombre")} autoComplete="name" placeholder="Nombre y apellido" value={d.nombre}
                    aria-invalid={errores.nombre || undefined} onChange={e => poner("nombre", e.target.value)} />
                </div>
                <fieldset>
                  <legend className="rotulo">Entrega</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {([["bogota", "Bogotá y alrededores"], ["nacional", "Otra ciudad"]] as [ZonaEntrega, string][]).map(([v, t]) => (
                      <label key={v} className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2.5 text-sm font-semibold ${zona === v ? "border-marca bg-white ring-1 ring-marca" : "border-linea-fuerte bg-white"}`}>
                        <input type="radio" name={`${id}-entrega`} value={v} checked={zona === v} onChange={() => poner("entrega", v)} className="accent-[#0B8457]" />{t}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor={`${id}-dir`} className="rotulo">{nacional ? "Ciudad, dirección y barrio" : "Dirección y barrio"}</label>
                  <input id={`${id}-dir`} className={campo("dir")} autoComplete="street-address" value={d.dir}
                    placeholder={nacional ? "Ciudad, calle, número y barrio" : "Calle, número y barrio"}
                    aria-invalid={errores.dir || undefined} onChange={e => poner("dir", e.target.value)} />
                  <p className="mt-1.5 text-xs text-tinta-2">{nacional ? CONFIG.envio : CONFIG.domicilio} {reglaEnvio(zona)}</p>
                </div>
                <div>
                  <label htmlFor={`${id}-pago`} className="rotulo">Cómo vas a pagar</label>
                  <select id={`${id}-pago`} className="campo" value={pago} onChange={e => poner("pago", e.target.value)}>
                    {pagos.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${id}-nota`} className="rotulo">Nota <span className="opcional">(opcional)</span></label>
                  <input id={`${id}-nota`} className="campo" placeholder="Color, si necesitas factura u otra indicación" value={d.nota} onChange={e => poner("nota", e.target.value)} />
                </div>
                <details className="rounded border border-linea bg-white">
                  <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-tinta-2">Ver el mensaje que se va a enviar</summary>
                  <pre className="whitespace-pre-wrap border-t border-linea px-3 py-3 font-mono text-xs leading-relaxed text-tinta-2">{mensaje}</pre>
                </details>
              </form>
            </div>

            <footer className="border-t border-linea px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4">
              <dl className="grid gap-1 text-sm">
                <div className="flex justify-between"><dt className="text-tinta-2">Productos</dt><dd>{dinero(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-tinta-2">{nacional ? "Envío a otra ciudad" : "Envío en Bogotá"}</dt><dd className={envio ? "" : "font-semibold text-marca"}>{envio ? dinero(envio) : "Gratis"}</dd></div>
              </dl>
              <div className="mt-2">
                <p className="text-xs text-tinta-2">{envio ? `Te faltan ${dinero(meta - subtotal)} para el envío gratis ${nacional ? "a otra ciudad" : "en Bogotá"}.` : "¡Tu pedido tiene envío gratis!"}</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fondo" aria-hidden="true">
                  {/* Se mueve con scaleX (no con el ancho), que no obliga a recalcular la página */}
                  <div className="h-full origin-left bg-marca transition-transform duration-300 ease-salida" style={{ transform: `scaleX(${Math.min(1, subtotal / meta)})` }} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-linea pt-3">
                <span className="font-semibold">Total</span>
                <strong className="font-display text-2xl tabular-nums">{dinero(total)}</strong>
              </div>
              {errores.texto && <p className="alerta mt-2" role="alert">{errores.texto}</p>}
              {/* El pedido por WhatsApp es el camino principal: ahí se confirma la disponibilidad antes de cobrar */}
              <div className="mt-3 grid gap-2">
                <a href={waLink(mensaje)} target="_blank" rel="noopener" onClick={e => { if (!validar()) e.preventDefault(); }} className="btn btn-wa w-full">
                  <IconoWhatsApp />Enviar pedido por WhatsApp
                </a>
                {boldActivo() && (
                  <button type="button" onClick={pagarConBold} className="btn btn-borde w-full"><IconoTarjeta />Pagar en línea con Bold</button>
                )}
              </div>
              <p className="mt-2 text-center text-xs leading-relaxed text-tinta-3">
                Enviar el pedido no es un pago: se abre WhatsApp con el pedido escrito, lo envías y te confirmamos disponibilidad y total.
                {boldActivo() && " Si prefieres pagar ya, Bold acepta tarjeta, PSE y más."}
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
