const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');
code = code.replace(/io\('http:\/\/localhost:5000'\)/g, "io('http://192.168.68.105:5000')");
fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
