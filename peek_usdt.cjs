const fs = require('fs');
const file = 'mobile/src/screens/subscription/UsdtPaymentScreen.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(0, 15).join('\n'));
