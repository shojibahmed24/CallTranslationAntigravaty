const fs = require('fs');
const file = 'mobile/src/screens/main/ChatRoomScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
let start = lines.findIndex(l => l.includes('return (') && l.includes('<div className={`flex flex-col h-[100dvh]'));
if (start === -1) {
  start = lines.findIndex(l => l.trim() === 'return (' && lines[lines.indexOf(l)+1].includes('<div className={`flex flex-col h-[100dvh]'));
}
let end = lines.findIndex((l, i) => i > start && l.trim() === 'export default function ChatRoomScreen');
console.log(lines.slice(start, start + 30).join('\n'));
