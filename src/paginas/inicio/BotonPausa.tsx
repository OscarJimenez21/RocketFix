import { IconoPausa, IconoReproducir } from "../../components/Iconos";

/** Botón para detener un carrusel que avanza solo y volver a ponerlo en marcha (WCAG 2.2.2: lo que se mueve solo por
    más de 5 segundos debe poder pausarse). Con mouse o teclado los carruseles ya se quedan quietos mientras se usan;
    este botón sirve además en celular y la pausa queda puesta hasta que la persona la quite.
    El nombre no cambia: el lector de pantalla dice «Pausar …, presionado» o «no presionado». */
export function BotonPausa({ pausado, alternar, que, className }: { pausado: boolean; alternar: () => void; que: string; className: string }) {
  return (
    <button type="button" onClick={alternar} aria-pressed={pausado} aria-label={`Pausar ${que}`}
      title={pausado ? "Reanudar el movimiento" : "Pausar el movimiento"} className={className}>
      {pausado ? <IconoReproducir /> : <IconoPausa />}
    </button>
  );
}
