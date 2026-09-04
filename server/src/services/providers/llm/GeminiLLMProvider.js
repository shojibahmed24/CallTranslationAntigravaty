import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiLLMProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      // Using gemini-1.5-flash for low-latency real-time text translation
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  async translate(text, sourceLang, targetLang, contextHistory = []) {
    if (!this.model) {
      throw new Error('Gemini API key is missing. Cannot translate.');
    }

    const systemPrompt = `You are an expert simultaneous interpreter. 
Translate the following text from ${sourceLang} to ${targetLang}.
Guidelines:
1. Do NOT translate word-by-word. Translate the MEANING and INTENT naturally.
2. Maintain the emotional tone of the speaker.
3. If it's a partial sentence, provide the best partial translation possible that flows naturally.
4. Output ONLY the translated text, nothing else. No conversational padding.`;

    const recentContext = contextHistory.slice(-3).map(c => `Previous: ${c.original} -> ${c.translated}`).join('\n');

    const prompt = `${systemPrompt}\n\nContext History:\n${recentContext}\n\nText to translate:\n"${text}"`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error('Gemini translation error:', err);
      throw new Error('Failed to fetch translation from Gemini');
    }
  }
}

export const geminiLLM = new GeminiLLMProvider();
