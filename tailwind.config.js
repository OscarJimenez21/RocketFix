/** @type {import('tailwindcss').Config} */
// Colores y letras de la marca Rocket Fix (los mismos de la tienda original y de las piezas gráficas)
export default {
  content: { relative: true, files: ["./index.html", "./src/**/*.{ts,tsx}"] },
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: "#0B8457", // verde principal
          hover: "#097049",
          claro: "#3DD598",
          menta: "#5BE0A9",
          medio: "#0A6B4B",
          oscuro: "#053D2B",
          noche: "#03241B",
          suave: "#E7F3EC"
        },
        acento: { DEFAULT: "#FF6B2C", hover: "#E85A1D", suave: "#FFF0E8" },
        brillo: "#FFC15E",
        tinta: { DEFAULT: "#0F1F18", 2: "#4A5D53", 3: "#7A8C82" },
        fondo: "#F4F8F6",
        linea: { DEFAULT: "#DCE6E0", fuerte: "#C5D3CA" },
        wa: { DEFAULT: "#1FA855", hover: "#178C46" }
      },
      fontFamily: {
        display: ['"Archivo"', "system-ui", "sans-serif"],
        sans: ['"Instrument Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "Consolas", "monospace"]
      },
      borderRadius: { DEFAULT: "6px", md: "8px", lg: "10px" },
      maxWidth: { pagina: "1240px" },
      boxShadow: {
        tarjeta: "0 1px 2px rgba(15,31,24,.05)",
        flota: "0 12px 32px -8px rgba(15,31,24,.22)"
      }
    }
  },
  plugins: []
};
