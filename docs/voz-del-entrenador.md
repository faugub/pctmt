# La Voz del Entrenador — Documento Fundacional de pctmt

*Una guía de metodología de alto rendimiento para no perder el rumbo mientras seguimos construyendo.*

---

## Por qué existe este documento

pctmt no compite contra una hoja de cálculo. Compite contra el WhatsApp, la libreta de cuero y la memoria del coach. Para ganarle a eso, el software no puede sentirse como un sistema de gestión genérico con nombres de pádel pegados encima — tiene que sentirse como si lo hubiera diseñado alguien que entiende lo que realmente separa a un entrenador que forma jugadores de un entrenador que solo da clases.

Este documento no es una entrevista real ni cita textual de ningún entrenador. Es una síntesis de cómo trabajan públicamente algunos de los referentes del coaching de pádel de alto rendimiento — **Pablo Crosetti** (coach de Tapia, Libaak y Augsburger), **Gustavo Pratto** (coach de Coello/Tapia, formador de jugadores desde la base) y **Manu Martín** (formador de entrenadores, coach de elite del WPT) — traducida a principios de producto. La idea es tener una "voz de sabiduría" a la que volver cada vez que decidamos qué construir, para que cada feature se pregunte: *¿esto ayuda a un entrenador a pensar y decidir mejor, o solo le agrega una pantalla más?*

---

## Los tres pilares que tomamos prestados

### 1. Pablo Crosetti — "Lo que no se mide no se puede mejorar"

Crosetti es conocido públicamente por aplicar una mirada de medición y datos al trabajo de jugadores de élite — el título de una de sus entrevistas más conocidas es literalmente esa frase. Es el entrenador actual de la élite del pádel mundial y habla específicamente de cómo usa la medición en su trabajo diario.

Además, en su marco "El Pádel por Etapas" para formación de entrenadores, estructura la enseñanza sobre tres pilares: EQUIPO (el pádel es un deporte de equipos de dos), CABEZA (entendimiento del juego, autodisciplina, elegir bien los tiros) y CORAZÓN (el esfuerzo como valor).

**Lo que esto significa para pctmt:**
- Cada dato que pedimos guardar tiene que servir para *decidir algo después*, no para llenar un campo. Si un coach anota algo y nunca vuelve a mirarlo, esa pantalla está mal diseñada.
- El pádel se juega en pareja. Casi todo el software de coaching individual (fitness, tenis singles) está construido para una persona. pctmt necesita pensar en **la pareja como unidad de análisis**, no solo en el jugador suelto — cómo se complementan, quién cubre qué zona, cómo evoluciona la sociedad en el tiempo, no solo cada jugador por separado.
- "Elegir bien los tiros" es decisión, no técnica. Eso valida algo que ya intuimos: las estrategias y drills no deberían ser solo "qué golpe practicar" sino "qué decisión estamos entrenando" (¿bandeja o víbora? ¿globo o volea?).
- El esfuerzo (CORAZÓN) es un dato cualitativo legítimo. Un coach de alto rendimiento no solo registra resultado físico — registra actitud, constancia, cómo responde el jugador bajo presión. Eso debería tener un lugar en la ficha del jugador, no solo las métricas físicas.

### 2. Gustavo Pratto — Trayectoria, decisión y juego en paralelo

Pratto formó a Arturo Coello y Agustín Tapia, los número uno del mundo, y dirige una metodología que desde hace más de 20 años forma jugadores profesionales, abarcando desde menores hasta el circuito profesional. Su forma de pensar el juego es explícitamente sobre toma de decisión, no solo ejecución: uno de sus ejercicios documentados entrena al jugador a responder a una volea difícil tomando la mejor decisión posible entre un globo o una volea tensa. Y en cuanto a táctica, insiste en que el progreso real pasa por entender mejor el juego en paralelo — algo que casi nadie entrena de forma consciente porque siempre se practica en diagonal, ya que jugar en diagonal es algo natural y repetido miles de veces, mientras que jugar en paralelo casi nunca se practica deliberadamente, lo que deja a la mayoría de los jugadores con un juego incompleto.

**Lo que esto significa para pctmt:**
- Un coach que forma jugadores "desde la base hasta el profesional" piensa en **años**, no en sesiones sueltas. La ficha del jugador necesita una vista de trayectoria longitudinal — qué trabajamos hace 6 meses, qué cambió, qué seguimos sin resolver — no solo el snapshot de la última sesión.
- La distinción diagonal/paralelo es un ejemplo perfecto de algo que un coach de élite mide mentalmente pero que ningún software actual le ayuda a rastrear sistemáticamente. Si la librería de estrategias permite etiquetar conceptos tácticos concretos (paralelo, diagonal, transición, defensa, finalización), de repente el coach puede preguntar "¿cuánto venimos trabajando paralelo con este jugador?" — algo que hoy solo vive en su cabeza.
- Los drills no son intercambiables entre jugadores del mismo nivel. Un sistema de calidad debería permitir anotar *qué decisión específica* entrena cada ejercicio, para poder filtrar "ejercicios de decisión bajo presión" cuando un jugador tiene ese problema puntual, en vez de buscar por nombre de drill.

### 3. Manu Martín — La táctica al centro, la técnica a su servicio

Manu Martín entrena jugadores del WPT y, a través de su academia de formación de entrenadores, plantea un cambio de paradigma explícito: su metodología sitúa la táctica en el centro y la técnica al servicio del juego, lo que permite que los alumnos entiendan el pádel desde el primer día. Un dato igual de importante para nosotros: su método permite que todo un equipo de entrenadores unifique criterios y progresiones, hablando el mismo idioma táctico, lo que multiplica la autonomía de los jugadores.

**Lo que esto significa para pctmt:**
- Técnica al servicio de la táctica significa que el orden lógico en el software también debería ir de lo táctico a lo técnico, no al revés. Hoy una sesión se planifica como una lista de ejercicios; idealmente se planifica como un objetivo táctico que *se resuelve* con ciertos ejercicios.
- "Unificar criterios entre todo un equipo de entrenadores" es la versión profesional de un problema que Fau ya tiene en mente (coach asistente cubriendo una sesión, academia con más de un entrenador). Esto valida que vale la pena, más adelante, pensar en un **vocabulario táctico compartido** dentro de una cuenta — no para vender "multi-coach" como feature de monetización todavía, sino para que la estructura de datos no nos pinte en una esquina cuando llegue ese momento.
- Si la metodología en sí se puede certificar y enseñar, eso confirma que el conocimiento de un coach es un activo, no solo una actividad. pctmt podría, con el tiempo, convertirse en el lugar donde un coach **documenta su propia metodología** — no solo "qué hicimos hoy" sino "así es como yo enseño esto", reutilizable sesión tras sesión y jugador tras jugador.

---

## Síntesis: el patrón que se repite en los tres

A pesar de tener estilos distintos, los tres coinciden en algo que el software actual de pctmt todavía no refleja del todo:

1. **El dato existe para apoyar una decisión futura, no para documentar el pasado.** Si un campo de la base de datos no cambia ninguna decisión de coaching más adelante, probablemente no debería existir, o debería estar mejor conectado a algo que sí importa.
2. **La unidad de análisis en pádel es la pareja, no solo el individuo**, y el tiempo de análisis es la temporada o la carrera del jugador, no la sesión aislada.
3. **Todo gira alrededor de la decisión táctica**, y la técnica, la física y el resultado del torneo son consecuencias de esa decisión, no el centro de la historia.
4. **La metodología de un coach es personal y transferible.** Cuanto más pueda el sistema capturar *cómo piensa* ese coach específico (sus propios conceptos, su propio vocabulario táctico, su propia progresión), más insustituible se vuelve la herramienta para él.

---

## Cómo se traduce esto, módulo por módulo

**Jugadores / Fichas**
No alcanza con datos físicos y de contacto. Falta una vista de trayectoria temporal (qué trabajamos, qué cambió, hitos), y un lugar para lo cualitativo — actitud, autodisciplina, esfuerzo — junto a lo cuantitativo. La pareja (no solo el jugador suelto) debería poder tener su propia ficha de sociedad: cómo se complementan, qué patrones tácticos usan juntos, cómo evolucionó esa sociedad específica en el tiempo.

**Sesiones**
Una sesión debería poder anclarse a un objetivo táctico explícito (paralelo, transición, defensa, finalización), no solo a una lista de ejercicios. Eso permite, con el tiempo, responder "¿cuánto venimos trabajando X con este jugador en los últimos 3 meses?" sin que el coach tenga que recordarlo de memoria.

**Librería de estrategias y drills**
Hoy es básicamente texto libre con estructura de carpetas. El salto de calidad es un sistema de etiquetas tácticas (concepto: paralelo/diagonal/transición/red/fondo; tipo de decisión: técnica/táctica/bajo presión) que convierte la librería en algo filtrable y reutilizable de verdad, no solo un archivo de notas.

**Planes de entrenamiento por fases**
Ya existen las fases. Lo que falta es la conexión explícita entre "por qué hacemos esto hoy" y "en qué fase del plan estamos" — para que cualquier coach (incluso uno cubriendo una sesión que no es la suya) entienda el propósito sin tener que preguntar.

**Pizarra táctica**
Cada diagrama dibujado debería poder asociarse automáticamente al concepto táctico que representa y a la sesión/jugador correspondiente, para que en 3 meses se pueda recuperar "esto es lo que le mostré a Juan sobre el juego en paralelo en marzo" sin tener que buscarlo a mano.

**Torneos y competencias**
El resultado de un torneo es la consecuencia de decisiones tácticas, no un dato aislado. Vale la pena, a futuro, poder conectar un resultado de torneo con los conceptos tácticos que se venían trabajando antes de esa competencia — para cerrar el círculo entre lo que se entrenó y lo que pasó en cancha real.

**Dashboard y estadísticas**
Los gráficos actuales (asistencia, horas, físico) son operativos y están bien, pero son la superficie. El siguiente nivel es mostrarle al coach patrones de decisión y evolución táctica, no solo cantidad de actividad.

---

## Preguntas heurísticas para cualquier feature nueva

Antes de construir algo nuevo, vale la pena pasarlo por estos filtros — son la versión resumida de todo lo anterior:

- ¿Esto ayuda al coach a tomar una mejor decisión la próxima vez que ve a este jugador, o solo agrega una pantalla más para llenar?
- ¿Esto piensa en la pareja, o solo en el jugador individual?
- ¿Esto sirve en el momento (en cancha, con el celular en la mano entre pelota y pelota), o solo sirve después, sentado en la computadora?
- ¿Esto ayuda a construir la metodología propia del coach, o lo obliga a usar la nuestra?
- ¿Esto resiste el paso del tiempo — sigue siendo útil dentro de 6 meses, o es una foto de un solo momento?

---

## Glosario táctico de base (semilla para etiquetas y taxonomía futura)

Esta lista no pretende ser exhaustiva ni reemplazar el vocabulario propio de cada coach — es un punto de partida razonable para que el sistema de etiquetas tácticas en estrategias y drills tenga estructura desde el día uno:

- **Juego en diagonal** — el patrón de juego más natural y repetido; intercambio cruzado entre jugadores.
- **Juego en paralelo** — patrón menos practicado conscientemente; intercambio entre jugadores del mismo lado de la cancha.
- **Transición** — el momento de pasar de defensa (fondo de pista) a ataque (red), y viceversa.
- **Defensa en el medio / defensa acorralada** — patrones para salir de una posición incómoda en el fondo de la cancha.
- **Finalización en la red** — decisiones de cierre de punto: bandeja, víbora, remate, bajada de pared.
- **Toma de decisión bajo presión** — drills diseñados específicamente para entrenar la elección (no la ejecución) de un golpe en una situación límite.
- **Juego de globo** — uso del globo como herramienta táctica, no solo defensiva.
- **Comunicación de pareja** — patrones de cobertura, cambios de posición y entendimiento entre los dos jugadores.

Esta lista debería crecer con el uso real — cada vez que un coach (empezando por Fau) necesite un concepto que no está en la lista, ese es la señal de que hay que agregarlo, no de que el sistema está incompleto.

---

## Cómo usar este documento

Esto no es una especificación técnica ni un backlog. Es la brújula. Cuando estemos decidiendo entre dos features, o entre construir algo rápido versus construirlo bien, este documento es al que volvemos para preguntarnos si la decisión técnica está al servicio de cómo piensa realmente un entrenador de alto rendimiento — o si solo estamos agregando más pantallas a un sistema de gestión genérico.

Es un documento vivo. A medida que Fau use el producto en cancha real y aparezcan más matices de su propia metodología, esta guía debería actualizarse — el objetivo final no es parecerse a Crosetti, Pratto o Manu Martín, sino que pctmt termine reflejando la metodología propia de Fau con la misma profundidad con la que estos referentes reflejan la suya.
