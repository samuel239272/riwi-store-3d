# Project Ascension — dirección e implementación

La firma de esta versión es **código que materializa una prenda 3D real**, dentro del mundo continuo de RIWI. El usuario conserva el personaje en el centro, enfocado y detrás de la interfaz, mientras las tecnologías se desplazan por el viewport con parallax. Esta indicación directa prevalece sobre el traslado lateral sugerido en los documentos de referencia.

## Auditoría y decisiones

Los principales defectos observados en la evolución anterior, ordenados por impacto:

1. El personaje se convertía en un acompañante lateral. Se mantiene ahora la composición central del cierre cinematográfico, sin depender del scroll ni de la ruta.
2. La nitidez del personaje podía perderse detrás de paneles con `backdrop-filter`. Se desenfoca solamente la capa del escenario; el cristal de contenido utiliza transparencia, reflejos y luz local.
3. Los símbolos quedaban limitados al Hero. El campo tecnológico es persistente y sus trayectorias abarcan el viewport durante todo el recorrido.
4. Los símbolos podían competir con textos y controles. El refinamiento del 10 de noviembre sustituye las cápsulas y las zonas de exclusión por símbolos sin marco en una capa inferior al personaje y al contenido. Solo el inspector de información seleccionado utiliza un portal en primer plano. El solapamiento geométrico con una tarjeta es intencional y no intercepta sus controles.
5. La franja lateral estrechaba demasiado el contenido móvil. Se recupera todo el ancho, con una composición de Hero específica para teléfono.
6. La relación entre programación y ropa era principalmente decorativa. Code to Fashion convierte los datos de la selección en una transición hacia un visor GLB interactivo.
7. El color elegido no alteraba una fotografía editorial estática. En la presentación 3D, el color se aplica al material del modelo; la talla se conserva en la fuente visual y en el carrito.
8. Las categorías repetían el mismo comportamiento de cristal. La composición asimétrica incorpora una exploración lumínica breve al interactuar, sin un escaneo permanente.
9. Las expansiones podían animar dimensiones durante la interacción. La apertura holográfica usa una máscara desde el núcleo del símbolo, con la posición del control conservada y una alternativa inmediata para teclado o movimiento reducido.
10. La continuidad dependía de liberar correctamente el video. Se corrigió la limpieza del callback ref bajo Strict Mode, evitando que un desmontaje transitorio eliminara el origen durante la reproducción en desarrollo.

## Especificación de la firma

El módulo Code to Fashion conserva una altura estable: 740 px en escritorio, 760 en tablet y 710 en móvil. La cabecera ocupa 62 px, o 53 en teléfono; los modos Código / 3D / Foto ocupan 70 o 67 px en la base. El código muestra nombre, talla y color del catálogo local, sin ejecutar texto ni fingir un servidor o un compilador remoto.

Materializar prenda 3D activa la carga diferida del visor existente y presenta una exploración holográfica de 900 ms. La geometría mantiene su estado real de carga, error y reintento. La línea de exploración se mueve mediante `transform`; la prenda conserva los controles de cámara, zoom, teclado y puntero. Los recursos WebGL se liberan al volver a Código o Foto. La preferencia de movimiento reducido elimina la coreografía y mantiene la función.

Las seis trayectorias utilizan fases iniciales deterministas y periodos próximos al minuto. El scroll aporta una segunda componente con distinta profundidad por tecnología. Un símbolo seleccionado detiene su trayectoria y abre su inspector dentro del viewport. Escape devuelve el foco al símbolo. La pausa global detiene el movimiento sin desplazar a la mascota.

El bucle ambiental actualiza únicamente valores de transformación. El inspector calcula su posición al seleccionar un símbolo o cambiar el tamaño del viewport; no hay mediciones de controles ni cambios de estado de React por fotograma. La prueba de capas coloca deliberadamente un símbolo debajo del botón principal y verifica que el botón sigue recibiendo el puntero.

La ambientación de desarrollo utiliza dos planos de código, circuitos SVG animados y marcadores de archivo por capítulo. Las entradas combinan máscaras de títulos, desplazamiento de superficies y parallax de prendas. La iluminación local sigue el cursor mediante variables CSS y restablece su desplazamiento al salir. La pausa y el movimiento reducido mantienen visibles los capítulos y detienen la ambientación.

La paleta y los recursos RIWI proceden del brief del usuario. Se conservan los colores violeta y azul oscuro, el logotipo suministrado y las fuentes locales existentes, incluso cuando una guía complementaria propone otra estética. No se incorpora una plantilla ni una biblioteca adicional de animación.

## Skills aplicadas

- `codex-master-dev`: arquitectura para separar escena, movimiento e interacción; UI/UX para jerarquía y responsive; animación para coreografía determinista; Browser QA para pruebas y capturas; optimización 3D para mantener originales y entregar GLB comprimidos sin pérdidas de geometría.
- `motionsites-web-builder`: estudio de composición por capas y precisión temporal en dos ejemplos cercanos, conservando los recursos propios y una composición original. Se aplica el ciclo captura → inspección → corrección.
- `design-motion-principles`: exploración expresiva en la firma, refinamiento en la ejecución y respuestas breves en controles frecuentes. Movimiento reducido, pausa, limpieza y transformación de capas se implementan junto con los efectos.
- `design-taste-frontend`: revisión de bordes, jerarquía, legibilidad, controles y ejecución de su comprobador. Las decisiones explícitas del usuario sobre arte y movimiento prevalecen sobre sus preferencias de estilo.
- `imagegen`: edición de los derivados alfa y escenario limpio a partir del video del usuario; procedencia y prompts en `artifacts/reborn-image-prompts.json`.

## Evidencias

`SYSTEM-REBORN.md` documenta arquitectura, recursos, instrucciones y límites. `VALIDATION.md` registra los resultados ejecutados. Las capturas y los informes de navegador están en `artifacts/`. Las puntuaciones visuales internas sirven para priorizar revisiones; no se presentan como métricas objetivas ni como garantía de resultados en la competencia.
