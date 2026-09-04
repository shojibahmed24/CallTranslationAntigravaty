const fs = require('fs');
const file = 'mobile/src/components/CallDetailsModal.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(0, 20).join('\n'));
