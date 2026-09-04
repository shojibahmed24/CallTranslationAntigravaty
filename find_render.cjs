const fs = require('fs');
const file = 'mobile/src/screens/main/ChatRoomScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
let start = lines.findIndex(l => l.includes('const renderMessageText ='));
let end = lines.findIndex((l, i) => i > start && l.trim() === '};');
console.log(lines.slice(start, end + 1).join('\n'));
