const fs = require('fs');

let file = 'src/server.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('const Sentry = require("@sentry/node");', 'import * as Sentry from "@sentry/node";');
fs.writeFileSync(file, content);

file = 'src/controllers/callController.js';
content = fs.readFileSync(file, 'utf8');
content = content.replace("const { sendPushNotification } = require('./pushController');", "import { sendPushNotification } from './pushController.js';");
fs.writeFileSync(file, content);

file = 'src/controllers/chatController.js';
content = fs.readFileSync(file, 'utf8');
content = content.replace("const { sendPushNotification } = require('./pushController');", "import { sendPushNotification } from './pushController.js';");
fs.writeFileSync(file, content);

console.log('Fixed requires');
