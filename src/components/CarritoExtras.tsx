/* Partes nuevas del carrito (ideas del 11/11/2026):
   - Sugerencias (20): con el carrito vacío, tres de los más vendidos para empezar.
   - Enviado (21): después de abrir WhatsApp con el pedido, una pantalla de «listo» con el cohete despegando (animación 65).
     El carrito no se vacía: el pedido todavía no está confirmado.
   - Cotizacion (22): la misma información del pedido en una hoja para imprimir o guardar en PDF (solo se ve al imprimir). */
import { createPortal } from "react-dom";
import { CONFIG, MAS_VENDIDOS, nombreItem, porId } from "../data/catalogo";
import { activa } from "../lib/animaciones";
import { dinero } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import type { LineaCarrito, Producto } from "../types";
import { FotoProducto } from "./FotoProducto";
import { IconoWhatsApp } from "./Iconos";
import { Cohete, Logo } from "./Logo";
import { useVistos } from "../lib/vistos";

export function Sugerencias() {
  const vistos = useVistos().filter(p => !p.consultar);
  const conVistos = vistos.length >= 2;
  const lista = conVistos ? vistos.slice(0, 3) : MAS_VENDIDOS.map(id => porId[id]).filter((p): p is Producto => Boolean(p && !p.consultar)).slice(0, 3);
  if (!lista.length) return null;
  return (
    <div className="mt-4 w-full text-left">
      <p className="etiqueta mb-2 text-center">{conVistos ? "Lo que viste hace poco" : "Para empezar, lo más vendido"}</p>
      <ul className="grid gap-2">
        {lista.map(p => (
          <li key={p.id}>
            <a href={hrefProducto(p.id)} className="flex items-center gap-3 rounded-md border border-linea p-2 hover:border-linea-fuerte">
              <span className="escenario h-12 w-12 shrink-0 rounded p-1"><FotoProducto producto={p} alt="" tamanos="48px" /></span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-sm font-semibold">{p.nombre}</span>
                <span className="text-xs text-tinta-2">{p.opciones.length > 1 ? "Desde " : ""}{dinero(Math.min(...p.opciones.map(o => o.precio)))}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Enviado({ enlace, volver, seguir }: { enlace: string; volver: () => void; seguir: () => void }) {
  return (
    <div role="status" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-superficie px-8 text-center motion-safe:animate-entrar">
      <span aria-hidden="true" className="relative mb-2 flex h-28 w-24 items-end justify-center">
        <span className={activa(65) ? "pedido-despega" : ""}><Cohete className="h-14 w-14 text-marca" /></span>
        <span className="absolute bottom-0 h-[3px] w-16 rounded-full bg-linea-fuerte" />
      </span>
      <p className="text-xl font-extrabold">Abrimos WhatsApp con tu pedido</p>
      <p className="text-sm text-tinta-2">Envía el mensaje que se abrió en WhatsApp. Te respondemos para confirmar disponibilidad y el total.</p>
      <a href={enlace} target="_blank" rel="noopener" className="btn btn-wa mt-2 w-full"><IconoWhatsApp />Abrir WhatsApp otra vez</a>
      <button type="button" onClick={seguir} className="btn btn-borde w-full">Seguir viendo productos</button>
      <button type="button" onClick={volver} className="enlace-suelto text-sm">Volver a mi pedido</button>
    </div>
  );
}

export function Cotizacion({ lineas, subtotal, envio, total, entrega }: { lineas: LineaCarrito[]; subtotal: number; envio: number; total: number; entrega: string }) {
  const hoy = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  return createPortal(
    <section className="solo-imprimir claro-siempre" aria-hidden="true">
      <div className="flex items-start justify-between gap-6 border-b border-linea pb-4">
        <Logo />
        <div className="text-right text-sm">
          <p className="text-lg font-extrabold">Cotización</p>
          <p>{hoy}</p>
          <p>WhatsApp {CONFIG.whatsappVisible}</p>
        </div>
      </div>
      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-linea text-left">
            <th className="py-2 pr-3">Producto</th><th className="py-2 pr-3 text-right">Cantidad</th><th className="py-2 pr-3 text-right">Precio c/u</th><th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineas.map(l => (
            <tr key={l.clave} className="border-b border-linea">
              <td className="py-2 pr-3">{nombreItem(l.producto, l.opcion.nombre)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{l.cantidad}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{dinero(l.opcion.precio)}</td>
              <td className="py-2 text-right tabular-nums">{dinero(l.opcion.precio * l.cantidad)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={3} className="pt-3 text-right">Productos</td><td className="pt-3 text-right tabular-nums">{dinero(subtotal)}</td></tr>
          <tr><td colSpan={3} className="text-right">{entrega}</td><td className="text-right tabular-nums">{envio ? dinero(envio) : "Gratis"}</td></tr>
          <tr><td colSpan={3} className="pt-2 text-right font-bold">Total</td><td className="pt-2 text-right text-lg font-extrabold tabular-nums">{dinero(total)}</td></tr>
        </tfoot>
      </table>
      <p className="mt-6 text-xs text-tinta-2">Precios en pesos colombianos. Antes de cualquier pago te confirmamos disponibilidad por WhatsApp al {CONFIG.whatsappVisible}.</p>
    </section>,
    document.body
  );
}
