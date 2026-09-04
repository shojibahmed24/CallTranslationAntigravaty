const fs = require('fs');
const file = 'server/src/services/providers/llm/GeminiLLMProvider.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('generateSummary')) {
  const method = `
  async generateSummary(prompt) {
    if (!this.model) await this.initialize();
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini Summary Error:', error);
      return 'Summary could not be generated.';
    }
  }
`;
  content = content.replace("async translate(text", method + "\n  async translate(text");
  fs.writeFileSync(file, content);
  console.log('Added generateSummary to Gemini');
}
