const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');

code = code.replace(/if \(timerRef\.current\) clearInterval\(timerRef\.current\);/g, 
`if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }`);

fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
