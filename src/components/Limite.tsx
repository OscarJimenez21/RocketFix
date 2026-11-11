/* Red de seguridad: si una página falla al dibujarse, en vez de quedar toda la tienda en blanco se muestra este aviso
   con dos salidas (recargar o escribir por WhatsApp). La cabecera, el pie y el carrito siguen funcionando.
   React solo permite atrapar estos errores con un componente de clase. */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { CONFIG } from "../data/catalogo";
import { waLink } from "../lib/whatsapp";
import { IconoWhatsApp } from "./Iconos";

export class Limite extends Component<{ children: ReactNode }, { roto: boolean }> {
  state = { roto: false };

  static getDerivedStateFromError() {
    return { roto: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Queda en la consola para poder revisarlo; la página no envía datos a ningún lado
    console.error("Error al mostrar la página:", error, info.componentStack);
  }

  render() {
    if (!this.state.roto) return this.props.children;
    return (
      <div role="alert" className="contenedor py-16 text-center">
        <h1 tabIndex={-1} className="text-2xl font-extrabold">No pudimos mostrar esta página</h1>
        <p className="mx-auto mt-2 max-w-md text-tinta-2">Recarga la página. Si sigue igual, escríbenos por WhatsApp y te atendemos por ahí.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-borde" onClick={() => location.reload()}>Recargar la página</button>
          <a className="btn btn-wa" href={waLink(`Hola ${CONFIG.nombre}, la página me mostró un error.`)} target="_blank" rel="noopener"><IconoWhatsApp />Escribir por WhatsApp</a>
        </div>
      </div>
    );
  }
}
