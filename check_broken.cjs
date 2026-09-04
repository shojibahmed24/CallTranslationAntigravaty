const fs = require('fs');
const content = fs.readFileSync('broken_incoming.jsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(0, 30).join('\n'));
