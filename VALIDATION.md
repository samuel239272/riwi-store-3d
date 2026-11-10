GATE: ERROR (the copy (the page showed no <main>, <section> or <h1> to lint); consistency.mjs could not walk 1440, 390; check.mjs could not run (exit 2: check: timed out))

# Validación de RIWI — System Reborn / Project Ascension

Última revisión: 10 de noviembre de 2026. Repositorio existente en Windows. La línea anterior corresponde al comprobador adicional de `design-taste-frontend`, ejecutado el 9 de noviembre: no pudo completar su recorrido y no se considera aprobado. Su informe se conserva en `.taste-skill/gate.json`. No se volvió a ejecutar tras su error. Las comprobaciones siguientes se ejecutaron con la configuración Playwright del proyecto y scripts de inspección independientes.

## Refinamiento de interfaz y movimiento — 10 de noviembre

- Iconos sin marco, con fondo transparente, borde de cero píxeles y sin sombra de recuadro. Las capas verificadas son tecnologías 1, mascota 2 y contenido 3. Una prueba provoca solapamiento con el CTA y comprueba el destino real del puntero y su navegación.
- Dos planos de código, circuitos SVG, marcadores de archivo, máscaras de títulos, parallax de prendas e iluminación del cursor. Se corrigió una máscara que impedía activar la entrada de títulos; el observador conserva ahora un contenedor sin recorte completo.
- Pausa global: iconos estáticos y capítulos legibles al continuar el scroll. Movimiento reducido conserva la presentación estática y las funciones.
- Suite completa `npm test -- --trace=off --max-failures=2`: **59 pruebas aprobadas, 1 omitida**, en 7,6 minutos. La omitida comprueba iluminación mediante mouse y se excluye expresamente del perfil táctil móvil. Incluye catálogo, introducción, portada, capas, parallax, pausa, búsqueda, carrito, probador y visor.
- `npm run typecheck`, `npm run build` y Prettier sobre los archivos modificados: aprobados. Sin dependencias nuevas. El chunk de Three.js mantiene la advertencia de tamaño indicada en el registro anterior.
- `node scripts/verify-reborn.mjs http://127.0.0.1:4173`: seis anchos, 320–1920 px, todos los inspectores dentro del viewport, mascota fija, sin desbordamientos ni errores de ejecución. Introducción de diez segundos de presentación y video liberado al terminar.
- `node scripts/capture-motion.mjs http://127.0.0.1:4173`: capturas de producción de los cinco capítulos en escritorio y móvil, abiertas y revisadas. `artifacts/motion-visual-check.json` registra las capas, la mascota fija y la ausencia de errores y desbordamiento. El hover de escritorio se revisó también en `artifacts/motion-hover-desktop.png`.
- `node scripts/capture-ascension.mjs http://127.0.0.1:4173`: visor de producción accesible en ambos tamaños; zoom real de 5,634 a 4,508, mascota nítida y fija, cero canvases al volver a Código y cero errores.

La evidencia visual actual está en `artifacts/motion-*.png`. Las mediciones de rendimiento de abajo pertenecen al 9 de noviembre; no se repitieron como parte de este refinamiento. No se afirman resultados nuevos de LCP, INP o fluidez en hardware físico.

## Registro anterior — 9 de noviembre

## Compilación y formato

- `npm run typecheck`: aprobado, sin errores de TypeScript.
- `npm run build`: aprobado; `dist/` generado con los recursos locales y rutas hash existentes.
- Prettier sobre componentes Reborn, layout, portada, estilos, pruebas de portada/cine e `index.html`: aprobado.
- El build conserva una advertencia por el chunk de Three.js de 776,84 kB sin comprimir, 202,29 kB gzip. El motor se carga bajo demanda; no se ocultó la advertencia.

## Pruebas funcionales ejecutadas

`npm test -- --trace=off --max-failures=2`: **52 pruebas aprobadas**, 26 en escritorio y 26 con emulación móvil; duración registrada de seis minutos.

Después de ajustar el orden del foco y la navegación de tablet, se ejecutaron **12 pruebas focalizadas aprobadas**: introducción, repetición, primer Tab, cápsulas, materialización 3D y búsqueda, en ambos perfiles.

Después de corregir la capa de interacción de los símbolos, `npm test -- tests/cover.spec.ts --trace=off --max-failures=2`: **18 pruebas aprobadas**. Incluyen las dos nuevas verificaciones del primer Tab; no se presentan como una segunda ejecución completa de toda la suite.

La revisión visual del visor detectó un desenfoque residual de la mascota a través de su superficie. Se reservó el blur exclusivamente al escenario y se añadieron comprobaciones de `backdrop-filter`: **2 pruebas Code to Fashion aprobadas**, una por perfil, tras la corrección.

Se añadieron zonas de seguridad para los controles que aparecen al materializar la prenda, conservando la pausa del movimiento ambiental: **4 regresiones aprobadas** entre Code to Fashion y pausa, en ambos perfiles. Tras eliminar actualizaciones innecesarias de variables CSS en cada frame, se aprobaron otras **4 comprobaciones** de cápsulas y movimiento. Los ensayos focalizados repiten casos existentes para verificar las correcciones; no se suman como pruebas únicas.

El cierre detectó una actualización de scroll pendiente que podía recolocar una cápsula después de pausar. Se corrigió conservando la posición nativa de scroll al activar la pausa. La prueba de Code to Fashion se reforzó desplazando los controles al viewport y accionando el zoom real: **8 ejecuciones de estabilidad aprobadas**, dos repeticiones de ambos casos en escritorio y móvil, tras la corrección.

La cobertura incluye:

- Reproducción real, duración de presentación, ausencia de loop, transición, salto, Escape, sesión, repetición y liberación del elemento de video.
- Rechazo de autoplay, MP4 no disponible, recurso crítico fallido y movimiento reducido sin descarga automática del video.
- Mascota centrada y con el mismo rectángulo antes y después del scroll y de cambiar de ruta; capas independientes y escenario desenfocado.
- Seis tecnologías, categorías correctas, panel único, fijado, cierre, foco, movimiento, parallax y pausa global.
- Categorías enlazadas al catálogo, búsqueda, filtros combinados, orden y rutas inexistentes.
- Talla, color, carrito persistente y eliminación.
- Code to Fashion con geometría GLB real, modos Código / 3D / Foto y retorno a la fuente.
- Terminal `help`, `about`, `shop`, `clear` e historial.
- Visores con zoom, presets, arrastre de ratón, gesto táctil emulado y teclado; carga de los ocho modelos, recuperación de errores y alternativa sin WebGL.
- Probador con medidas válidas e inválidas, persistencia voluntaria, borrado, cambios de prenda y color.

## Inspección responsive y cinematográfica

`node scripts/verify-reborn.mjs` inspeccionó **320, 390, 768, 1024, 1440 y 1920 px**. En los seis anchos:

- Los seis paneles se pudieron seleccionar y quedaron dentro del viewport.
- La mascota conservó exactamente su rectángulo en las cuatro secciones posteriores al Hero.
- No se detectó desbordamiento horizontal ni errores de ejecución.

Se verificó movimiento real en coordenadas de los seis símbolos, con y sin desplazamiento de página. La portada inicia sin canvas. El MP4 reportó 10,090667 s de duración y 10 s de presentación; tras la transición el número de elementos de video fue cero.

Evidencias: `artifacts/reborn-final-qa.json`, `reborn-visual-qa.json` y capturas `reborn-*-hero.png`, `reborn-*-tech.png`, las cuatro secciones y la secuencia `reborn-transition-*.png`. Las capturas se abrieron y revisaron; no se consideró la compilación como sustituto de la inspección visual.

## Producción y rendimiento

`node scripts/profile-reborn.mjs` se ejecuta sobre `http://127.0.0.1:4173`, servido por Vite Preview desde `dist/`. El informe medido está en `artifacts/reborn-performance.json`; incluye visitas con y sin introducción, recursos transferidos, LCP, CLS, tareas largas, errores y descarga diferida de Three.js.

Condiciones: Chromium local en Windows, 1440 × 1000, sin limitación artificial de red o CPU y WebGL por software. Son observaciones de laboratorio, no métricas de usuarios reales. La introducción de diez segundos y la transición retrasan deliberadamente la primera experiencia interactiva; no se afirma que la primera visita cumpla un objetivo LCP de 2,5 segundos. INP de campo y fluidez en dispositivos físicos no se midieron.

La última muestra instrumentada, con capturas durante el recorrido, registró LCP de **5.820 ms sin introducción** y **14.140 ms con introducción**; CLS de **0** y **0,000045**, respectivamente. Los tiempos variaron entre ejecuciones en esta máquina. El objetivo LCP de 2,5 s no se considera alcanzado en la muestra final; hace falta medir en hardware representativo antes de afirmar ese resultado.

En las dos visitas medidas, la portada inició con cero canvases, cero peticiones iniciales a los chunks del motor 3D, cero errores de ejecución y cero videos retenidos tras completar la llegada. El visor real se activó mediante la acción del usuario. Se revisaron `ascension-code-desktop.png`, `ascension-materialized-desktop.png` y `ascension-materialized-mobile.png`.

`node scripts/capture-ascension.mjs` verificó la compilación definitiva en escritorio y móvil: controles sin iconos superpuestos, personaje nítido detrás del visor, cámara de 5,634 a 4,508 al pulsar Acercar, mascota fija, cero canvases al volver a Código, cero errores y ningún desbordamiento. El resultado está en `artifacts/ascension-production-check.json`; las capturas de Hero y materialización se actualizaron desde esa compilación y se revisaron visualmente.

## Recursos

`node scripts/check-optimized-models.mjs`: aprobado para los ocho GLB. Tras decodificar Meshopt, conserva posiciones, índices, atributos, UV, materiales y jerarquía respecto a los originales. Las texturas se optimizaron por separado. Los archivos originales se conservan.

El conjunto original ocupa 52.180.532 bytes y la entrega optimizada 18.248.676 bytes. El hoodie pasa de 19.335.216 a 1.188.848 bytes. Los detalles están en `artifacts/garment-optimization.json`.

La mascota de entrega tiene alfa real; los masters, los prompts y las limitaciones de composición están en `SYSTEM-REBORN.md` y `artifacts/reborn-image-prompts.json`. No se presentan las ediciones asistidas como archivos oficiales nuevos.

## Límites de la verificación

- Escritorio y móvil se probaron en Chromium; el perfil iPhone 13 emula resolución y eventos táctiles. No se probaron dispositivos físicos, Safari ni Firefox.
- No se realizó una auditoría con lectores de pantalla ni un estudio de accesibilidad con usuarios.
- El comprobador complementario de la skill agotó su tiempo; sus comprobaciones de copy y layout no se declaran aprobadas.
- El archivo de video conserva 10,090667 s; la presentación se normaliza a diez segundos. La correspondencia píxel a píxel entre capas requiere el master de producción original.
- No se desplegó el sitio ni se conectaron pagos, autenticación o inventario real. El catálogo, los precios y el carrito son demostrativos.
