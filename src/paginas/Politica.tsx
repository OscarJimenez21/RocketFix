/* Páginas de políticas: garantía, cambios y devoluciones (retracto) y datos personales */
import { CONFIG } from "../data/catalogo";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { IconoWhatsApp } from "../components/Iconos";
import { DATOS_FALTANTES, POLITICAS, TextoLegal, datoLegal } from "../components/TextoLegal";
import { lista } from "../lib/formato";
import { waLink } from "../lib/whatsapp";
import { NoEncontrada } from "./NoEncontrada";
import { hrefDe } from "../lib/rutas";

export function Politica({ id }: { id: string }) {
  const p = POLITICAS.find(x => x.id === id);
  if (!p) return <NoEncontrada />;
  const vigencia = datoLegal("vigencia");
  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: hrefDe("inicio") }, { texto: p.titulo }]} titulo={p.titulo} lead={p.lead}
        extra={vigencia ? <p className="mt-3 text-sm text-tinta-3">Vigente desde {vigencia}</p> : undefined} />
      <div className="contenedor grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="prosa min-w-0 max-w-3xl">
          {DATOS_FALTANTES.length > 0 && (
            <p role="note" className="alerta">Borrador: faltan {lista(DATOS_FALTANTES)}. No se debe publicar hasta completarlos.</p>
          )}
          {p.secciones.map(s => (
            <section key={s.titulo} className="mt-10 space-y-4 first:mt-0">
              <h2>{s.titulo}</h2>
              {s.bloques.map((b, i) => typeof b === "string"
                ? <p key={i}><TextoLegal t={b} /></p>
                : b.numerada
                  ? <ol key={i} className="list-decimal space-y-1.5 pl-5 text-tinta-2">{b.lista.map(x => <li key={x}><TextoLegal t={x} /></li>)}</ol>
                  : <ul key={i}>{b.lista.map(x => <li key={x}><TextoLegal t={x} /></li>)}</ul>)}
            </section>
          ))}
        </article>
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <nav aria-label="Políticas de la tienda">
            <p className="etiqueta mb-2">Políticas</p>
            <ul className="grid text-sm">
              {POLITICAS.map(x => (
                <li key={x.id}><a href={hrefDe(x.id)} aria-current={x.id === id ? "page" : undefined}
                  className={`enlace-suelto py-1 font-medium ${x.id === id ? "text-marca-texto" : ""}`}>{x.menu}</a></li>
              ))}
            </ul>
          </nav>
          <div className="tarjeta mt-6 p-5">
            <p className="font-semibold">¿Tienes una duda o un reclamo?</p>
            <p className="mt-1 text-sm text-tinta-2">Escríbenos y te ayudamos.</p>
            <a href={waLink(`Hola ${CONFIG.nombre}, tengo una consulta sobre ${p.menu.toLowerCase()}.`)} target="_blank" rel="noopener" className="btn btn-sm btn-wa mt-3">
              <IconoWhatsApp className="h-4 w-4" />Escribir por WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
