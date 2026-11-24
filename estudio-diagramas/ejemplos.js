// Contenido inicial de cada plantilla: los diagramas que le faltan a la memoria.
window.EJEMPLOS = {

// Cierre del ámbito 3. Fabricación digital (3.1 → 3.4)
eje: `nombre fabricacion-digital
color rojo
formato doble

nodo Primeros medios tecnológicos
  rama Piedra, bronce y hierro | Childe (1936)
  rama Herramienta y máquina | Mumford (1934)

nodo Artesanía
  sub El artesano domina el proceso completo
  cita Sennett (2008)

nodo Mecanización industrial
  rama Operaciones simples y repetibles | Giedion (1978)
  rama Revolución Industrial | Hobsbawm (2009)

nodo Fabricación digital | grande
  dentro Del archivo digital al objeto
  rama Sustractiva // CNC y corte láser
  rama Aditiva // Impresión 3D
  cita Torreblanca Díaz (2016)

nodo Cultura maker
  sub Hackerspace // Makerspace // Fab Lab
  cita Cavalcanti (2013)

nodo Fab Labs en Chile
  sub PUC 2007 // U. del Bío-Bío 2008 // U. de Chile 2010
  cita Herrera Polo y Juárez (2012)

arco arriba 1 4 | Mumford (1934)
arco abajo 2 5 | Volver a hacer con las propias manos | Martínez Torán (2016)
`,

// Factores rescatados de los referentes (9.2: Mi Primer Robot, Nube Lab, Ideo Maker)
convergencia: `nombre referentes
color azul
formato doble
prefijo Referente

referente Mi Primer Robot | Municipalidad de Renca, INNOVA UTEM y La Fábrica de Renca
  * Cada estudiante arma su robot desde cero
  * Electrónica y programación de forma lúdica
  * Jóvenes guían el taller
  - Escala comunal: 1.300 estudiantes de 35 colegios

referente Nube Lab | Organización sin fines de lucro, desde 2012
  * Materiales cotidianos, sin equipamiento especializado
  * Actividades que el docente puede repetir
  - Etiquetas por asignatura

referente Ideo Maker | Talleres para instituciones
  * Diseño a la carta según edad y nivel
  * Un docente interesado abre la puerta del colegio
  - Feria Maker abierta a la comunidad

destino Sala Maker | Taller de tres sesiones en la sala de clases | verde
`,
// 7.x Metodología proyectual (pp. 77–79)
etapas: `nombre etapas-metodologia
color rojo
formato doble
prefijo Etapa

etapa Investigación | abierta | más
  desc Levantamiento de factores a considerar, revisión de referentes y definición de la forma de llevar el proyecto.
etapa Búsqueda de establecimiento | cerrada | más
  desc Contacto con distintos colegios y gestión del espacio para testear el taller con el 5° A del Colegio Maipo.
etapa Planificación del taller | cerrada | menos
  desc Definición de las tres sesiones, sus actividades, la organización de los estudiantes y la historia como hilo conductor.
etapa Acercamiento al curso | cerrada | menos
  desc Observación del curso dentro de una clase y aplicación de una encuesta sobre el personaje final del taller.
etapa Desarrollo de proyectos taller | cerrada | más
  desc Diseño y fabricación de identificadores, fidget toys, proyectos con Arduino y recursos de sesiones.
etapa Implementación del taller | cerrada | más
  desc Realización de las tres sesiones y ajuste de cada una a partir de lo observado, asesorías y entrevistas con el colegio.
etapa Análisis y proyección | abierta | menos
  desc Revisión del registro y de la retroalimentación de los estudiantes, e identificación de mejoras para futuras implementaciones.
`,

// 11.2 Recorrido del taller (pp. 102–103)
recorrido: `nombre recorrido-taller
color azul
formato doble

punto Encuesta | Inicio
valle
hito Sesión 01 | Proponer | Despertar el interés por la fabricación digital
hito Sesión 02 | Construir | Materializar las ideas del curso mediante la fabricación digital
hito Sesión 03 | Activar | Explorar la electrónica básica con Arduino
valle
punto Valoración | Final | abajo
`,

// 4. Marco teórico: intersección de los tres ámbitos (p. 41)
venn: `nombre ambitos
color rojo
formato simple

ambito Pedagogía
ambito Territorio
ambito Fabricación digital
cruce 1 2 | La gran deuda educacional del sistema chileno.
cruce 1 3 | Fabricación digital como herramienta pedagógica para el aprendizaje activo.
cruce 2 3 | El acceso de los Fab Labs en Chile.
`,

// Análisis FODA (p. 127)
cuadrantes: `nombre foda
color rosado
formato simple

cuadrante Fortalezas
  - Bajo costo por estudiante: el taller completo cuesta $200.131 para un curso de 33 estudiantes, unos $6.065 por estudiante.
  - Deja recursos en la sala: las mejoras instaladas y los kits con Arduino siguen sirviendo al docente después del taller.
  - Metodología activa: los estudiantes proponen, votan, arman e instalan sus propias mejoras, aprendiendo desde el hacer, el error y la iteración.
cuadrante Oportunidades
  - Brecha de acceso a la fabricación digital: de los 26 Fab Labs de Chile, 13 están en la Región Metropolitana y varias regiones no tienen ninguno.
  - Financiamiento posible: la Subvención Escolar Preferencial (SEP) permite a los colegios invertir en material educativo.
  - Escalabilidad: el taller puede replicarse en otros cursos y colegios, o ampliarse con nuevas sesiones y proyectos.
cuadrante Debilidades
  - Necesita un facilitador con conocimientos: la sesión de Arduino requiere a alguien que domine electrónica básica para guiar a los grupos.
  - Dependencia de la fabricación previa: entre sesiones se necesita acceso a impresora 3D y cortadora láser, que el colegio normalmente no tiene.
cuadrante Amenazas
  - Rigidez curricular y falta de tiempo: los colegios pueden no tener espacio en el horario para un taller de tres sesiones.
  - Bajo presupuesto escolar: muchos establecimientos priorizan gastos básicos antes que materiales nuevos.
`,

// 1. Pedagogía: enseñar para aprender o para memorizar (pp. 22–24)
trayectorias: `nombre ensenar
formato doble

origen Enseñar | azul
arriba Aprender | verde
  paso Evaluar
  paso Cambiar
  paso Iterar
  paso Transformar
  paso Reformular
  paso Repetir
  paso Procesar
  paso Analizar
abajo Memorizar | verde
  paso Recibir
  paso Repetir
`,

// Costos del taller por sesión (p. 126)
barras: `nombre costos
color rojo
formato simple
prefijo $

barra Sesión 01 | 13.800 | | Proponer
barra Sesión 02 | 72.334 | | Construir
barra Sesión 03 | 113.997 | * | Activar: kits con Arduino
total Total del taller | 200.131
`,
};
