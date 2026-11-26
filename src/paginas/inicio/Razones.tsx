/* 26/11/2026 (usuario: «aplica todo», idea 2 tomada de la franja «Aún más razones para comprar con nosotros» de Mac
   Center): cuatro razones para comprar en Rocket Fix que no están en las ventajas de arriba (entrega, envíos y pagos).
   Solo reglas que ya están publicadas en Ayuda y en las políticas: parte de pago, apartado, garantía y asesoría.
   Nada de cuotas, descuentos ni promociones. */
import { CONFIG } from "../../data/catalogo";
import { IconoEscudo, IconoReloj, IconoTelefono, IconoWhatsApp } from "../../components/Iconos";
import { PuntoEstado, useAtencion } from "../../components/Contacto";
import { PLAZOS } from "../../lib/estados";
import { hrefDe } from "../../lib/rutas";
import { waLink } from "../../lib/whatsapp";

export function Razones() {
  const atencion = useAtencion();
  const razones = [
    {
      icono: <IconoTelefono className="h-7 w-7" />, titulo: "Tu equipo vale como parte de pago",
      texto: "Recibimos celulares, iPads y Mac. Escríbenos con el modelo y cómo está, y te decimos cuánto te reconocemos.",
      enlace: { texto: "Cotizar mi equipo", href: waLink(`Hola ${CONFIG.nombre}, quiero dar mi equipo como parte de pago. Modelo: `), fuera: true }
    },
    {
      icono: <IconoReloj className="h-7 w-7" />, titulo: "Apártalo con el 40 %",
      texto: "En productos desde $300.000. Tienes un mes para pagar el resto y te damos factura con el abono y la fecha límite.",
      enlace: { texto: "Cómo funciona", href: hrefDe("preguntas-frecuentes"), fuera: false }
    },
    {
      icono: <IconoEscudo className="h-7 w-7" />, titulo: `Garantía de ${PLAZOS.nuevos}`,
      texto: `En productos nuevos. Los primeros ${PLAZOS.directo} la atiendes directamente con nosotros.`,
      enlace: { texto: "Qué cubre", href: hrefDe("garantia"), fuera: false }
    },
    {
      icono: <IconoWhatsApp className="h-7 w-7" />, titulo: "Te asesora una persona",
      texto: "Por WhatsApp te ayudamos a elegir el equipo que te sirve y confirmamos tu pedido contigo.",
      enlace: { texto: "Escribir ahora", href: waLink(`Hola ${CONFIG.nombre}, quiero que me asesoren. `), fuera: true },
      extra: <span className="mt-2 flex items-center gap-2 text-[12.5px] text-tinta-2"><PuntoEstado abierto={atencion.abierto} />{atencion.texto}</span>
    }
  ];
  return (
    <section aria-labelledby="t-razones" className="claro-siempre bg-[#f5f7f6] py-12 text-tinta sm:py-16">
      <div className="contenedor">
        <h2 id="t-razones" className="titulo-seccion text-balance">Más razones para comprar aquí. <span className="text-tinta-3">Reglas claras, publicadas en Ayuda.</span></h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {razones.map(r => (
            <li key={r.titulo} className="tarjeta-apple flex flex-col rounded-[22px] bg-white p-6">
              <span className="text-marca">{r.icono}</span>
              <h3 className="mt-4 font-display text-[20px] font-extrabold leading-tight tracking-tight">{r.titulo}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-tinta-2">{r.texto}</p>
              {r.extra}
              <a href={r.enlace.href} {...(r.enlace.fuera ? { target: "_blank", rel: "noopener" } : {})}
                className="mt-auto inline-flex min-h-[44px] items-center pt-4 text-[14.5px] font-semibold text-marca hover:underline">
                {r.enlace.texto} <span aria-hidden="true" className="ml-1">›</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
