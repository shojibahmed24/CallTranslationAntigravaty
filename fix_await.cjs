const fs = require('fs');
const file = 'native-app/app/call/[id].tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/await\s*\}/g, '}');

fs.writeFileSync(file, content);
console.log('Fixed await');
