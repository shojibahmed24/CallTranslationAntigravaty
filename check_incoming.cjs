const fs = require('fs');
const file = 'mobile/src/screens/call/IncomingCallModal.jsx';
const content = fs.readFileSync(file, 'utf8');

let openBraces = 0;
let closeBraces = 0;
for(let i=0; i<content.length; i++) {
  if (content[i] === '{') openBraces++;
  if (content[i] === '}') closeBraces++;
}
console.log('Open:', openBraces, 'Close:', closeBraces);

const lines = content.split('\n');
console.log(lines.slice(Math.max(0, lines.length - 30)).join('\n'));
