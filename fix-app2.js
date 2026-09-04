const fs = require('fs');
let code = fs.readFileSync('mobile/src/App.jsx', 'utf8');

const target = `<OtpVerifyScreen
          phone={pendingPhone}
          onBack={() => setAuthStep('phone')}`;

const replacement = `<OtpVerifyScreen
          phone={pendingPhone}
          firebaseConfirmation={firebaseConfirmation}
          onBack={() => setAuthStep('phone')}`;

code = code.replace(target, replacement);
fs.writeFileSync('mobile/src/App.jsx', code);
