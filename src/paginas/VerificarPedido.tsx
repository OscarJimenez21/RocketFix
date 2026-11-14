/* Página interna /verificar-pedido/ (antifraude, 14/11/2026). Rocket Fix pega aquí el pedido que llegó por WhatsApp y
   la página lo compara con los precios de hoy (lib/verificarPedido.ts). No tiene enlaces desde la tienda, no se indexa
   y no guarda ni envía lo que se pega. */
import { useEffect, useId, useMemo, useState } from "react";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { consultarPagoBold, lineaComprobante, type ComprobanteBold } from "../lib/bold";
import { dinero } from "../lib/formato";
import { hrefDe, hrefProducto } from "../lib/rutas";
import { revisarPedido, type EstadoLinea } from "../lib/verificarPedido";

const ROTULO: Record<EstadoLinea, string> = { bien: "Coincide", precio: "Precio distinto", desconocido: "No está en la tienda", consultar: "Preguntar disponibilidad" };
const COLOR: Record<EstadoLinea, string> = { bien: "text-marca", precio: "text-[#C62828]", desconocido: "text-[#C62828]", consultar: "text-tinta-2" };

function useNoIndexar() {
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
}

/** Consulta en Bold el pago de esa referencia: lo que diga Bold vale más que el texto del mensaje, que el cliente puede editar.
    Bold solo deja consultar un pago durante las 24 horas siguientes; después, se revisa en su panel. */
function PagoBold({ referencia, comprobante, total }: { referencia?: string; comprobante?: string; total: number }) {
  const [estado, setEstado] = useState<"listo" | "consultando" | "no-hay" | ComprobanteBold>("listo");
  if (!referencia) return <p className="mt-3 text-sm">El mensaje no trae la referencia de Bold (RF…). Búscala en el panel de Bold por el nombre del cliente o la hora.</p>;
  const consultar = async () => { setEstado("consultando"); setEstado((await consultarPagoBold(referencia, 1)) ?? "no-hay"); };
  const c = typeof estado === "object" ? estado : null;
  const avisos = c ? [
    c.estado !== "Aprobado" && `Bold reporta el pago como «${c.estado}», no aprobado.`,
    c.total !== undefined && c.total !== total && `Bold cobró ${dinero(c.total)}, pero el pedido con los precios de la tienda da ${dinero(total)}.`,
    comprobante && comprobante !== c.transaccion && `El mensaje trae el comprobante ${comprobante}, pero Bold dice ${c.transaccion}.`
  ].filter((a): a is string => Boolean(a)) : [];
  return (
    <div className="mt-3 rounded-md border border-linea px-4 py-3 text-sm">
      {!c && (
        <>
          <button type="button" onClick={consultar} disabled={estado === "consultando"} className="btn btn-borde">{estado === "consultando" ? "Consultando…" : `Consultar el pago ${referencia} en Bold`}</button>
          {estado === "no-hay" && <p className="mt-2">Bold no tiene un pago con esa referencia. Puede tardar hasta 10 minutos en aparecer; si pasaron más de 24 horas, búscalo en el panel de Bold. No despaches sin verlo.</p>}
        </>
      )}
      {c && (
        <>
          <p className="font-semibold">{avisos.length ? "Bold no coincide con el pedido" : "Bold confirma el pago"}</p>
          <p className="mt-1 tabular-nums">{lineaComprobante(c)}</p>
          {avisos.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5">{avisos.map(a => <li key={a}>{a}</li>)}</ul>}
          {!avisos.length && <p className="mt-1 text-xs text-tinta-3">Si fue por PSE, el estado puede cambiar: confírmalo en el panel de Bold antes de despachar.</p>}
        </>
      )}
    </div>
  );
}

export function VerificarPedido() {
  useNoIndexar();
  const id = useId();
  const [texto, setTexto] = useState("");
  const r = useMemo(() => (texto.trim() ? revisarPedido(texto) : null), [texto]);
  const bien = r && !r.problemas.length;

  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: hrefDe("inicio") }, { texto: "Verificar pedido" }]} titulo="Verificar un pedido"
        lead="Pega el mensaje del cliente tal como llegó por WhatsApp. Se compara cada línea con los precios de hoy en la tienda." />
      <div className="contenedor grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <label htmlFor={`${id}-texto`} className="mb-1.5 block text-sm font-semibold">Mensaje del pedido</label>
          <textarea id={`${id}-texto`} value={texto} onChange={e => setTexto(e.target.value)} rows={16} spellCheck={false}
            placeholder={"Hola Rocket Fix, quiero hacer este pedido (n.º RF-XXXXX):\n\n• 1 × …: $ …\n\nProductos: …\nEnvío: …\nTotal: …"}
            className="campo w-full font-mono text-sm" />
          <p className="mt-2 text-xs text-tinta-3">Lo que pegas se queda en esta pantalla: no se guarda ni se envía.</p>
          {texto && <button type="button" onClick={() => setTexto("")} className="btn btn-borde mt-3">Borrar</button>}
        </div>

        <div aria-live="polite">
          {!r ? (
            <div className="rounded-md border border-dashed border-linea-fuerte px-6 py-10 text-sm text-tinta-2">
              <p className="font-semibold text-tinta">Antes de despachar cualquier pedido</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Confirma que el dinero ya está en la cuenta o en el panel de Bold. Una captura de pantalla no es prueba de pago.</li>
                <li>Si pagó con Bold, busca la referencia en el panel y compara el valor pagado con el total de aquí.</li>
                <li>Si el mensaje no coincide, pide al cliente que vuelva a armar el pedido desde la tienda.</li>
              </ul>
            </div>
          ) : (
            <>
              <div role="status" className={`rounded-md px-4 py-3 ${bien ? "bg-marca-suave" : "bg-acento-suave"}`}>
                <p className="font-semibold">{bien ? `El pedido coincide con la tienda: ${dinero(r.esperado.total)}` : `Revisa ${r.problemas.length === 1 ? "1 diferencia" : `${r.problemas.length} diferencias`} antes de cobrar`}</p>
                {r.numero && <p className="text-sm">Pedido {r.numero}</p>}
                {r.pagoBold && <p className="mt-1 text-sm">Dice que pagó con Bold{r.referencia ? ` (referencia ${r.referencia})` : ""}. Consulta el pago real abajo o en el panel de Bold.</p>}
              </div>
              {r.pagoBold && <PagoBold key={r.referencia ?? ""} referencia={r.referencia} comprobante={r.comprobante} total={r.esperado.total} />}
              {r.problemas.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{r.problemas.map(p => <li key={p}>{p}</li>)}</ul>
              )}
              {r.lineas.length > 0 && (
                <table className="mt-4 w-full text-sm">
                  <thead><tr className="border-b border-linea text-left text-tinta-3"><th className="py-2 font-medium">Producto</th><th className="py-2 text-right font-medium">Mensaje</th><th className="py-2 text-right font-medium">Tienda hoy</th></tr></thead>
                  <tbody>
                    {r.lineas.map((l, i) => (
                      <tr key={i} className="border-b border-linea align-top">
                        <td className="py-2 pr-3">
                          {l.producto ? <a className="enlace" href={hrefProducto(l.producto.id)} target="_blank" rel="noopener">{l.cantidad} × {l.nombre}</a> : <span>{l.cantidad} × {l.nombre}</span>}
                          <span className={`block text-xs font-semibold ${COLOR[l.estado]}`}>{ROTULO[l.estado]}</span>
                        </td>
                        <td className="whitespace-nowrap py-2 text-right tabular-nums">{dinero(l.escrito)}</td>
                        <td className="whitespace-nowrap py-2 text-right tabular-nums">{l.esperado === undefined ? "—" : dinero(l.esperado)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="tabular-nums">
                    <tr><td className="pt-2">Productos</td><td className="pt-2 text-right">{r.escrito.productos === undefined ? "—" : dinero(r.escrito.productos)}</td><td className="pt-2 text-right">{dinero(r.esperado.productos)}</td></tr>
                    <tr><td>Envío{r.zona ? (r.zona === "bogota" ? " (Bogotá)" : " (otra ciudad)") : ""}</td><td className="text-right">{r.escrito.envio === undefined ? "—" : r.escrito.envio ? dinero(r.escrito.envio) : "gratis"}</td><td className="text-right">{r.esperado.envio ? dinero(r.esperado.envio) : "gratis"}</td></tr>
                    <tr className="font-semibold"><td className="pt-1">Total</td><td className="pt-1 text-right">{r.escrito.total === undefined ? "—" : dinero(r.escrito.total)}</td><td className="pt-1 text-right">{dinero(r.esperado.total)}</td></tr>
                  </tfoot>
                </table>
              )}
              <p className="mt-4 text-xs text-tinta-3">Se compara con los precios de hoy. Si cambiaste un precio después de que el cliente hizo el pedido, esa diferencia puede ser legítima.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
