# Aula Maker · Estudio de diagramas

**Abrir en línea:** https://emiguerra.github.io/aulaMaker/

## Esto es para

La memoria de título *Aula Maker / Sala Maker* (Diseño UDP), de Millaray. La memoria
necesita muchos diagramas: hilos de autores, líneas de tiempo, datos comparados, la
metodología, el público objetivo. Todos tienen que verse como parte del mismo libro.
Este estudio los dibuja en su lenguaje gráfico, así no hay que armar cada uno a mano en
Illustrator.

## Hace esto

- Convierte un texto corto (conceptos, autores, cifras, etapas) en un diagrama terminado.
- Aplica siempre las mismas reglas gráficas: Neutrif Studio, línea fina negra,
  punteadas, puntos negros, el asterisco ✱ como marcador y un color de acento por
  capítulo, que va solo en etiquetas y marcadores.
- Revisa que nada se superponga: textos que chocan, líneas que pasan sobre un texto,
  cruces no buscados y textos sobre la costura del pliego.
- Exporta SVG con el texto editable, listo para Illustrator → InDesign.

## Qué tiene

- **Dashboard:** los 37 diagramas que pide la memoria, ordenados por capítulo, con página,
  prioridad (alta, media, baja o ya existente) y estado: sin superposiciones, revisar
  contenido o pendiente por falta de datos.
- **Editor:** el texto a la izquierda, el diagrama en el centro y el panel de estilo a la
  derecha.
- **21 plantillas:** eje de conceptos, convergencia, etapas isométricas, recorrido, Venn,
  bloques (FODA/Canvas), trayectorias, barras, línea de tiempo, árbol, tabla en T, matriz
  de puntos, ciclo, cadena, territorio, escala, barra de tiempos, flujo, antes/después,
  anillos y dato comparado.
- **Panel de estilo:** color principal, acentos en color o solo tinta, paleta, tinta,
  grosor de línea, tipo de punteado, radio del punto, asterisco, tamaño de texto (90–115 %),
  interlineado y peso de los títulos. Se aplica a un diagrama o a todos. "Volver a los
  lineamientos de Milla" deshace los cambios.
- **Mapeo de la memoria:** [`estudio-diagramas/MAPEO.md`](estudio-diagramas/MAPEO.md)
  recorre las 145 páginas e indica dónde va cada diagrama, qué contenido lleva, con qué
  plantilla se hace y qué prioridad tiene.
- **Ejemplos:** los SVG ya exportados, en [`estudio-diagramas/ejemplos/`](estudio-diagramas/ejemplos/).

## Cómo funciona

Es una página web estática: HTML y JavaScript, sin servidor, sin instalar nada y sin
conexión a internet una vez abierta.

1. Cada diagrama es un texto con una instrucción por línea (`nodo`, `sub`, `cita`,
   `rama`…). Ese texto vive en `diagramas.js`.
2. La plantilla lee el texto, mide cada palabra con la tipografía real y ubica los
   elementos.
3. El panel de estilo cambia las constantes del motor **antes** de dibujar, así que la
   plantilla vuelve a medir todo con el estilo nuevo.
4. El revisor recorre el SVG resultante y marca en rojo cualquier superposición.

| Archivo | Qué hace |
|---|---|
| `app.js` | Motor de dibujo y primeras plantillas |
| `plantillas2.js` | El resto de las plantillas |
| `revisor.js` | Detecta superposiciones |
| `estilo.js` | Panel de estilo |
| `diagramas.js` | Contenido de cada diagrama de la memoria |
| `ejemplos.js` | Textos de ejemplo por plantilla |
| `ui.js` | Dashboard, editor y exportación |
| `cargar-fuentes.js` | Carga Neutrif Studio desde el computador de quien usa la página |

### La tipografía

Neutrif Studio es una fuente de pago y **no está en este repositorio**. La página la pide
la primera vez que se abre, de una de estas dos formas:

- **Desde el computador** (Chrome o Edge): el navegador pide permiso para leer las fuentes
  instaladas y toma Neutrif de ahí.
- **Desde archivos:** se eligen los `.ttf`/`.otf` de Neutrif Studio.

La fuente queda guardada solo en ese navegador (localStorage) y nunca se sube a ningún lado.

## Cómo usar

**En línea:** entra a https://emiguerra.github.io/aulaMaker/ con Chrome o Edge y da acceso
a la tipografía cuando lo pida.

**En local:** clona el repositorio y abre `estudio-diagramas/index.html` con doble clic.

```sh
git clone https://github.com/emiguerra/aulaMaker.git
```

Para hacer o corregir un diagrama:

1. En el dashboard, haz clic en el diagrama.
2. Edita el texto de la izquierda. El diagrama se redibuja al escribir.
3. Si el recuadro de estado queda en rojo, acorta o reparte el texto hasta que el revisor
   no marque superposiciones.
4. Ajusta el estilo a la derecha si hace falta.
5. Exporta:
   - **SVG:** texto vivo en Neutrif. Se abre en Illustrator y se pega en InDesign.
   - **Copiar SVG:** se pega directo en Illustrator.
   - **PNG** a 300 dpi.
   - **Descargar todos los SVG**, desde el dashboard.

Los cambios hechos en el editor no se guardan solos en el repositorio. Para que un cambio
quede, hay que copiar el texto nuevo a `diagramas.js`.

## Licencia

- **Código** (archivos `.js` y `.html`): MIT. Puedes usarlo, copiarlo y modificarlo
  citando la fuente.
- **Contenido de la memoria** (textos, datos y diagramas de `diagramas.js` y `ejemplos/`):
  © Millaray, todos los derechos reservados. No se reutiliza sin su permiso.
- **Neutrif Studio:** fuente comercial. No se distribuye aquí; cada persona usa su propia
  licencia.
- **Roboto Mono:** SIL Open Font License 1.1, ver
  [`estudio-diagramas/fuentes/OFL-RobotoMono.txt`](estudio-diagramas/fuentes/OFL-RobotoMono.txt).
