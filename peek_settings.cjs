const fs = require('fs');
const file = 'mobile/src/screens/main/SettingsScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const funcStart = lines.findIndex(l => l.includes('export default function SettingsScreen'));
const returnStart = lines.findIndex((l, i) => i > funcStart && l.includes('return ('));
console.log(lines.slice(returnStart - 2, returnStart + 5).join('\n'));
