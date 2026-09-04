const fs = require('fs');
const file = 'server/src/controllers/authController.js';
let content = fs.readFileSync(file, 'utf8');

const pushTokenFunction = `
  updatePushToken: async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ success: false, message: 'Token required' });
      
      const { error } = await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', req.user.id);
        
      if (error) throw error;
      return res.json({ success: true });
    } catch (err) {
      console.error('Update push token error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update token' });
    }
  },
`;

content = content.replace(
  "updateProfile: async (req, res) => {",
  pushTokenFunction + "\n  updateProfile: async (req, res) => {"
);

fs.writeFileSync(file, content);
console.log('Added updatePushToken to controller');
