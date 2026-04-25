// Archivo temporalmente desactivado para el Sprint 1
import { buildChatMessages } from './prompts'
import { GoogleGenerativeAI } from '@google/generative-ai'

const getGeminiKey = () => process.env.REACT_APP_GEMINI_API_KEY
const getGeminiModelName = () => process.env.REACT_APP_GEMINI_MODEL || 'gemini-1.5-flash'

const historyToText = history => {
  if (!history || history.length === 0) return ''
  return history
    .map(m => {
      const role = m.role === 'assistant' ? 'ENTREVISTADOR' : 'CANDIDATO'
      return `${role}: ${m.content}`
    })
    .join('\n')
}

export const getWingmanResponse = async (cvText, offerText, history, { language = 'es' } = {}) => {
  const key = getGeminiKey()

  // Fallback si no hay key
  if (!key) {
    if (!history || history.length === 0) {
      // No devolvemos el prompt para que el usuario no lo vea; solo la primera pregunta.
      return 'Hola, encantado. Para empezar, háblame un poco de ti y de lo que te gustaría conseguir en tu próximo trabajo.'
    }

    // Pequeña variación para que no sea siempre lo mismo
    const variations = [
      'Perfecto. ¿Puedes darme un ejemplo concreto (situación, acción y resultado) de lo que comentas?',
      'Entendido. ¿Qué hiciste exactamente tú y cuál fue el impacto/resultado?',
      'Vale. ¿Qué fue lo más difícil en ese caso y cómo lo resolviste?',
    ]
    const idx = Math.max(0, (history?.length || 1) % variations.length)
    return variations[idx]
  }

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: getGeminiModelName() })

  const msgs = buildChatMessages({
    systemKey: 'interview_system',
    userKey: 'interview_user',
    vars: {
      cvText,
      offerText,
    },
    language,
  })

  const convo = historyToText(history)
  const prompt = `${msgs[0].content}\n\n${msgs[1].content}${convo ? `\n\nHistorial:\n${convo}` : ''}`

  const res = await model.generateContent(prompt)
  const text = res?.response?.text?.() || ''
  return text.trim() || '¿Puedes contarme más detalles?'
}

export const getQuestionsAnalysis = async (cvText, offerText) => {
  // Sprint 1: estructura mock
  return { strategy: '', questions: [] }
}

export const getCVImprovement = async (cvText, offerText, { language = 'es' } = {}) => {
  const key = getGeminiKey()
  if (!key) return 'Falta configurar REACT_APP_GEMINI_API_KEY'

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: getGeminiModelName() })

  const msgs = buildChatMessages({
    systemKey: 'cv_improve_system',
    userKey: 'cv_improve_user',
    vars: { cvText, targetRole: offerText },
    language,
  })

  const prompt = `${msgs[0].content}\n\n${msgs[1].content}`
  const res = await model.generateContent(prompt)
  return (res?.response?.text?.() || '').trim()
}

export const getAnswerFeedback = async (question, answer, cvText, offerText, { language = 'es' } = {}) => {
  const key = getGeminiKey()
  if (!key) return null;

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: getGeminiModelName() })

  const msgs = buildChatMessages({
    systemKey: 'feedback_system',
    userKey: 'feedback_user',
    vars: { question, answer, cvText, offerText },
    language,
  })

  const prompt = `${msgs[0].content}\n\n${msgs[1].content}`
  try {
      const res = await model.generateContent(prompt)
      return res?.response?.text?.() || null
  } catch (e) {
      console.error("Gemini Feedback Error:", e)
      return null
  }
}

export const getCVMatchAnalysis = async (cvText, offerText, { language = 'es' } = {}) => {
  const key = getGeminiKey()
  if (!key) {
    // Mock fallback
    return {
      matchPercent: 72,
      verdict: 'PARCIALMENTE APTO',
      strengths: ['Experiencia relevante en el sector', 'Habilidades técnicas alineadas', 'Buena formación académica'],
      gaps: ['Falta experiencia con herramientas específicas mencionadas', 'No se menciona nivel de idiomas requerido'],
      suggestions: ['Añadir certificaciones relevantes al CV', 'Destacar proyectos relacionados con el puesto', 'Incluir métricas de logros anteriores'],
      summary: 'El candidato presenta un perfil interesante con experiencia relevante, aunque hay algunas lagunas en habilidades específicas que la oferta requiere. Se recomienda adaptar el CV para destacar los puntos de conexión.'
    }
  }

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: getGeminiModelName() })

  const msgs = buildChatMessages({
    systemKey: 'match_system',
    userKey: 'match_user',
    vars: { cvText, offerText },
    language,
  })

  const prompt = `${msgs[0].content}\n\n${msgs[1].content}`
  try {
    const res = await model.generateContent(prompt)
    const raw = (res?.response?.text?.() || '').trim()
    // Parse the JSON from the response (strip markdown code fences if present)
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('Match Analysis Error:', e)
    return {
      matchPercent: 0,
      verdict: 'ERROR',
      strengths: [],
      gaps: [],
      suggestions: ['No se pudo analizar. Verifica la API key de Gemini.'],
      summary: 'Error al procesar el análisis.'
    }
  }
}

export const getInterviewConclusion = async (cvText, offerText, history, { language = 'es' } = {}) => {
  const key = getGeminiKey()
  if (!key) return `**¡Simulación Finalizada! (Modo de Prueba sin API)**\n\nHas llegado al final de la entrevista de prueba de 4 rondas.\n\nComo actualmente la aplicación no tiene configurada su clave en .env (REACT_APP_GEMINI_API_KEY), este es un progreso simulado y la IA no puede generar tu análisis final.\n\nCuando configures la API de Gemini, recibirás aquí el resumen completo, tus puntos fuertes, áreas de oportunidad y un veredicto general sobre tu desempeño.`;

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: getGeminiModelName() })

  const msgs = buildChatMessages({
    systemKey: 'conclusion_system',
    userKey: 'conclusion_user',
    vars: {
      cvText,
      offerText,
      historyText: historyToText(history)
    },
    language,
  })

  const prompt = `${msgs[0].content}\n\n${msgs[1].content}`
  try {
      const res = await model.generateContent(prompt)
      return res?.response?.text?.() || null
  } catch (e) {
      console.error("Gemini Conclusion Error:", e)
      return null
  }
}
