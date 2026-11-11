/* Mejora: aviso cuando el teléfono o el computador se queda sin internet. La tienda sigue abierta con lo que ya cargó,
   pero las fotos nuevas, el pago con Bold y WhatsApp necesitan conexión. Al volver, dice «Volviste a tener conexión» y se va.
   Animación 86: la franja baja desde arriba al aparecer */
import { useEffect, useState } from "react";

export function SinConexion() {
  const [estado, setEstado] = useState<"bien" | "sin" | "volvio">(() => (typeof navigator !== "undefined" && navigator.onLine === false ? "sin" : "bien"));
  useEffect(() => {
    let reloj = 0;
    const sin = () => { window.clearTimeout(reloj); setEstado("sin"); };
    const con = () => {
      setEstado(e => (e === "sin" ? "volvio" : e));
      window.clearTimeout(reloj);
      reloj = window.setTimeout(() => setEstado("bien"), 3500);
    };
    window.addEventListener("offline", sin);
    window.addEventListener("online", con);
    return () => { window.removeEventListener("offline", sin); window.removeEventListener("online", con); window.clearTimeout(reloj); };
  }, []);
  return (
    <div role="status" aria-live="polite">
      {estado !== "bien" && (
        <p className={`sin-conexion no-imprimir px-4 py-2 text-center text-sm font-semibold ${estado === "sin" ? "bg-acento text-acento-tinta" : "bg-marca text-white"}`}>
          {estado === "sin"
            ? "Sin internet: puedes seguir mirando, pero para enviar tu pedido necesitas conexión."
            : "Volviste a tener conexión."}
        </p>
      )}
    </div>
  );
}
