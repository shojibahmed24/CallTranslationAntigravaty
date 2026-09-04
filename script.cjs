const fs = require('fs');
let file = 'server/src/routes/api.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `router.delete('/calls/:callId', requireAuth, callController.deleteCallLog);`,
  `router.delete('/calls/:callId', requireAuth, callController.deleteCallLog);\nrouter.delete('/calls', requireAuth, callController.clearCallHistory);`
);

fs.writeFileSync(file, content);
console.log('Added /calls DELETE route');

file = 'server/src/controllers/callController.js';
content = fs.readFileSync(file, 'utf8');

const newFunc = `
export const clearCallHistory = async (req, res) => {
  try {
    const { error } = await supabase
      .from('calls')
      .delete()
      .or(\`caller_id.eq.\${req.user.id},receiver_id.eq.\${req.user.id}\`);
      
    if (error) throw error;
    
    return res.json({ success: true, message: 'Call history cleared' });
  } catch (err) {
    console.error('Clear call history error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear call history' });
  }
};
`;

content = content + '\n' + newFunc;
fs.writeFileSync(file, content);
console.log('Added clearCallHistory controller');
