# RIWI — SYSTEM REBORN

Tienda de merchandising tecnológico para la comunidad RIWI. Combina catálogo, variantes, carrito persistente y un estudio 3D interactivo para explorar cada prenda desde todos los ángulos.

La experiencia combina una llegada cinematográfica, un mundo violeta y azul oscuro, paneles de cristal y cultura de programación. La mascota permanece centrada y nítida detrás de la interfaz, con el escenario desenfocado. Seis tecnologías recorren todo el viewport con movimiento continuo y parallax. Las prendas, precios e inventario son muestras conceptuales; el carrito guarda una selección local y no procesa pagos.

## Ejecutar localmente

Requiere Node.js 22.12+ y npm.

```sh
npm ci
npm run dev
```

La aplicación queda disponible en `http://127.0.0.1:5173`. El servidor escucha solamente en la máquina local.

```sh
npm run typecheck
npm run build
npm test
```

## Funcionalidades

- Video de entrada presentado durante diez segundos, con salto, autoplay alternativo, poster y máquina de estados explícita. Solo se reproduce automáticamente una vez por sesión; libera sus recursos después de la transición.
- Escenario y mascota en capas independientes, con transparencia real y continuidad entre rutas. Los derivados de composición asistidos por IA están identificados en los créditos.
- Tech Orbit persistente: JavaScript, TypeScript, Python, HTML, CSS y SQL sin recuadros, detrás del contenido, con trayectorias amplias, parallax e inspector accesible.
- Ambientación de desarrollo con planos de código, circuitos animados, revelado de títulos, parallax de prendas e iluminación de tarjetas que sigue al cursor.
- Cinco capítulos editoriales, categorías, prenda destacada con variantes y ADD TO LOADOUT conectado al carrito.
- Code to Fashion: los datos de tu selección se materializan en un visor GLB real, con modos Código / 3D / Foto y color aplicado al material.
- Terminal funcional con `help`, `shop`, `about`, `clear` e historial mediante flechas.
- Estudio y fichas con GLB reales, selector de objeto y color.
- Consola de búsqueda con `Ctrl + K` / `⌘ K` y restauración del foco al cerrar.
- Pausa global de movimiento, respeto por `prefers-reduced-motion` y suspensión del canvas fuera de pantalla.
- Nueve productos organizados en una fuente de datos tipada, con categorías, búsquedas, filtros por talla, color y colección, y ordenamiento.
- Fichas de producto con variantes, guía de tallas, galería, productos relacionados y estado de inventario de muestra.
- Modelos GLB originales de hoodie, camiseta, camisa, jeans, buzo, sudadera y gorra; sus renders se generan localmente.
- Visor 360° con arrastre, táctil, zoom, vistas, iluminación, giro automático, puntos de detalle y alternativa visual si WebGL falla.
- Carrito persistente por navegador, con variantes, cantidades, subtotales y exportación de la selección. No procesa pagos, reservas ni transacciones.

## Arquitectura

`src/data/products.ts` mantiene el catálogo. `src/services/catalog.ts` define el límite preparado para una API futura. `src/components/cart/CartProvider.tsx` encapsula el carrito y su persistencia. El visor reutiliza React Three Fiber, Drei y Three.js con carga diferida en `src/components/viewer/` y `src/scenes/`.

`src/components/reborn/` contiene la máquina de introducción, mascota, campo tecnológico, cristal, terminal y producto destacado. `src/components/layout/RebornLayout.tsx` mantiene navegación, búsqueda y cierre; `src/app/RebornHome.tsx` compone la portada. El contexto de movimiento y las capas persistentes están fuera de las rutas. `src/styles/reborn.css` define el diseño activo y adapta las rutas comerciales existentes.

La dirección final, procedencia de los recursos, arquitectura, recorrido de demostración y limitaciones están en [SYSTEM-REBORN.md](SYSTEM-REBORN.md). [ASCENSION.md](ASCENSION.md) documenta la firma interactiva, las correcciones visuales y las skills aplicadas. Los resultados ejecutados están en [VALIDATION.md](VALIDATION.md). `CYBER-EXPERIENCE.md` describe la iteración anterior.

Los recursos de muestra viven en `public/models/garments` y `public/images/products`. Para regenerarlos:

```sh
node scripts/generate-models.mjs
node scripts/render-products.mjs
npm run assets:optimize
```

Estos comandos usan el estudio local y Chromium para exportar geometría y renders. Los modelos son recursos provisionales originales; no son CAD, fotografía ni especificaciones oficiales de una prenda RIWI.

El navegador utiliza los GLB de `public/models/optimized/`: texturas optimizadas y atributos de geometría comprimidos sin pérdidas mediante Meshopt, ya incluido entre las dependencias instaladas. Los originales se conservan. El pipeline verifica la equivalencia de posiciones, índices, UV, materiales y jerarquía después de decodificar.

El video suministrado está en `public/media/riwi-cyber-intro.mp4`. Se conserva su archivo de 10,090667 segundos y se normaliza la presentación a diez segundos mediante la velocidad de reproducción. Los posters originales y los derivados de composición están en la misma carpeta. La preferencia de reproducción se guarda en `sessionStorage` con la clave `riwi.reborn.intro.v1`; REPLAY ARRIVAL permite repetirlo. Para probar una primera visita, utiliza una pestaña con sesión nueva.

## Producción

`npm run build` genera `dist/`. La configuración conserva despliegue estático y rutas hash para GitHub Pages. Para publicar bajo una subruta, ajusta `BASE_URL` o las variables del flujo de despliegue. Antes de conectar inventario, usuarios, órdenes o pagos, implementa una API autenticada y un proveedor de pago real; el frontend actual no presenta esas integraciones como existentes.
