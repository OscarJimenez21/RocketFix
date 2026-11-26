/* Idea 30 (modo noche) RETIRADA el 25/11/2026 por pedido del usuario: la página siempre se ve de día. Se dejan estas
   funciones para que lo que aún las llame siga funcionando: siempre ponen los colores de día y borran la elección
   guardada de antes (la de index.html hace lo mismo antes de pintar). */
export type Tema = "claro";

export function aplicarTema() {
  const raiz = document.documentElement;
  delete raiz.dataset.tema;
  try { localStorage.removeItem("rf-tema"); } catch { /* sin almacenamiento */ }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#FFFFFF");
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", "light");
}
