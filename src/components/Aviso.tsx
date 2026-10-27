import { useTienda } from "../estado/TiendaContext";

/** Aviso breve abajo de la pantalla (ej.: "Agregaste … al carrito"), con botón para ver el carrito */
export function Aviso() {
  const { aviso, avisar, abrirCarrito, carritoAbierto } = useTienda();
  const agregado = aviso.startsWith("Agregaste");
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all ${aviso && !carritoAbierto ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
      {aviso && (
        <div className="flex items-center gap-3 rounded-md bg-tinta px-4 py-3 text-sm text-white shadow-flota">
          <span className="flex-1">{aviso}</span>
          {agregado && <button type="button" onClick={() => { avisar(""); abrirCarrito(); }} className="shrink-0 font-semibold text-marca-menta hover:underline">Ver carrito</button>}
        </div>
      )}
    </div>
  );
}
