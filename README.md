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
| `npm run verificar` | Revisa el catálogo antes de publicar: ids únicos, precios válidos, fotos que existen y nada privado. También lista lo que cambió respecto a la tienda anterior (solo informativo; con `-- --estricto` cuenta como error) |
| `npm run auditoria` | Regenera `docs/auditoria-catalogo.md` |
| `npm run catalogo` | Solo se usó para la migración: vuelve a extraer los datos de `legacy/index.html` y **sobrescribe `src/data/`**, borrando los cambios hechos después. No lo uses para el trabajo diario |

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

Igual que antes: cada vez que subes cambios a `main` (*Push origin* en GitHub Desktop), el flujo "Publicar la tienda" verifica el catálogo, compila y publica `dist/`. Si la verificación falla, no publica y la tienda anterior sigue en línea. En GitHub → *Actions* ves cada publicación (marca verde = publicada) y puedes repetirla con *Run workflow*.

Requisito, una sola vez: en GitHub → *Settings* → *Pages* → *Build and deployment* → *Source* debe estar en **GitHub Actions**.

Para compilar a mano con otra ruta base: `BASE_PATH=/otra-ruta/ npm run build` (por defecto es `/RocketFix/`).

### Volver a la versión anterior

En *Settings* → *Pages* → *Source*, elige **Deploy from a branch** → rama `version-estable`, carpeta `/ (root)`. GitHub vuelve a publicar la tienda anterior tal como estaba (la rama debe estar subida a GitHub).
