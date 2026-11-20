/* Descripción de la página del producto: misma regla que la tienda original (resumen y ficha del proveedor,
   características propias del producto y lo que trae la caja según su tipo). */
import { useEffect, useState } from "react";
import { ESTADOS, INCLUYE, nombreCat } from "../data/catalogo";
import type { Descripcion, Producto } from "../types";
import { incluyeSegunEstado } from "./estados";
import { lista, norm, recurso } from "./formato";

/** Solo lo que tiene la forma de una descripción: resumen de texto y ficha de pares [característica, valor] */
export function leerDescripcion(dato: unknown): Descripcion {
  if (!dato || typeof dato !== "object") return {};
  const { resumen, ficha, parrafos, secciones, caja, cifras, destacados } = dato as Record<string, unknown>;
  const d: Descripcion = {};
  const esPar = (f: unknown): f is [string, string] => Array.isArray(f) && f.length === 2 && typeof f[0] === "string" && typeof f[1] === "string";
  const textos = (x: unknown) => (Array.isArray(x) ? x.filter((t): t is string => typeof t === "string" && t.trim() !== "") : []);
  if (typeof resumen === "string") d.resumen = resumen;
  if (Array.isArray(ficha)) d.ficha = ficha.filter(esPar);
  // 19/11/2026: descripción ampliada, ficha por secciones y contenido de la caja
  if (textos(parrafos).length) d.parrafos = textos(parrafos);
  if (Array.isArray(secciones)) {
    const s = secciones
      .filter((x): x is [string, unknown[]] => Array.isArray(x) && x.length === 2 && typeof x[0] === "string" && Array.isArray(x[1]))
      .map(([t, filas]): [string, [string, string][]] => [t, filas.filter(esPar)])
      .filter(([, filas]) => filas.length > 0);
    if (s.length) d.secciones = s;
  }
  if (textos(caja).length) d.caja = textos(caja);
  if (Array.isArray(cifras)) {
    const c = cifras.filter((x): x is [string, string, string] => Array.isArray(x) && x.length === 3 && x.every(t => typeof t === "string"));
    if (c.length) d.cifras = c;
  }
  if (Array.isArray(destacados)) {
    const ds = destacados.filter((x): x is { titulo: string; texto: string; foto?: number } =>
      !!x && typeof x === "object" && typeof (x as { titulo?: unknown }).titulo === "string" && typeof (x as { texto?: unknown }).texto === "string");
    if (ds.length) d.destacados = ds.map(x => ({ titulo: x.titulo, texto: x.texto, ...(typeof x.foto === "number" ? { foto: x.foto } : {}) }));
  }
  return d;
}

/** Descripción del proveedor de un producto. Cada una está en su propio archivo (descripciones/<id>.json, ver
    vite.config.ts): la página baja solo la suya. Mientras llega devuelve null; si no hay (o falla la red), una vacía,
    y la página arma la descripción general con los datos del producto, como antes. */
export function useDescripcion(id: string): Descripcion | null {
  const [cargada, setCargada] = useState<{ id: string; d: Descripcion } | null>(() => {
    const d = guardadas.get(id);
    return d ? { id, d } : null;
  });
  useEffect(() => {
    let vigente = true;
    void pedirDescripcion(id).then(d => { if (vigente) setCargada({ id, d }); });
    return () => { vigente = false; };
  }, [id]);
  return cargada?.id === id ? cargada.d : (guardadas.get(id) ?? null);
}

/* 13/11/2026: las descripciones ya bajadas quedan en memoria mientras la pestaña está abierta. Al volver a un producto,
   la descripción sale de una vez (antes llegaba un instante después y, al regresar con «atrás», la página quedaba
   ~300 px más abajo de donde estaba la persona). Un pedido que falla no se guarda: se vuelve a intentar. */
const guardadas = new Map<string, Descripcion>();
const enCamino = new Map<string, Promise<Descripcion>>();
export function pedirDescripcion(id: string): Promise<Descripcion> {
  const ya = guardadas.get(id);
  if (ya) return Promise.resolve(ya);
  const pedido = enCamino.get(id);
  if (pedido) return pedido;
  const nuevo = fetch(recurso(`descripciones/${id}.json`))
    .then(r => (r.ok ? r.json() : {}))
    .then(dato => { const d = leerDescripcion(dato); guardadas.set(id, d); return d; })
    .catch((): Descripcion => ({}))
    .finally(() => enCamino.delete(id));
  enCamino.set(id, nuevo);
  return nuevo;
}

/** Al dejar el mouse 250 ms sobre una tarjeta, se pide su descripción (así la página del producto abre completa) */
let espera = 0;
export function precargarDescripcion(id: string) {
  const red = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (guardadas.has(id) || red?.saveData) return;
  window.clearTimeout(espera);
  espera = window.setTimeout(() => { void pedirDescripcion(id); }, 250);
}

export interface DescripcionArmada {
  resumen: string;
  filas: [string, string][];
  incluye: string;
  /** 19/11/2026: descripción ampliada y ficha por secciones (la primera sección, «General», sale de los datos del producto) */
  parrafos: string[];
  secciones: [string, [string, string][]][];
  caja: string[] | null;
  cifras: [string, string, string][];
  destacados: { titulo: string; texto: string; foto?: number }[];
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
  const generales = filas.filter((f): f is [string, string] => Boolean(f[1]));
  for (const f of d.ficha ?? []) filas.push(f);
  // La ficha por secciones también cuenta para el comparador (sin repetir características que ya están)
  for (const [, fs] of d.secciones ?? []) for (const f of fs) if (!filas.some(([k]) => norm(k) === norm(f[0]))) filas.push(f);

  let incluye = (p.categoria && INCLUYE[p.categoria]) || INCLUYE[p.tienda] || INCLUYE.varios || "";
  // (una nota "Incluye…" es parte de la caja; "Sobre pedido" no. 14/11/2026: la tienda no da obsequios, nunca se anuncian)
  if (p.nota && !/pedido/i.test(p.nota)) incluye += ` ${p.nota}.`;
  const usado = incluyeSegunEstado(p.estado, p.tienda);
  if (usado) incluye = usado;
  else if (p.estado !== "Nuevo") incluye += ` Como el producto es ${condMin}, te confirmamos los accesorios que trae.`;

  const secciones: [string, [string, string][]][] = d.secciones?.length ? [["General", generales], ...d.secciones] : [];
  return { resumen, filas: filas.filter((f): f is [string, string] => Boolean(f[1])), incluye, parrafos: d.parrafos ?? [], secciones, caja: d.caja ?? null,
    cifras: d.cifras ?? [], destacados: d.destacados ?? [] };
}
