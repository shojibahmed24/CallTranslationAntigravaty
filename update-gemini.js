const fs = require('fs');
let code = fs.readFileSync('server/src/services/providers/llm/GeminiLLMProvider.js', 'utf8');

const regex = /async translate\(text, sourceLang, targetLang, contextHistory = \[\]\) \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}/m;

const replacement = `async translate(text, sourceLang, targetLang, contextHistory = [], audioBuffer = null) {
    if (!this.model) {
      console.warn('Gemini API key is missing. Returning fallback text.');
      return \`[Fallback Translate: \${text || 'audio'}]\`;
    }

    const systemPrompt = \`You are an expert simultaneous interpreter. \`;
    const parts = [];

    if (audioBuffer) {
      parts.push({
        inlineData: {
          data: audioBuffer.toString('base64'),
          mimeType: 'audio/webm'
        }
      });
      parts.push({
        text: \`\${systemPrompt}
Listen to this audio in \${sourceLang}. 
If there is no speech, just background noise, or silence, output EXACTLY AND ONLY: [SILENCE]
If there is speech, translate its meaning into \${targetLang}.
Output ONLY the translated text, nothing else.\`
      });
    } else {
      parts.push({
        text: \`\${systemPrompt}
Translate this from \${sourceLang} to \${targetLang}.
Do NOT translate word-by-word. Translate the MEANING.
Output ONLY the translated text, nothing else.

Text to translate:
"\${text}"\`
      });
    }

    try {
      const result = await this.model.generateContent(parts);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error('Gemini translation error:', err);
      return text || ''; 
    }
  }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/src/services/providers/llm/GeminiLLMProvider.js', code);
