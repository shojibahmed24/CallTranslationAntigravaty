const fs = require('fs');
const file = 'src/controllers/pushController.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const { Expo } = require('expo-server-sdk');", "import { Expo } from 'expo-server-sdk';");
content = content.replace("const apn = require('@parse/node-apn');", "import apn from '@parse/node-apn';");
content = content.replace("module.exports = {", "export {");

fs.writeFileSync(file, content);
console.log('Converted to ESM');
