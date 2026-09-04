const fs = require('fs');
let code = fs.readFileSync('server/src/services/providers/llm/GeminiLLMProvider.js', 'utf8');

const regex = /async translate\(text, sourceLang, targetLang, contextHistory = \[\], audioBuffer = null\) \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}/m;

const replacement = `async translate(text, sourceLang, targetLang, contextHistory = []) {
    if (!this.model) {
      console.warn('Gemini API key is missing. Returning fallback text.');
      return \`[Fallback Translate: \${text}]\`;
    }

    const systemPrompt = \`You are an expert simultaneous interpreter. 
Translate the following text from \${sourceLang} to \${targetLang}.
Guidelines:
1. Do NOT translate word-by-word. Translate the MEANING and INTENT naturally.
2. Maintain the emotional tone of the speaker.
3. If it's a partial sentence, provide the best partial translation possible that flows naturally.
4. Output ONLY the translated text, nothing else. No conversational padding.\`;

    const recentContext = contextHistory.slice(-3).map(c => \`Previous: \${c.original} -> \${c.translated}\`).join('\\n');

    const prompt = \`\${systemPrompt}\\n\\nContext History:\\n\${recentContext}\\n\\nText to translate:\\n"\${text}"\`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error('Gemini translation error:', err);
      // Fallback: Just return the original text if LLM fails (prevents complete silence)
      return \`[Fallback Translate: \${text}]\`;
    }
  }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/src/services/providers/llm/GeminiLLMProvider.js', code);
