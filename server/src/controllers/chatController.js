import { sendPushNotification } from './pushController.js';
import supabase from '../database/supabaseClient.js';

export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 1. Get all chats the user is part of
    const { data: participants, error: pErr } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', currentUserId);

    if (pErr) throw pErr;
    if (!participants || participants.length === 0) {
      return res.json({ success: true, conversations: [] });
    }

    const chatIds = participants.map(p => p.chat_id);

    // 2. Fetch those chats with participants and latest message
    const { data: chats, error: chatsErr } = await supabase
      .from('chats')
      .select(`
        id,
        type,
        created_at,
        chat_participants(user_id, joined_at),
        messages(id, text, type, file_url, sender_id, status, timestamp)
      `)
      .in('id', chatIds);

    if (chatsErr) throw chatsErr;

    // Format the response
    const conversations = [];
    for (const chat of chats) {
      // Find the "other" participant for direct chats
      const otherParticipant = chat.chat_participants.find(p => p.user_id !== currentUserId);
      if (!otherParticipant && chat.type === 'direct') continue;

      let contact = null;
      if (chat.type === 'group') {
        contact = {
          id: chat.id,
          name: chat.name || 'Group Chat',
          phone: '',
          avatar: chat.avatar_url || 'https://ui-avatars.com/api/?name=Group&background=0D8ABC&color=fff',
          about: 'Group Conversation',
          onlineStatus: 'online',
          lastSeen: chat.created_at,
          isGroup: true
        };
      } else if (otherParticipant) {
        const { data: user } = await supabase
          .from('users')
          .select('id, name, phone_number, profile_picture, status, online_status, last_seen, language')
          .eq('id', otherParticipant.user_id)
          .single();
        contact = user ? {
          id: user.id,
          name: user.name,
          phone: user.phone_number,
          avatar: user.profile_picture,
          about: user.status,
          language: user.language,
          onlineStatus: user.online_status,
          lastSeen: user.last_seen,
          isGroup: false
        } : null;
      }

      // Sort messages by timestamp descending to get the latest
      const sortedMessages = chat.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const lastMessage = sortedMessages[0] || null;
      
      const unreadCount = chat.messages.filter(m => m.sender_id !== currentUserId && m.status !== 'read').length;

      conversations.push({
        chatId: chat.id,
        type: chat.type,
        contact: contact,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.text,
          mediaType: lastMessage.type,
          senderId: lastMessage.sender_id,
          status: lastMessage.status,
          createdAt: lastMessage.timestamp
        } : null,
        unreadCount: unreadCount
      });
    }

    // Sort by latest message date
    conversations.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
      return dateB - dateA;
    });

    return res.json({ success: true, conversations });
  } catch (err) {
    console.error('getConversations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    // contactId might actually be a chatId for groups!
    const { contactId } = req.params;

    let sharedChatId = contactId;

    // Check if it's actually a direct chat by querying users
    const { data: isUser } = await supabase.from('users').select('id').eq('id', contactId).single();
    
    if (isUser) {
      // It's a user, find shared direct chat
      const { data: myChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', currentUserId);
      const { data: theirChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', contactId);
      
      sharedChatId = null;
      if (myChats && theirChats) {
        const myIds = myChats.map(c => c.chat_id);
        const theirIds = theirChats.map(c => c.chat_id);
        sharedChatId = myIds.find(id => theirIds.includes(id));
      }
    }

    if (!isUser) {
      const { data: part } = await supabase.from('chat_participants').select('id').eq('chat_id', sharedChatId).eq('user_id', currentUserId).maybeSingle();
      if (!part) return res.status(403).json({ success: false, message: 'Unauthorized to view this chat.' });
    }

    if (!sharedChatId) {
      return res.json({ success: true, messages: [] });
    }

    const { page = 1, limit = 50 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch messages for this chat (descending to get latest pages)
    const { data: messages, error: msgErr } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', sharedChatId)
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (msgErr) throw msgErr;

    // Map to frontend expected format and reverse so oldest is first in the chunk
    const formattedMessages = messages.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.text,
      mediaType: m.type,
      fileUrl: m.file_url,
      fileName: m.file_name,
      replyToId: m.reply_to_id,
      metadata: m.metadata,
      status: m.status,
      createdAt: m.timestamp
    }));

    return res.json({ success: true, messages: formattedMessages });
  } catch (err) {
    console.error('getMessages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch message history.' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, chatId, text, mediaType = 'text', fileUrl = null, replyToId = null, metadata = null, fileName = null } = req.body;

    if (!receiverId && !chatId) {
      return res.status(400).json({ success: false, message: 'Receiver ID or Chat ID is required.' });
    }

    if (chatId) {
      const { data: participant } = await supabase.from('chat_participants').select('id').eq('chat_id', chatId).eq('user_id', req.user.id).maybeSingle();
      if (!participant) return res.status(403).json({ success: false, message: 'Unauthorized: You are not a participant in this chat.' });
    }

    // Check if blocked
    if (receiverId) {
      const { data: blockedData } = await supabase
        .from('blocked_users')
        .select('*')
        .or(`and(blocker_id.eq.${receiverId},blocked_id.eq.${senderId}),and(blocker_id.eq.${senderId},blocked_id.eq.${receiverId})`);
        
      if (blockedData && blockedData.length > 0) {
        return res.status(403).json({ success: false, message: 'Cannot send message. User is blocked.' });
      }
    }

    let sharedChatId = chatId;

    if (!sharedChatId && receiverId) {
      // Find or create direct chat
      const { data: myChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', senderId);
      const { data: theirChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', receiverId);
      
      if (myChats && theirChats) {
        const myIds = myChats.map(c => c.chat_id);
        const theirIds = theirChats.map(c => c.chat_id);
        sharedChatId = myIds.find(id => theirIds.includes(id));
      }

      if (!sharedChatId) {
        // Create new chat
        const { data: newChat, error: newChatErr } = await supabase
          .from('chats')
          .insert([{ type: 'direct' }])
          .select()
          .single();
        
        if (newChatErr) throw newChatErr;
        sharedChatId = newChat.id;

        // Add participants
        await supabase.from('chat_participants').insert([
          { chat_id: sharedChatId, user_id: senderId },
          { chat_id: sharedChatId, user_id: receiverId }
        ]);
      }
    }

    const { data: newMessage, error: msgErr } = await supabase
      .from('messages')
      .insert([{
        chat_id: sharedChatId,
        sender_id: senderId,
        text: text || '',
        type: mediaType,
        file_url: fileUrl,
        reply_to_id: replyToId || null,
        metadata: metadata || null,
        file_name: fileName || null
      }])
      .select()
      .single();

    if (msgErr) throw msgErr;

    const mappedMessage = {
      id: newMessage.id,
      senderId: newMessage.sender_id,
      receiverId: receiverId, // For legacy frontend compatibility
      text: newMessage.text,
      mediaType: newMessage.type,
      fileUrl: newMessage.file_url,
      fileName: newMessage.file_name,
      replyToId: newMessage.reply_to_id,
      metadata: newMessage.metadata,
      status: newMessage.status,
      createdAt: newMessage.timestamp
    };

    return res.json({ success: true, message: mappedMessage });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', req.user.id);

    if (error) throw error;
    return res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};

export const syncContacts = async (req, res) => {
  try {
    const { phoneNumbers = [] } = req.body;
    const currentUserId = req.user.id;

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, phone_number, profile_picture, status, online_status')
      .in('phone_number', phoneNumbers)
      .neq('id', currentUserId);

    if (error) throw error;

    const matchedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone_number,
      avatar: u.profile_picture,
      about: u.status,
      onlineStatus: u.online_status
    }));

    return res.json({ success: true, contacts: matchedUsers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to sync contacts.' });
  }
};
export const markMessagesAsRead = async (req, res) => {
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
      .select();

    if (error) throw error;
    
    return res.json({ success: true, updatedCount: data.length });
  } catch (err) {
    console.error('markMessagesAsRead error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark messages as read.' });
  }
};
export const createGroup = async (req, res) => {
  try {
    const { name, participants } = req.body; // participants is an array of user IDs
    const creatorId = req.user.id;

    if (!name || !participants || participants.length === 0) {
      return res.status(400).json({ success: false, message: 'Group name and participants required.' });
    }

    const { data: newChat, error: chatErr } = await supabase
      .from('chats')
      .insert([{ type: 'group', name }])
      .select()
      .single();

    if (chatErr) throw chatErr;

    const members = [...new Set([...participants, creatorId])];
    const participantRows = members.map(userId => ({
      chat_id: newChat.id,
      user_id: userId
    }));

    await supabase.from('chat_participants').insert(participantRows);

    return res.json({ success: true, chat: newChat });
  } catch (err) {
    console.error('createGroup error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create group.' });
  }
};

export const muteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ success: false, message: 'chatId is required' });

    const { error } = await supabase
      .from('muted_chats')
      .insert({ user_id: req.user.id, chat_id: chatId });
      
    if (error && error.code !== '23505') throw error;
    return res.json({ success: true, message: 'Chat muted successfully' });
  } catch (err) {
    console.error('muteChat error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mute chat' });
  }
};

export const unmuteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { error } = await supabase
      .from('muted_chats')
      .delete()
      .match({ user_id: req.user.id, chat_id: chatId });
      
    if (error) throw error;
    return res.json({ success: true, message: 'Chat unmuted successfully' });
  } catch (err) {
    console.error('unmuteChat error:', err);
    return res.status(500).json({ success: false, message: 'Failed to unmute chat' });
  }
};

export const getChatMedia = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { chatId } = req.params; // actually contactId or group chat id

    let sharedChatId = chatId;
    
    // Check if it's a direct chat (chatId is actually contact user UUID)
    const { data: isUser } = await supabase.from('users').select('id').eq('id', chatId).single();
    if (isUser) {
      const { data: myChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', currentUserId);
      const { data: theirChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', chatId);
      
      sharedChatId = null;
      if (myChats && theirChats) {
        const myIds = myChats.map(c => c.chat_id);
        const theirIds = theirChats.map(c => c.chat_id);
        sharedChatId = myIds.find(id => theirIds.includes(id));
      }
    }

    if (!isUser) {
      const { data: part } = await supabase.from('chat_participants').select('id').eq('chat_id', sharedChatId).eq('user_id', currentUserId).maybeSingle();
      if (!part) return res.status(403).json({ success: false, message: 'Unauthorized to view this chat media.' });
    }

    if (!sharedChatId) {
      return res.json({ success: true, media: [] });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', sharedChatId)
      .neq('type', 'text')
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    return res.json({ success: true, media: data });
  } catch (err) {
    console.error('getChatMedia error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
};


export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    // Supabase messages table currently has a metadata jsonb column we can use for reactions
    const { data: msg, error: fetchErr } = await supabase.from('messages').select('chat_id, metadata').eq('id', messageId).single();
    if (fetchErr) throw fetchErr;

    const { data: part } = await supabase.from('chat_participants').select('id').eq('chat_id', msg.chat_id).eq('user_id', userId).maybeSingle();
    if (!part) return res.status(403).json({ success: false, message: 'Unauthorized to react to this message.' });

    let metadata = msg.metadata || {};
    let reactions = metadata.reactions || {};
    
    // Toggle reaction
    if (reactions[emoji] && reactions[emoji].includes(userId)) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      if (!reactions[emoji]) reactions[emoji] = [];
      reactions[emoji].push(userId);
    }
    
    metadata.reactions = reactions;

    const { error: updateErr } = await supabase.from('messages').update({ metadata }).eq('id', messageId);
    if (updateErr) throw updateErr;

    return res.json({ success: true, reactions });
  } catch (err) {
    console.error('reactToMessage err:', err);
    return res.status(500).json({ success: false, message: 'Failed to react to message.' });
  }
};

export const updateMessageMetadata = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { metadata } = req.body;
    
    // Check permission
    const { data: msg } = await supabase.from('messages').select('chat_id').eq('id', messageId).single();
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    
    const { data: part } = await supabase.from('chat_participants').select('id').eq('chat_id', msg.chat_id).eq('user_id', req.user.id).maybeSingle();
    if (!part) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { error } = await supabase.from('messages').update({ metadata }).eq('id', messageId);
    if (error) throw error;
    
    return res.json({ success: true });
  } catch (err) {
    console.error('updateMessageMetadata err:', err);
    return res.status(500).json({ success: false });
  }
};


export const markMessageAsPaid = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Fetch current message
    const { data: msg, error: fetchErr } = await supabase.from('messages').select('*').eq('id', messageId).single();
    if (fetchErr || !msg) return res.status(404).json({ success: false, message: 'Message not found' });
    
    // Update metadata
    const metadata = msg.metadata || {};
    metadata.status = 'paid';
    
    const { data, error } = await supabase
      .from('messages')
      .update({ metadata })
      .eq('id', messageId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    // Optional: emit socket event to update sender's UI
    // const io = require('../socket/socketHandler.js').getIO();
    // io.to(msg.sender_id).emit('chat:message_updated', data);
    
    return res.json({ success: true, message: data });
  } catch (err) {
    console.error('Mark as paid error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update payment status' });
  }
};
