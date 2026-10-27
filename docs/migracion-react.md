# Migración de Rocket Fix a React + TypeScript + Vite + Tailwind

Rama: `rediseno-react` · Punto de partida: `main` en `a668219` ("Carrusel de fotos en 147 productos más") · Respaldo: rama `version-estable` (mismo commit).
**Estado: lista para revisión. No se ha publicado ni se ha tocado `main` ni el sitio en línea.**

## 1. Auditoría inicial

Detalle completo en [`auditoria-catalogo.md`](auditoria-catalogo.md).

| Dato | Valor |
|---|---|
| Productos (fichas) | 963 |
| Versiones (cada opción de precio) | 1.083. El "≈1.083" del encargo son las versiones. |
| Identificadores repetidos | 0 |
| Productos con foto principal | 963 (0 fotos faltantes o rotas) |
| Productos con carrusel | 592 (1.395 fotos de galería) |
| Productos con descripción | 963 |
| Productos sin marca | 52 (son genéricos: cables, soportes, etc.) |
| Nombres repetidos | 9 (productos distintos con el mismo nombre comercial) |

La tienda anterior era un solo archivo `index.html` de 682 KB con datos, estilos y código mezclados. Las fotos estaban en `fotos/` y el despliegue era "Deploy from a branch" (`main`, raíz).

## 2. Protección

- `main` sigue intacto en `a668219`. Todo el trabajo está en la rama `rediseno-react`, en una carpeta aparte (`Documents\GitHub\RocketFix-react`).
- Rama `version-estable` creada en `a668219` como punto de regreso. Sirve para volver a publicar la tienda anterior desde *Settings → Pages*.
- `legacy/index.html` es el archivo original, movido con `git mv` y sin cambios. De ahí se extraen los datos, y contra él se verifica el catálogo.
- Ninguna rama se ha subido a GitHub.

## 3. Arquitectura

- **Datos separados de la interfaz.** `scripts/extraer-catalogo.mjs` lee `legacy/index.html` y genera `src/data/*.json`. No se borró ni se cambió ningún producto: se conservan todos los campos originales. `src/data/catalogo.ts` les da tipos e índices.
- **Tipos estrictos.** `strict` y `noUncheckedIndexedAccess`, sin `any`. Hay una sola conversión forzada (`descripciones.json`), comprobada por `npm run verificar`.
- **Lógica sin interfaz** en `src/lib/`:
  - búsqueda, con el mismo puntaje y los mismos sinónimos;
  - pedido y envío, con las mismas reglas y el mismo texto de WhatsApp;
  - Bold, horario y rutas.
- **Estado del carrito** en `src/estado/TiendaContext.tsx`.
  - Usa la misma llave de `localStorage` (`rocketfix-carrito-v3-573223262404`) y el mismo formato (`id~versión`), así que los carritos de los clientes se conservan.
  - Se sincroniza entre pestañas.
- **Rutas con `#`**, iguales a las anteriores. Los enlaces compartidos siguen funcionando y recargar no da 404 en GitHub Pages.
- **Página de producto en un archivo aparte.** Las descripciones solo se descargan al abrir un producto.
- **Lista para un backend.** Para pasar a una API, basta con cambiar `src/data/catalogo.ts` por llamadas al servidor. Lo mismo con `firmaUrl` de Bold, que ya está previsto.

## 4. Diseño

Se conservó el logo original (cohete y "ROCKET FIX"), los colores de la marca (verde `#0B8457`, naranja `#FF6B2C`) y las letras (Archivo, Instrument Sans y JetBrains Mono).
- **Sin efectos decorativos:** no hay degradados, brillos ni sombras grandes. Se usan superficies planas, bordes finos y fotos reales sobre fondo blanco.
- **Cabecera:** fija, con buscador y sugerencias, el número de WhatsApp, el carrito y las secciones desplazables.
- **Inicio:**
  - portada con horario de atención en vivo;
  - ventajas (entrega, envíos, pagos);
  - 12 categorías con foto real;
  - lo más vendido;
  - servicios con formulario;
  - productos destacados;
  - cómo comprar.
- **Tienda:** filtros por tipo, o por marca y estado en celulares, más marca, búsqueda en la sección, orden y "Ver más". Los filtros se recuerdan al volver.
- **Producto:** galería con miniaturas, versiones con su precio, agregar al carrito, preguntar por WhatsApp, compartir, descripción, ficha técnica, contenido de la caja y productos relacionados.
- **Carrito:** panel lateral con entrega, formas de pago según la zona, vista previa del mensaje, barra de envío gratis, Bold y WhatsApp.
- **Fotos faltantes:** si una foto no carga, se muestra el dibujo de la categoría con el texto "Foto pendiente".
- **Accesibilidad:**
  - enlace para saltar al contenido y foco visible;
  - buscador como *combobox* con flechas, Enter y Esc;
  - el carrito como diálogo: Esc lo cierra, el foco vuelve al botón y el fondo queda bloqueado;
  - textos alternativos y respeto por "reducir movimiento".

## 5. Funciones conservadas

| Función | Estado |
|---|---|
| Catálogo completo (963 / 1.083) | Verificado con `npm run verificar` |
| Buscador general (sugerencias, sinónimos, búsquedas populares, página de resultados) | Probado |
| Secciones y filtros | Probado |
| Página de producto con carrusel | Probado |
| Rutas antiguas y recarga directa | Probado en la versión compilada |
| Carrito persistente, envío y formas de pago por zona | Probado |
| Pedido por WhatsApp (mensaje con productos, totales y datos) | Probado: se generó e inspeccionó el enlace sin enviar nada |
| Pago en línea con Bold | Código igual al anterior. **No se probó un pago real**; solo la pantalla de regreso, simulada |
| Blog y 3 artículos (con paquetes y "Cotizar", y enlaces a componentes filtrados) | Probado |
| Formularios de servicio técnico y de los artículos | Probado |
| Horario de atención en vivo, copiar número | Horario revisado en pantalla ("Abierto ahora · hasta 8:00 p. m."); el botón de copiar no se presionó |
| Vista previa al compartir el enlace (Open Graph) e íconos | Revisado en la versión compilada |

## 6. Pruebas realizadas

Todas se ejecutaron el 27 de octubre de 2026 en este equipo (Node 22.11, Chrome del panel de vista previa).

**Comandos**

| Prueba | Resultado |
|---|---|
| `npm install` | Correcto |
| `npm run typecheck` / `tsc -b` | Sin errores |
| `npm run build` | Correcto |
| `npm run verificar` | 963 de 963 productos en el mismo orden, con los mismos nombres, precios, versiones, fotos, marcas y categorías. Galerías y descripciones idénticas, todas las fotos existen, sin hojas de cálculo ni llaves secretas. |
| Prueba en negativo de `verificar` (copia con un precio alterado y sin fotos) | Detectó las diferencias y terminó con error, como debe |
| `npm run auditoria` | 0 ids repetidos, 0 fotos faltantes o rotas, 0 galerías rotas, 0 categorías inválidas, 0 precios inválidos |

**Navegador** (servidor de desarrollo y versión compilada con `vite preview`)

- **Celular (375 px), tableta (768 px) y escritorio:** se revisaron inicio, las 12 secciones, productos, búsqueda, blog, los 3 artículos y la página de error. No hay desplazamiento horizontal ni contenido cortado.
- **Carrito:**
  - elegir versión, agregar, sumar y quitar unidades, eliminar;
  - se conserva al recargar;
  - envío en Bogotá: $15.000 por debajo de $400.000 y gratis desde ahí;
  - envío a otra ciudad: $40.000 por debajo de $1.500.000 y gratis desde ahí;
  - formas de pago según la zona;
  - validación de nombre y dirección;
  - texto del mensaje de WhatsApp;
  - Esc cierra el panel y el foco vuelve al botón.
- **Buscador:**
  - sugerencias, flechas, Esc y Enter;
  - página de resultados y búsqueda sin resultados;
  - búsquedas populares al tocar el campo.
- **Tienda:**
  - ordenar por menor y mayor precio (comprobado que queda ordenado);
  - filtro de marca (solo Logitech) y filtro por tipo;
  - "Ver más";
  - al volver de un producto se conservan el filtro y la posición.
- **Artículos y formularios:**
  - "Cotizar este paquete" baja al formulario y deja el paquete elegido;
  - validación y mensaje de WhatsApp;
  - "Ver discos SSD →" abre Componentes filtrado;
  - el formulario de servicios cambia sus campos al elegir cámaras.
- **Versión compilada:**
  - abrir y recargar `#p/mbairm5` directamente;
  - fotos, logos de pago, ícono y etiqueta de vista previa;
  - la página de producto se descarga aparte;
  - sin errores en la consola.
- **Regreso de Bold:** se simuló con `?pedido=RFPRUEBA&bold-tx-status=rejected`. Muestra el aviso, limpia la dirección y ofrece enviar el pedido por WhatsApp. No hubo ningún pago.

**Errores encontrados en las pruebas y ya corregidos**

1. En celular, Chrome alejaba toda la página. Había dos causas: el panel del carrito cerrado, y textos para lectores de pantalla dentro de las filas desplazables, que quedaban fuera del recorte.
2. En celular, el botón "Agregar" de las tarjetas quedaba cortado. Ahora el precio va arriba y el botón ocupa todo el ancho.
3. Las tablas de los artículos ensanchaban la página en celular.
4. Los artículos tenían clases sin estilo (`callout`, `checks`, `fix`, `link`, `list`, `cmp.narrow`) y los párrafos no tenían separación.
5. Los enlaces "Ver discos SSD →" y "Ver memorias RAM →" no abrían la sección filtrada.
6. Los logos de formas de pago nunca cargaban, por la carga diferida en imágenes sin tamaño.
7. El buscador decía "Ver los 1 resultados".
8. En Safari, el foco podía quedarse en el carrito ya cerrado.

**No se probó (queda pendiente o requiere tu acción)**

- Un pago real con Bold: implicaría una transacción.
- Conservar los carritos de clientes reales: el sitio publicado está en otra dirección. Se comprobó leyendo el código que la llave y el formato son los mismos.
- Teléfonos reales y Safari en iPhone: solo se usó la emulación de Chrome.
- El flujo de GitHub Actions: no se ha subido nada a GitHub.
- Lectores de pantalla y mediciones de Lighthouse.

## 7. Antes y después

| | Antes | Ahora |
|---|---|---|
| Archivos de la página | 1 `index.html` de 682 KB (162 KB comprimido) | HTML de 2,6 KB, CSS de 36 KB (7 KB comprimido), código de 510 KB (117 KB comprimido) |
| Lo que descarga el inicio | 162 KB comprimidos | ~125 KB comprimidos |
| Descripciones de productos | Siempre, en el archivo único | Solo al abrir un producto (55 KB comprimidos) |
| Organización | Datos, estilos y código en un solo archivo | Datos en JSON, 15 componentes, 7 páginas, lógica separada y tipos |
| Comprobación del catálogo | Manual | `npm run verificar` (también antes de cada publicación) |
| Publicación | Automática al subir a `main` | Automática al subir a `main`, solo si pasa la verificación del catálogo |

## 8. Archivos

- **Movidos sin cambios** (`git mv`):
  - `index.html` → `legacy/index.html`;
  - `fotos/` → `public/fotos/` (2.388 fotos);
  - `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` y `vista-previa.jpg` → `public/`.
- **Creados:**
  - Configuración del proyecto: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `postcss.config.js`, `index.html` (entrada de Vite) y `.gitignore`.
  - Código y datos: `src/` (tipos, datos, lib, estado, componentes y páginas).
  - Scripts: `scripts/extraer-catalogo.mjs`, `scripts/verificar-catalogo.mjs` y `scripts/auditoria.mjs`.
  - Logos de pago en `public/pagos/`, extraídos de la página anterior.
  - Publicación: `.github/workflows/publicar.yml`, que publica al subir a `main` o a mano desde Actions.
  - Documentación: `docs/auditoria-catalogo.md` y este informe.
- **Modificados:** `README.md`.
- **Eliminados:** ninguno.

## 9. Pendientes

- **Bold:** `firmaUrl` está vacío, así que el cliente escribe el total en Bold. Para el total firmado hace falta un servicio propio con la llave secreta, que nunca va en la página.
- **Archivo de código pesado:** el código principal pesa 510 KB porque incluye el catálogo. Si el catálogo crece mucho, conviene cargarlo aparte o desde una API.
- **Productos sin marca:** 52. Revisar si alguno debería tenerla.
- **Productos sin carrusel:** 371, como antes de la migración.
- **Fotos aproximadas:** Corn GT22, Corn GT32 y Fly FY200 tienen fotos aproximadas, de antes de la migración.

## 10. Cómo revisar y aprobar la publicación

1. **Revisar en tu equipo** (requiere Node 22 o más reciente). En la carpeta `Documents\GitHub\RocketFix-react`, corre `npm install` y `npm run dev`, y abre http://localhost:5173/RocketFix/.
2. **Subir las ramas sin publicar.** En GitHub Desktop: *File → Add local repository* → `Documents\GitHub\RocketFix-react` → *Publish branch* (`rediseno-react`). Sube también `version-estable`. Esto no cambia el sitio, que se publica desde `main`. Si quieres, abre un *pull request* hacia `main` para revisar los cambios.
3. **Cuando lo apruebes:**
   1. En GitHub, ve a *Settings → Pages → Source* y elige **GitHub Actions**.
   2. Une `rediseno-react` a `main` y súbelo con *Push origin*. Al subirlo, el flujo "Publicar la tienda" verifica el catálogo, compila y publica solo.

   Haz el paso 1 antes del 2: si `main` se sube con Pages todavía en "Deploy from a branch", el sitio queda caído hasta que se cambie.
4. **Comprobar en el teléfono:** inicio, un producto, el carrito y el botón de WhatsApp.
5. **Para volver atrás:** en *Settings → Pages → Source*, elige *Deploy from a branch* → `version-estable` → `/ (root)`.
