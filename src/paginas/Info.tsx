/* Páginas de ayuda (ideas del 12/11/2026). Todas usan los textos de data/ayuda.json y los datos reales del catálogo:
     · busca-por-uso (ideas 9 y 10) · todas-las-marcas (12) · sigue-tu-pedido (36 y 57) · preguntas-frecuentes (97)
     · glosario (63) · guia-de-originales (48) · cuidado-de-tus-equipos (70) · antes-de-tu-reparacion (60)
     · diagnostico (56) · empresas (98)
   Los formularios no guardan ni envían nada: arman el mensaje y abren WhatsApp, y la persona lo envía. */
import { Fragment, useEffect, useMemo, useState } from "react";
import { CONFIG, LOGOS_MARCAS, MAS_VENDIDOS, PRODUCTOS, TIENDA_VISTA, VISTAS, conPrecioPrimero, nombreCat } from "../data/catalogo";
import { EncabezadoVista } from "../components/EncabezadoVista";
import { FormularioWhatsApp, type CampoForm } from "../components/FormularioWhatsApp";
import { IconoBuscar, IconoWhatsApp } from "../components/Iconos";
import { TarjetaProducto } from "../components/TarjetaProducto";
import { GLOSARIO, PREGUNTAS, USOS, paginaAyuda, plano, rellenar, trozos, type PaginaAyuda } from "../lib/ayuda";
import { norm, recurso, slug } from "../lib/formato";
import { hrefDe, hrefMarca } from "../lib/rutas";
import { waLink } from "../lib/whatsapp";
import type { Producto, TiendaId } from "../types";
import { NoEncontrada } from "./NoEncontrada";

/** Texto con enlaces [texto](ruta): las rutas de la tienda abren dentro de ella; las de otros sitios, en otra pestaña */
export function TextoConEnlaces({ texto }: { texto: string }) {
  return (
    <>
      {trozos(rellenar(texto)).map((t, i) => {
        if (!("ruta" in t)) return <Fragment key={i}>{t.texto}</Fragment>;
        const externo = /^https?:/.test(t.ruta);
        return <a key={i} href={externo ? t.ruta : hrefDe(t.ruta)} className="enlace" {...(externo ? { target: "_blank", rel: "noopener" } : {})}>{t.texto}</a>;
      })}
    </>
  );
}

/** Al final de cada página: si no encontró lo que buscaba, WhatsApp */
function Cierre({ texto = "¿Te quedó alguna duda? Escríbenos y te ayudamos.", mensaje = `Hola ${CONFIG.nombre}, ` }: { texto?: string; mensaje?: string }) {
  return (
    <div className="mt-10 flex flex-col items-start gap-3 rounded-md border border-linea bg-fondo p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-semibold">{texto}</p>
      <a href={waLink(mensaje)} target="_blank" rel="noopener" className="btn btn-wa shrink-0"><IconoWhatsApp />Escribir por WhatsApp</a>
    </div>
  );
}

/** Campo para filtrar una lista larga (preguntas, glosario) */
function Filtro({ valor, cambiar, rotulo, ejemplo }: { valor: string; cambiar: (v: string) => void; rotulo: string; ejemplo: string }) {
  return (
    <label className="relative block max-w-md">
      <span className="sr-only">{rotulo}</span>
      <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-3" />
      <input type="search" value={valor} onChange={e => cambiar(e.target.value)} placeholder={ejemplo} enterKeyHint="search" autoComplete="off" className="campo pl-9" />
    </label>
  );
}

/* ---------- Busca por uso ---------- */
const VENDIDOS = new Set(MAS_VENDIDOS);
const productosDeTipo = (tipo: string) => {
  const [t, c] = tipo.split(":");
  return PRODUCTOS.filter(p => p.tienda === t && (!c || p.categoria === c) && !p.consultar && p.imagen)
    .sort((a, b) => Number(VENDIDOS.has(b.id)) - Number(VENDIDOS.has(a.id)) || conPrecioPrimero(a, b));
};
/** Un producto de cada tipo, por turnos, para que se vea variedad */
function muestraDe(tipos: string[], n: number): Producto[] {
  const listas = tipos.map(productosDeTipo);
  const out: Producto[] = [];
  for (let k = 0; out.length < n && listas.some(l => l[k]); k++) for (const l of listas) { const p = l[k]; if (p && out.length < n && !out.includes(p)) out.push(p); }
  return out;
}
const enlaceTipo = (tipo: string) => {
  const [t, c] = tipo.split(":") as [TiendaId, string | undefined];
  const vista = TIENDA_VISTA[t];
  return { href: hrefDe(vista) + (c ? `?tipo=${encodeURIComponent(c)}` : ""), texto: c ? nombreCat[c] ?? c : VISTAS[vista] ?? vista };
};

function BuscaPorUso() {
  return (
    <>
      <nav aria-label="Usos" className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {USOS.map(u => <a key={u.id} href={`#${u.id}`} className="chip">{u.titulo}</a>)}
      </nav>
      {USOS.map(u => (
        <section key={u.id} id={u.id} aria-labelledby={`t-${u.id}`} className="mt-10 scroll-mt-36">
          <h2 id={`t-${u.id}`} className="text-xl font-extrabold sm:text-2xl">{u.titulo}</h2>
          <p className="mt-1 text-tinta-2">{u.texto}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {u.tipos.map(enlaceTipo).map(e => <li key={e.href}><a href={e.href} className="chip">{e.texto}</a></li>)}
          </ul>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {muestraDe(u.tipos, 4).map(p => <li key={p.id}><TarjetaProducto producto={p} /></li>)}
          </ul>
        </section>
      ))}
      <Cierre texto="¿Tu uso no está aquí? Cuéntanos qué necesitas y te recomendamos." mensaje={`Hola ${CONFIG.nombre}, necesito un equipo para `} />
    </>
  );
}

/* ---------- Todas las marcas ---------- */
function TodasLasMarcas() {
  const marcas = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of PRODUCTOS) if (p.marca) m.set(p.marca, (m.get(p.marca) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, []);
  const letras = [...new Set(marcas.map(([m]) => norm(m)[0]?.toUpperCase() ?? "#"))];
  return (
    <>
      <nav aria-label="Letras" className="flex flex-wrap gap-1.5">
        {letras.map(l => <a key={l} href={`#letra-${l}`} className="flex h-10 min-w-10 items-center justify-center rounded border border-linea-fuerte px-2 font-semibold hover:border-marca hover:text-marca">{l}</a>)}
      </nav>
      {letras.map(l => (
        <section key={l} id={`letra-${l}`} aria-label={`Marcas con ${l}`} className="mt-8 scroll-mt-36">
          <h2 className="font-display text-2xl font-extrabold text-tinta-3">{l}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {marcas.filter(([m]) => (norm(m)[0]?.toUpperCase() ?? "#") === l).map(([m, n]) => (
              <li key={m}>
                <a href={hrefMarca(m)} className="tarjeta presionable flex h-full items-center gap-3 p-3 hover:border-marca">
                  <span className="claro-siempre flex h-10 w-14 shrink-0 items-center justify-center rounded bg-white">
                    {LOGOS_MARCAS[m] ? <img src={recurso(LOGOS_MARCAS[m] ?? "")} alt="" loading="lazy" decoding="async" className="max-h-7 max-w-[48px] object-contain" />
                      : <span aria-hidden="true" className="font-display text-lg font-extrabold text-tinta-3">{m.slice(0, 2)}</span>}
                  </span>
                  <span className="min-w-0"><span className="block truncate font-semibold">{m}</span><span className="text-xs text-tinta-3">{n} {n === 1 ? "producto" : "productos"}</span></span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Cierre texto="¿Buscas una marca que no está? Pregúntanos: puede que la consigamos por pedido." mensaje={`Hola ${CONFIG.nombre}, busco productos de la marca `} />
    </>
  );
}

/* ---------- Sigue tu pedido o tu reparación ---------- */
const CAMPOS_SEGUIMIENTO: CampoForm[] = [
  { id: "tipo", rotulo: "Qué quieres consultar", etiqueta: "Consulta", tipo: "lista", opciones: ["Un pedido de la tienda", "Una reparación", "Una instalación de cámaras"], ancho: "completo" },
  { id: "numero", rotulo: "Número de pedido o de orden", etiqueta: "Número", opcional: true, placeholder: "Por ejemplo: RF-7K2Q4" },
  { id: "nombre", rotulo: "Tu nombre", etiqueta: "Nombre", obligatorio: true, falta: "tu nombre", autocompletar: "name" },
  { id: "detalle", rotulo: "Algo más que debamos saber", etiqueta: "Detalle", tipo: "area", opcional: true, placeholder: "Fecha en que hiciste el pedido o dejaste el equipo, o qué necesitas" }
];
function SigueTuPedido() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="tarjeta p-5 sm:p-6">
        <FormularioWhatsApp asunto="saber en qué va mi pedido o mi equipo" campos={CAMPOS_SEGUIMIENTO} boton="Consultar por WhatsApp" />
      </div>
      <div className="text-sm leading-relaxed text-tinta-2">
        <h2 className="text-lg font-extrabold text-tinta">¿Dónde está mi número?</h2>
        <p className="mt-2">Los pedidos que se envían desde el carrito llevan un número que empieza por RF. Lo ves al inicio del mensaje de WhatsApp con el que hiciste el pedido.</p>
        <p className="mt-2">Si no lo tienes, no hay problema: con tu nombre lo buscamos.</p>
        <p className="mt-4">Atendemos en el horario que ves al final de la página. Si escribes fuera de ese horario, te respondemos cuando volvamos a abrir.</p>
      </div>
    </div>
  );
}

/* ---------- Preguntas frecuentes ---------- */
function PreguntasFrecuentes() {
  const [q, setQ] = useState("");
  const n = norm(q.trim());
  const lista = PREGUNTAS.filter(x => !n || norm(`${x.tema} ${x.p} ${plano(x.r)}`).includes(n));
  const temas = [...new Set(lista.map(x => x.tema))];
  return (
    <>
      <Filtro valor={q} cambiar={setQ} rotulo="Buscar en las preguntas" ejemplo="Por ejemplo: envío, Bold, garantía" />
      <p className="mt-3 text-sm text-tinta-2" aria-live="polite">{lista.length} {lista.length === 1 ? "pregunta" : "preguntas"}</p>
      {temas.map(t => (
        <section key={t} aria-label={t} className="mt-6">
          <h2 className="etiqueta">{t}</h2>
          <div className="mt-2 grid gap-2">
            {lista.filter(x => x.tema === t).map(x => (
              <details key={x.p} open={Boolean(n)} className="desplegable rounded border border-linea bg-superficie">
                <summary className="cursor-pointer px-4 py-3 font-semibold">{x.p}</summary>
                <p className="border-t border-linea px-4 py-3 leading-relaxed text-tinta-2"><TextoConEnlaces texto={x.r} /></p>
              </details>
            ))}
          </div>
        </section>
      ))}
      {!lista.length && <p className="mt-6 text-tinta-2">No hay preguntas con «{q.trim()}». Escríbenos y te respondemos.</p>}
      <Cierre texto="¿No encontraste tu pregunta? Escríbenos." mensaje={q.trim() ? `Hola ${CONFIG.nombre}, tengo una pregunta: ${q.trim()}` : `Hola ${CONFIG.nombre}, tengo una pregunta: `} />
    </>
  );
}

/* ---------- Glosario ---------- */
function Glosario() {
  const [q, setQ] = useState("");
  const n = norm(q.trim());
  const lista = GLOSARIO.filter(g => !n || norm(`${g.t} ${g.d}`).includes(n));
  return (
    <>
      <Filtro valor={q} cambiar={setQ} rotulo="Buscar en el glosario" ejemplo="Por ejemplo: eSIM, SSD, Hz" />
      <dl className="mt-6 grid gap-3 md:grid-cols-2">
        {lista.map(g => (
          <div key={g.t} id={slug(g.t)} className="tarjeta scroll-mt-36 p-4">
            <dt className="font-display text-lg font-extrabold">{g.t}</dt>
            <dd className="mt-1 leading-relaxed text-tinta-2">{g.d}</dd>
          </div>
        ))}
      </dl>
      {!lista.length && <p className="mt-6 text-tinta-2">No encontramos «{q.trim()}» en el glosario.</p>}
      <Cierre texto="¿Ves otra palabra que no entiendes en una ficha? Pregúntanos." />
    </>
  );
}

/* ---------- Guías de texto (originales, cuidado, antes de reparar) ---------- */
function Guia({ pagina }: { pagina: PaginaAyuda }) {
  return (
    <div className="max-w-3xl">
      {pagina.secciones?.map(s => (
        <section key={s.titulo} className="mt-8 first:mt-0">
          <h2 className="text-xl font-extrabold">{s.titulo}</h2>
          {s.parrafos?.map(t => <p key={t} className="mt-3 leading-relaxed text-tinta-2"><TextoConEnlaces texto={t} /></p>)}
          {s.lista && (
            <ul className="mt-3 grid gap-2">
              {s.lista.map(t => (
                <li key={t} className="flex gap-3 leading-relaxed text-tinta-2">
                  <span aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 rounded border-2 border-marca" />
                  <span><TextoConEnlaces texto={t} /></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {pagina.id === "antes-de-tu-reparacion"
        ? <Cierre texto="¿Listo? Cuéntanos qué le pasa a tu equipo." mensaje={`Hola ${CONFIG.nombre}, quiero cotizar la reparación de mi `} />
        : <Cierre />}
    </div>
  );
}

/* ---------- Diagnóstico guiado ---------- */
type Equipo = "celular" | "computador" | "consola" | "camaras";
const EQUIPOS: { id: Equipo; nombre: string }[] = [
  { id: "celular", nombre: "Celular o tableta" }, { id: "computador", nombre: "Computador" },
  { id: "consola", nombre: "Consola o control" }, { id: "camaras", nombre: "Cámaras de seguridad" }
];
/** Síntoma → qué revisamos (sin precios: el valor se da por WhatsApp con el modelo) */
const SINTOMAS: Record<Equipo, { s: string; revisamos: string; consejo?: string }[]> = {
  celular: [
    { s: "La pantalla se rompió o no se ve", revisamos: "el cambio de pantalla (o solo del vidrio, si el resto funciona)", consejo: "Si la pantalla aún responde, haz una copia de tus datos antes de traerlo." },
    { s: "La batería dura poco o se infla", revisamos: "el estado de la batería y su cambio", consejo: "Si la batería está inflada, deja de cargarlo y no lo presiones." },
    { s: "No carga o carga a ratos", revisamos: "el puerto de carga, el cable y el cargador", consejo: "Prueba con otro cable y otro cargador: a veces la falla está ahí." },
    { s: "Se mojó", revisamos: "la limpieza de la placa y qué partes se afectaron", consejo: "Apágalo y no lo cargues. No lo metas en arroz: no saca la humedad de adentro." },
    { s: "No enciende", revisamos: "la batería, la placa y el botón de encendido" },
    { s: "Cámara, micrófono o altavoz", revisamos: "el módulo que falla y su cambio" },
    { s: "Está lento o se reinicia", revisamos: "el software, el almacenamiento y la batería" }
  ],
  computador: [
    { s: "Está lento", revisamos: "el disco, la memoria RAM y el sistema; muchas veces mejora mucho con un SSD", consejo: "Cuéntanos la marca y el modelo para decirte si admite más RAM o un SSD." },
    { s: "Se calienta o se apaga solo", revisamos: "los ventiladores, la pasta térmica y la limpieza interna" },
    { s: "No enciende", revisamos: "el cargador, la batería y la tarjeta madre" },
    { s: "Pantalla dañada o con rayas", revisamos: "la pantalla, el cable de video y la tarjeta gráfica" },
    { s: "Teclado o touchpad", revisamos: "el teclado o el touchpad y su cambio" },
    { s: "Virus, formateo o programas", revisamos: "el formateo, la instalación del sistema y la copia de tus archivos" },
    { s: "Quiero mejorarlo (SSD, RAM) o armar un PC", revisamos: "qué piezas son compatibles con tu equipo o tu presupuesto" }
  ],
  consola: [
    { s: "No enciende o se apaga", revisamos: "la fuente, la limpieza y la placa" },
    { s: "Se calienta o hace mucho ruido", revisamos: "la limpieza interna y la pasta térmica" },
    { s: "El control falla (drift, botones)", revisamos: "los joysticks y botones del control" },
    { s: "No lee discos o no da imagen", revisamos: "el lector o el puerto HDMI" }
  ],
  camaras: [
    { s: "Quiero instalar cámaras nuevas", revisamos: "cuántas cámaras necesitas y dónde van, en una visita técnica" },
    { s: "Mis cámaras dejaron de verse en el celular", revisamos: "la grabadora, la red y la configuración de la aplicación" },
    { s: "Quiero agregar más cámaras", revisamos: "si tu grabadora tiene espacio para más canales" }
  ]
};
const SERVICIO_DE: Record<Equipo, { texto: string; ruta: string }> = {
  celular: { texto: "Reparación de celulares", ruta: "blog-celulares" },
  computador: { texto: "Reparación de computadores", ruta: "blog-computadores" },
  consola: { texto: "Solicitar un servicio", ruta: "servicios" },
  camaras: { texto: "Instalación de cámaras", ruta: "blog-camaras" }
};

function Diagnostico() {
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [sintoma, setSintoma] = useState<number | null>(null);
  const [modelo, setModelo] = useState("");
  const s = equipo && sintoma != null ? SINTOMAS[equipo][sintoma] : null;
  const nombreEquipo = EQUIPOS.find(e => e.id === equipo)?.nombre.toLowerCase() ?? "";
  const mensaje = s ? `Hola ${CONFIG.nombre}, quiero saber el valor aproximado de un servicio.\n\nEquipo: ${nombreEquipo}${modelo.trim() ? ` (${modelo.trim()})` : ""}\nQué le pasa: ${s.s}` : "";
  const paso = (n: number, titulo: string) => <h2 className="flex items-center gap-2.5 text-lg font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-marca text-sm text-white">{n}</span>{titulo}</h2>;
  return (
    <div className="grid max-w-3xl gap-8">
      <fieldset>
        <legend className="mb-3">{paso(1, "¿Qué equipo es?")}</legend>
        <div className="flex flex-wrap gap-2">
          {EQUIPOS.map(e => <button key={e.id} type="button" aria-pressed={equipo === e.id} onClick={() => { setEquipo(e.id); setSintoma(null); }} className="chip">{e.nombre}</button>)}
        </div>
      </fieldset>
      {equipo && (
        <fieldset className="motion-safe:animate-entrar">
          <legend className="mb-3">{paso(2, "¿Qué le pasa?")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {SINTOMAS[equipo].map((x, i) => (
              <button key={x.s} type="button" aria-pressed={sintoma === i} onClick={() => setSintoma(i)}
                className={`presionable min-h-[48px] rounded border px-4 py-2.5 text-left text-[15px] ${sintoma === i ? "border-marca bg-marca-suave font-semibold ring-1 ring-marca" : "border-linea-fuerte hover:border-tinta-2"}`}>{x.s}</button>
            ))}
          </div>
        </fieldset>
      )}
      {equipo && s && (
        <section aria-live="polite" className="tarjeta p-5 motion-safe:animate-entrar sm:p-6">
          {paso(3, "Esto es lo que revisamos")}
          <p className="mt-3 leading-relaxed text-tinta-2">Para «{s.s.toLowerCase()}» revisamos {s.revisamos}. El valor depende de la marca y el modelo: te damos uno aproximado por WhatsApp.</p>
          {s.consejo && <p className="mt-3 rounded bg-acento-suave px-3.5 py-2.5 text-sm text-acento-texto"><b>Mientras tanto:</b> {s.consejo}</p>}
          <label className="mt-4 block">
            <span className="rotulo">Marca y modelo <span className="opcional">(opcional)</span></span>
            <input value={modelo} onChange={e => setModelo(e.target.value)} className="campo" placeholder="Por ejemplo: iPhone 13, Lenovo IdeaPad 3" autoComplete="off" />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={waLink(mensaje)} target="_blank" rel="noopener" className="btn btn-wa"><IconoWhatsApp />Pedir el valor por WhatsApp</a>
            <a href={hrefDe(SERVICIO_DE[equipo].ruta)} className="btn btn-borde">{SERVICIO_DE[equipo].texto}</a>
          </div>
          {equipo !== "camaras" && <p className="mt-4 text-sm text-tinta-2">Antes de traerlo, mira <a href={hrefDe("antes-de-tu-reparacion")} className="enlace">qué hacer antes de tu reparación</a>.</p>}
        </section>
      )}
    </div>
  );
}

/* ---------- Empresas ---------- */
const CAMPOS_EMPRESAS: CampoForm[] = [
  { id: "empresa", rotulo: "Empresa, colegio o negocio", etiqueta: "Empresa", obligatorio: true, falta: "el nombre de la empresa", autocompletar: "organization" },
  { id: "nombre", rotulo: "Tu nombre", etiqueta: "Contacto", obligatorio: true, falta: "tu nombre", autocompletar: "name" },
  { id: "ciudad", rotulo: "Ciudad de entrega", etiqueta: "Ciudad", inicial: "Bogotá", autocompletar: "address-level2" },
  { id: "cantidad", rotulo: "Cuántos equipos o productos", etiqueta: "Cantidad", tipo: "lista", opciones: ["1 a 5", "6 a 20", "21 a 50", "Más de 50", "Aún no sé"] },
  { id: "detalle", rotulo: "Qué necesitas", etiqueta: "Necesita", tipo: "area", obligatorio: true, falta: "qué necesitas",
    placeholder: "Por ejemplo: 10 portátiles para oficina con 16 GB de RAM, o celulares para el equipo de ventas" },
  { id: "fecha", rotulo: "Para cuándo lo necesitas", etiqueta: "Para cuándo", opcional: true, placeholder: "Por ejemplo: antes del 15 de diciembre" }
];
function Empresas() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="tarjeta p-5 sm:p-6">
        <FormularioWhatsApp asunto="una cotización para mi empresa" campos={CAMPOS_EMPRESAS} boton="Pedir cotización por WhatsApp" />
      </div>
      <div className="text-sm leading-relaxed text-tinta-2">
        <h2 className="text-lg font-extrabold text-tinta">Qué puedes cotizar</h2>
        <ul className="mt-2 grid gap-1.5">
          {["Portátiles y PC de escritorio", "Celulares y tabletas", "Monitores, teclados, mouse y cámaras web", "Componentes y mejoras (SSD, RAM)", "Instalación de cámaras de seguridad", "Mantenimiento de computadores"].map(t => <li key={t}>• {t}</li>)}
        </ul>
        <p className="mt-4">Te respondemos por WhatsApp con la cotización y la disponibilidad de cada producto.</p>
      </div>
    </div>
  );
}

export function Info({ id }: { id: string }) {
  const pagina = paginaAyuda(id);
  useEffect(() => { if (pagina) document.title = `${pagina.titulo} · ${CONFIG.nombre}`; }, [pagina]);
  // Las secciones de la página se abren con #: /busca-por-uso/#jugar baja hasta «Para jugar»
  useEffect(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h) requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ block: "start" }));
  }, []);
  if (!pagina) return <NoEncontrada />;
  const contenido = (() => {
    switch (id) {
      case "busca-por-uso": return <BuscaPorUso />;
      case "todas-las-marcas": return <TodasLasMarcas />;
      case "sigue-tu-pedido": return <SigueTuPedido />;
      case "preguntas-frecuentes": return <PreguntasFrecuentes />;
      case "glosario": return <Glosario />;
      case "diagnostico": return <Diagnostico />;
      case "empresas": return <Empresas />;
      default: return <Guia pagina={pagina} />;
    }
  })();
  return (
    <>
      <EncabezadoVista migas={[{ texto: "Inicio", href: hrefDe("inicio") }, { texto: pagina.menu }]} titulo={pagina.titulo} lead={pagina.lead} />
      <div className="contenedor py-8">{contenido}</div>
    </>
  );
}
