import { buildChatMessages } from './prompts.js'

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const fallbackFirstQuestion = ({ offerText } = {}) => {
  const generic = [
    'Hola, soy Wingman. Para empezar, ¿podrías presentarte brevemente y contarme qué estás buscando ahora mismo?',
    'Perfecto. ¿Cuál ha sido tu proyecto o experiencia más relevante y qué impacto tuvo?',
    'Empecemos fuerte: ¿qué logros destacarías de tu última experiencia laboral?',
  ]

  const offer = [
    'Genial. ¿Qué te ha llamado la atención de esta oferta y por qué crees que encajas?',
    'Para este puesto, ¿cuáles dirías que son tus 2-3 fortalezas más relevantes?',
  ]

  return offerText && offerText.trim() ? pick(offer) : pick(generic)
}

const formatHistoryToText = history => {
  if (!Array.isArray(history) || history.length === 0) return ''
  return history
    .map(m => `${m.role === 'assistant' ? 'Wingman' : 'Candidato'}: ${m.content}`)
    .join('\n')
}

async function geminiRespond({ cvText, offerText, history, language = 'es' }) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY
  if (!apiKey) return null

  // Lazy import so builds don't break if dependency isn't installed in every env
  // eslint-disable-next-line no-unused-vars
  const { GoogleGenerativeAI } = await import('@google/generative-ai')

  const modelName = process.env.REACT_APP_GEMINI_MODEL || 'gemini-1.5-flash'
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  const messages = buildChatMessages({
    systemKey: 'interview_system',
    userKey: 'interview_user',
    vars: { cvText, offerText },
    language,
  })

  const historyText = formatHistoryToText(history)
  const prompt = `${messages[0].content}\n\n${messages[1].content}\n\nHistorial:\n${historyText || '(sin historial)'}\n\nSiguiente turno:`

  const result = await model.generateContent(prompt)
  const text = result?.response?.text?.() || ''
  return text.trim() || null
}

export const getWingmanResponse = async (cvText, offerText, history) => {
  try {
    const gemini = await geminiRespond({ cvText, offerText, history, language: 'es' })
    if (gemini) return gemini
  } catch (e) {
    // fall back below
    console.warn('Gemini failed, using fallback:', e)
  }

  // Fallback: always return something useful
  if (!history || history.length === 0) return fallbackFirstQuestion({ offerText })

  const lastUserMsg = [...history].reverse().find(m => m.role === 'user')?.content
  if (!lastUserMsg) return fallbackFirstQuestion({ offerText })

  return pick([
    'Gracias. ¿Puedes darme un ejemplo concreto con números o resultados (si aplica)?',
    'Interesante. ¿Qué aprendiste de esa experiencia y qué harías diferente hoy?',
    'Bien. ¿Cómo organizaste tu trabajo y cómo priorizaste tareas en esa situación?',
  ])
}

export const getQuestionsAnalysis = async (cvText, offerText) => {
  // (Mantener mock seguro por ahora)
  return { strategy: '', questions: [] }
}

export const getCVImprovement = async (cvText, offerText) => {
  // (Mantener mock seguro por ahora)
  return ''
}
