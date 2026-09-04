const fs = require('fs');
const content = fs.readFileSync('mobile/src/screens/main/ContactsScreen.jsx', 'utf8');
const lines = content.split('\n');
console.log('Lines:', lines.length);
