const fs = require('fs');

let apiCode = fs.readFileSync('mobile/src/services/api.js', 'utf8');
apiCode = apiCode.replace(/const API_BASE = 'http:\/\/192\.168\.68\.105:5000\/api';/, "const API_BASE = `http://${window.location.hostname}:5000/api`;");
fs.writeFileSync('mobile/src/services/api.js', apiCode);

let callCtxCode = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');
callCtxCode = callCtxCode.replace(/io\('http:\/\/192\.168\.68\.105:5000'\)/g, "io(`http://${window.location.hostname}:5000`)");
callCtxCode = callCtxCode.replace(/io\('http:\/\/localhost:5000'\)/g, "io(`http://${window.location.hostname}:5000`)");
fs.writeFileSync('mobile/src/context/CallContext.jsx', callCtxCode);
