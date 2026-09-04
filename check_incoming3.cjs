const fs = require('fs');
const file = 'mobile/src/screens/call/IncomingCallModal.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(0, 30).join('\n'));
