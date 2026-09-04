const fs = require('fs');
let file = 'src/controllers/storageController.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const arrayBuffer = buffer\.buffer\.slice\(buffer\.byteOffset, buffer\.byteOffset \+ buffer\.byteLength\);\s+const bucketName/g,
  'const bucketName'
);

content = content.replace(
  /upload\(uniqueName, arrayBuffer, {/g,
  'upload(uniqueName, buffer, {'
);

fs.writeFileSync(file, content);
console.log('Fixed storageController.js to use Buffer instead of ArrayBuffer');
