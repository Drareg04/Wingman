import { buildChatMessages } from './prompts.js'

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const fallbackFirstQuestion = ({ offerText } = {}) => {
  const generic = [
    'Hola, soy Wingman. Para empezar, ¿podrías presentarte brevemente y contarme qué estás buscando ahora mismo?',
    'Perfecto. ¿Cuál ha sido tu proyecto o experiencia más relevante y qué impacto tuvo?',
    'Empecemos fuerte: ¿qué logros destacarías de tu última experiencia laboral?',
  ]

  const offer = ['Genial. ¿Qué te ha llamado la atención de esta oferta y por qué crees que encajas?', 'Para este puesto, ¿cuáles dirías que son tus 2-3 fortalezas más relevantes?']

  return offerText && offerText.trim() ? pick(offer) : pick(generic)
}

const formatHistoryToText = history => {
  if (!Array.isArray(history) || history.length === 0) return ''
  return history.map(m => `${m.role === 'assistant' ? 'Wingman' : 'Candidato'}: ${m.content}`).join('\n')
}

const normalizeLang = lang => {
  const v = String(lang || '').toLowerCase()
  if (v.startsWith('ca')) return 'ca'
  if (v.startsWith('es')) return 'es'
  return 'es'
}

const getApiBase = () => {
  // In dev, if CRA proxy isn't configured/working, fall back to the backend port.
  // Use same-origin when possible to keep it simple.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1'
    if (isLocal) return 'http://localhost:5001'
  }
  return ''
}

async function callGeminiBackend(payload) {
  const base = getApiBase()
  const res = await fetch(`${base}/api/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  return await res.json()
}

async function geminiRespond({ cvText, offerText, history, language = 'es' }) {
  const messages = buildChatMessages({
    systemKey: 'interview_system',
    userKey: 'interview_user',
    vars: { cvText, offerText },
    language,
  })

  const historyText = formatHistoryToText(history)
  const prompt = `${messages[0].content}\n\n${messages[1].content}${historyText ? `\n\nHistorial:\n${historyText}` : ''}`

  const data = await callGeminiBackend({ prompt })
  const text = String(data?.text || '').trim()
  return text || null
}

export const getAnswerFeedback = async (question, answer, cvText, offerText, { language = 'es' } = {}) => {
  // Keep signature for existing callers, but use the backend structured mode
  const locale = normalizeLang(language)
  const transcript = String(answer || '').trim()
  if (!transcript) return null

  try {
    const data = await callGeminiBackend({
      mode: 'voice_feedback',
      locale,
      transcript,
      cvText: cvText || '',
      offerText: offerText || '',
    })

    const feedback = Array.isArray(data?.feedback) ? data.feedback.filter(Boolean) : []
    const improvedAnswer = String(data?.improvedAnswer || '').trim()

    // Return a readable string to show in UI (existing UI expects string)
    const lines = []
    if (feedback.length) {
      lines.push('Puntos a mejorar:')
      feedback.slice(0, 3).forEach((f, i) => lines.push(`${i + 1}. ${f}`))
    }
    if (improvedAnswer) {
      lines.push('')
      lines.push('Respuesta mejorada:')
      lines.push(improvedAnswer)
    }

    return lines.join('\n').trim() || null
  } catch (e) {
    console.warn('Feedback failed, skipping:', e)
    return null
  }
}

export const getWingmanResponse = async (cvText, offerText, history, { language = 'es' } = {}) => {
  try {
    const gemini = await geminiRespond({ cvText, offerText, history, language })
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

export const getInterviewConclusion = async (cvText, offerText, history, { language = 'es' } = {}) => {
  const messages = buildChatMessages({
    systemKey: 'conclusion_system',
    userKey: 'conclusion_user',
    vars: {
      cvText,
      offerText,
      historyText: formatHistoryToText(history)
    },
    language: normalizeLang(language),
  })

  const prompt = `${messages[0].content}\n\n${messages[1].content}`
  
  try {
    const data = await callGeminiBackend({ prompt })
    const text = String(data?.text || '').trim()
    return text || null
  } catch (e) {
    console.error("Gemini Conclusion Error:", e)
    return null
  }
}

export const getCVMatchAnalysis = async (cvText, offerText, { language = 'es' } = {}) => {
  const messages = buildChatMessages({
    systemKey: 'match_system',
    userKey: 'match_user',
    vars: { cvText, offerText },
    language: normalizeLang(language),
  })

  const prompt = `${messages[0].content}\n\n${messages[1].content}`
  try {
    const data = await callGeminiBackend({ prompt })
    const raw = String(data?.text || '').trim()
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
