const fs = require('fs');
const file = 'mobile/src/screens/call/LiveCallScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(70, 75).join('\n'));
