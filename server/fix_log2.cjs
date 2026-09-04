const fs = require('fs');
let file = 'src/controllers/storageController.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const buffer = Buffer\.from\(base64Data, 'base64'\);\n\s*const fileSize = buffer\.length;/;

const replacement = `const buffer = Buffer.from(base64Data, 'base64');
      const fileSize = buffer.length;
      console.log('UPLOAD DEBUG:', { uniqueName, bucketName, fileSize, mimeType: req.body.mimeType, base64Prefix: base64Data.substring(0, 30) });`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Added debug log');
} else {
  console.log('Regex did not match');
}
