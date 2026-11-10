# RIWI CYBER — Notas de implementación

## Auditoría y estrategia

El proyecto utiliza React 19.1.1, TypeScript 5.9.3, Vite 7.3.7 y React Router 7.18.5 con rutas hash para hosting estático. Framer Motion 12.23.24, React Three Fiber 9.4.0, Drei 10.7.6 y Three.js 0.180.0 ya estaban instalados. No fue necesario incorporar otro motor de animación, smooth scrolling, backend ni servicios externos.

Se conservaron el catálogo tipado, las variantes, el carrito persistente, las galerías, las guías de talla, el control de cámara, los hotspots, los respaldos de WebGL y el probador. La versión anterior carecía de una entrada audiovisual y un showroom integrado en la portada, alteraba por CSS el color del logo y combinaba varias generaciones de UI. Las versiones anteriores permanecen como referencia en el repositorio, pero las rutas activas importan exclusivamente CyberHome y CyberLayout.

Se inspeccionaron ocho GLB de prendas: camiseta, camisa, hoodie, chaqueta, jeans, joggers, buzo y gorra. Los recursos originales sumaban 52.18 MB. El hoodie tenía 6,393 triángulos pero pesaba 19.34 MB por sus texturas; el buzo contiene 140,300 triángulos. Por eso se priorizaron texturas, compresión sin pérdidas y carga bajo demanda, conservando las siluetas.

## Arquitectura activa

- `src/RiwiApp.tsx`: contextos persistentes de movimiento, carrito y cine; rutas de comercio existentes.
- `src/components/layout/CyberLayout.tsx`: navegación de vidrio, progreso, controles accesibles, consola y cierre cinematográfico.
- `src/components/cyber/CinematicExperience.tsx`: máquina de estados `intro → entering → ready`, reproducción, posters y persistencia de sesión.
- `src/app/CyberHome.tsx`: composición de Hero, Collections, Showroom, Products, Culture e Identity.
- `src/components/cyber/`: cada sección tiene su propio módulo; Reveal centraliza el movimiento de entrada.
- `src/components/viewer/` y `src/scenes/`: visor y escenas 3D reutilizados, con los controles y respaldos existentes.
- `src/styles/cyber.css`: sistema visual y adaptación móvil; conserva la base comercial del proyecto.

## Video e identidad

El MP4 aportado dura 10.090667 segundos, mide 1920 × 1080 y ocupa 5.80 MB. Se copia con un nombre estable a `public/media/riwi-cyber-intro.mp4`. Los posters se extrajeron con Chromium del mismo archivo, incluyendo su último fotograma decodificable. No se generaron ni recolorearon el logo o la mascota.

La primera visita a Inicio reproduce el video silenciado, inline y sin loop ni controles nativos. El usuario puede saltar con el botón o Escape. Si autoplay es rechazado se ofrece reproducción manual; si falla el recurso o no comienza a reproducirse, se utiliza el poster final y se permite entrar. Hay un límite de espera para evitar bloquear la tienda.

El video no se desmonta al terminar: permanece pausado, respaldado por la imagen final. Desenfoque, oscuridad y contenido se sincronizan durante la transición. Navegar y recargar no reinicia automáticamente la introducción dentro de la sesión. El footer permite repetirla. Las visitas directas a productos o catálogo entran a su destino; con movimiento reducido o ahorro de datos no se solicita automáticamente el MP4.

## Showroom y calidad 3D

La portada carga geometría GLB real. En escritorio se inicia cerca de la sección; en móvil y dispositivos limitados requiere activación voluntaria. El selector cambia de objeto y color. Arrastre, vistas, zoom, enfoque, iluminación, hotspots y fullscreen siguen disponibles. Si WebGL falla se presenta una imagen del producto identificada como alternativa.

Se suavizan las normales del tejido a través de vértices duplicados por UV, sin desplazar posiciones ni soldar costuras. Las piezas rígidas conservan sus normales. La iluminación combina luz principal neutra, relleno suave y contraluz rojo discreto. Las sombras de contacto se recalculan al estar disponible el modelo y al cambiar la iluminación; ya no dependen de una captura anterior a la carga de la prenda.

## Rendimiento y recursos

`npm run assets:optimize` genera copias de entrega: reduce las texturas grandes a un máximo de 1024 px, conserva PNG donde existe transparencia y utiliza JPEG para mapas opacos. Después aplica `EXT_meshopt_compression` sin cuantización, simplificación ni reordenamiento de atributos. El decodificador ya estaba configurado en el loader.

`node scripts/check-optimized-models.mjs` compara los ocho modelos con los originales, decodificando los streams comprimidos y comprobando igualdad binaria de los datos geométricos, además de materiales, accessors, nodos y escenas. Los resultados medidos se guardan en `artifacts/garment-optimization.json`. El hoodie de entrega pesa 1.19 MB y la chaqueta 2.86 MB. El buzo conserva su malla densa y todavía ocupa 8.24 MB; solo se descarga al seleccionarlo.

El renderer utiliza demanda de frames, detiene el render fuera de pantalla o al ocultar la pestaña y limita el DPR móvil. Solo hay un visor de producto activo en el showroom. Las escenas se importan dinámicamente. No se incorporaron GSAP ni Lenis: Framer Motion, CSS y las APIs existentes cubren las secuencias sin reemplazar el scroll nativo.

## Accesibilidad y alcance

Se mantienen landmarks, jerarquía de encabezados, foco visible, menú por teclado, formularios etiquetados y restauración del foco en la consola. Durante el video el contenido de la tienda es `inert`; al entrar se devuelve el foco al contenido. La pausa global detiene animaciones y rotaciones; la preferencia de movimiento reducido muestra la identidad completa y omite la reproducción automática.

Los precios, inventario, materiales y estampados siguen siendo datos conceptuales centralizados en `src/data/products.ts`. No se añadieron backend, cuentas, pagos ni información comercial oficial. Las prendas y el maniquí son aproximaciones visuales y no una simulación física ni una predicción de talla.

## Ejecución y verificación

Usa `npm ci` si faltan dependencias y `npm run dev` para abrir `http://127.0.0.1:5173`. `npm run build` genera `dist/`. `npm test` ejecuta los recorridos de escritorio y móvil. El estado de la verificación de esta entrega se documenta en `VALIDATION.md`.

`scripts/preview-cyber.mjs` captura entrada, portada, identidad y showroom y registra errores de ejecución y desbordamiento. `scripts/inspect-cinematic.mjs` recibe la ruta de un video local y extrae sus fotogramas de referencia. Los scripts de medios requieren Chromium o Chrome instalado; la aplicación y el build no dependen de ejecutarlos.
