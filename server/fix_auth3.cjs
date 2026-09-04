const fs = require('fs');
let file = 'src/controllers/authController.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const \{ data: user, error \} = await supabase\s*\.from\('users'\)\s*\.update\(updates\)/;

const replacement = `if (Object.keys(updates).length === 0) {
        return res.json({ success: true, message: 'No valid fields to update.' });
      }
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Added check for empty updates');
} else {
  console.log('Regex did not match!');
}
