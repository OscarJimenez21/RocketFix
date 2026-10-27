import { ARTICULOS, CABECERAS } from "../data/catalogo";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { Ilustracion } from "../components/Ilustracion";

export function TarjetaArticulo({ id }: { id: string }) {
  const a = ARTICULOS.find(x => x.id === id);
  if (!a) return null;
  return (
    <a href={`#${a.id}`} className="group flex h-full flex-col rounded-md border border-linea bg-white p-5 transition-colors hover:border-marca">
      <Ilustracion nombre={a.ilustracion} className="h-14 w-[72px] text-marca-medio" />
      <p className="etiqueta-mono mt-4">{a.etiqueta}</p>
      <h2 className="mt-1 text-lg font-bold leading-snug group-hover:text-marca">{a.titulo}</h2>
      <p className="mt-2 text-sm text-tinta-2">{a.resumen}</p>
      <p className="mt-auto flex items-center justify-between pt-4 text-sm"><span className="text-tinta-3">Lectura de {a.minutos} min</span><b className="text-marca">Leer y escribirnos →</b></p>
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
