const fs = require('fs');
const file = 'mobile/src/screens/main/ContactsScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(Math.max(0, lines.length - 20)).join('\n'));
