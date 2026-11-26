// Todos los diagramas de la memoria, por capítulo. "revisar" marca lo que Milla debe validar.
const E = window.EJEMPLOS;
window.DIAGRAMAS = [
// ── 1. Pedagogía ──
{ id: 'ensenar', cap: '1. Pedagogía', pag: '22–23', titulo: 'Enseñar: aprender o memorizar', plantilla: 'trayectorias', prioridad: 'existe', texto: E.trayectorias },
{ id: 'autores-pedagogia', cap: '1. Pedagogía', pag: '18–19', titulo: 'Hilo de autores de la pedagogía', plantilla: 'eje', prioridad: 'baja', texto:
`nombre autores-pedagogia
color azul

nodo Transmisión
  sub Acción de las generaciones adultas sobre las jóvenes
  cita Durkheim (2013)
nodo Imposición
  sub Modelos, materias y métodos desde arriba y desde fuera
  cita Dewey (2010)
nodo Educación bancaria
  rama Depositar contenidos | Freire (1970)
  rama Pedagogía dialógica | Freire (1970)
nodo Aprender en el ambiente
  sub Experiencias efectuadas en el ambiente
  cita Montessori (1986)
nodo Tres procesos | grande
  dentro Adquirir · transformar · evaluar
  cita Bruner (1963)
nodo Reconstruir lo conocido
  sub La enseñanza interpela el sentido común
  cita Maggio (2012)
` },
{ id: 'sistema-escolar', cap: '1. Pedagogía', pag: '20', titulo: 'Sistema escolar chileno', plantilla: 'arbol', prioridad: 'baja', texto:
`nombre sistema-escolar
color azul

raiz Sistema escolar chileno | Tres niveles (parvularia, básica y media) y tres tipos de establecimiento, organizados así desde la dictadura (1973–1990). Bellei (2015)
hijo Público | Administración traspasada del Estado central a las municipalidades. | Sala Maker trabaja aquí
hijo Particular subvencionado | Privados que reciben financiamiento estatal en las mismas condiciones que los públicos.
hijo Particular pagado | Financiado por las familias; los resultados siguen la jerarquía socioeconómica. García-Huidobro y Bellei (2003)
` },
{ id: 'estatus-docente', cap: '1. Pedagogía', pag: '21', titulo: 'Caída del estatus docente', plantilla: 'dato', prioridad: 'media', texto:
`nombre estatus-docente
color azul

nota Profesores que perciben su profesión como de alto estatus | Bellei y Valenzuela (2013)
valor 82 % | 1965
valor 14 % | 2008
` },
// ── 3. Fabricación digital ──
{ id: 'fabricacion-digital', cap: '3. Fabricación digital', pag: '38', titulo: 'Cierre del ámbito Fabricación digital', plantilla: 'eje', prioridad: 'alta', revisar: true, texto: E.eje },
{ id: 'linea-fablabs', cap: '3. Fabricación digital', pag: '38', titulo: 'Origen y expansión de los Fab Labs', plantilla: 'linea', prioridad: 'media', texto:
`nombre linea-fablabs
color rojo

hito MIT | Curso "How to Make Almost Anything": más de 500 inscritos en su primera edición | García Sáez (2016)
hito 2001 | El CBA-MIT impulsa los Fab Labs para democratizar la fabricación digital | Herrera Polo y Juárez (2012)
hito 2007 | Taller de Ensamble Digital, Pontificia Universidad Católica de Chile | Herrera Polo y Juárez (2012)
hito 2008 | Laboratorio de la Universidad del Bío-Bío, Concepción
hito 2010 | Laboratorio de Prototipado Digital, Universidad de Chile
hito Hoy | El número de Fab Labs se duplica cada 18 meses | García Sáez (2016)
` },
// ── 4. Marco teórico ──
{ id: 'ambitos', cap: '4. Marco teórico', pag: '41', titulo: 'Intersección de los tres ámbitos', plantilla: 'venn', prioridad: 'alta', texto: E.venn },
{ id: 'mapa-fablabs', cap: '4. Marco teórico', pag: '43', titulo: 'Fab Labs en Chile, de norte a sur', plantilla: 'territorio', prioridad: 'alta', revisar: true, texto:
`nombre mapa-fablabs
color rojo

region Arica y Parinacota | 0 | NodoLab · SLEP Chinchorro
region Tarapacá
region Antofagasta
region Atacama
region Coquimbo
region Valparaíso
region Metropolitana | 13 | NodoLab · SLEP Barrancas
region O'Higgins
region Maule
region Ñuble
region Biobío | | NodoLab · SLEP Andalién Sur
region La Araucanía | 0
region Los Ríos | 0
region Los Lagos
region Aysén | 0
region Magallanes
dato 26 | Fab Labs inscritos en Chile; el 50 % se concentra en la Región Metropolitana. | FabLabs.io (2025) · MinCiencia y Mineduc (2025)
` },
{ id: 'simce', cap: '4. Marco teórico', pag: '44 · 55 · 58', titulo: 'Brecha SIMCE entre grupos socioeconómicos', plantilla: 'escala', prioridad: 'alta', revisar: true, texto:
`nombre simce
color rojo

nota SIMCE 2023 · Matemática 4° básico | Agencia de Calidad de la Educación (2024)
rango 200 | 320
punto 292 | Grupo socioeconómico alto
punto 237 | Grupo socioeconómico bajo | nivel Insuficiente
umbral 292 | Umbral nivel Adecuado
brecha
` },
{ id: 'deuda', cap: '4. Marco teórico', pag: '44–45', titulo: 'La deuda educacional en el tiempo', plantilla: 'linea', prioridad: 'media', texto:
`nombre deuda-educacional
color rojo

hito 1973–1990 | Municipalización y financiamiento estatal a privados | Bellei (2015)
hito 2006 | Segmentación social: los quintiles de menor ingreso se desplazan a la educación municipal | Cornejo (2006)
hito 2018 | Cerca del 80 % de los liceos agrupa por habilidad al ingreso | Treviño et al. (2018)
hito 2023 | En Matemática 4° básico, el grupo alto promedia 292 puntos y el bajo 237 | Agencia de Calidad (2024)
hito 2015–2024 | La segregación baja un 35 %, pero el financiamiento compartido sigue en el 20 % de la matrícula | Valenzuela et al. (2025)
` },
{ id: 'construccionismo', cap: '4. Marco teórico', pag: '42', titulo: 'Ciclo construccionista', plantilla: 'ciclo', prioridad: 'media', texto:
`nombre construccionismo
color rojo

centro Aprender construyendo | Papert (1980) en Blikstein (2013)
paso Diseño | el estudiante crea un producto público
paso Falla | el error es información útil
paso Rediseño | ajustar y volver a intentar
` },
// ── 5. Estado de la cuestión ──
{ id: 'estado-cuestion', cap: '5. Estado de la cuestión', pag: '47–49', titulo: 'Aportes de tres tesis', plantilla: 'convergencia', prioridad: 'alta', revisar: true, texto:
`nombre estado-cuestion
color rojo
prefijo Tesis

referente Stgo. Makerspace | Weinstein (2016), Universidad de Chile
  * La lógica maker no depende de infraestructura especializada
  * Aprendizaje situado y horizontal
  - Los makerspaces se concentran en Santiago
referente Juegos de hormigón para la primera infancia | Cifuentes Muñoz (2025), Universidad de Chile
  * Diseñar desde el diagnóstico en terreno
  - Pedagogías Pikler y Montessori
  - Plazas de La Pintana
referente Pertenencia en la escuela | Canales Escobar y Peña Torres (2014), PUCV
  * La pertenencia se construye desde los vínculos
  * El aula como territorio de pertenencia
  - 23 % de los dibujos muestra infraestructura y no vínculos

destino Sala Maker | Taller de tres sesiones en la sala de clases | verde
` },
// ── 6. Estado del arte ──
{ id: 'estado-arte', cap: '6. Estado del arte', pag: '51–53', titulo: 'Estado del arte comparado', plantilla: 'matriz', prioridad: 'media', revisar: true, texto:
`nombre estado-arte
color rojo

encabezado Ocurre en el aula | Aprender haciendo | Fabricación digital | Deja recursos | Educación pública
fila Gracias Profe | si | si | no | si | ?
fila Museo Taller | si | si | no | si | ?
fila Red NodoLab | si | si | si | si | si
fila Sala Maker * | si | si | si | si | si
` },
// ── 7. Diseño metodológico ──
{ id: 'argumento', cap: '7. Diseño metodológico', pag: '55–61', titulo: 'Cadena del argumento', plantilla: 'cadena', prioridad: 'alta', texto:
`nombre argumento
color rojo

eslabon Problemática | Los métodos memorísticos no cierran la brecha de resultados entre grupos socioeconómicos: la mantienen.
eslabon Oportunidad | La cultura DIY permite aprender haciendo sin necesitar un Fab Lab.
eslabon Justificación | La fabricación digital obliga a decidir, anticipar errores, ajustar y volver a intentar.
eslabon Hipótesis | Un recurso pedagógico maker contribuye a las metodologías de enseñanza sin infraestructura especializada.
eslabon Pregunta | ¿Puede el diseño de un recurso pedagógico maker integrar metodologías activas en el aula municipal?
` },
{ id: 'objetivos', cap: '7. Diseño metodológico', pag: '62', titulo: 'Objetivos y etapas', plantilla: 'arbol', prioridad: 'alta', revisar: true, texto:
`nombre objetivos
color rojo
prefijo Específico

raiz Objetivo general | Implementar un recurso pedagógico maker que proponga metodologías activas de aprendizaje, mediante un taller de tres sesiones en un quinto básico municipal.
hijo Analizar | Las metodologías de enseñanza de la educación básica municipal, para definir criterios del taller. | Etapa 01 · Investigación
hijo Definir | Los recursos pedagógicos y de fabricación digital, en una secuencia de sesiones con narrativa. | Etapas 03 y 05 · Planificación y desarrollo
hijo Implementar | El taller en un quinto básico, como primera experiencia con la fabricación digital. | Etapa 06 · Implementación
hijo Identificar mejoras | A partir de lo observado y de la conversación con docentes, para proyectar el taller. | Etapa 07 · Análisis y proyección
` },
{ id: 'dos-dimensiones', cap: '7. Diseño metodológico', pag: '59', titulo: 'El diseño en dos dimensiones', plantilla: 'tablaT', prioridad: 'media', texto:
`nombre dos-dimensiones
color rojo
titulo El diseño aporta desde dos dimensiones

columna Mediador de experiencias
  - Taller: organiza las sesiones, los materiales y el tiempo.
  - Narrativa: la historia de Michi da continuidad al proceso.
  - De escuchar a proponer: los estudiantes identifican problemas de su sala.
columna Mundo objetual
  - Implementos fabricados para la sala.
  - Proyectos con Arduino como resultado tangible.
  - Quedan en la sala: el docente los sigue usando en sus clases.
` },
{ id: 'transmision', cap: '7. Diseño metodológico', pag: '55', titulo: 'Ciclo de la transmisión', plantilla: 'ciclo', prioridad: 'baja', texto:
`nombre transmision
color rojo

centro Enseñanza por transmisión | Freire (1970)
paso El docente habla
paso El estudiante escucha
paso Memoriza
paso Repite
` },
// ── 8. Descripción del proyecto ──
{ id: 'preguntas', cap: '8. Descripción del proyecto', pag: '65–66', titulo: 'Qué, por qué, cómo, para qué, cuándo y dónde', plantilla: 'cuadrantes', prioridad: 'media', texto:
`nombre preguntas
color rosado
columnas 2

bloque ¿Qué?
  texto Taller maker de tres sesiones para educación básica municipal, que usa la sala de clases como espacio de aprendizaje y desarrolla proyectos con Arduino.
bloque ¿Por qué?
  texto Porque la educación básica municipal sigue enseñando desde la transmisión; la fabricación digital puede entrar a la sala como recurso pedagógico.
bloque ¿Cómo?
  texto Tres sesiones con una semana entre cada una, unidas por la historia de un gatito perdido. El trabajo escala de lo individual a duplas y a grupos.
bloque ¿Para qué?
  texto Para que los estudiantes aprendan haciendo, la fabricación digital deje de ser lejana y se fortalezca el sentido de pertenencia con su sala.
bloque ¿Cuándo y dónde? | 2
  texto Sala del 5° A del Colegio Maipo, Puente Alto, en horario de clases, entre octubre y noviembre de 2026.
` },
{ id: 'publico', cap: '8. Descripción del proyecto', pag: '67 · 128', titulo: 'Público objetivo', plantilla: 'anillos', prioridad: 'media', texto:
`nombre publico
color rosado

anillo Estudiantes | 5° básico, 9 a 10 años | directo
anillo Docentes | comparten la sala | directo
anillo Colegios municipales | municipios y SLEP | indirecto
anillo Familias | indirecto
` },
// ── 9. Diseño ──
{ id: 'entrevistas', cap: '9. Diseño', pag: '69–71', titulo: 'Hallazgos de las entrevistas', plantilla: 'convergencia', prioridad: 'alta', revisar: true, texto:
`nombre entrevistas
color azul
prefijo Entrevista

referente Belén Pedrero | Profesora diferencial, PIE, La Pintana
  * Aprenden mejor con juego o actividades significativas
  * Un resultado tangible aumenta el interés
  - El territorio afecta el aprendizaje
  * Faltan perfeccionamiento docente y recursos
referente Patricia Ramírez | Cofundadora de IdeoMaker
  * Un docente interesado gestiona todo
  * Diseño a la carta según edad, nivel y temática
  - Medir resultados con niños es un punto débil
referente Karen | Pendiente: la entrevista aún no está en la memoria
  - Completar con sus hallazgos

destino Sala Maker | Taller de tres sesiones en la sala de clases | verde
` },
{ id: 'metodologia', cap: '9. Diseño', pag: '77–79', titulo: 'Metodología en siete etapas', plantilla: 'etapas', prioridad: 'existe', texto: E.etapas },
{ id: 'referentes', cap: '9. Diseño', pag: '72–74', titulo: 'Factores rescatados de los referentes', plantilla: 'convergencia', prioridad: 'alta', revisar: true, texto: E.convergencia },
{ id: 'evolucion', cap: '9. Diseño', pag: '83 · 140', titulo: 'Evolución de la propuesta', plantilla: 'antes', prioridad: 'media', texto:
`nombre evolucion
color rojo

antes Idea inicial | Seminario
despues Proyecto de título | Sala Maker
par Un kit maker para acercar la fabricación digital al aula | Un taller de tres sesiones dentro de la sala
par Entregar un objeto | Construir una experiencia
par Protoboard | Placa diseñada para simplificar las conexiones
par Proyectos distintos por grupo | Todos los grupos sobre un mismo teclado con Arduino
` },
// ── 10. Iteraciones ──
{ id: 'iteraciones', cap: '10. Iteraciones', pag: '94–96', titulo: 'Línea de iteraciones', plantilla: 'linea', prioridad: 'media', revisar: true, texto:
`nombre iteraciones
color rojo

hito Antes de S1 | Reunión con Aarón: se revisa el taller y se ajustan las sesiones 1, 2 y 3
hito Idea | Diseñar una placa que reemplace la protoboard
hito Sesión 3 | Se reemplaza la protoboard de 400 puntos, que no tiene indicadores de positivo y negativo
hito Placa PCB | Todas las conexiones a tierra en un mismo lugar; fabricada en China
hito Pendiente | Conversación con Karen
` },
{ id: 'protoboard-placa', cap: '10. Iteraciones', pag: '95', titulo: 'De protoboard a placa', plantilla: 'antes', prioridad: 'media', texto:
`nombre protoboard-placa
color rojo

antes Protoboard | 400 puntos
despues Placa PCB | tierra común
par Sin indicadores de positivo y negativo | Todas las conexiones a tierra en un mismo lugar
par Difícil explicar cómo funcionan las conexiones | Conexión y explicación mucho más simples
` },
// ── 11. Implementación ──
{ id: 'vinculacion', cap: '11. Implementación', pag: '98', titulo: 'Vinculación con el Colegio Maipo', plantilla: 'cadena', prioridad: 'baja', texto:
`nombre vinculacion
color azul
prefijo no

eslabon Directora | Autoriza la implementación de Sala Maker.
eslabon Jefa de UTP | Define cómo el taller se integra al colegio.
eslabon 5° A | El curso y su profesora a cargo, en horario de clases.
eslabon Carta | La vinculación se formaliza con una carta de respaldo.
` },
{ id: 'recorrido', cap: '11. Implementación', pag: '102–103', titulo: 'Recorrido del taller', plantilla: 'recorrido', prioridad: 'existe', texto: E.recorrido },
{ id: 'ritmo', cap: '11. Implementación', pag: '105–115', titulo: 'Ritmo del taller', plantilla: 'tiempos', prioridad: 'alta', texto:
`nombre ritmo-taller
total 90

modalidad Todo el curso | azul
modalidad Individual | rosado
modalidad Duplas | amarillo
modalidad Grupal | verde

sesion Sesión 01 | Proponer
  momento El gato está perdido | 5 | Todo el curso
  momento ¿Qué es la fabricación digital? | 20 | Todo el curso
  momento Mi identificador | 20 | Individual
  momento Hoja de proyectos | 30 | Duplas
  momento Votación | 10 | Todo el curso
  momento Cierre | 5 | Todo el curso
sesion Sesión 02 | Construir
  momento Repaso | 10 | Todo el curso
  momento Entrega de proyectos | 5 | Todo el curso
  momento Armado del lapicero | 25 | Grupal
  momento Armado de clicker | 20 | Individual
  momento Colorear al perro | 25 | Individual
  momento Adelanto sesión 03 | 5 | Todo el curso
sesion Sesión 03 | Activar
  momento Componentes | 15 | Todo el curso
  momento Instructivo de conexión | 10 | Todo el curso
  momento Entrega de materiales | 5 | Grupal
  momento Armado del proyecto | 45 | Grupal
  momento Llega el gatito | 10 | Todo el curso
  momento Cierre | 5 | Todo el curso
` },
{ id: 'fabricado', cap: '11. Implementación', pag: '105–121', titulo: 'Qué se fabricó y con qué', plantilla: 'matriz', prioridad: 'alta', revisar: true, texto:
`nombre fabricado
color rojo

encabezado Impresión 3D | Corte láser | Electrónica
fila Pin identificador | si | si | no
fila Lapicero | si | si | no
fila Clicker | si | no | no
fila Perro Colo-Colo | no | si | no
fila Teclado musical | no | si | si
fila Michi | ? | ? | no
` },
{ id: 'laminas', cap: '11. Implementación', pag: '116–121', titulo: 'Láminas técnicas', plantilla: null, prioridad: 'baja', pendiente: 'Ya existen como renders en InDesign; rehacerlas requiere los modelos 3D.' },
// ── 12. Gestión ──
{ id: 'flujo-software', cap: '12. Gestión', pag: '122–123', titulo: 'Del software a la máquina', plantilla: 'flujo', prioridad: 'media', texto:
`nombre flujo-software
color rojo

etapas Diseño | Preparación | Máquina | Resultado
ruta Adobe Illustrator | Falcon Design Space | Cortadora láser | Placas del identificador y perro Colo-Colo en MDF
ruta Rhinoceros 8 | Creality Print | Impresora 3D | Base del identificador, lapicero y clicker en PLA
ruta KiCad | | Placa PCB | Esquemas de conexión: LEDs, botón y buzzer
ruta Arduino IDE | | Arduino | Código del teclado de la sesión 3
` },
{ id: 'costos', cap: '12. Gestión', pag: '126', titulo: 'Costos por sesión', plantilla: 'barras', prioridad: 'alta', texto: E.barras },
{ id: 'foda', cap: '12. Gestión', pag: '127', titulo: 'Análisis FODA', plantilla: 'cuadrantes', prioridad: 'existe', texto: E.cuadrantes },
{ id: 'canvas', cap: '12. Gestión', pag: '128', titulo: 'Modelo Canvas', plantilla: 'cuadrantes', prioridad: 'media', texto:
`nombre canvas
color rosado
columnas 5

bloque Socios clave
  texto Colegio Maipo, Mechatronic (proveedor de electrónica), Fab Labs y laboratorios universitarios, Universidad Diego Portales.
bloque Actividades y recursos clave
  - Actividades: diseño del taller, modelado y fabricación digital, diseño de la placa PCB, facilitación, testeo e iteración.
  - Recursos: diseño y fabricación digital, software, impresora 3D, cortadora láser, kits con Arduino y la narrativa de Michi.
bloque Propuesta de valor
  texto Taller maker de tres sesiones que acerca la fabricación digital y la electrónica básica a la sala de colegios municipales, sin necesidad de un Fab Lab.
bloque Relación y canales
  - Relación: acompañamiento directo, retroalimentación y recursos que quedan en la sala.
  - Canales: visitas a colegios, docentes y sostenedores, redes sociales y presentación de resultados.
bloque Segmentos
  - Directos: estudiantes de 5° básico municipal y sus docentes.
  - Indirectos: colegios municipales, sostenedores (municipios y SLEP) y familias.
bloque Estructura de costos | 3
  texto Materiales de fabricación (PLA, MDF, cartón), electrónica, placa PCB, láminas y tiempo de facilitación. $200.131 por curso, unos $6.065 por estudiante.
bloque Fuentes de financiamiento | 2
  texto Subvención Escolar Preferencial (SEP), presupuesto de sostenedores municipales y SLEP, fondos concursables y venta del taller a colegios.
` },
{ id: 'gantt', cap: '12. Gestión', pag: '124', titulo: 'Carta Gantt', plantilla: null, prioridad: 'media', pendiente: 'La Gantt es una captura de planilla: faltan las fechas de cada tarea en texto para rehacerla.' },
// ── Post taller ──
{ id: 'post-its', cap: 'Post taller', pag: '136', titulo: 'Lo que más les gustó', plantilla: null, prioridad: 'alta', pendiente: 'Falta el conteo de post-its por categoría (teclado, trabajo en grupo, Michi, objetos).' },
// ── 13. Conclusiones ──
{ id: 'conclusiones', cap: '13. Conclusiones', pag: '140', titulo: 'Limitaciones y proyecciones', plantilla: 'tablaT', prioridad: 'media', texto:
`nombre conclusiones
color rojo

columna Limitaciones
  - Un solo curso: una experiencia acotada a tres sesiones.
  - Depende de alguien externo que prepare los recursos y guíe a los estudiantes.
  - La escuela por sí sola no cuenta con las herramientas.
columna Proyecciones
  * Otros cursos y establecimientos: ajustar contenidos a distintos niveles.
  * Docentes que guían las sesiones.
  * Un ciclo más largo, con más trabajo en grupo.
  * Vínculo con laboratorios, universidades o Red NodoLab.
  * Financiamiento con la Subvención Escolar Preferencial.
` },
];
