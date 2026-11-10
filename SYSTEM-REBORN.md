# RIWI — System Reborn

Implementación frontend sobre el proyecto existente: React 19, TypeScript, Vite, Framer Motion y los visores Three.js ya instalados. No requiere credenciales, backend ni servicios remotos durante la navegación.

## Dirección final

El mundo del video se convierte en una interfaz de moda y programación. La última indicación del usuario prevalece sobre el brief: la mascota **permanece centrada, enfocada y detrás del contenido durante todo el recorrido**. No se desplaza a un lateral. El escenario se desenfoca de forma independiente.

Los seis símbolos tecnológicos persisten en el viewport, con trayectorias amplias y deterministas. El desplazamiento de la página aporta un segundo movimiento, con distinta profundidad por tecnología. La interacción detiene el símbolo seleccionado; el panel puede fijarse, cerrarse y manejarse con teclado. La pausa global y la preferencia de movimiento reducido detienen las trayectorias.

El refinamiento del 10 de noviembre elimina los recuadros de los símbolos y coloca todas sus trayectorias detrás del personaje y del contenido. La información de una tecnología seleccionada aparece en un inspector independiente. Dos planos de código con sintaxis coloreada, circuitos animados y desplazamiento de profundidad refuerzan la ambientación de desarrollo. Los títulos se revelan con máscara, las prendas tienen parallax y los bordes de las tarjetas responden al cursor.

Los cinco capítulos son WEAR THE FUTURE, SELECT YOUR LOADOUT, THE CODE COLLECTION, BUILT BY CODERS y DEPLOY YOUR IDENTITY. Incluyen categorías enlazadas al catálogo, variantes y carrito local reales, vistas de producto, acceso al estudio 3D y terminal con `help`, `shop`, `about`, `clear` e historial mediante flechas.

Project Ascension incorpora Code to Fashion: el fragmento de código refleja la selección actual y permite materializar un GLB real bajo demanda, con color de material, controles de cámara y alternativas de fotografía. `CodeFashionStage.tsx` mantiene esta interacción separada del carrito y de la máquina cinematográfica. El cristal no aplica desenfoque al personaje; la capa del escenario se desenfoca por separado.

## Capas y componentes

- `src/components/reborn/RebornExperience.tsx`: preparación, máquina de estados, reproducción y liberación del video. Se conserva fuera de las rutas.
- `src/components/reborn/MascotAnchor.tsx`: sprite alfa independiente, nítido y centrado. No intercepta el puntero.
- `src/components/reborn/TechField.tsx`: seis trayectorias de símbolos sin marco, parallax, pausa, foco e inspector mediante portal. Actualiza valores de transformación sin renders de React ni mediciones de controles por fotograma.
- `src/components/reborn/DeveloperAtmosphere.tsx`: planos de código y circuitos SVG detrás del personaje, sin canvas adicional.
- `src/components/reborn/ScrollReveal.tsx`: entradas por sección y parallax de imágenes. Las máscaras de los títulos se aplican al texto para que no anulen la detección de entrada del contenedor.
- `src/components/reborn/GlassPanel.tsx`: variantes de cristal con iluminación local del puntero.
- `src/components/reborn/FeaturedSection.tsx`: variantes conectadas a `CartProvider`.
- `src/components/reborn/CyberTerminal.tsx`: comandos locales sin `eval`, historial acotado y salida accesible.
- `src/app/RebornHome.tsx`, `src/components/layout/RebornLayout.tsx` y `src/styles/reborn.css`: composición, navegación, menú, búsqueda y responsive.

La jerarquía mantiene escenario, símbolos tecnológicos (z-index 1), mascota (2), contenido (3) y overlays en contextos definidos. `src/styles/motion-refinement.css` define el último refinamiento. La mascota no se desmonta al navegar. Las rutas de catálogo, ficha, carrito, colecciones, probador y estudio conservan sus funciones y sus GLB.

## Recursos y procedencia

El video aportado por el usuario se conserva sin modificar en `public/media/riwi-cyber-intro.mp4`: 1920 × 1080, 10,090667 segundos. Su duración de presentación se normaliza a diez segundos mediante `playbackRate = duration / 10`; el archivo original no se ha recodificado a diez segundos exactos.

El fotograma final y el poster se extrajeron del video. La transición mantiene primero el fotograma original y compone después el fondo limpio y el personaje independiente durante 1,8 segundos. Se elimina el elemento de video y se libera su origen al finalizar.

Se produjeron dos **derivados de composición asistidos por IA**, usando el editor de imágenes integrado, a partir del fotograma final:

- `public/media/riwi-mascot-alpha.png`: master RGBA; entrega WebP en `public/media/riwi-mascot-alpha.webp`, 166.032 bytes.
- `imported_assets/reborn-authoring/riwi-world-clean.png`: master del escenario sin personaje; entrega en `public/media/riwi-world-clean.webp`, 262.952 bytes.

Son derivados revisados visualmente, no nuevos recursos oficiales de RIWI. La silueta tiene transparencia real. La edición puede introducir diferencias de detalle respecto al video; no se afirma una coincidencia píxel a píxel. Para una fidelidad de producción exacta se necesitan las capas originales de la animación o un recorte autorizado del master.

Las rutas originales, herramienta, modalidad de edición y prompts completos están registrados en `artifacts/reborn-image-prompts.json`. `artifacts/reborn-asset-metadata.json` documenta tamaño, límites alfa y píxeles transparentes. `scripts/prepare-reborn-assets.mjs` genera los WebP de entrega sin editar creativamente los masters.

Los cinco SVG de tecnologías proceden de Simple Icons 16.35.0 y se alojan localmente. SQL utiliza el símbolo genérico de base de datos de Lucide. Sus fuentes, condiciones y atribuciones están en `public/tech/ATTRIBUTION.txt`, `provenance.json` y `SIMPLE-ICONS-LICENSE.md`, enlazadas desde el footer. El logo RIWI suministrado se conserva en su imagen original, sobre una placa blanca.

## Ejecución y recorrido de demostración

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Abrir `http://127.0.0.1:5173`. La clave de sesión es `riwi.reborn.intro.v1`; una pestaña nueva permite demostrar la primera llegada. El botón REPLAY ARRIVAL del footer repite la secuencia. El salto y Escape permiten entrar directamente. Movimiento reducido y ahorro de datos evitan la descarga automática del video.

Recorrido sugerido: llegada → composición central → fijar una tecnología → scroll y parallax → seleccionar prenda, talla y color → ADD TO LOADOUT → terminal `help` / `shop` → estudio 3D → versión móvil → cierre NEXT GENERATION.

## Límites

El carrito y los precios son demostrativos; no se procesan pagos. Los productos y renders existentes son conceptuales. La ausencia de WebGL ofrece imágenes alternativas en las rutas 3D. El inicio utiliza imágenes y transformaciones, sin cargar un canvas 3D.

La duración exacta del archivo y la correspondencia perfecta de las capas requieren un master de video definitivo. Las verificaciones ejecutadas, perfiles de navegador y límites de hardware se registran en `VALIDATION.md`; la emulación móvil no equivale a probar dispositivos físicos.
