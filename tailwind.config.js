/** @type {import('tailwindcss').Config} */
// Colores y letras de la marca Rocket Fix (los mismos de la tienda original y de las piezas gráficas)
export default {
  content: { relative: true, files: ["./index.html", "./src/**/*.{ts,tsx}"] },
  // hover: solo en equipos con mouse; en celular el efecto quedaba pegado después de tocar
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: "#0B8457", // verde principal
          hover: "#097049",
          // Verde para textos y enlaces sobre blanco o sobre el fondo claro (5,7:1); el verde principal ahí solo da 4,4:1
          texto: "#097049",
          claro: "#3DD598",
          menta: "#5BE0A9",
          medio: "#0A6B4B",
          oscuro: "#053D2B",
          noche: "#03241B",
          suave: "#E7F3EC"
        },
        // Naranja del cohete: solo para la acción principal y detalles puntuales. "texto" se lee sobre fondos claros (7:1)
        // "tinta": texto sobre el naranja (el mismo de la tienda original), 6,7:1; el blanco sobre naranja solo da 2,8:1
        acento: { DEFAULT: "#FF6B2C", hover: "#E85A1D", suave: "#FFF0E8", texto: "#9A3412", tinta: "#1F0B00" },
        // tinta-3 cumple contraste 4,5:1 sobre blanco y sobre el fondo claro para textos pequeños
        tinta: { DEFAULT: "#0F1F18", 2: "#4A5D53", 3: "#5F6F66" },
        fondo: "#F4F8F6",
        linea: { DEFAULT: "#DCE6E0", fuerte: "#C5D3CA" },
        // Verde WhatsApp un poco más oscuro para que el texto blanco se lea bien (contraste 4,7:1)
        wa: { DEFAULT: "#168540", hover: "#116B33", vivo: "#25D366" }
      },
      fontFamily: {
        display: ['"Archivo"', "system-ui", "sans-serif"],
        sans: ['"Instrument Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Sin fuente web: los pocos números que la usan toman la del sistema
        mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"]
      },
      // Curvas de movimiento: "salida" para lo que aparece o responde a un toque; "cajon" para el carrito y el menú (como iOS)
      transitionTimingFunction: { salida: "cubic-bezier(0.23, 1, 0.32, 1)", cajon: "cubic-bezier(0.32, 0.72, 0, 1)" },
      borderRadius: { DEFAULT: "6px", md: "8px", lg: "10px" },
      maxWidth: { pagina: "1240px" },
      // Dos sombras en todo el sitio: tarjetas al pasar el mouse y paneles que flotan (menú, carrito, sugerencias)
      boxShadow: {
        tarjeta: "0 6px 18px -10px rgba(15,31,24,.25)",
        flota: "0 12px 32px -8px rgba(15,31,24,.22)"
      }
    }
  },
  plugins: []
};
