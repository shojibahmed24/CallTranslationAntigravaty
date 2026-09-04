const fs = require('fs');
const file = 'mobile/src/screens/main/SettingsScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.find(l => l.includes('framer-motion')));
