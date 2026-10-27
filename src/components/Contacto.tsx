import { useEffect, useState } from "react";
import { CONFIG } from "../data/catalogo";
import { estadoAtencion, filasHorario } from "../lib/horario";
import { waLink } from "../lib/whatsapp";
import { IconoWhatsApp } from "./Iconos";

/** Abierto / cerrado según el horario; se actualiza cada minuto */
export function useAtencion() {
  const [estado, setEstado] = useState(() => estadoAtencion());
  useEffect(() => {
    const t = window.setInterval(() => setEstado(estadoAtencion()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return estado;
}

/** Punto verde (abierto) o gris (cerrado). `claro`: sobre fondo oscuro */
export function PuntoEstado({ abierto, claro = false }: { abierto: boolean; claro?: boolean }) {
  return <span aria-hidden="true" className={`inline-block h-2 w-2 shrink-0 rounded-full ${abierto ? "bg-marca-claro" : claro ? "bg-white/50" : "bg-tinta-3"}`} />;
}

export function BotonCopiar({ texto, className = "" }: { texto: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin permiso */ }
  };
  return <button type="button" onClick={copiar} className={`btn btn-sm btn-borde ${className}`}>{copiado ? "Copiado" : "Copiar número"}</button>;
}

/** Sección de contacto (al final de todas las páginas, como en la tienda original) */
export function Contacto() {
  const atencion = useAtencion();
  return (
    <section id="contacto" aria-labelledby="t-contacto" className="border-t border-linea bg-fondo">
      <div className="contenedor grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="etiqueta">Contacto</p>
          <h2 id="t-contacto" className="mt-1 text-2xl font-extrabold">Escríbenos por WhatsApp</h2>
          <p className="mt-3 text-[15px] text-tinta-2">Tienda en línea con atención por WhatsApp. Te enviamos tus compras a domicilio, coordinamos contigo cómo recibir los equipos que vas a reparar y vamos a tu casa o negocio para instalar cámaras.</p>
        </div>
        <div>
          <h3 className="text-base font-bold">Horario</h3>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</p>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {filasHorario().map(([d, h]) => (
                <tr key={d} className="border-t border-linea"><th scope="row" className="py-2 text-left font-normal text-tinta-2">{d}</th><td className="py-2 text-right font-semibold">{h}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-base font-bold">WhatsApp</h3>
          <p className="mt-2 font-display text-2xl font-bold">{CONFIG.whatsappVisible}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={waLink()} target="_blank" rel="noopener" className="btn btn-sm btn-wa"><IconoWhatsApp className="h-4 w-4" />Abrir chat</a>
            <BotonCopiar texto={CONFIG.whatsappVisible} />
          </div>
        </div>
      </div>
    </section>
  );
}
