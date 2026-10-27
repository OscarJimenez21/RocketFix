# Rediseño profesional de Rocket Fix

Rama: `rediseno-profesional`, que parte de `main` en `91c57ac` (la versión publicada).
**No está publicada:** `main`, la configuración de GitHub Pages y la página en línea siguen sin cambios. La versión anterior al React sigue disponible en la rama `version-estable`.

## 1. Punto de partida (auditoría)

- **Estado del repositorio:** `main` estaba sin cambios pendientes e igual a `origin/main` (`91c57ac`). La última publicación en Actions terminó bien. Los cambios recientes eran la portada con vitrina, el botón de WhatsApp y "Lo más vendido" arriba; se conservaron.
- **Lo que funcionaba bien y se conservó:**
  - El catálogo y su verificación, las rutas con `#`, el carrito y su mensaje para WhatsApp, y Bold.
  - Los formularios por servicio, el buscador con sugerencias, la galería y los filtros recordados.
  - El logo original y la paleta verde y naranja. Por pedido expreso, no se usaron el azul ni el crema propuestos en el encargo.
- **Problemas encontrados:**
  - **Cabecera:** mostraba 13 enlaces a la vez y en celular era una fila larga que se desplazaba de lado. No había menú.
  - **Portada:**
    - tenía brillo, flotación, puntos de fondo, barra de avance, llama animada, amarillo y una franja durazno, todo compitiendo;
    - la sección "Productos destacados" repetía los mismos productos de la vitrina;
    - en celular, las 12 categorías ocupaban 6 filas.
  - **Contenido repetido:** la sección "Contacto" repetía el horario y el WhatsApp del pie de página.
  - **Producto:** el nombre estaba en una franja separada del precio y de los botones de compra.
  - **Carrito:** Bold aparecía como la acción principal, aunque el total no llega firmado y la disponibilidad no está confirmada.
  - **Tipografía y contraste:**
    - las etiquetas usaban una fuente monoespaciada externa, una descarga más con aspecto de plantilla;
    - el gris de texto secundario tenía contraste 3,6:1, por debajo del mínimo de 4,5:1.
  - **Errores ya existentes:**
    - enlazar a `#servicios`, `#categorias` o `#contacto` desde otra página podía dejar a la persona arriba de la portada, en vez de en la sección;
    - los avisos de error de los formularios no se quitaban al corregir el campo.
- **Datos:**
  - ningún producto tiene existencias configuradas, así que no se puede mostrar disponibilidad;
  - 6 productos tienen notas reales: obsequios, "Sobre pedido" e "Incluye…";
  - los paquetes de cámaras ya estaban marcados como precios de referencia.

## 2. Decisiones de diseño

- **Un color por función:**
  - el verde es la marca y la navegación;
  - el naranja del cohete es solo para la acción principal de cada vista (comprar, agregar al carrito, cotizar la instalación);
  - el verde de WhatsApp es solo para abrir WhatsApp.

  En las tarjetas, "Agregar" usa un verde suave para que la cuadrícula no se llene de botones naranjas.
- **Sobriedad:**
  - sin degradados, brillos ni animaciones decorativas;
  - la vitrina cambia de producto con un fundido cada 6 segundos, se detiene con el mouse o el teclado y no se mueve si la persona pidió menos movimiento.
- **La tienda y el servicio técnico se distinguen:**
  - los productos van sobre fondos claros;
  - el servicio técnico tiene su propia sección, con un bloque oscuro para la línea de cámaras.
- **Información antes que adorno:**
  - el titular es el que propusiste: "Tecnología para tu día a día. Soluciones cuando las necesitas.", con las acciones "Comprar tecnología" y "Solicitar servicio técnico";
  - la vitrina muestra los 6 productos estrella a la vez, en miniatura;
  - las categorías muestran las 6 principales con foto y las otras 6 como accesos rápidos.
- **Sin datos inventados:** no hay disponibilidad, descuentos, calificaciones, direcciones ni políticas que no existan. Los paquetes de cámaras dicen "Valores de referencia… te lo confirmamos en la visita técnica".

## 3. Cambios por página y componente

| Archivo | Cambio |
|---|---|
| `tailwind.config.js` | Contraste del gris secundario (4,5:1), naranja de texto legible (`acento-texto`), sin amarillo, sin fuente monoespaciada externa, sombra de tarjeta discreta |
| `src/index.css` | Sistema compartido: botones con reglas de uso (`btn-primario`, `btn-marca`, `btn-suave`, `btn-borde`, `btn-wa`, `btn-claro`), `etiqueta`, `titulo-seccion`, `tarjeta`, `chip`, `alerta`. Sin animaciones decorativas |
| `index.html` | Una fuente menos (JetBrains Mono) y dirección canónica |
| `src/components/Cabecera.tsx` | Cabecera compacta. En escritorio, menú "Todas las categorías" (4 grupos con la cantidad de productos), las 6 principales y servicio técnico. En celular, menú lateral con categorías, servicios y WhatsApp (Esc, foco y fondo bloqueado) |
| `src/components/Logo.tsx` | Mismo logo, un poco más pequeño en celulares de 360 px para que quepa la cabecera |
| `src/paginas/Inicio.tsx` | Portada nueva, vitrina sobria, categorías principales con accesos rápidos, servicios (computadores, celulares y bloque de cámaras con paquetes de referencia), formulario y "Cómo comprar". Se quitó la sección "Productos destacados", que estaba repetida. Corrección de las anclas |
| `src/components/PiePagina.tsx` | Incluye el contacto (`#contacto`): franja "¿Necesitas ayuda para elegir?", columnas de tienda, servicio técnico y horario, formas de pago |
| `src/components/Contacto.tsx` | Se retiró la sección repetida; quedan las piezas compartidas |
| `src/App.tsx` | Sin la sección de contacto repetida |
| `src/components/TarjetaProducto.tsx` | Botón "Agregar" suave, notas reales como etiqueta (`NotaProducto`), cinta "Top ventas" discreta, sin zoom al pasar el mouse |
| `src/components/EncabezadoVista.tsx` | Encabezado interno más compacto. Migas de pan reutilizables (`Migas`) |
| `src/paginas/Producto.tsx` | Nombre, precio y compra en una sola columna; aviso de que la disponibilidad se confirma antes de cobrar; descripción y ficha técnica a lo ancho |
| `src/components/Carrito.tsx` | WhatsApp como acción principal y Bold como secundaria; "Enviar el pedido no es un pago…"; el error se quita al corregir el campo. **Mismos cálculos y mismo mensaje** |
| `src/components/FormularioWhatsApp.tsx` | "La solicitud queda hecha cuando envíes ese mensaje"; el error se quita al corregir el campo |
| `src/paginas/Tienda.tsx` | Chips compartidos; migas de pan con el nombre de la sección; estado vacío con "Quitar filtros" y WhatsApp |
| `src/paginas/Buscar.tsx` | Estado vacío que explica qué hacer: WhatsApp, búsquedas populares y categorías |
| `src/paginas/Blog.tsx`, `Articulo.tsx` | Tarjetas y paquetes con el estilo compartido; migas de pan desde Inicio |
| `src/components/Buscador.tsx` | Resaltado de coincidencias en verde (antes era amarillo) |
| `src/components/Iconos.tsx` | Íconos de menú, cuadrícula, flecha hacia abajo y verificación |
| `src/data/tiendas.ts` | Secciones principales y grupos del menú. Son datos de navegación; **el catálogo no cambió** |
| `src/lib/rutas.ts` | Ancla `#categorias` |

Sin cambios en: catálogo (`src/data/*.json`), precios, cálculo del carrito, mensaje del pedido, Bold, scripts y publicación.

## 4. Pruebas realizadas

Todas se ejecutaron en este equipo, con Node 22.11 y el navegador del panel de Claude.

| Prueba | Resultado |
|---|---|
| `npm run typecheck` | Sin errores |
| `npm run verificar` | "Catálogo listo para publicar". Con `--estricto`: "Todo coincide con la tienda anterior" (963 productos, 1.083 versiones) |
| `npm run build` | Correcto. CSS de 41 KB (8 KB comprimido), código de 523 KB (121 KB comprimido) y página de producto aparte (55 KB comprimidos) |
| `npm run auditoria` | 0 ids repetidos, 0 fotos faltantes o rotas, 52 sin marca, 9 nombres repetidos. El documento no cambió de contenido |
| Anchos de 360, 390, 430, 768, 1024 y 1440 px | Se recorrieron 11 páginas (inicio, celulares, componentes, 2 productos, búsqueda con y sin resultados, blog, 2 artículos y error) en cada ancho. Sin desplazamiento horizontal ni botones cortados en las tarjetas. A 360 px la cabecera se desbordaba 20 px; se corrigió |
| Menú de celular | Abre, enfoca "Cerrar", bloquea el fondo, marca la sección actual, al elegir una categoría navega y se cierra, y Esc devuelve el foco |
| Menú "Todas las categorías" | Se cierra con Esc, con un clic afuera y al elegir una categoría |
| Carrito | Se agregaron dos versiones de un celular (256 y 512 GB), se sumó una unidad, se quitó una versión, el total quedó en 2 × $3.550.000 = $7.100.000 con envío gratis, se probó la validación de nombre y dirección, el error se quita al escribir y el mensaje de WhatsApp sale completo. El pago con Bold **no se probó**: sería una transacción real |
| Formularios | "Cotizar instalación" deja elegido "Instalación de cámaras" con sus campos y baja al formulario |
| Anclas | `#categorias`, `#servicios` y `#contacto` funcionan desde otras páginas y al abrirlas directamente (error que ya existía, corregido) |
| Versión compilada servida en `/RocketFix/` | Abrir y recargar un producto directamente, secciones, búsqueda, artículo y página de error. Ícono y dirección canónica. Sin errores en la consola |

No se probó: pago real con Bold, teléfonos físicos (solo la emulación del navegador), Safari en iPhone, lectores de pantalla ni Lighthouse.

## 5. Pendientes y limitaciones

- **SEO:** las direcciones con `#` (necesarias en GitHub Pages sin servidor) hacen que los buscadores vean sobre todo la portada. Para que cada producto aparezca por separado en Google haría falta generar páginas estáticas por producto. Queda como mejora futura.
- **Bold:** como `firmaUrl` está vacío, el cliente escribe el total en Bold. Para que el total llegue firmado hace falta un pequeño servicio propio con la llave secreta, que nunca va en la página.
- **Archivo principal de 523 KB:** pesa eso porque incluye el catálogo. Si crece mucho, conviene cargarlo aparte.
- **Productos:** 52 no tienen marca y 371 no tienen carrusel. Las fotos de Corn GT22, Corn GT32 y Fly FY200 son aproximadas.

## 6. Datos que debes completar antes del lanzamiento

1. **Políticas:** garantía, cambios y devoluciones (incluido el derecho de retracto en compras por internet) y tratamiento de datos personales. Hoy no existen y no las inventé. Cuando las tengas, se agregan al pie de página.
2. **Redes sociales:** `src/data/config.json → redes` (Instagram, Facebook, TikTok) está vacío. Si las agregas, aparecen solas en el pie.
3. **Paquetes de cámaras:** confirma que los valores de referencia siguen vigentes.
4. **Horario:** confirma el de `config.json` (lunes a sábado de 8:00 a. m. a 8:00 p. m.; domingos y festivos cerrado).
5. **Disponibilidad:** si quieres mostrar existencias, se puede usar el campo `stock` de cada producto. Hoy se confirma por WhatsApp.

## 7. Cómo revisarlo

En la carpeta `Documents\GitHub\RocketFix`, con la rama `rediseno-profesional` activa (así queda en GitHub Desktop), corre:

```bash
npm run dev
```

Luego abre http://localhost:5173/RocketFix/. En la app de Claude se ve en el panel de navegador.

## 8. Cómo publicarlo (cuando lo autorices)

1. En GitHub Desktop, con la carpeta RocketFix abierta: *Branch → Merge into current branch* estando en `main`, elige `rediseno-profesional`.
2. Presiona **Push origin**. El flujo "Publicar la tienda" verifica el catálogo, compila y publica en uno o dos minutos.
3. **Para volver a la versión publicada hoy (`91c57ac`):** en GitHub Desktop, *History*, revierte los commits del rediseño (clic derecho → *Revert changes in commit*, del más reciente al más antiguo) y presiona *Push origin*. También puedes pedírmelo. Para una emergencia, en *Settings → Pages* puedes elegir la rama `version-estable`, que es la tienda anterior al React.
