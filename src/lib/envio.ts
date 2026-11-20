import { CONFIG } from "../data/catalogo";

/** 20/11/2026: aviso corto de envío gratis para las tarjetas, con los mismos topes de config.json que se publican en la
    página («Envíos»): desde el tope nacional, a todo Colombia; desde el de Bogotá, en Bogotá. Si el precio no llega a
    ninguno, nada (no se inventan beneficios) */
export function envioGratis(precio: number): string {
  if (!precio) return "";
  // Corto: en celular la tarjeta mide ~165 px («Envío gratis a todo Colombia» salía cortado)
  if (precio >= CONFIG.envios.nacional.gratisDesde) return "Envío nacional gratis";
  if (precio >= CONFIG.envios.bogota.gratisDesde) return "Envío gratis en Bogotá";
  return "";
}
