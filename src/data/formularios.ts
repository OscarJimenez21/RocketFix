/* Campos de los formularios de servicio técnico (los mismos de la tienda original) */
import type { CampoForm } from "../components/FormularioWhatsApp";
import type { Servicio } from "../types";
import { PAQUETES } from "./catalogo";

const CAMARAS = ["1 o 2", "3 o 4", "5 a 8", "Más de 8", "Aún no sé"];
const nombre: CampoForm = { id: "nombre", rotulo: "Tu nombre", etiqueta: "Nombre", obligatorio: true, falta: "tu nombre", autocompletar: "name" };

/** Formulario "Solicita un servicio" de la portada: cambia según el servicio elegido */
export function camposServicio(s: Servicio | undefined, titulos: string[]): CampoForm[] {
  const esCam = Boolean(s?.camaras);
  const tipo: CampoForm = { id: "servicio", rotulo: "Servicio", etiqueta: "Servicio", tipo: "lista", opciones: titulos, ancho: "completo" };
  if (esCam) {
    return [
      tipo,
      { id: "cams", rotulo: "Cuántas cámaras", etiqueta: "Cámaras", tipo: "lista", opciones: CAMARAS, inicial: "3 o 4" },
      { id: "lugar", rotulo: "Dónde", etiqueta: "Lugar", tipo: "lista", opciones: ["Casa", "Apartamento", "Local o negocio", "Bodega o finca"] },
      { id: "detalle", rotulo: "Qué quieres vigilar", etiqueta: "Detalle", tipo: "area", opcional: true, placeholder: s?.detalle },
      nombre,
      { id: "barrio", rotulo: "Barrio o dirección de la instalación", etiqueta: "Dirección", obligatorio: true, falta: "la dirección de la instalación", autocompletar: "street-address" }
    ];
  }
  return [
    tipo,
    { id: "equipo", rotulo: "Equipo (marca y modelo)", etiqueta: "Equipo", ancho: "completo", placeholder: s?.equipo ?? "Marca y modelo, si aplica" },
    { id: "detalle", rotulo: s ? "Qué le pasa al equipo" : "Qué necesitas", etiqueta: "Detalle", tipo: "area", obligatorio: true,
      falta: s ? "qué le pasa al equipo" : "qué necesitas", placeholder: s?.detalle ?? "Cuéntanos qué necesitas" },
    nombre,
    { id: "barrio", rotulo: "Barrio", etiqueta: "Barrio", opcional: true, autocompletar: "street-address" }
  ];
}

/** Formularios al final de cada artículo del blog */
export const FORMULARIOS_ARTICULO: Record<string, { titulo: string; texto: string; asunto: string; boton: string; campos: CampoForm[] }> = {
  "blog-camaras": {
    titulo: "Solicita tu visita técnica",
    texto: "Llena estos datos y se abre WhatsApp con tu solicitud escrita. Te respondemos para agendar la visita.",
    asunto: "solicitar una visita técnica para instalar cámaras de seguridad",
    boton: "Enviar solicitud por WhatsApp",
    campos: [
      nombre,
      { id: "dir", rotulo: "Barrio o dirección", etiqueta: "Dirección", obligatorio: true, falta: "el barrio o la dirección", autocompletar: "street-address" },
      { id: "lugar", rotulo: "Tipo de lugar", etiqueta: "Lugar", tipo: "lista", opciones: ["Casa", "Apartamento", "Local o negocio", "Bodega o finca", "Conjunto residencial"] },
      { id: "cantidad", rotulo: "Cuántas cámaras", etiqueta: "Cámaras", tipo: "lista", opciones: CAMARAS, inicial: "3 o 4" },
      { id: "paquete", rotulo: "Paquete de interés", etiqueta: "Paquete", tipo: "lista", ancho: "completo",
        opciones: [...PAQUETES.map(p => p.nombre), "Aún no sé, quiero asesoría"], inicial: "Aún no sé, quiero asesoría" },
      { id: "detalle", rotulo: "Qué quieres vigilar", etiqueta: "Detalle", tipo: "area", opcional: true, placeholder: "Ej.: la entrada y el parqueadero. Ya tengo internet WiFi." }
    ]
  },
  "blog-celulares": {
    titulo: "Cotiza la reparación de tu celular",
    texto: "Con la marca, el modelo y la falla te damos un valor aproximado por WhatsApp.",
    asunto: "cotizar la reparación de mi celular",
    boton: "Enviar por WhatsApp",
    campos: [
      { id: "modelo", rotulo: "Marca y modelo", etiqueta: "Celular", obligatorio: true, falta: "la marca y el modelo", placeholder: "Ej.: Samsung Galaxy A54" },
      { id: "falla", rotulo: "Qué le pasa", etiqueta: "Falla", tipo: "lista",
        opciones: ["Pantalla rota o no se ve", "La batería dura poco", "No carga", "Se mojó", "No enciende", "Cámara, micrófono o altavoz", "Lento o se reinicia", "Otro"] },
      { id: "detalle", rotulo: "Detalle", etiqueta: "Detalle", tipo: "area", opcional: true, placeholder: "Ej.: se cayó y la pantalla quedó negra, pero vibra." },
      nombre
    ]
  },
  "blog-computadores": {
    titulo: "Solicita servicio para tu computador",
    texto: "Cuéntanos qué le pasa o qué necesitas. Se abre WhatsApp con tu solicitud escrita y te respondemos con el valor aproximado.",
    asunto: "solicitar servicio técnico para mi computador",
    boton: "Enviar por WhatsApp",
    campos: [
      { id: "tipo", rotulo: "Tipo de equipo", etiqueta: "Equipo", tipo: "lista", opciones: ["Portátil", "PC de escritorio", "Todo en uno"] },
      { id: "servicio", rotulo: "Servicio", etiqueta: "Servicio", tipo: "lista",
        opciones: ["Mantenimiento preventivo", "Reparación", "Formateo e instalación", "Mejora a SSD o RAM", "Armado de PC", "Recuperación de archivos", "Otro"] },
      { id: "modelo", rotulo: "Marca y modelo", etiqueta: "Modelo", opcional: true, ancho: "completo", placeholder: "Ej.: HP Pavilion 15, Lenovo IdeaPad 3" },
      { id: "detalle", rotulo: "Qué le pasa o qué necesitas", etiqueta: "Detalle", tipo: "area", obligatorio: true, falta: "qué le pasa al equipo",
        placeholder: "Ej.: se calienta y se apaga cuando abro varios programas." },
      nombre
    ]
  }
};
