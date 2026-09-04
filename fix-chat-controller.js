const fs = require('fs');
let code = fs.readFileSync('server/src/controllers/chatController.js', 'utf8');

code = code.replace(
  /\.select\('id, name, phone_number, profile_picture, status, online_status, last_seen'\)/g,
  ".select('id, name, phone_number, profile_picture, status, online_status, last_seen, language')"
);

code = code.replace(
  /about: user\.status,/g,
  "about: user.status,\n          language: user.language,"
);

fs.writeFileSync('server/src/controllers/chatController.js', code);
