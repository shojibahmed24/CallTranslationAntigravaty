const fs = require('fs');
const file = 'mobile/src/screens/main/ContactsScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

if (content.endsWith('}\n}')) {
  content = content.slice(0, -2);
} else if (content.endsWith('}\r\n}')) {
  content = content.slice(0, -3);
} else if (content.endsWith('}\r\n}\r\n')) {
  content = content.slice(0, -5);
} else if (content.endsWith('}\n}\n')) {
  content = content.slice(0, -3);
}

fs.writeFileSync(file, content);
console.log('Fixed extra brace in ContactsScreen');
