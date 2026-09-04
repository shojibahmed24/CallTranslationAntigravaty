const fs = require('fs');
const file = 'server/src/socket/socketHandler.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('translationEngine.initCallContext')) {
  // Add initCallContext
  const regex = /(livekitAgent\.joinCallAsBot\([\s\S]*?\);)/m;
  content = content.replace(regex, "$1\n            translationEngine.initCallContext(callId, callData.caller_lang, callData.receiver_lang);");
  fs.writeFileSync(file, content);
  console.log('Injected initCallContext');
}
