const fs = require('fs');

let broken = fs.readFileSync('broken_incoming.jsx', 'utf8');
if (broken.includes('\0')) {
  broken = broken.replace(/\0/g, '');
}

const uiStart = broken.indexOf('<motion.div');
const newUI = broken.substring(uiStart);

const original = fs.readFileSync('mobile/src/screens/call/IncomingCallModal.jsx', 'utf8');
const returnStart = original.lastIndexOf('return (');

const finalContent = original.substring(0, returnStart) + 'return (\n    ' + newUI;

fs.writeFileSync('mobile/src/screens/call/IncomingCallModal.jsx', finalContent, 'utf8');
console.log('Fixed correctly');
