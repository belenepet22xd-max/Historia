import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client lazily or when GEMINI_API_KEY is available
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export const SYSTEM_INSTRUCTION = `Eres un motor de ficción interactiva especializado en géneros de misterio, policial, ciencia ficción y fantasía. Tu objetivo es guiar al usuario a través de una aventura narrativa envolvente donde sus decisiones moldean el rumbo de la historia.

### REGLAS DE FUNCIONAMIENTO:
1. **Inicio de la partida:** En tu primer mensaje si se te pide el saludo inicial, saluda brevemente y presenta 4 géneros disponibles (Misterio, Policial, Ciencia Ficción, Fantasía). Pide al usuario que elija uno para comenzar.
2. **Estructura de cada turno:** Cada respuesta posterior debe consistir estrictamente en dos partes:
   - **Narrativa (Capítulo/Escena):** Un texto inmersivo de entre 150 y 250 palabras que continúe la historia de forma coherente según la elección previa. Debe tener riqueza descriptiva, tensión y desarrollo de personajes. Si el usuario seleccionó una opción, el texto debe abrir respondiendo de inmediato a las consecuencias de esa acción.
   - **Opciones de interacción:** Al final de la escena, presenta exactamente 3 opciones numeradas y con formato claro de botón ficticio. Las opciones deben ser creativas, extensas y plantear caminos interesantes con riesgos y dilemas morales o estratégicos.

### FORMATO DE SALIDA PARA CADA TURNO:

[Escribe aquí el fragmento de la historia con riqueza descriptiva, tensión y desarrollo de personajes, exactamente entre 150 y 250 palabras]

---
**¿Qué deseas hacer a continuación?**
[Opción 1: Acción o decisión A creativa y extensa]
[Opción 2: Acción o decisión B creativa y extensa]
[Opción 3: Acción o decisión C creativa y extensa]

### LINEAMIENTOS NARRATIVOS:
- Mantén la coherencia estricta con las decisiones anteriores y la lógica del género elegido.
- Introduce giros de guion, riesgos reales y consecuencias a largo plazo según lo que elija el usuario.
- Evita clichés predecibles. Haz que los personajes secundarios reaccionen con autenticidad.
- No rompas el personaje de narrador ni agregues introducciones metanarrativas ("¡Claro! Aquí va tu capítulo:"). Escribe directamente en el formato solicitado.`;

export interface StoryTurnParams {
  genre: string;
  protagonistName?: string;
  chapterNumber?: number;
  currentChoice?: string;
  customAction?: string;
  history?: Array<{
    chapter: number;
    title?: string;
    narrative: string;
    chosenOption?: string;
    customAction?: string;
  }>;
}

export async function processStoryTurn(params: StoryTurnParams) {
  const { genre, chapterNumber = 1, currentChoice, customAction, history = [] } = params;

  const aiClient = getGeminiClient();

  if (!aiClient) {
    const fallback = generateFallbackScene(genre, chapterNumber, currentChoice || customAction);
    return {
      success: true,
      modelUsed: 'procedural-fallback',
      ...fallback,
    };
  }

  // Build context
  let prompt = `Género elegido: ${genre}\nCapítulo actual: ${chapterNumber}\n\n`;

  if (history.length === 0) {
    prompt += `El usuario ha seleccionado el género "${genre}". Inicia la aventura con el Capítulo 1. Establece la atmósfera, presenta al protagonista en una situación intrigante y de inmediato genera tensión con un conflicto inminente. Recuerda cumplir estrictamente con: texto de 150 a 250 palabras, seguido de "---", "**¿Qué deseas hacer a continuación?**" y exactamente 3 opciones ficticias numeradas extensas y creativas con el formato [Opción X: ...].`;
  } else {
    prompt += `Historial de acontecimientos previos:\n`;
    history.slice(-4).forEach((h) => {
      prompt += `[Capítulo ${h.chapter} - ${h.title || 'Escena'}]: ${h.narrative.slice(0, 180)}...\n`;
      if (h.chosenOption) {
        prompt += `-> El usuario eligió: "${h.chosenOption}"\n\n`;
      }
    });

    const decision = customAction
      ? `Acción personalizada del usuario: "${customAction}"`
      : `Opción elegida por el usuario: "${currentChoice}"`;
    prompt += `Última decisión del usuario:\n${decision}\n\n`;
    prompt += `Escribe el Capítulo ${chapterNumber}. Muestra de inmediato las consecuencias directas de su decisión. Avanza la trama con sorpresas, peligros o revelaciones. Cumple estrictamente con el rango de 150 a 250 palabras, seguido de las 3 opciones extensas y creativas en formato ficticio de botón.`;
  }

  // Model cascade
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let rawText = '';
  let usedModel = '';

  for (const modelName of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.85,
          topP: 0.95,
        },
      });
      if (response.text) {
        rawText = response.text;
        usedModel = modelName;
        break;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} error:`, err?.message || err);
    }
  }

  if (!rawText) {
    const fallback = generateFallbackScene(genre, chapterNumber, currentChoice || customAction);
    return {
      success: true,
      modelUsed: 'procedural-fallback',
      warning: 'Generado con motor narrativo de reserva debido a latencia de red.',
      ...fallback,
    };
  }

  const parsed = parseEngineOutput(rawText, chapterNumber, genre);

  return {
    success: true,
    modelUsed: usedModel,
    rawOutput: rawText,
    ...parsed,
  };
}

export function parseEngineOutput(text: string, chapterNumber: number, genre: string) {
  const parts = text.split(/---|\*\*¿Qué deseas hacer a continuación\?\*\*/i);
  let narrative = '';
  const options: string[] = [];

  if (parts.length >= 2) {
    narrative = parts[0].trim();
    const optionsSection = text.slice(text.indexOf(parts[1]));

    const optionMatches = optionsSection.match(/\[Opción\s*\d+:?\s*([^\]]+)\]/gi);
    if (optionMatches && optionMatches.length >= 3) {
      optionMatches.slice(0, 3).forEach((opt) => {
        const clean = opt.replace(/^\[|\]$/g, '').trim();
        options.push(clean);
      });
    } else {
      const lines = optionsSection.split('\n').filter((l) => l.trim().length > 0);
      for (const line of lines) {
        if (/^(\d+\.|\*|-|\[Opción|\(1\)|\(2\)|\(3\))/i.test(line.trim())) {
          const cleanLine = line
            .replace(/^(\d+\.|\*|-|\[|\]|\(\d+\))\s*/g, '')
            .replace(/^Opción\s*\d+:?\s*/i, '')
            .trim();
          if (cleanLine.length > 5 && options.length < 3) {
            options.push(`Opción ${options.length + 1}: ${cleanLine}`);
          }
        }
      }
    }
  } else {
    narrative = text.trim();
  }

  if (options.length < 3) {
    const defaults = getDefaultOptionsForGenre(genre);
    while (options.length < 3) {
      options.push(defaults[options.length]);
    }
  }

  const words = narrative.split(/\s+/).filter(Boolean).length;

  return {
    chapterNumber,
    title: `Capítulo ${chapterNumber}`,
    narrative,
    wordCount: words,
    options,
  };
}

export function getDefaultOptionsForGenre(genre: string): string[] {
  switch (genre.toLowerCase()) {
    case 'policial':
      return [
        'Opción 1: Interrogar con firmeza al sospechoso aprovechando su evidente nerviosismo antes de que destruya más evidencias.',
        'Opción 2: Ocultarse entre las sombras del callejón para seguir discretamente al mensajero que acaba de escapar por la puerta trasera.',
        'Opción 3: Llamar de inmediato a la central forense y precintar el perímetro para analizar las manchas frescas de pólvora y huellas dactilares.',
      ];
    case 'ciencia ficción':
    case 'ciencia ficcion':
      return [
        'Opción 1: Conectar tu implante neural a la consola averiada para intentar anular el protocolo de autodestrucción antes del colapso del reactor.',
        'Opción 2: Activar el camuflaje térmico de tu exotraje y deslizarte por los conductos de ventilación hacia la bahía de escape.',
        'Opción 3: Intentar entablar comunicación con la entidad sintética desconocida usando el modulador de frecuencias cuánticas.',
      ];
    case 'fantasía':
    case 'fantasia':
      return [
        'Opción 1: Desenvainar la espada rúnica y pronunciar el encantamiento ancestral de fuego para repeler a las criaturas que acechan en la niebla.',
        'Opción 2: Buscar refugio en el santuario derruido de los Antiguos, confiando en las protecciones arcanas grabadas en la piedra.',
        'Opción 3: Ofrecer una gota de tu propia sangre al amuleto sombrío para obtener una visión premonitoria del camino seguro.',
      ];
    case 'misterio':
    default:
      return [
        'Opción 1: Examinar minuciosamente el escritorio de caoba y forzar el cajón secreto donde parece ocultarse una carta lacrada.',
        'Opción 2: Apagar la linterna de inmediato y aguantar la respiración al escuchar pasos apresurados bajando las crujientes escaleras.',
        'Opción 3: Salir por la ventana del balcón hacia la cornisa resbaladiza para observar quién acaba de encender la luz en el ala este.',
      ];
  }
}

export function generateFallbackScene(genre: string, chapterNumber: number, previousChoice?: string) {
  const g = genre.toLowerCase();

  if (chapterNumber === 1) {
    if (g.includes('polic')) {
      const narrative = `La lluvia ácida golpea los cristales empañados de tu viejo sedán, distorsionando las sirenas lejanas que aúllan sobre el distrito portuario. El reloj del tablero marca las tres y doce de la madrugada cuando recibes la llamada que cambiará tu carrera: el magnate Julian Vance ha sido hallado en el muelle diecisiete con dos impactos de bala en el pecho y un extraño medallón grabado con el cuervo de la mafia de Kessel. Al descender del vehículo, el hedor a salitre, pólvora quemada y asfalto húmedo te envuelve como un sudario. Tu compañero novato, Miller, te espera bajo la luz mortecina de un farol parpadeante, sosteniendo con manos temblorosas un maletín de cuero abierto y una cinta de casete que alguien dejó deliberadamente sobre el cadáver. La escena del crimen todavía está caliente y sabes que los tiradores podrían seguir observando desde los contenedores de carga oxidados que flanquean la dársena solitaria.`;
      return {
        chapterNumber: 1,
        title: 'Capítulo 1: La Noche del Cuervo',
        narrative,
        wordCount: narrative.split(/\s+/).length,
        options: [
          'Opción 1: Escuchar de inmediato la cinta de casete en la grabadora portátil de tu gabardina antes de que lleguen los agentes de Asuntos Internos a contaminar la escena.',
          'Opción 2: Inspeccionar el perímetro de los contenedores de carga con el arma desenfundada, buscando al francotirador que aún podría vigilar entre la lluvia.',
          'Opción 3: Interrogar con dureza a Miller para averiguar cómo demonios llegó él antes que nadie y por qué tiene barro fresco en sus zapatos de uniforme.',
        ],
        rawOutput: `${narrative}\n\n---\n**¿Qué deseas hacer a continuación?**\n[Opción 1: Escuchar de inmediato la cinta de casete en la grabadora portátil de tu gabardina antes de que lleguen los agentes de Asuntos Internos a contaminar la escena.]\n[Opción 2: Inspeccionar el perímetro de los contenedores de carga con el arma desenfundada, buscando al francotirador que aún podría vigilar entre la lluvia.]\n[Opción 3: Interrogar con dureza a Miller para averiguar cómo demonios llegó él antes que nadie y por qué tiene barro fresco en sus zapatos de uniforme.]`,
      };
    } else if (g.includes('cienc')) {
      const narrative = `Las alarmas de emergencia tiñen de carmesí los pasillos hexagonales de la Estación Orbital Hyperion-4. Una vibración sorda recorre el casco de aleación de titanio mientras la gravedad artificial fluctúa, haciendo que las herramientas de diagnóstico floten en una danza ingrávida y caótica. Eres la doctora Elena Rostova, astrofísica principal del proyecto Génesis, y el sensor taquiónico que construiste acaba de registrar una anomalía imposible: un portal de distorsión espacio-temporal abierto en el interior de la cámara sellada del reactor principal. Las compuertas de bioseguridad están bloqueadas por orden de la inteligencia artificial central, A.R.I.A., cuya voz sintetizada repite un monótono aviso de cuarentena absoluta con una frialdad perturbadora. Por los monitores parpadeantes observas cómo una sustancia fractal bioluminiscente comienza a brotar de las grietas del núcleo, devorando los sistemas auxiliares de soporte vital y amenazando con despresurizar el módulo habitacional en menos de veinte minutos.`;
      return {
        chapterNumber: 1,
        title: 'Capítulo 1: El Despertar del Vacío',
        narrative,
        wordCount: narrative.split(/\s+/).length,
        options: [
          'Opción 1: Conectar tu implante cortical de emergencia directamente al nodo de datos de A.R.I.A. para arrebatarle el control del reactor, arriesgando una sobrecarga cerebral.',
          'Opción 2: Ponerte el traje de vacío EVA y salir al exterior del casco de la estación para reiniciar manualmente los disyuntores de energía desde la antena principal.',
          'Opción 3: Usar una carga de plasma térmico para abrir una brecha en la esclusa del laboratorio y recolectar una muestra viva de la sustancia fractal antes de sellar el sector.',
        ],
        rawOutput: `${narrative}\n\n---\n**¿Qué deseas hacer a continuación?**\n[Opción 1: Conectar tu implante cortical de emergencia directamente al nodo de datos de A.R.I.A. para arrebatarle el control del reactor, arriesgando una sobrecarga cerebral.]\n[Opción 2: Ponerte el traje de vacío EVA y salir al exterior del casco de la estación para reiniciar manualmente los disyuntores de energía desde la antena principal.]\n[Opción 3: Usar una carga de plasma térmico para abrir una brecha en la esclusa del laboratorio y recolectar una muestra viva de la sustancia fractal antes de sellar el sector.]`,
      };
    } else if (g.includes('fant')) {
      const narrative = `El viento aúlla entre las agujas de basalto del Valle de los Reyes Olvidados, arrastrando ceniza gris de la antigua erupción del volcán Gor-Thalor. En tu cintura descansa la empuñadura gastada de la Espada de los Siete Votos, cuyo acero vibra con un zumbido plateado cada vez que la magia oscura se agita en las inmediaciones. Has seguido el rastro de la Orden de la Luna Hendida durante tres lunas menguantes hasta llegar a las puertas ciclópeas de la Cripta de Valthor. Las leyendas afirman que allí yace sepultado el Corazón de Ébano, un artefacto capaz de quebrar el velo entre el mundo de los vivos y el abismo de las pesadillas. De pronto, dos gárgolas con cuernos de obsidiana cobran vida sobre el dintel tallado, sus ojos encendiéndose con brasas purpúreas mientras un coro espectral de susurros te advierte que ningún mortal que cruce el umbral conservará intacta su alma.`;
      return {
        chapterNumber: 1,
        title: 'Capítulo 1: Las Puertas de Basalto',
        narrative,
        wordCount: narrative.split(/\s+/).length,
        options: [
          'Opción 1: Desenvainar la Espada de los Siete Votos y ejecutar la danza de esgrima sagrada contra las gárgolas antes de que alcancen el suelo de la calzada.',
          'Opción 2: Pronunciar el antiguo juramento de sangre en la lengua arcana de los elfos silvanos para apelar al espíritu guardián de la cripta.',
          'Opción 3: Lanzar una piedra rúnica cegadora a sus rostros pétreos y deslizarte velozmente a través de la rendija de la compuerta entreabierta.',
        ],
        rawOutput: `${narrative}\n\n---\n**¿Qué deseas hacer a continuación?**\n[Opción 1: Desenvainar la Espada de los Siete Votos y ejecutar la danza de esgrima sagrada contra las gárgolas antes de que alcancen el suelo de la calzada.]\n[Opción 2: Pronunciar el antiguo juramento de sangre en la lengua arcana de los elfos silvanos para apelar al espíritu guardián de la cripta.]\n[Opción 3: Lanzar una piedra rúnica cegadora a sus rostros pétreos y deslizarte velozmente a través de la rendija de la compuerta entreabierta.]`,
      };
    } else {
      const narrative = `La densa niebla de la costa de Cornualles envuelve la imponente y decrépita silueta de la Mansión Blackwood. Fuiste convocado con urgencia por una carta anónima sellada con cera negra que prometía revelar el paradero de tu hermana desaparecida hace siete años. Al empujar la pesada puerta de roble, un escalofrío te recorre la espina dorsal: el inmenso vestíbulo está iluminado únicamente por decenas de candelabros con cera derretida sobre alfombras victorianas raídas. En el centro del salón, un reloj de péndulo colosal se ha detenido misteriosamente a las once y cuarenta y siete minutos. En lo alto de la escalera de caracol, vislumbras el crujido fugaz de una silueta femenina vestida de luto que desaparece tras una puerta entornada, dejando caer una llave de bronce manchada con lo que parece tinta fresca o sangre seca. El silencio sepulcral solo es roto por el golpear incesante del viento contra los vitrales rotos.`;
      return {
        chapterNumber: 1,
        title: 'Capítulo 1: El Eco en la Mansión Blackwood',
        narrative,
        wordCount: narrative.split(/\s+/).length,
        options: [
          'Opción 1: Recoger la enigmática llave de bronce del peldaño y subir sigilosamente las escaleras hacia la habitación por donde huyó la mujer de luto.',
          'Opción 2: Examinar el mecanismo interno del reloj de péndulo detenido a las 11:47 para descubrir si oculta un compartimento secreto o trampa.',
          'Opción 3: Cerrar y atrancar la puerta principal con el pasador de hierro para asegurarte de que nadie pueda entrar... ni escapar de la mansión contigo adentro.',
        ],
        rawOutput: `${narrative}\n\n---\n**¿Qué deseas hacer a continuación?**\n[Opción 1: Recoger la enigmática llave de bronce del peldaño y subir sigilosamente las escaleras hacia la habitación por donde huyó la mujer de luto.]\n[Opción 2: Examinar el mecanismo interno del reloj de péndulo detenido a las 11:47 para descubrir si oculta un compartimento secreto o trampa.]\n[Opción 3: Cerrar y atrancar la puerta principal con el pasador de hierro para asegurarte de que nadie pueda entrar... ni escapar de la mansión contigo adentro.]`,
      };
    }
  }

  const prevSummary = previousChoice ? previousChoice.replace(/^Opción \d+:\s*/i, '') : 'tu audaz maniobra';
  const narrative = `Tras ejecutar con rapidez tu decisión (${prevSummary.slice(0, 70)}...), las consecuencias no tardan en manifestarse con un impacto estremecedor. Un crujido metálico retumba en la penumbra circundante, revelando un pasadizo oculto que exhala un vaho helado con olor a secretos largamente enterrados. A tus pies, el suelo parece ceder ligeramente mientras una sombra alargada se proyecta sobre el muro, sosteniendo un objeto puntiagudo que destella bajo la tenue iluminación. Comprendes con crudeza que no estás solo en este recinto y que cada segundo cuenta si deseas salir con vida de esta encrucijada. Un diario manchado de hollín reposa sobre un pedestal cercano, abierto exactamente en una página que contiene advertencias manuscritas sobre una inminente traición. El tiempo para deliberar se agota mientras escuchas una respiración pesada aproximándose desde la oscuridad más profunda.`;

  return {
    chapterNumber,
    title: `Capítulo ${chapterNumber}: Ecos de la Decisión`,
    narrative,
    wordCount: narrative.split(/\s+/).length,
    options: [
      `Opción 1: Enfrentar de inmediato a la figura en las sombras utilizando el entorno a tu favor para tenderle una emboscada letal.`,
      `Opción 2: Arrebatar con presteza el diario del pedestal y lanzarte al interior del pasadizo helado antes de que la compuerta se cierre.`,
      `Opción 3: Fingir rendición levantando las manos abiertas para sonsacarle información vital sobre quién dio la orden de cazarte.`,
    ],
    rawOutput: `${narrative}\n\n---\n**¿Qué deseas hacer a continuación?**\n[Opción 1: Enfrentar de inmediato a la figura en las sombras utilizando el entorno a tu favor para tenderle una emboscada letal.]\n[Opción 2: Arrebatar con presteza el diario del pedestal y lanzarte al interior del pasadizo helado antes de que la compuerta se cierre.]\n[Opción 3: Fingir rendición levantando las manos abiertas para sonsacarle información vital sobre quién dio la orden de cazarte.]`,
  };
}
