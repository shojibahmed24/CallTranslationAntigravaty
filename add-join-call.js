const fs = require('fs');
let apiCode = fs.readFileSync('mobile/src/services/api.js', 'utf8');

const callSection = `// Calls
  initiateCall(receiverId) {`;

const updatedCallSection = `// Calls
  joinCall(callId) {
    return this.request(\`/calls/\${callId}/join\`, {
      method: 'POST'
    });
  },

  initiateCall(receiverId) {`;

apiCode = apiCode.replace(callSection, updatedCallSection);
fs.writeFileSync('mobile/src/services/api.js', apiCode);
