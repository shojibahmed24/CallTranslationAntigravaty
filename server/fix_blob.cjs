const fs = require('fs');
let file = 'src/controllers/storageController.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `const { error: uploadErr } = await supabase.storage.from(bucketName).upload(uniqueName, base64Data, {
        contentType: req.body.mimeType || 'image/jpeg',
        upsert: true,
        decode: true
      });`;

const replaceStr = `// Clean base64 string to prevent any Bad Request decoding errors
      let cleanBase64 = base64Data;
      if (cleanBase64.includes(',')) cleanBase64 = cleanBase64.split(',')[1];
      cleanBase64 = cleanBase64.replace(/\\s+/g, ''); // strip newlines/whitespace
      
      const cleanBuffer = Buffer.from(cleanBase64, 'base64');
      // Create a Blob to guarantee fetch polyfill compatibility
      const blob = new Blob([cleanBuffer], { type: req.body.mimeType || 'image/jpeg' });

      const { error: uploadErr } = await supabase.storage.from(bucketName).upload(uniqueName, blob, {
        contentType: req.body.mimeType || 'image/jpeg',
        upsert: true
      });`;

if (content.includes('decode: true')) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log('Fixed storage controller to use Blob');
} else {
  console.log('String not found');
}
