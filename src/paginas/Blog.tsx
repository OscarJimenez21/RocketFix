import { ARTICULOS, CABECERAS } from "../data/catalogo";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { Ilustracion } from "../components/Ilustracion";

export function TarjetaArticulo({ id }: { id: string }) {
  const a = ARTICULOS.find(x => x.id === id);
  if (!a) return null;
  return (
    <a href={`#${a.id}`} className="tarjeta group flex h-full flex-col p-5 transition-[border-color,box-shadow] hover:border-marca hover:shadow-tarjeta">
      <span className="flex h-16 w-20 items-center justify-center rounded bg-marca-suave"><Ilustracion nombre={a.ilustracion} className="h-12 w-16 text-marca-medio" /></span>
      <p className="etiqueta mt-4">{a.etiqueta} · {a.minutos} min de lectura</p>
      <h2 className="mt-1 text-lg font-bold leading-snug group-hover:text-marca">{a.titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-tinta-2">{a.resumen}</p>
      <p className="mt-auto pt-4 text-sm font-semibold text-marca">Leer el artículo →</p>
    </a>
  );
}

export function Blog() {
  const cab = CABECERAS.blog;
  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: "#inicio" }, { texto: "Blog" }]} titulo={cab?.titulo ?? "Blog y servicio técnico"} lead={cab?.lead}
        nota={{ titulo: "¿Tienes una pregunta rápida?", texto: "Escríbenos y te respondemos por WhatsApp.", enlace: "Abrir chat de WhatsApp", href: null, whatsapp: "" }} />
      <div className="contenedor py-10">
        <ul className="grid gap-4 md:grid-cols-3">{ARTICULOS.map(a => <li key={a.id}><TarjetaArticulo id={a.id} /></li>)}</ul>
      </div>
    </>
  );
}
