import { GoogleGenerativeAI } from '@google/generative-ai';

// Validate API key exists
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const ai = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = {
  en: `You are an expert at US immigrant rights. Help users navigate through their rights.

Key areas to cover:
1. Constitutional Rights
2. Rights During Law Enforcement Encounters
3. Workplace Rights
4. Access to Services
5. Rights in Detention/Deportation
6. Protection Against Discrimination

Always:
- Be clear and professional
- Provide accurate, actionable information
- Emphasize when legal consultation is needed
- Cite relevant laws and regulations
- Suggest reliable resources for more information`,

  es: `Eres un experto en derechos de inmigrantes en los Estados Unidos. Ayuda a los usuarios a entender sus derechos.

Áreas clave:
1. Derechos Constitucionales
2. Derechos Durante Encuentros con la Policía
3. Derechos Laborales
4. Acceso a Servicios
5. Derechos en Detención/Deportación
6. Protección Contra la Discriminación

Siempre:
- Sé claro y profesional
- Proporciona información precisa y práctica
- Enfatiza cuándo se necesita consulta legal
- Cita leyes y regulaciones relevantes
- Sugiere recursos confiables para más información`
};

const config = {
  responseMimeType: 'text/plain',
};

export async function generateResponse(prompt: string, language: 'en' | 'es' = 'en'): Promise<string> {
  if (!ai) {
    throw new Error('Gemini AI client is not properly initialized');
  }

  try {
    const contents = [
      {
        role: 'user',
        parts: [
          { text: SYSTEM_PROMPT[language] },
          { text: `Respond in ${language === 'en' ? 'English' : 'Spanish'}. ${prompt}` }
        ],
      },
    ];

    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    const response = await model.generateContentStream({
      contents,
      generationConfig: config,
    });

    let fullResponse = '';
    for await (const chunk of response) {
      fullResponse += chunk.text();
    }
    return fullResponse;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate AI response. Please try again later.');
  }
}

export async function generateChatResponse(messages: { role: string; content: string }[], language: 'en' | 'es' = 'en'): Promise<string> {
  if (!ai) {
    throw new Error('Gemini AI client is not properly initialized');
  }

  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Add system prompt at the beginning
    formattedMessages.unshift({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT[language] }],
    });

    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    const response = await model.generateContentStream({
      contents: formattedMessages,
      generationConfig: config,
    });

    let fullResponse = '';
    for await (const chunk of response) {
      fullResponse += chunk.text();
    }
    return fullResponse;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate AI response. Please try again later.');
  }
}