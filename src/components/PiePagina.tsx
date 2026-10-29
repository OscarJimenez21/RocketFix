import { ARTICULOS, CONFIG, PAGOS } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { recurso } from "../lib/formato";
import { filasHorario } from "../lib/horario";
import { waLink } from "../lib/whatsapp";
import { BotonCopiar, PuntoEstado, useAtencion } from "./Contacto";
import { IconoWhatsApp } from "./Iconos";
import { Logo } from "./Logo";

/** Pie de todas las páginas. Incluye el contacto (#contacto): WhatsApp, horario y estado de atención. */
export function PiePagina() {
  const atencion = useAtencion();
  const redes = Object.entries(CONFIG.redes).filter(([, url]) => url);
  const enlace = "hover:text-white hover:underline underline-offset-4";
  return (
    <footer id="contacto" aria-labelledby="t-contacto" className="bg-marca-noche text-white/75">
      <div className="border-b border-white/10">
        <div className="contenedor flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <h2 id="t-contacto" className="text-xl font-extrabold text-white sm:text-2xl">¿Necesitas ayuda para elegir?</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed">Escríbenos por WhatsApp: te asesoramos, confirmamos disponibilidad y coordinamos la entrega o el servicio.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="btn btn-wa"><IconoWhatsApp />Escribir por WhatsApp</a>
            <BotonCopiar texto={CONFIG.whatsappVisible} className="btn-claro" />
          </div>
        </div>
      </div>

      <div className="contenedor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1.4fr_1.1fr_1fr]">
        <div>
          <Logo claro />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">Venta de celulares, computadores, tablets y accesorios. Reparación de equipos e instalación de cámaras de seguridad.</p>
          <p className="mt-4 text-sm">
            <span className="block text-xs text-white/55">WhatsApp</span>
            <a href={waLink()} target="_blank" rel="noopener" className="font-semibold text-white hover:underline">{CONFIG.whatsappVisible}</a>
          </p>
          {redes.length > 0 && (
            <p className="mt-3 flex gap-4 text-sm">{redes.map(([red, url]) => <a key={red} href={url} target="_blank" rel="noopener" className={`capitalize ${enlace}`}>{red}</a>)}</p>
          )}
        </div>
        <nav aria-label="Categorías de la tienda">
          <h3 className="etiqueta mb-3 text-white/60">Tienda</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{TIENDAS.map(t => <li key={t.id}><a href={`#${t.vista}`} className={enlace}>{t.menu}</a></li>)}</ul>
        </nav>
        <nav aria-label="Servicio técnico">
          <h3 className="etiqueta mb-3 text-white/60">Servicio técnico</h3>
          <ul className="grid gap-2 text-sm">
            <li><a href="#servicios" className={enlace}>Solicitar un servicio</a></li>
            {ARTICULOS.map(a => <li key={a.id}><a href={`#${a.id}`} className={enlace}>{a.titulo}</a></li>)}
            <li><a href="#blog" className={enlace}>Blog</a></li>
          </ul>
        </nav>
        <div>
          <h3 className="etiqueta mb-3 text-white/60">Horario</h3>
          <p className="flex items-center gap-2 text-sm font-semibold text-white"><PuntoEstado abierto={atencion.abierto} claro />{atencion.texto}</p>
          <ul className="mt-2 grid gap-1 text-sm">{filasHorario().map(([d, h]) => <li key={d}>{d}: {h}</li>)}</ul>
          <p className="mt-3 text-xs leading-relaxed text-white/60">{CONFIG.atencion}</p>
        </div>
      </div>

      <section aria-labelledby="t-pagos" className="border-t border-white/10">
        <div className="contenedor py-8">
          <h2 id="t-pagos" className="etiqueta mb-4 text-white/60">Formas de pago</h2>
          <ul className="flex flex-wrap gap-2">
            {PAGOS.lista.map(f => (
              <li key={f.nombre} className="flex h-11 items-center gap-2 rounded bg-white px-3 text-[13px] font-semibold text-tinta">
                {f.archivo
                  ? <img src={recurso(f.archivo)} alt={f.alt ?? f.nombre} className="h-6 w-auto max-w-[96px] object-contain" loading="lazy" decoding="async" />
                  : <><span className="h-5 w-5 text-marca-medio [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: f.icono ?? "" }} />{f.nombre}</>}
              </li>
            ))}
          </ul>
          {PAGOS.nota && <p className="mt-4 max-w-3xl text-sm">{PAGOS.nota}</p>}
        </div>
      </section>
      <div className="border-t border-white/10">
        <p className="contenedor py-5 text-xs text-white/55">© {new Date().getFullYear()} {CONFIG.nombre} · Bogotá, Colombia</p>
      </div>
    </footer>
  );
}
