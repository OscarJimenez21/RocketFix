/* Descripción de la página del producto: misma regla que la tienda original (resumen y ficha del proveedor,
   características propias del producto y lo que trae la caja según su tipo). */
import { ESTADOS, INCLUYE, nombreCat } from "../data/catalogo";
import type { Descripcion, Producto } from "../types";
import { lista, norm } from "./formato";

export interface DescripcionArmada {
  resumen: string;
  filas: [string, string][];
  incluye: string;
}

export function armarDescripcion(p: Producto, d: Descripcion = {}): DescripcionArmada {
  const cond = ESTADOS[p.estado] ?? p.estado;
  const condMin = cond.charAt(0).toLowerCase() + cond.slice(1);
  const conMarca = p.marca && !norm(p.nombre).includes(norm(p.marca)) ? ` de ${p.marca}` : "";
  const variasVersiones = p.opciones.length > 1;
  const resumen =
    d.resumen ||
    `${p.nombre}${conMarca}${variasVersiones ? `, disponible en ${lista(p.opciones.map(o => o.nombre))}` : ""}. ${
      p.estado !== "Nuevo" ? `Estado: ${condMin}.` : /^escritorio/.test(p.categoria ?? "") ? "Equipo nuevo, armado y probado antes de entregarlo." : "Producto nuevo, en su empaque original."
    } Si tienes dudas sobre sus especificaciones, escríbenos y te asesoramos.`;

  const filas: [string, string | undefined][] = [
    ["Marca", p.marca],
    ["Tipo", p.tienda === "cel" ? "Celular" : p.categoria ? nombreCat[p.categoria] : undefined],
    ["Estado", cond]
  ];
  const primera = p.opciones[0];
  if (variasVersiones) filas.push([p.etiqueta || "Versiones", lista(p.opciones.map(o => o.nombre))]);
  else if (primera?.nombre) filas.push([p.etiqueta || "Versión", primera.nombre]);
  // (en los PC armados la ficha del proveedor ya trae lo mismo que specs, más completo)
  if (p.specs.length && !(d.ficha && p.tienda === "pc")) filas.push(["Detalles", p.specs.join(" · ")]);
  for (const f of d.ficha ?? []) filas.push(f);

  let incluye = (p.categoria && INCLUYE[p.categoria]) || INCLUYE[p.tienda] || INCLUYE.varios || "";
  // (las notas de regalo o "Incluye…" son parte de la caja; "Sobre pedido" no)
  if (p.nota && !/pedido/i.test(p.nota)) incluye += ` ${p.nota.replace(/^Obsequio:\s*/i, "De regalo: ")}.`;
  if (p.estado !== "Nuevo") incluye += ` Como el producto es ${condMin}, te confirmamos los accesorios que trae.`;

  return { resumen, filas: filas.filter((f): f is [string, string] => Boolean(f[1])), incluye };
}
