const fs = require('fs');
const file = 'src/routes/api.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("router.get('/push/public-key', pushController.getPublicKey);", "// router.get('/push/public-key', pushController.getPublicKey);");
content = content.replace("router.post('/push/subscribe', requireAuth, pushController.saveSubscription);", "// router.post('/push/subscribe', requireAuth, pushController.saveSubscription);");

fs.writeFileSync(file, content);
console.log('Fixed api.js');
