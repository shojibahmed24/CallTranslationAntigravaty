const fs = require('fs');
const file = 'server/src/routes/api.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "router.put('/auth/profile', requireAuth, authController.updateProfile);",
  "router.put('/auth/profile', requireAuth, authController.updateProfile);\nrouter.post('/users/push-token', requireAuth, authController.updatePushToken);"
);

fs.writeFileSync(file, content);
console.log('Added push token route');
