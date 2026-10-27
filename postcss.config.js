import { fileURLToPath } from "node:url";

// La configuración de Tailwind se busca junto a este archivo (así funciona aunque Vite se inicie desde otra carpeta)
export default {
  plugins: {
    tailwindcss: { config: fileURLToPath(new URL("./tailwind.config.js", import.meta.url)) },
    autoprefixer: {}
  }
};
