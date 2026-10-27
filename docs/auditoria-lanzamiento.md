# Auditoría de lanzamiento de Rocket Fix

Rama: `auditoria-lanzamiento`, a partir de lo publicado (`main` en `7d3c0c6`). **Nada de esto está publicado.** `main`, GitHub Pages y la configuración siguen sin cambios. Para comparar con la versión estable, en GitHub Desktop elige la rama y abre *History*; también puedes usar `git diff main auditoria-lanzamiento`.

## A. Problemas encontrados

| # | Problema | Dónde |
|---|---|---|
| 1 | Los botones naranjas principales ("Comprar tecnología", "Agregar al carrito", "Cotizar instalación") tenían texto blanco sobre naranja: contraste de 2,84:1, cuando el mínimo para texto normal es 4,5:1. Lo mismo pasaba con el contador del carrito | `src/index.css` (`.btn-primario`), `src/components/Cabecera.tsx` |
| 2 | El gris del texto secundario daba 4,48:1 sobre el fondo claro, apenas por debajo del mínimo (fechas, notas, migas de pan) | `tailwind.config.js` (`tinta-3`) |
| 3 | En los filtros activos, el número de productos daba 3,6:1 | `src/paginas/Tienda.tsx` |
| 4 | Al volver de Bold, la página decía "¡Pago recibido!" basándose solo en un dato de la dirección web (`?bold-tx-status=approved`), que cualquiera puede escribir a mano. Afirmaba un pago que nadie había verificado | `src/App.tsx` (`RegresoBold`) |
| 5 | Esa lectura del regreso de Bold se borraba a sí misma: si React la repetía (en modo de desarrollo lo hace), el aviso no aparecía | `src/lib/bold.ts` |
| 6 | En celular, la vitrina de la portada seguía cambiando sola aunque la persona hubiera elegido un producto (en celular no hay mouse que la detenga) | `src/paginas/Inicio.tsx` |
| 7 | Una dirección escrita sin `#` (por ejemplo `/RocketFix/celulares`) mostraba la página de error genérica de GitHub | Faltaba `public/404.html` |
| 8 | En la imagen que se ve al compartir el enlace, la PS5 y los AirPods estaban mal recortados (bordes dentados), y el estilo, con degradados y brillos, ya no coincidía con la página. Además, la descripción para compartir prometía entrega "el mismo día", que está pendiente de confirmar | `public/vista-previa.jpg`, `index.html` |

**Revisado sin problemas:**
- 273 enlaces internos sin enlaces rotos, y ningún producto enlazado que no exista.
- En 24 páginas: todos los botones y enlaces tienen nombre, todas las imágenes tienen texto alternativo, todos los campos tienen etiqueta, no hay identificadores repetidos y cada página tiene un único título principal.
- Consola sin errores ni advertencias.
- El número de WhatsApp sale de un solo lugar (`config.json`); la única copia aparte está en el aviso para navegadores sin JavaScript (`index.html`) y coincide.

## B. Correcciones realizadas

1. **Contraste de los botones naranjas:** el naranja de la marca no cambia. El texto pasa a `#1F0B00`, el marrón casi negro que la tienda original usaba sobre ese mismo naranja: 6,7:1. Se aplicó también al contador del carrito.
2. **Gris secundario:** pasa de `#66766D` a `#5F6F66`, que da 4,9:1 sobre el fondo claro y 5,3:1 sobre blanco.
3. **Números de los filtros activos:** pasan a blanco pleno (4,7:1).
4. **Regreso de Bold:**
   - El aviso ahora dice "Bold reportó tu pago como aprobado. Envíanos el pedido por WhatsApp: verificamos el pago y coordinamos la entrega."
   - No afirma que el pago se recibió, porque la página no puede comprobarlo.
   - La lógica no cambió.
5. **Lectura del regreso de Bold:** se hace una sola vez y se guarda el resultado.
6. **Vitrina:** deja de cambiar sola cuando la persona elige un producto. También se detiene con el mouse o el teclado, y no se mueve si la persona pidió menos movimiento.
7. **`public/404.html`:**
   - Lleva `/RocketFix/celulares` a `/RocketFix/#celulares`, y `/RocketFix/p/sa07` a `/RocketFix/#p/sa07`.
   - Si la sección no existe, se ve la página "No la encontramos" de la tienda.
   - Probado con 7 direcciones de ejemplo.
8. **Imagen para compartir rediseñada** (1200 × 630, 91 KB):
   - Mismo estilo de la portada: verde oscuro plano, logo oficial y el titular "Tecnología para tu día a día. Soluciones cuando las necesitas.".
   - Muestra iPhone 18 Pro Max, PS5, MacBook Air M5 y AirPods Pro 3 sobre mosaicos blancos, con las fotos completas de 800 px y sin recortes.
   - Archivo fuente y versión de alta calidad en `Downloads\Lanzamiento Rocket Fix\Vista previa del enlace\02 Tecnologia para tu dia a dia`.
   - En `index.html`:
     - `og:image` lleva `?v=2` para que WhatsApp y Facebook no sigan mostrando la versión anterior guardada;
     - el título y la descripción coinciden con la portada nueva;
     - la descripción ya no dice "el mismo día".

## C. Mejoras recomendadas (requieren tu decisión, información o servicios externos)

1. **Políticas.** No existen y no las inventé:
   - garantía;
   - cambios y devoluciones, incluido el derecho de retracto en compras por internet;
   - tratamiento de datos personales. Los formularios y el carrito piden nombre y dirección, aunque solo los ponen en un mensaje de WhatsApp.

   Cuando las tengas, las agrego al pie de página.
2. **Pago con Bold:**
   - **Monto:** como `firmaUrl` está vacío, el cliente escribe el total a mano, así que puede pagar un valor distinto.
   - **Estado:** el estado que llega en la dirección no está verificado.
   - **Para dejarlo completo** hace falta un servicio pequeño, que puede ser gratuito (Cloudflare Workers, Netlify o Vercel). Guardaría la llave secreta, firmaría el total (así el cliente no lo escribe) y recibiría las confirmaciones de Bold por *webhook*.
   - **Mientras tanto:** verifica cada pago en el panel de Bold, por referencia y monto, antes de despachar.
3. **"Lo más vendido" y la cinta "Top ventas".** La tienda todavía no tiene historial de ventas propio. Si la lista refleja lo más vendido en el mercado colombiano, conviene decir "Populares en Colombia" o algo similar.
4. **Dominio propio** (por ejemplo, rocketfix.com.co):
   - genera más confianza;
   - permite `robots.txt` y `sitemap.xml`, porque en una página de proyecto de GitHub esos archivos no se leen;
   - da un correo con el nombre de la tienda.
5. **Posicionamiento en Google:** con las direcciones `#`, Google ve sobre todo la portada. Para que cada producto aparezca por separado habría que generar una página por producto. Es un cambio mayor.
6. **Ficha de producto:** dice "Paga con tarjeta, Bre-B, Daviplata, transferencia o efectivo" y no menciona PSE, que la portada sí incluye (a través de Bold). Conviene unificar el texto.
7. **Mensaje del pedido por WhatsApp:** no incluye notas como "Sobre pedido". Agregarlas cambiaría el formato del mensaje.
8. **Rendimiento:** el archivo principal pesa 523 KB (121 KB comprimido) porque incluye el catálogo. Conviene cargarlo aparte si el catálogo crece mucho.
9. **Catálogo:** 52 productos sin marca, 371 sin carrusel y 3 fotos aproximadas (Corn GT22, Corn GT32 y Fly FY200).

## D. Pruebas

| Prueba | Resultado |
|---|---|
| `npm run typecheck` (`tsc -b`) | Sin errores |
| `npm run verificar` | "Catálogo listo para publicar" (963 productos, 1.083 versiones, 592 galerías) |
| `node scripts/verificar-catalogo.mjs --estricto` | "Todo coincide con la tienda anterior" |
| `npm run build` | Correcto: CSS de 41 KB, código de 523 KB (121 KB comprimido) y producto aparte de 195 KB (55 KB comprimido). Incluye `404.html` y la imagen nueva |
| `npm run auditoria` | 0 ids repetidos, 0 fotos faltantes o rotas, 52 productos sin marca. El documento no cambió de contenido |
| Enlaces internos (navegador) | 273 revisados, ninguno roto, 0 productos inexistentes |
| Accesibilidad automática (24 páginas) | Sin botones ni enlaces sin nombre, sin imágenes sin texto alternativo, sin campos sin etiqueta, sin identificadores repetidos y con un único título principal por página |
| Contraste de todo el texto visible (5 páginas) | Antes: 8 casos bajo el mínimo. Después: 0 |
| Vitrina | Al elegir la PS5, sigue mostrándola 7 segundos después |
| Regreso de Bold (simulado solo con la dirección, sin pagos) | Aviso nuevo correcto y dirección limpia |
| `404.html` | 7 direcciones de ejemplo redirigen bien |
| Versión compilada servida en `/RocketFix/` | La ficha de producto abre directo, la imagen y el `404.html` responden, los metadatos están y el ancla de servicios funciona. Sin errores en la consola |
| Anchos de pantalla | Ya probados en el rediseño (320 a 1440 px). Esta vez se revisó la portada a 1280 px |

**Sin probar:**
- un pago real con Bold;
- teléfonos físicos y Safari en iPhone;
- lectores de pantalla;
- Lighthouse;
- la vista previa real en WhatsApp o Facebook, que solo se puede ver después de publicar.

## E. Datos comerciales por confirmar

| Dato | Valor actual | Dónde aparece |
|---|---|---|
| Entrega el mismo día en Bogotá **y alrededores** (sin zona definida) | — | Portada (beneficios y "Cómo comprar"), ficha de producto, `config.json → domicilio` |
| Envío en Bogotá | $15.000, gratis desde $400.000 | `config.json → envios`: carrito, portada y ficha |
| Envío a otra ciudad | $40.000, gratis desde $1.500.000; pago anticipado | Igual que el anterior |
| Pago contra entrega en Bogotá | Efectivo y tarjeta con datáfono | `config.json → pagos.bogota`, nota de `pagos.json` (pie), portada |
| Pago con tarjeta en otras ciudades | "Te enviamos un link de pago" (requiere links de pago de Bold) | `config.json → pagos.nacional` (carrito) |
| Medios de pago | Visa, Mastercard, PSE (Bold), Bre-B, DaviPlata, transferencia, efectivo, datáfono | `pagos.json` (pie) |
| Paquetes de cámaras (de referencia, con instalación) | $450.000, $1.600.000 y $2.800.000 | `contenido.json → paquetes`: portada (bloque de cámaras) y artículo de cámaras |
| Visita técnica para cotizar cámaras (no dice si tiene costo) | — | Servicio de cámaras y formulario |
| Garantía de reparación de celulares (sin plazo) | "Garantía sobre el repuesto y el trabajo realizado" | Artículo de celulares, preguntas frecuentes |
| Tiempos de reparación | Pantalla, 1 a 3 h; batería, 1 h; celular mojado, 1 a 3 días; computador "el mismo día si lo recibimos en la mañana" | Artículos de celulares y de computadores |
| "Te decimos el valor antes de reparar" | — | Servicios (portada) |
| Obsequios y promociones | Tecno Camon 50 Pro (audífonos), Camon 50 Pro 4G (diadema), vivo V60 Lite (reloj), Lenovo Tab Plus (forro y Moto Buds), Switch 2 (incluye un juego) | `productos.json → nota`: tarjeta, ficha y "Qué incluye la caja" |
| "Sobre pedido" | Producto `pporttilgig` | `productos.json → nota` |
| "Lo más vendido" y "Top ventas" | 15 productos | Portada |
| "Reacondicionados certificados (CPO)" | — | Encabezado de Celulares |
| "Cargadores originales" | — | Encabezado de Accesorios |
| Garantía de las patinetas ("cómo es la garantía") | — | Encabezado de Patinetas |
| Horario | Lunes a sábado de 8:00 a. m. a 8:00 p. m.; domingos y festivos cerrado | `config.json → horario` (pie y estado "Abierto ahora") |
| WhatsApp | +57 322 326 2404, igual en todo el sitio | `config.json` |
| Redes sociales | Vacías | `config.json → redes` |
| Precios de los 963 productos | Vienen del catálogo actual; no se compararon con el proveedor en esta auditoría | `productos.json` |

## F. Estado del lanzamiento

**Pendiente de información comercial.** En lo técnico, la tienda está lista para continuar:
- compila y pasa todas las comprobaciones;
- la navegación, el carrito, los formularios y los enlaces funcionan;
- no hay errores en la consola;
- se ve bien de 320 a 1440 px.

Antes de recibir clientes reales faltan:
- las políticas de garantía, devoluciones y datos personales;
- confirmar los datos comerciales de la sección E, en especial obsequios, entrega el mismo día, costos de envío y garantías;
- decidir sobre "Top ventas".

El pago con Bold funciona, pero con el total escrito a mano por el cliente; hay que verificar cada pago en el panel de Bold.

## G. Archivos modificados en esta rama

| Archivo | Cambio |
|---|---|
| `tailwind.config.js` | `acento.tinta` (texto sobre naranja); `tinta-3` más oscuro |
| `src/index.css` | `.btn-primario` con texto oscuro |
| `src/components/Cabecera.tsx` | Contador del carrito con texto oscuro |
| `src/paginas/Tienda.tsx` | Número de los filtros activos en blanco pleno |
| `src/App.tsx` | Aviso de regreso de Bold sin afirmar un pago no verificado |
| `src/lib/bold.ts` | Lectura del regreso de Bold una sola vez |
| `src/paginas/Inicio.tsx` | La vitrina se detiene cuando la persona elige un producto |
| `public/404.html` (nuevo) | Redirige las direcciones sin `#` a la sección correcta |
| `public/vista-previa.jpg` | Imagen nueva para compartir el enlace |
| `index.html` | Metadatos para compartir: título, descripción, texto alternativo e imagen `?v=2` |
| `docs/auditoria-lanzamiento.md` (nuevo) | Este informe |

## H. Próximos pasos, en orden

1. Revisar esta rama y autorizar su publicación. Incluye la imagen nueva para compartir.
2. Redactar las políticas: garantía, cambios y devoluciones (con retracto) y tratamiento de datos personales.
3. Confirmar o corregir los datos de la sección E, empezando por obsequios, entrega el mismo día y su zona, costos de envío y garantías.
4. Decidir el nombre de "Lo más vendido" y "Top ventas".
5. Decidir sobre Bold: seguir con el total escrito por el cliente (verificando cada pago en el panel) o montar el servicio de firma y confirmaciones.
6. Agregar las redes sociales a `config.json`.
7. Después de publicar:
   - actualizar la vista previa en el depurador de Facebook (https://developers.facebook.com/tools/debug/) y compartir el enlace en WhatsApp para comprobarla;
   - hacer una compra de prueba por WhatsApp desde un teléfono.
8. Opcional: dominio propio.

**Para publicar cuando lo autorices:** en GitHub Desktop, estando en `main`, elige *Branch → Merge into current branch → auditoria-lanzamiento* y luego **Push origin**.
