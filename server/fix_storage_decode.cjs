const fs = require('fs');
let file = 'src/controllers/storageController.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /upload\(uniqueName, buffer, \{[\s\S]*?\}\);/;

const replacement = `upload(uniqueName, base64Data, {
        contentType: req.body.mimeType || 'image/jpeg',
        upsert: true,
        decode: true
      });`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed storageController.js to use decode: true');
} else {
  console.log('Regex did not match');
}
