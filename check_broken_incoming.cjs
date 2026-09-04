const fs = require('fs');
let content = fs.readFileSync('broken_incoming.jsx', 'utf8');
if (content.includes('\0')) {
  content = content.replace(/\0/g, '');
}
const lines = content.split('\n');
console.log(lines.slice(0, 30).join('\n'));
