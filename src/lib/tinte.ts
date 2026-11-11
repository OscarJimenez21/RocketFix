/* Animación 49: color de la versión elegida. Si el nombre de la versión trae un color («256 GB negro», «Blanca»,
   «Lila»…), el marco de la foto del producto toma un brillo suave de ese tono. Si no trae color, no pasa nada. */

const COLORES: [RegExp, string][] = [
  [/\b(negr[oa]|black|graphite|grafito|medianoche|midnight)\b/i, "#3A3F45"],
  [/\b(blanc[oa]|white|crema|starlight)\b/i, "#C9D2DC"],
  [/\b(gris|gray|grey|silver|plata|platead[oa]|titanio)\b/i, "#9AA3AD"],
  [/\b(azul|blue|celeste)\b/i, "#5B8DEF"],
  [/\b(lila|morad[oa]|purple|violeta|lavanda)\b/i, "#A58BE8"],
  [/\b(ros[ae]|rosad[oa]|pink|fucsia|magenta)\b/i, "#F08DB7"],
  [/\b(roj[oa]|red)\b/i, "#E86A5F"],
  [/\b(dorad[oa]|gold|oro)\b/i, "#E3B85C"],
  [/\b(verde|green|menta)\b/i, "#5CC08A"],
  [/\b(amarill[oa]|yellow)\b/i, "#F2CF4F"],
  [/\b(naranja|orange)\b/i, "#F59A4A"]
];

/** Color de la versión según su nombre, o null si no menciona ninguno */
export function tinteDe(nombre: string | undefined): string | null {
  if (!nombre) return null;
  for (const [re, color] of COLORES) if (re.test(nombre)) return color;
  return null;
}
