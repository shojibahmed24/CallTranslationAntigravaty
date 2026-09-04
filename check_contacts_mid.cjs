const fs = require('fs');
const file = 'mobile/src/screens/main/ContactsScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const returnIndex = lines.findIndex(l => l.includes('return ('));
console.log(lines.slice(returnIndex - 15, returnIndex + 5).join('\n'));
