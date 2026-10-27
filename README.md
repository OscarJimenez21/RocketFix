# Rocket Fix

Tienda en línea de tecnología de Rocket Fix (Bogotá, Colombia): celulares, computadores, componentes, periféricos, consolas y más, con pedidos por WhatsApp y pago en línea con Bold.

Hecha con **React 18 + TypeScript + Vite + Tailwind CSS**. Se publica en GitHub Pages en `https://oscarjimenez21.github.io/RocketFix/`.

> La versión anterior (un solo `index.html`) está guardada sin cambios en `legacy/index.html` y en la rama `version-estable`.

## Requisitos

- [Node.js](https://nodejs.org) 22 o más reciente (trae `npm`).

## Uso diario

```bash
npm install          # solo la primera vez (o cuando cambie package.json)
npm run dev          # abre la tienda en http://localhost:5173/RocketFix/ y se actualiza al guardar
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Tienda en modo de desarrollo |
| `npm run build` | Revisa los tipos y compila la versión para publicar en `dist/` |
| `npm run preview` | Sirve `dist/` en http://localhost:4173/RocketFix/ para probarla tal como quedará publicada |
| `npm run typecheck` | Solo revisa los tipos de TypeScript |
| `npm run verificar` | Comprueba que el catálogo sea el mismo de la tienda original (productos, precios, fotos) y que no haya datos privados |
| `npm run auditoria` | Regenera `docs/auditoria-catalogo.md` |
| `npm run catalogo` | Vuelve a extraer los datos de `legacy/index.html` a `src/data/` |

## Estructura

```
src/
  data/          Catálogo y contenido (JSON) + acceso tipado (catalogo.ts)
  lib/           Lógica sin interfaz: búsqueda, pedido y envío, WhatsApp, Bold, rutas, horario
  estado/        Carrito y versión elegida de cada producto (se guarda en el navegador)
  components/    Piezas reutilizables: cabecera, buscador, tarjeta de producto, carrito, galería…
  paginas/       Inicio, sección de la tienda, producto, búsqueda, blog y artículos
  types.ts       Tipos de producto, configuración, carrito y rutas
public/          Fotos, logos de pago, favicons y la imagen para compartir el enlace
scripts/         Extracción, verificación y auditoría del catálogo
legacy/          La tienda anterior, sin cambios
```

Las direcciones son las mismas de la tienda anterior (`#celulares`, `#p/ip17pm`, `#buscar/samsung`, `#blog-camaras`…), así que los enlaces ya compartidos siguen funcionando y recargar la página no da error.

## Cambiar productos, precios o textos

Los datos están en `src/data/`:

- `productos.json`: cada producto con `id`, `tienda`, `categoria`, `marca`, `nombre`, `imagen` y `opciones` (`[{ "nombre": "256 GB", "precio": 3550000 }]`).
- `galerias.json`: fotos extra del carrusel de cada producto.
- `descripciones.json`: resumen y ficha técnica.
- `config.json`: WhatsApp, horario, envíos, formas de pago y Bold.

Las fotos van en `public/fotos/` (800 × 800 px, `.jpg`). Después de cambiar algo, corre `npm run build` para revisar que todo compile.

**Nunca** pongas en este repositorio costos de proveedor, márgenes, el Excel o CSV de proveedores ni la llave secreta de Bold: el repositorio es público. `npm run verificar` avisa si encuentra hojas de cálculo o algo con forma de llave secreta.

## Bold

`config.json → bold.llave` es la **llave de identidad** (pública: Bold la pide en el navegador). La llave secreta nunca va en la página.
Mientras `bold.firmaUrl` esté vacío, el cliente escribe el total en Bold (la página se lo copia). Para que el total llegue firmado hace falta un pequeño servicio propio que calcule la firma con la llave secreta y devuelva `{ "hash": "…" }`; su dirección va en `firmaUrl`.

## Publicar en GitHub Pages

La publicación **no es automática**: el sitio solo cambia cuando inicias a mano el flujo "Publicar la tienda".

1. **Una sola vez:** en GitHub → *Settings* → *Pages* → *Build and deployment* → *Source*, elige **GitHub Actions**.
2. Lleva los cambios a `main` (por ejemplo, uniendo la rama `rediseno-react`) y súbelos.
3. En GitHub → *Actions* → **Publicar la tienda** → *Run workflow* (rama `main`). El flujo verifica el catálogo, compila y publica `dist/`.
4. Cuando termine (marca verde), abre la tienda y revisa inicio, un producto, el carrito y el botón de WhatsApp.

Para compilar a mano con otra ruta base: `BASE_PATH=/otra-ruta/ npm run build` (por defecto es `/RocketFix/`).

### Volver a la versión anterior

En *Settings* → *Pages* → *Source*, elige **Deploy from a branch** → rama `version-estable`, carpeta `/ (root)`. GitHub vuelve a publicar la tienda anterior tal como estaba (la rama debe estar subida a GitHub).
