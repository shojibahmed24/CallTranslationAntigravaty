const fs = require('fs');
const file = 'mobile/src/screens/main/ChatRoomScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const funcStart = lines.findIndex(l => l.includes('export default function ChatRoomScreen'));
let start = lines.findIndex((l, i) => i > funcStart && l.includes('return (') && lines[i+1].includes('<div className={`flex flex-col h-[100dvh]'));
console.log("Start line:", start);
console.log(lines.slice(start, start + 30).join('\n'));
