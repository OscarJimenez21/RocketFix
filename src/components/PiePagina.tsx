import { useRef, useState } from "react";
import { ARTICULOS, CONFIG, PAGOS } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { useVisto } from "../lib/enPantalla";
import { recurso } from "../lib/formato";
import { filasHorario } from "../lib/horario";
import { waLink } from "../lib/whatsapp";
import { BotonCopiar, PuntoEstado, useAtencion } from "./Contacto";
import { IconoWhatsApp } from "./Iconos";
import { Cohete, Logo } from "./Logo";
import { POLITICAS, TextoLegal } from "./TextoLegal";

/** «Volver arriba»: el cohete despega hacia arriba mientras la página sube. Con «reducir movimiento» la página salta
    arriba de una vez. El foco pasa al logo de la cabecera, para seguir con el teclado desde arriba */
function VolverArriba() {
  const [despega, setDespega] = useState(0);
  const subir = () => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducir) { setDespega(n => n + 1); window.setTimeout(() => setDespega(0), 700); }
    window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
    document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
  };
  return (
    <button type="button" onClick={subir} className="btn btn-sm btn-claro">
      <span key={despega} className={`inline-block ${despega ? "animate-despegar" : ""}`}><Cohete className="h-[18px] w-[18px] text-marca-menta" /></span>
      Volver arriba
    </button>
  );
}

/** Pie de todas las páginas. Incluye el contacto (#contacto): WhatsApp, horario y estado de atención. */
export function PiePagina() {
  const atencion = useAtencion();
  const redes = Object.entries(CONFIG.redes).filter(([, url]) => url);
  const enlace = "hover:text-white hover:underline underline-offset-4";
  // Animación 40: la primera vez que se ve el botón de WhatsApp del pie, lanza dos ondas
  const botonesWa = useRef<HTMLDivElement>(null);
  const waVisto = useVisto(botonesWa);
  return (
    <footer id="contacto" aria-labelledby="t-contacto" className="bg-marca-noche text-white/75">
      <div className="border-b border-white/10">
        <div className="contenedor flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <h2 id="t-contacto" className="text-xl font-extrabold text-white sm:text-2xl">¿Necesitas ayuda para elegir?</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed">Escríbenos por WhatsApp: te asesoramos, confirmamos disponibilidad y coordinamos la entrega o el servicio.</p>
            <a href="#como-comprar" className="mt-1 inline-flex min-h-[44px] items-center text-[15px] font-semibold text-marca-menta underline-offset-4 hover:underline">Mira cómo comprar en 3 pasos</a>
          </div>
          <div ref={botonesWa} className="flex flex-wrap items-center gap-3">
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className={`btn btn-wa relative${waVisto ? " onda-wa" : ""}`}><IconoWhatsApp />Escribir por WhatsApp</a>
            <BotonCopiar texto={CONFIG.whatsappVisible} className="btn-claro" />
          </div>
        </div>
      </div>

      <div className="contenedor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1.4fr_1.1fr_1fr]">
        <div>
          <Logo claro />
          {/* Eslogan de la marca (antes iba una frase larga con todo lo que vende la tienda) */}
          <p className="mt-4 max-w-xs font-display text-[19px] font-extrabold leading-snug text-white ancho-108">Hacemos despegar tu tecnología</p>
          <p className="mt-4 text-sm">
            <span className="block text-xs text-white/55">WhatsApp</span>
            {/* El mismo destino que el número de la portada (dos enlaces con el mismo texto deben llevar al mismo lugar) */}
            <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" className="font-semibold text-white hover:underline">{CONFIG.whatsappVisible}</a>
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
                  // eslint-disable-next-line no-restricted-syntax -- íconos propios (pagos.json); scripts/verificar-catalogo.mjs no deja publicar si traen algo que se ejecute
                  : <><span className="h-5 w-5 text-marca-medio [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: f.icono ?? "" }} />{f.nombre}</>}
              </li>
            ))}
          </ul>
          {PAGOS.nota && <p className="mt-4 max-w-3xl text-sm">{PAGOS.nota}</p>}
        </div>
      </section>
      {/* Identidad del vendedor (art. 50, Ley 1480) y enlaces a las políticas */}
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-3 py-5 text-xs text-white/55 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="min-w-0">
            <p>© {new Date().getFullYear()} {CONFIG.nombre} · Bogotá, Colombia</p>
            <p className="mt-1 [overflow-wrap:anywhere]"><TextoLegal t="{titular} · {documento} · {direccion} · {correo}" /></p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <nav aria-label="Políticas de la tienda">
              <ul className="flex flex-wrap gap-x-4 gap-y-1">{POLITICAS.map(p => <li key={p.id}><a href={`#${p.id}`} className={enlace}>{p.menu}</a></li>)}</ul>
            </nav>
            <VolverArriba />
          </div>
        </div>
      </div>
    </footer>
  );
}
