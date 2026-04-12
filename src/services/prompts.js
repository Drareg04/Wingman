// Base prompts for Wingman AI features.
// Keep them in one place so the whole team can iterate.

export const PROMPT_VERSION = 'v1'

const normalizeLanguage = lang => {
  const v = (lang || '').toLowerCase()
  if (v.startsWith('ca')) return 'ca'
  if (v.startsWith('es')) return 'es'
  if (v.startsWith('en')) return 'en'
  return 'es'
}

const languageBlock = lang => {
  const l = normalizeLanguage(lang)
  if (l === 'ca') return 'Respon sempre en català.'
  if (l === 'en') return 'Always respond in English.'
  return 'Responde siempre en español.'
}

export const PROMPTS = {
  interview_system: ({ language = 'es' } = {}) => `Eres Wingman, un entrevistador profesional y amable.
Tu objetivo es simular una entrevista realista y ayudar al candidato a mejorar.
${languageBlock(language)}
Reglas:
- Haz 1 pregunta cada vez.
- Preguntas concisas.
- Si el usuario responde poco, pide ejemplos concretos.
- No inventes datos del CV que no existan.
`,

  interview_user: ({ cvText, offerText } = {}) => `Contexto del candidato.
CV:\n${cvText || '(sin CV)'}\n\nPuesto/Oferta:\n${offerText || '(sin oferta específica)'}\n\nEmpieza la entrevista con un saludo breve y la primera pregunta.`,

  feedback_system: ({ language = 'es' } = {}) => `Eres Wingman, un coach de entrevistas.
Analiza la respuesta del candidato y da feedback accionable.
${languageBlock(language)}
Formato:
- Puntos fuertes (máx 3)
- Puntos a mejorar (máx 3)
- Versión mejorada (reescribe la respuesta)
`,

  feedback_user: ({ question, answer, cvText, offerText } = {}) =>
    `CV:\n${cvText || '(sin CV)'}\n\nOferta:\n${offerText || '(sin oferta)'}\n\nPregunta:\n${question || '(sin pregunta)'}\n\nRespuesta del candidato:\n${answer || '(sin respuesta)'}\n`,

  cv_improve_system: ({ language = 'es' } = {}) => `Eres un experto en CVs ATS.
${languageBlock(language)}
Devuelve sugerencias concretas y reescrituras sin inventar información.
`,

  cv_improve_user: ({ cvText, targetRole } = {}) => `CV:\n${cvText || '(sin CV)'}\n\nObjetivo/rol deseado:\n${targetRole || '(no especificado)'}\n`,
}

export function buildPrompt(key, vars) {
  const tpl = PROMPTS[key]
  if (!tpl) throw new Error(`Unknown prompt key: ${key}`)
  return tpl(vars)
}

export function buildChatMessages({ systemKey, userKey, vars, language = 'es' }) {
  return [
    { role: 'system', content: buildPrompt(systemKey, { ...(vars || {}), language }) },
    { role: 'user', content: buildPrompt(userKey, vars || {}) },
  ]
}
