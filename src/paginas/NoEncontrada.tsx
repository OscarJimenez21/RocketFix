import { waLink } from "../lib/whatsapp";

export function NoEncontrada({ texto = "Esta página no existe o cambió de dirección." }: { texto?: string }) {
  return (
    <div className="contenedor py-20 text-center">
      <h1 tabIndex={-1} className="text-3xl font-extrabold">No la encontramos</h1>
      <p className="mt-3 text-tinta-2">{texto}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="#inicio" className="btn btn-marca">Ir al inicio</a>
        <a href={waLink()} target="_blank" rel="noopener" className="btn btn-borde">Preguntar por WhatsApp</a>
      </div>
    </div>
  );
}
