const fs = require('fs');
let file = 'src/controllers/storageController.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /catch \(e\) \{\s*console\.error\('Base64 Upload Error:', e\);\s*return res\.status\(500\)\.json\(\{ success: false, message: 'Base64 upload failed: ' \+ e\.message \}\);\s*\}/;

const replacement = `catch (e) {
      console.error('Base64 Upload Error Object:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
      if (e.response) {
         console.error('Base64 Upload Error Response:', e.response.data || e.response.statusText);
      }
      return res.status(500).json({ success: false, message: 'Base64 upload failed: ' + e.message + (e.response ? ' - ' + JSON.stringify(e.response.data) : '') });
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Added detailed error logging');
} else {
  console.log('Regex did not match');
}
