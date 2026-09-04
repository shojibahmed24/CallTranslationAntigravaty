const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');
code = code.replace(/io\(`http:\/\/\$\{window\.location\.hostname\}:5000`\)/g, "io({ path: '/socket.io' })");
fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
