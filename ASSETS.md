# Recursos y procedencia

| Recurso                             | Procedencia                                                                      | Uso                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| GLB ATLAS, ARC, CORE y SPECTRA      | Geometría original generada por `scripts/generate-models.mjs` para este proyecto | Demostración conceptual, sin fabricante comercial                 |
| Renders WebP                        | Renderizado local de los GLB anteriores mediante Three.js                        | Galerías, catálogo y respaldo                                     |
| Marca e icono de aplicación         | SVG original en `public/icons/mark.svg`                                          | Identidad de demostración                                         |
| Iconos de interfaz                  | Lucide React, licencia ISC                                                       | Navegación y controles                                            |
| Space Grotesk, Inter, IBM Plex Mono | Paquetes Fontsource incluidos en `package-lock.json`, SIL Open Font License      | Tipografía local                                                  |
| Decodificadores Draco               | Copiados de `three/examples/jsm/libs/draco/gltf`, distribución de Google Draco   | Lectura de GLB comprimidos; licencias en `public/decoders/draco/` |

No se han descargado fotografías de productos, logotipos de fabricantes ni modelos de terceros. No hay recursos con enlaces temporales ni dependencias de un CDN en la experiencia de demostración.

Los assets originales se entregan con el código para reutilizar y modificar en este proyecto. Esto no atribuye certificación, capacidad protectora o existencia comercial a los diseños.

## Recursos de RIWI CYBER

El logo `public/logos/riwi-coder.png` fue aportado por el usuario. La interfaz Cyber conserva el archivo y sus colores, sin filtros de recoloración.

`public/media/riwi-cyber-intro.mp4` es una copia del video aportado por el usuario, sin transcodificación. Los posters WebP de la misma carpeta se extrajeron de sus fotogramas de llegada y cierre. La mascota que aparece en la web procede de ese video; no se generó otra versión del personaje.

Los ocho GLB de `public/models/garments` son recursos preexistentes del proyecto. Sus copias en `public/models/optimized` incorporan optimización de texturas y compresión Meshopt sin pérdidas de geometría. Los originales no se sobrescribieron. `artifacts/garment-optimization.json` registra sus tamaños; el script de comprobación valida la equivalencia de los datos geométricos decodificados.

Los ejemplos de ATLAS y accesorios de la tabla anterior corresponden a recursos históricos. La tienda activa utiliza las prendas definidas en `src/data/products.ts`. La optimización no atribuye una nueva autoría ni una licencia distinta a esos recursos.

## Cuerpos del probador

`public/models/bodies/male.glb` procede de `humanMesh6.fbx` y `female.glb` de `Female Body.fbx`, ambos aportados por el usuario para esta integración. Su procedencia y hashes SHA-256 están en `public/models/bodies/provenance.json`. No se atribuye una licencia adicional a estos archivos.

La conversión conserva las superficies originales, sin decimación ni remallado, normaliza las unidades y prepara una postura de brazos relajados. El masculino utiliza los pesos de su esqueleto; el femenino, que no incluye rig, usa una transición espacial en los hombros. Los FBX recibidos no incluyen mapas de piel; se aplica un material de piel ajustable y se conserva la geometría facial que aporta cada archivo.

Para regenerar desde los FBX originales:

```sh
blender -b --python-exit-code 1 --python scripts/prepare-fitting-bodies.py -- /ruta/humanMesh6.fbx '/ruta/Female Body.fbx'
node scripts/compress-geometry.mjs --bodies
```

La compresión Meshopt comprueba que cada atributo decodificado coincide byte a byte con el original; `optimization.json` registra los tamaños. El probador carga las prendas existentes de `public/models/optimized` y conserva sus mallas, UV, texturas y detalles al registrarlas sobre el cuerpo. Los ajustes de complexión deforman por regiones las mallas importadas; no sustituyen los cuerpos por figuras procedurales. La vista Solo cuerpo permite inspeccionar la silueta completa.

Las medidas son controles de proporción visual, con valores de referencia editables; no proceden de un escaneo corporal. El ajuste de prendas es geométrico, no una simulación física de tejidos ni una predicción de talla.
