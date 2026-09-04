const fs = require('fs');
const file = 'mobile/src/components/CallDetailsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{isOpen && contact && (', '{isOpen && contact && callRecord && (');

fs.writeFileSync(file, content);
console.log('Fixed JSX condition');
