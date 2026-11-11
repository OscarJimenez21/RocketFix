/* Estado compartido: carrito (guardado en el navegador), versión elegida de cada producto, panel del carrito y avisos.
   La clave de guardado es la misma de la tienda original, así el carrito de los clientes se conserva. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CONFIG, porId } from "../data/catalogo";
import type { LineaCarrito } from "../types";

const CLAVE = "rocketfix-carrito-v3-" + CONFIG.whatsapp;
const MAX = 99;

export const claveLinea = (id: string, i: number) => `${id}~${i}`;
/** Los productos de «Preguntar disponibilidad» no entran al carrito (y salen de los carritos guardados) */
function deClave(k: string) {
  const [id = "", i = ""] = k.split("~");
  const producto = porId[id];
  const opcion = producto?.opciones[Number(i)];
  return producto && opcion && !producto.consultar ? { producto, opcion, indice: Number(i) } : null;
}

function cargar(): Record<string, number> {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || "{}") as Record<string, number>;
    const limpio: Record<string, number> = {};
    for (const [k, q] of Object.entries(datos)) {
      const d = deClave(k);
      // Solo cantidades enteras (lo guardado puede venir dañado o alterado)
      if (d && Number.isInteger(q) && q > 0) limpio[k] = Math.min(q, d.producto.stock ?? MAX);
    }
    return limpio;
  } catch {
    return {};
  }
}

interface Ctx {
  lineas: LineaCarrito[];
  unidades: number;
  cantidadDe: (id: string, i: number) => number;
  agregar: (id: string, i: number) => boolean;
  cambiar: (clave: string, delta: number) => void;
  quitar: (clave: string) => void;
  vaciar: () => void;
  version: (id: string) => number;
  elegirVersion: (id: string, i: number) => void;
  carritoAbierto: boolean;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
  aviso: string;
  /** Cuántos avisos se han dado (cambia aunque el texto se repita: así la línea del aviso vuelve a empezar) */
  avisoVez: number;
  avisar: (texto: string) => void;
}
const TiendaCtx = createContext<Ctx | null>(null);

export function TiendaProvider({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<Record<string, number>>(cargar);
  const [versiones, setVersiones] = useState<Record<string, number>>({});
  const [carritoAbierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState("");
  const [avisoVez, setAvisoVez] = useState(0);
  const reloj = useRef<number>();

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch { /* navegador sin almacenamiento */ }
  }, [carrito]);

  // Si el carrito cambia en otra pestaña, se actualiza aquí también
  useEffect(() => {
    const alGuardar = (e: StorageEvent) => { if (e.key === CLAVE) setCarrito(cargar()); };
    window.addEventListener("storage", alGuardar);
    return () => window.removeEventListener("storage", alGuardar);
  }, []);

  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    if (texto) setAvisoVez(n => n + 1);
    window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => setAviso(""), 4200);
  }, []);

  const cambiar = useCallback((k: string, delta: number) => {
    const d = deClave(k);
    if (!d) return;
    setCarrito(c => {
      const actual = c[k] ?? 0;
      const nueva = Math.max(0, Math.min(d.producto.stock ?? MAX, actual + delta));
      if (nueva === actual) return c;
      const sig = { ...c };
      if (nueva === 0) delete sig[k];
      else sig[k] = nueva;
      return sig;
    });
  }, []);

  const agregar = useCallback((id: string, i: number) => {
    const k = claveLinea(id, i);
    const d = deClave(k);
    if (!d) return false;
    const actual = carrito[k] ?? 0;
    if (actual >= (d.producto.stock ?? MAX)) return false;
    cambiar(k, 1);
    return true;
  }, [carrito, cambiar]);

  const lineas = useMemo<LineaCarrito[]>(() =>
    Object.entries(carrito).flatMap(([clave, cantidad]) => {
      const d = deClave(clave);
      return d ? [{ ...d, clave, cantidad }] : [];
    }), [carrito]);

  // Estas funciones no cambian nunca. Antes se creaban de nuevo en cada cambio de estado, y el carrito (que depende de
  // cerrarCarrito para cerrarse con Esc y devolver el foco) reiniciaba su efecto cada vez: al sumar o restar una unidad
  // con el teclado, el foco saltaba al botón «Cerrar carrito»
  const quitar = useCallback((k: string) => setCarrito(c => { const sig = { ...c }; delete sig[k]; return sig; }), []);
  const vaciar = useCallback(() => setCarrito({}), []);
  const elegirVersion = useCallback((id: string, i: number) => setVersiones(v => ({ ...v, [id]: i })), []);
  const abrirCarrito = useCallback(() => setAbierto(true), []);
  const cerrarCarrito = useCallback(() => setAbierto(false), []);

  const valor = useMemo<Ctx>(() => ({
    lineas,
    unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
    cantidadDe: (id, i) => carrito[claveLinea(id, i)] ?? 0,
    agregar,
    cambiar,
    quitar,
    vaciar,
    version: id => versiones[id] ?? 0,
    elegirVersion,
    carritoAbierto,
    abrirCarrito,
    cerrarCarrito,
    aviso,
    avisoVez,
    avisar
  }), [lineas, carrito, versiones, carritoAbierto, aviso, avisoVez, agregar, cambiar, quitar, vaciar, elegirVersion, abrirCarrito, cerrarCarrito, avisar]);
  return <TiendaCtx.Provider value={valor}>{children}</TiendaCtx.Provider>;
}

export function useTienda() {
  const c = useContext(TiendaCtx);
  if (!c) throw new Error("useTienda fuera de TiendaProvider");
  return c;
}
