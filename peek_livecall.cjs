const fs = require('fs');
const file = 'mobile/src/screens/call/LiveCallScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const returnLineIndex = lines.findIndex(l => l.includes('return ('));
console.log(lines.slice(returnLineIndex - 20, returnLineIndex + 10).join('\n'));
