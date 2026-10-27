import { ARTICULOS, CONFIG, PAGOS } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { recurso } from "../lib/formato";
import { filasHorario } from "../lib/horario";
import { waLink } from "../lib/whatsapp";
import { Logo } from "./Logo";

export function PiePagina() {
  const redes = Object.entries(CONFIG.redes).filter(([, url]) => url);
  return (
    <footer className="bg-marca-noche text-white/75">
      <div className="contenedor grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo claro />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">Venta de celulares, computadores, tablets y accesorios. Reparación de equipos e instalación de cámaras de seguridad.</p>
          <a href={waLink()} target="_blank" rel="noopener" className="mt-5 inline-block font-mono text-sm font-semibold text-marca-menta hover:underline">{CONFIG.whatsappVisible}</a>
          {redes.length > 0 && (
            <p className="mt-3 flex gap-4 text-sm">{redes.map(([red, url]) => <a key={red} href={url} target="_blank" rel="noopener" className="capitalize hover:text-white">{red}</a>)}</p>
          )}
        </div>
        <nav aria-label="Tienda">
          <p className="etiqueta mb-3 text-white/50">Tienda</p>
          <ul className="grid gap-2 text-sm">{TIENDAS.slice(0, 6).map(t => <li key={t.id}><a href={`#${t.vista}`} className="hover:text-white">{t.titulo}</a></li>)}</ul>
        </nav>
        <nav aria-label="Más secciones">
          <p className="etiqueta mb-3 text-white/50">&nbsp;</p>
          <ul className="grid gap-2 text-sm">{TIENDAS.slice(6).map(t => <li key={t.id}><a href={`#${t.vista}`} className="hover:text-white">{t.titulo}</a></li>)}</ul>
        </nav>
        <div>
          <p className="etiqueta mb-3 text-white/50">Servicio técnico</p>
          <ul className="grid gap-2 text-sm">
            {ARTICULOS.map(a => <li key={a.id}><a href={`#${a.id}`} className="hover:text-white">{a.titulo}</a></li>)}
            <li><a href="#contacto" className="hover:text-white">Contacto</a></li>
          </ul>
          <p className="etiqueta mb-2 mt-6 text-white/50">Horario</p>
          <ul className="grid gap-1 text-sm">{filasHorario().map(([d, h]) => <li key={d}>{d}: {h}</li>)}</ul>
        </div>
      </div>
      <section aria-labelledby="t-pagos" className="border-t border-white/10">
        <div className="contenedor py-8">
          <h2 id="t-pagos" className="etiqueta mb-4 text-white/50">Formas de pago</h2>
          <ul className="flex flex-wrap gap-2">
            {PAGOS.lista.map(f => (
              <li key={f.nombre} className="flex h-11 items-center gap-2 rounded bg-white px-3 text-[13px] font-semibold text-tinta">
                {f.archivo
                  ? <img src={recurso(f.archivo)} alt={f.alt ?? f.nombre} className="h-6 w-auto max-w-[96px] object-contain" decoding="async" />
                  : <><span className="h-5 w-5 text-marca-medio [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: f.icono ?? "" }} />{f.nombre}</>}
              </li>
            ))}
          </ul>
          {PAGOS.nota && <p className="mt-4 max-w-3xl text-sm">{PAGOS.nota}</p>}
        </div>
      </section>
      <div className="border-t border-white/10">
        <p className="contenedor py-5 text-xs text-white/50">© {new Date().getFullYear()} {CONFIG.nombre} · Bogotá, Colombia · {CONFIG.atencion}</p>
      </div>
    </footer>
  );
}
