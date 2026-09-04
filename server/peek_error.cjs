const fs = require('fs');
const file = 'src/socket/socketHandler.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(250, 360).join('\n'));
