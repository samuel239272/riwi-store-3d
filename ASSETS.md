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

Los modelos GLB de prendas en `public/models/garments` incluyen las dos gorras aportadas por el usuario: `cap-snapback.glb` (originada en `Cap.obj`/`Cap.mtl` con mapa normal `capTex_N.jpg`) y `cap-baseball.glb` (originada en `baseballCap_test2psd.kmz` con texturas PBR). Sus copias en `public/models/optimized` incorporan optimización de texturas y compresión Meshopt sin pérdidas de geometría. Los originales no se sobrescribieron. `artifacts/garment-optimization.json` registra sus tamaños; el script de comprobación valida la equivalencia de los datos geométricos decodificados.

Los ejemplos de ATLAS y accesorios de la tabla anterior corresponden a recursos históricos. La tienda activa utiliza las prendas definidas en `src/data/products.ts`. La optimización no atribuye una nueva autoría ni una licencia distinta a esos recursos.
