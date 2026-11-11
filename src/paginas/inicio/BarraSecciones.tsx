/* Idea 5 (animación 63): en computador, al pasar la portada grande aparece una barra fina debajo de la cabecera con las
   secciones de la portada. La sección en la que se va queda subrayada; el subrayado se desliza de una a otra. Tocar una
   baja hasta ella. Se esconde al volver arriba y al llegar al pie de página. En celular no existe (ahí está el menú) */
import { useEffect, useRef, useState } from "react";
import { useMarco } from "../../lib/movimiento";

const SECCIONES: { texto: string; id: string }[] = [
  { texto: "Categorías", id: "categorias" },
  { texto: "Envíos", id: "envios" },
  { texto: "Marcas", id: "marcas" },
  { texto: "Lo más vendido", id: "t-vendidos" },
  { texto: "Encuentra tu celular", id: "tu-celular" },
  { texto: "Celulares", id: "t-celulares" },
  { texto: "Computadores", id: "t-computadores" },
  { texto: "Servicio técnico", id: "servicios" },
  { texto: "Calificaciones", id: "calificaciones" }
];

export function BarraSecciones() {
  const [visible, setVisible] = useState(false);
  const [activa, setActiva] = useState(-1);
  const lista = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLElement>(null);
  // Las secciones que hay en la portada (las de diciembre o las que no tengan productos pueden faltar); se miran al montar
  const [presentes, setPresentes] = useState<typeof SECCIONES>([]);
  const actual = SECCIONES[activa]?.id;
  const marco = useMarco(lista, Math.max(0, presentes.findIndex(s => s.id === actual)));

  useEffect(() => {
    setPresentes(SECCIONES.filter(s => document.getElementById(s.id)));
    let cuadro = 0;
    const revisar = () => {
      cuadro = 0;
      const portada = document.querySelector("main section");
      const pie = document.getElementById("contacto");
      const pasada = portada ? portada.getBoundingClientRect().bottom < 120 : window.scrollY > 500;
      const conPie = pie ? pie.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      setVisible(pasada && !conPie);
      // La sección actual: la última cuyo comienzo ya subió al primer tercio largo de la pantalla
      const linea = Math.max(170, window.innerHeight * 0.4);
      let i = -1;
      SECCIONES.forEach((s, k) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < linea) i = k;
      });
      setActiva(i);
    };
    const alMover = () => { if (!cuadro) cuadro = requestAnimationFrame(revisar); };
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    revisar();
    return () => { window.removeEventListener("scroll", alMover); window.removeEventListener("resize", alMover); cancelAnimationFrame(cuadro); };
  }, []);
  useEffect(() => { if (barra.current) barra.current.inert = !visible; }, [visible]);

  const ir = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <nav ref={barra} aria-label="Secciones de la portada"
      className={`fixed inset-x-0 top-[69px] z-30 hidden border-b border-linea bg-superficie/90 backdrop-blur transition-[transform,opacity] duration-300 ease-salida lg:block ${visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"}`}>
      <div ref={lista} className="contenedor relative flex h-11 items-stretch gap-1 overflow-x-auto sin-barra">
        {presentes.map(s => (
          <button key={s.id} data-opcion type="button" onClick={() => ir(s.id)} aria-current={actual === s.id ? "true" : undefined}
            className={`shrink-0 px-3 text-[13.5px] font-semibold transition-colors duration-150 ${actual === s.id ? "text-tinta" : "text-tinta-2 hover:text-tinta"}`}>
            {s.texto}
          </button>
        ))}
        {/* El subrayado verde: mismo cálculo del marco que se desliza en las versiones del producto */}
        {marco && activa >= 0 && presentes.some(s => s.id === actual) && (
          <span aria-hidden="true" className="subrayado-seccion pointer-events-none absolute left-0 top-0" style={marco}><span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-marca" /></span>
        )}
      </div>
    </nav>
  );
}
