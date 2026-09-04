const fs = require('fs');
let file = 'src/controllers/authController.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const \{ name, about, avatar, language, theme, chat_wallpaper, privacy, bank_details, crypto_details \} = req\.body;\s*const updates = \{\};\s*if \(name !== undefined\) updates\.name = name\.trim\(\);\s*if \(about !== undefined\) updates\.status = about\.trim\(\);\s*if \(avatar !== undefined\) updates\.profile_picture = avatar;/;

const replacement = `const { name, about, status, avatar, profile_picture, language, theme, chat_wallpaper, privacy, bank_details, crypto_details, notifications } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name.trim();
      if (about !== undefined) updates.status = about.trim();
      if (status !== undefined) updates.status = status.trim();
      if (avatar !== undefined) updates.profile_picture = avatar;
      if (profile_picture !== undefined) updates.profile_picture = profile_picture;
      if (notifications !== undefined) updates.notifications = notifications;`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed authController.js to accept frontend payloads');
} else {
  console.log('Regex did not match!');
}
