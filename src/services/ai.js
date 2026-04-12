// Archivo temporalmente desactivado para el Sprint 1
import { buildChatMessages, buildPrompt } from './prompts'
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
