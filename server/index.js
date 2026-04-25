import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config({ path: new URL('./.env', import.meta.url) })

if (process.env.NODE_ENV !== 'production') {
  const key = process.env.GEMINI_API_KEY || ''
  console.log('[server] GEMINI_API_KEY present:', Boolean(key))
  console.log('[server] GEMINI_API_KEY prefix:', key ? key.slice(0, 6) : '(none)')
  console.log('[server] GEMINI_MODEL:', process.env.GEMINI_MODEL || '(none)')
}

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

const safeJsonParse = text => {
  const raw = String(text || '').trim()
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
  return JSON.parse(cleaned)
}

const buildVoiceFeedbackPrompt = ({ transcript, cvText, offerText, locale }) => {
  if (locale === 'ca') {
    return `Analitza la resposta oral transcrita i retorna:
- feedback: 3 punts (clars, accionables)
- improvedAnswer: una resposta millor (60-120 paraules)
- nextQuestion: una pregunta següent (1 frase)

Transcripció: """${transcript}"""

Context CV (pot venir buit):
"""${cvText || ''}"""

Context oferta (pot venir buit):
"""${offerText || ''}"""

Retorna EXACTAMENT aquest JSON:
{"feedback":["...","...","..."],"improvedAnswer":"...","nextQuestion":"..."}`
  }

  return `Analiza la respuesta oral transcrita y devuelve:
- feedback: 3 puntos (claros, accionables)
- improvedAnswer: una respuesta mejor (60-120 palabras)
- nextQuestion: una pregunta siguiente (1 frase)

Transcripción: """${transcript}"""

Contexto CV (puede venir vacío):
"""${cvText || ''}"""

Contexto oferta (puede venir vacío):
"""${offerText || ''}"""

Devuelve EXACTAMENTE este JSON:
{"feedback":["...","...","..."],"improvedAnswer":"...","nextQuestion":"..."}`
}

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

let cachedWorkingModel = null

const isNotFoundModelError = err => {
  const msg = String(err?.message || err || '')
  return msg.includes('NOT_FOUND') || msg.includes('404') || msg.toLowerCase().includes('not found')
}

const modelCandidates = () => {
  const envModel = (process.env.GEMINI_MODEL || '').trim()

  // Prefer the model that AI Studio shows quota for (commonly gemini-2.5-flash)
  const list = [envModel || null, 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'].filter(Boolean)

  // de-dup
  return [...new Set(list)]
}

const generateText = async ({ model, prompt }) => {
  const ai = getAI()
  if (!ai) throw new Error('Missing GEMINI_API_KEY in server env')

  const tryWithModel = async modelName => {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
    const text = res?.text || res?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || ''
    return String(text || '')
  }

  // 1) request override
  if (model && typeof model === 'string' && model.trim()) {
    return await tryWithModel(model.trim())
  }

  // 2) cached working model (if previously discovered)
  if (cachedWorkingModel) {
    return await tryWithModel(cachedWorkingModel)
  }

  // 3) probe candidates until one works
  let lastErr = null
  for (const candidate of modelCandidates()) {
    try {
      const out = await tryWithModel(candidate)
      cachedWorkingModel = candidate
      return out
    } catch (e) {
      lastErr = e
      if (!isNotFoundModelError(e)) throw e
    }
  }

  throw lastErr || new Error('No Gemini model worked')
}

app.post('/api/gemini', async (req, res) => {
  try {
    const body = req.body || {}

    // New structured mode for voice coaching
    if (body.mode === 'voice_feedback') {
      const transcript = String(body.transcript || '').trim()
      const locale = body.locale === 'ca' ? 'ca' : 'es'

      if (!transcript) {
        return res.status(400).json({ error: 'Missing transcript (string)' })
      }

      const prompt = buildVoiceFeedbackPrompt({
        transcript,
        cvText: body.cvText || '',
        offerText: body.offerText || '',
        locale,
      })

      const text = await generateText({ model: body.model, prompt })

      let json
      try {
        json = safeJsonParse(text)
      } catch (_e) {
        return res.status(500).json({
          error: 'Gemini returned non-JSON',
          raw: text,
        })
      }

      return res.json({
        feedback: Array.isArray(json.feedback) ? json.feedback : [],
        improvedAnswer: String(json.improvedAnswer || ''),
        nextQuestion: String(json.nextQuestion || ''),
      })
    }

    // Backward compatible prompt mode (used by current chat)
    const prompt = body.prompt
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt (string)' })
    }

    const text = await generateText({ model: body.model, prompt })
    return res.json({ text })
  } catch (err) {
    console.error('Gemini server error:', err)
    return res.status(500).json({
      error: 'Gemini request failed',
      message: String(err?.message || err),
    })
  }
})

const port = Number(process.env.PORT || 5001)
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`)
})
