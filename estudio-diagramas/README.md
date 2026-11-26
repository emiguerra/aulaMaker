# Estudio de diagramas · Aula Maker

Genera los diagramas de la memoria de Milla con su lenguaje gráfico: Neutrif Studio,
línea fina negra, punteadas, puntos, asterisco ✱ y un color de acento.

**Abrir:** doble clic en `index.html` (Chrome). Funciona sin internet.

- **Dashboard:** todos los diagramas de la memoria por capítulo, con su estado
  (sin superposiciones, revisar contenido, pendiente por falta de datos).
- **Editor:** clic en un diagrama → se edita el texto a la izquierda y el diagrama se
  redibuja. El **revisor** marca en rojo cualquier texto que choque con otro, línea que
  pase sobre un texto, líneas que se crucen sin querer y textos fuera de la página.
- **Una página:** la memoria es digital, así que todo diagrama se arma en una página carta
  apaisada (792 × 612 pt). La línea `formato` ya no se usa.
- **Estilo gráfico (panel derecho del editor):** color principal, acentos en color o
  solo tinta, ajuste de la paleta, tinta y gris, grosor de línea, tipo de punteado,
  radio del punto, grosor del asterisco, tamaño de texto e interlineado y peso de los
  títulos. Se aplica a "este diagrama" o a "todos", y muestra los cambios respecto de la
  memoria. "Volver a los lineamientos de Milla" lo deshace. El estilo se aplica antes de
  dibujar, así que las plantillas vuelven a medir todo y el revisor sigue valiendo.
- **Exportar:** SVG (texto vivo en Neutrif, abrir en Illustrator → pegar en InDesign),
  Copiar SVG, PNG a 300 dpi, o "Descargar todos los SVG" desde el dashboard.
  Los SVG ya exportados están en `ejemplos/`.

21 plantillas: eje de conceptos, convergencia, etapas isométricas, recorrido, Venn,
bloques (FODA/Canvas), trayectorias, barras, línea de tiempo, árbol, tabla en T,
matriz de puntos, ciclo, cadena, territorio, escala, barra de tiempos, flujo,
antes/después, anillos y dato comparado.

Archivos: `app.js` (motor y primeras plantillas) · `plantillas2.js` · `revisor.js` ·
`estilo.js` (panel de estilo) · `diagramas.js` (contenido de cada diagrama) · `ui.js` · `MAPEO.md`.

Fuentes: Neutrif Studio tiene licencia (viene del computador, no publicar esta carpeta).
Roboto Mono es OFL (Google Fonts).
