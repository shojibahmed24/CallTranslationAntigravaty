const fs = require('fs');
let file = 'src/controllers/chatController.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const currentUserId = req.user.id;

    if (!chatId) return res.status(400).json({ success: false, message: 'Chat ID required' });
    const { data: part } = await supabase.from('chat_participants').select('id').eq('chat_id', chatId).eq('user_id', currentUserId).maybeSingle();
    if (!part) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const { data, error } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('chat_id', chatId)
      .neq('sender_id', currentUserId)
      .neq('status', 'read')
      .select();`;

const replaceStr = `export const markMessagesAsRead = async (req, res) => {
  try {
    let { chatId } = req.body;
    const currentUserId = req.user.id;

    if (!chatId) return res.status(400).json({ success: false, message: 'Chat ID required' });
    
    // Resolve contactId to sharedChatId if it's a direct user ID
    const { data: isUser } = await supabase.from('users').select('id').eq('id', chatId).single();
    if (isUser) {
      const { data: myChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', currentUserId);
      const { data: theirChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', chatId);
      if (myChats && theirChats) {
        const myIds = myChats.map(c => c.chat_id);
        const theirIds = theirChats.map(c => c.chat_id);
        const shared = myIds.find(id => theirIds.includes(id));
        if (shared) {
          chatId = shared;
        }
      }
    }

    const { data: part } = await supabase.from('chat_participants').select('id').eq('chat_id', chatId).eq('user_id', currentUserId).maybeSingle();
    if (!part) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const { data, error } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('chat_id', chatId)
      .neq('sender_id', currentUserId)
      .neq('status', 'read')
      .select();`;

if (content.includes('export const markMessagesAsRead = async')) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log('Fixed markMessagesAsRead in backend');
} else {
  console.log('Target string not found');
}
