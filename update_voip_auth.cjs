const fs = require('fs');
const file = 'server/src/controllers/authController.js';
let content = fs.readFileSync(file, 'utf8');

// The function currently updates `expo_push_token`
// We need it to handle `isVoip` flag and store `voip_push_token`
const regex = /const { token } = req.body;[\s\S]*?eq\('id', req.user.id\);/m;
const replacement = `const { token, isVoip } = req.body;
      if (!token) return res.status(400).json({ success: false, message: 'Token required' });
      
      const updateData = isVoip ? { voip_push_token: token } : { expo_push_token: token };
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', req.user.id);`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Updated authController for VoIP token');
