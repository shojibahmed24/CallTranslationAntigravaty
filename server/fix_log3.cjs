const fs = require('fs');
let file = 'src/controllers/storageController.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const buffer = Buffer\.from\(base64Data, 'base64'\);\s+const fileSize = buffer\.length;\s+console\.log\('UPLOAD DEBUG:'.*?\);/,
  "const buffer = Buffer.from(base64Data, 'base64');\n      const fileSize = buffer.length;"
);

content = content.replace(
  /const uniqueName = `\$\{req\.user\.id\}\/\$\{uuidv4\(\)\}_\$\{Date\.now\(\)\}\$\{ext\}`;/,
  "const uniqueName = `${req.user.id}/${uuidv4()}_${Date.now()}${ext}`;\n      console.log('UPLOAD DEBUG:', { uniqueName, bucketName, fileSize, mimeType: req.body.mimeType, base64Prefix: base64Data.substring(0, 30) });"
);

fs.writeFileSync(file, content);
console.log('Fixed debug log');
