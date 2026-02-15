import OpenAI from "openai";

// ⚠️ IMPORTANT: The API key is now in the .env file.
// Make sure you have a .env file with REACT_APP_OPENAI_API_KEY=sk-...
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
const MODEL_NAME = "gpt-4o-mini";

// --- ENTREVISTA ---
export const getWingmanResponse = async (cvText, offerText, history) => {
    try {
        const response = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                {
                    role: "system",
                    content: `ERES: Un reclutador experto. CONTEXTO: CV: ${cvText.slice(0, 2000)} | OFERTA: ${offerText.slice(0, 1000)}.
          OBJETIVO: Entrevistar. Sé breve, profesional y directo (como una charla oral).
          FORMATO: No uses etiquetas. Habla natural.`
                },
                ...history
            ],
            temperature: 0.7,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error);
        return "Error de conexión con Wingman AI. ¿Podrías repetir?";
    }
};

// --- ANÁLISIS ---
export const getQuestionsAnalysis = async (cvText, offerText) => {
    try {
        const response = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "system", content: `Analiza CV y Oferta. JSON con { "strategy": "...", "questions": [] }` }],
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        return { strategy: "Prepárate bien y destaca tus fortalezas.", questions: ["Cuéntame sobre ti."] };
    }
};

// --- MEJORA CV ---
export const getCVImprovement = async (cvText, offerText) => {
    try {
        const response = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: `Eres un experto en RRHH. Reescribe y optimiza el perfil profesional del CV para que encaje mejor con la oferta, manteniendo la veracidad pero mejorando el redacción.` },
                { role: "user", content: `CV ACTUAL: ${cvText}\nOFERTA OBJETIVO: ${offerText}` }
            ]
        });
        return response.choices[0].message.content;
    } catch (error) { return "No se pudo conectar con el servicio de mejora."; }
};
