const fs = require('fs');
let file = 'src/controllers/authController.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/if \(notifications !== undefined\) updates\.notifications = notifications;/g, '');
fs.writeFileSync(file, content);
console.log('Removed notifications update to prevent schema crash');
