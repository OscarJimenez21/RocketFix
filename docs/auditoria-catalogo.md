# Auditoría del catálogo de Rocket Fix

Generada por `scripts/auditoria.mjs` a partir de `legacy/index.html` (la tienda publicada) y de los datos extraídos en `src/data`.

## Resumen

| Dato | Valor |
|---|---|
| Productos (fichas) | 963 |
| Versiones de producto (cada opción de precio) | 1083 |
| Líneas de producto en la tienda original | 963 |
| Identificadores repetidos | 0 |
| Productos con foto principal | 963 |
| Productos con galería (carrusel) | 592 |
| Fotos de galería | 1395 |
| Productos con descripción o ficha del proveedor | 963 |

El "aproximadamente 1.083" corresponde a las **versiones** (por ejemplo, un celular en 128 GB y 256 GB son dos versiones de una misma ficha). Las fichas de producto son 963.

## Productos por sección

| Sección | Productos |
|---|---|
| pc | 51 |
| cel | 104 |
| tab | 14 |
| rel | 22 |
| aud | 36 |
| par | 18 |
| acc | 29 |
| con | 42 |
| mov | 6 |
| tv | 9 |
| comp | 298 |
| per | 334 |

## Campos de los productos

| Campo | Productos que lo tienen |
|---|---|
| `id` | 963 |
| `tienda` | 963 |
| `nombre` | 963 |
| `imagen` | 963 |
| `estado` | 963 |
| `specs` | 963 |
| `opciones` | 963 |
| `marca` | 911 |
| `categoria` | 859 |
| `etiqueta` | 54 |
| `ilustracion` | 34 |
| `nota` | 6 |
| `destacado` | 4 |

`opciones` y `estado` se agregan al extraer (como lo hacía la tienda original al cargar): un producto con `precio` queda con una sola opción sin nombre, y el estado por defecto es "Nuevo".

## Revisión

### Identificadores repetidos
- Ninguno

### Productos sin foto principal
- Ninguno

### Fotos principales que no existen en la carpeta
- Ninguno

### Fotos de galería que no existen
- Ninguno

### Galerías de productos que no existen
- Ninguno

### Productos sin marca (52)
- relt30 · Reloj inteligente T30
- p51283 · PC Ryzen 5 5600GT
- p51293 · PC Ryzen 5 8500G
- p51287 · PC Core i5 12400
- p51254 · PC Ryzen 7 5700G
- p51261 · PC Ryzen 7 5700G
- p51288 · PC Core i5 14400
- p51268 · PC Ryzen 5 8600G
- p51291 · PC Ryzen 5 8600G
- p51292 · PC Ryzen 7 8700G
- p51266 · PC Ryzen 5 9600X
- p51265 · PC Ryzen 5 9600X
- p51286 · PC Core i7 14700
- p51285 · PC Core i7 14700
- p51282 · PC Ryzen 7 9700X
- p51281 · PC Ryzen 5 5600XT + RTX 3050
- p51280 · PC Ryzen 5 5600XT + RTX 5050
- p51269 · PC Ryzen 7 5700X + RTX 5050
- p51250 · PC Ryzen 7 8700F + RTX 3050
- p51270 · PC Ryzen 7 5700X + RTX 5050
- p51272 · PC Ryzen 5 5600XT + RTX 5060
- p51294 · PC Ryzen 5 5600X + RTX 5060
- p51289 · PC Ryzen 5 5600XT + RTX 5060
- p51252 · PC Ryzen 7 5700X + RTX 5060
- p51274 · PC Ryzen 7 8700F + RTX 5050
- p51279 · PC Ryzen 7 5700X + RTX 5060
- p51290 · PC Ryzen 7 8700F + RTX 5060
- p51284 · PC Ryzen 7 8700F + RTX 5060
- p5014 · Memoria OEM 4GB DDR3
- p45637 · Base para Portátil Plegable NB8/S
- p45635 · Base para Portátil LX15F/S 16"
- p45636 · Base para Portátil LX11/G 16"
- p45558 · Soporte Base para TV Pedestal 32-70"
- p62027 · Cámara Web C922 Pro HD Stream Webcam 1080P HD 60FPS Tripode
- p45099b · Timón + Pedales + Palanca G920 (PC-Xbox)
- p24131 · Adaptador HDMI a VGA + Audio
- p24128 · Adaptador Display Port a HDMI 4K
- p24141 · Adaptador SATA a USB 3.0
- p24132 · Adaptador USB-C a LAN 1000 RJ45 Genérico
- p24123 · Adaptador USB 3.0 a LAN 1000 RJ45 Genérico
- p24135 · Adaptador 8 en 1 Tipo-C RED1000 HDTV+USB+RJ45+SD/TF Card
- p24136 · Bluetooth USB 5.4
- p45560 · Caja Externa Portátil M.2 (NVMe/NGFF) 3.1 USB Tipo A / Tipo C
- p45397 · Espuma Limpiadora 16 onzas
- p45036 · Hub USB 4 Puertos USB 3.0
- p45472 · Silicona Desmoldante Spray 16 onzas
- p24097 · Cable HDMI 1,8 m Encauchetado 4K
- p24098 · Cable HDMI 3 m Encauchetado 4K
- p24061 · Cable Splitter Genérico Fan RGB / Ext. 1 a 4
- p24079 · Cable de Corriente para Ventilador 1 a 3
- p24122 · Cable de Red Categoría 6 2 m
- p24087 · Cable de Red Categoría 6 5 m

### Productos con categoría inválida
- Ninguno

### Precios vacíos o en cero
- Ninguno

### Nombres repetidos (9)
Son productos distintos con el mismo nombre (por ejemplo, un PC armado en dos versiones o una caja nueva y open box). Se conservan todos.
- PC Ryzen 7 5700G (2)
- PC Ryzen 5 8600G (2)
- PC Ryzen 5 9600X (2)
- PC Core i7 14700 (2)
- PC Ryzen 7 5700X + RTX 5050 (2)
- PC Ryzen 5 5600XT + RTX 5060 (2)
- PC Ryzen 7 5700X + RTX 5060 (2)
- PC Ryzen 7 8700F + RTX 5060 (2)
- Memoria portátil Crucial 16GB DDR5 (2)

### Fotos en la carpeta que ningún producto usa (0)
- Ninguno
