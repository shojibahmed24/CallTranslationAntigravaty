import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/index.js';
import supabase from '../database/supabaseClient.js';
import { livekitAgent } from '../services/livekitAgentService.js';
import { translationEngine } from '../services/aiTranslationService.js';
import { telemetryService } from '../services/telemetryService.js';
import { sendPushNotification } from '../controllers/pushController.js';

// Map of userId -> socketId and socketId -> userId
// In a multi-worker production environment, we would use Redis for this
const userSocketMap = new Map();
const socketUserMap = new Map();
const activeCallTimeouts = new Map();
export const callStartTimes = new Map();

export const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
      socket.user = decoded; 
      socket.user.id = decoded.userId || decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // User authentication / online presence
    socket.on('user:join', async () => {
      const userId = socket.user.id;
      
      userSocketMap.set(userId, socket.id);
      socketUserMap.set(socket.id, userId);

      // Update online status in Supabase DB
      await supabase
        .from('users')
        .update({
          online_status: 'online',
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);

      // Broadcast user online to all connected clients
      io.emit('user:presence_changed', { userId, status: 'online' });
      // Send current online users to the joining client
      const onlineUsers = Array.from(userSocketMap.keys());
      socket.emit('user:presence_sync', { onlineUsers });
    });

    // Group Chat Rooms
    socket.on('chat:join', ({ chatId }) => {
      socket.join(`chat_${chatId}`);
    });

    // Typing Indicators
    socket.on('typing:start', ({ receiverId, chatId }) => {
      const senderId = socket.user.id;
      if (chatId) {
        socket.to(`chat_${chatId}`).emit('typing:status', { senderId, isTyping: true, chatId });
      } else {
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('typing:status', { senderId, isTyping: true });
      }
    });

    socket.on('typing:stop', ({ receiverId, chatId }) => {
      const senderId = socket.user.id;
      if (chatId) {
        socket.to(`chat_${chatId}`).emit('typing:status', { senderId, isTyping: false, chatId });
      } else {
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('typing:status', { senderId, isTyping: false });
      }
    });

    // Real-time Chat message dispatch
    socket.on('message:send', (messageData) => {
      messageData.sender_id = socket.user.id;
      const { receiverId, chat_id } = messageData;
      if (chat_id) {
        socket.to(`chat_${chat_id}`).emit('message:received', messageData);
      }
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:received', messageData);
        // Acknowledge delivered
        socket.emit('message:status_update', { messageId: messageData.id, status: 'delivered' });
      } else {
        // Receiver is offline, send Push Notification
        sendPushNotification(receiverId, {
          title: 'New Message',
          body: 'You received a new message.',
          url: '/'
        });
      }
    });

    socket.on('message:delete', ({ messageId, receiverId, chatId }) => {
      const deleterId = socket.user.id;
      if (chatId) {
        socket.to(`chat_${chatId}`).emit('message:deleted', { messageId, deleterId });
      } else {
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('message:deleted', { messageId, deleterId });
      }
    });

    socket.on('message:read', ({ messageIds = [], senderId }) => {
      const readerId = socket.user.id;
      const senderSocketId = userSocketMap.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:read_receipt', { messageIds, readerId });
      }
    });

    // --- REAL-TIME VOICE CALL & SIMULTANEOUS TRANSLATION EVENTS ---

    // 1. Initiate Call Offer
    socket.on('call:offer', ({ callId, caller, receiverId, isTranslated, callerLang, receiverLang, isVideo }) => {
      // Ensure caller is the authenticated user
      const authenticatedCaller = { ...caller, id: socket.user.id };
      
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call:incoming', {
          callId,
          caller: authenticatedCaller,
          isTranslated,
          callerLang,
          receiverLang,
          isVideo
        });
      } else {
        socket.emit('call:ringing', { message: 'Calling via Push Notification...' });
      }

      sendPushNotification(receiverId, {
        title: `Incoming ${isVideo ? 'Video' : 'Voice'} Call: ${authenticatedCaller?.name || 'Unknown'}`,
        body: isTranslated ? 'Simultaneous Translated Call' : `Direct ${isVideo ? 'Video' : 'Voice'} Call`,
        url: '/'
      });

      if (activeCallTimeouts.has(callId)) clearTimeout(activeCallTimeouts.get(callId));
      
      const timeoutId = setTimeout(async () => {
        activeCallTimeouts.delete(callId);
        socket.emit('call:timeout', { callId, reason: 'unanswered' });
        if (receiverSocketId) io.to(receiverSocketId).emit('call:missed', { callId });
        await supabase.from('calls').update({ duration_seconds: 0 }).eq('id', callId);
      }, 30000);
      
      activeCallTimeouts.set(callId, timeoutId);
    });

    // 2. Answer Call
    socket.on('call:answer', ({ callId, callerId }) => {
      callStartTimes.set(callId, Date.now());
      if (activeCallTimeouts.has(callId)) {
        clearTimeout(activeCallTimeouts.get(callId));
        activeCallTimeouts.delete(callId);
      }
      const callerSocketId = userSocketMap.get(callerId);
      if (callerSocketId) {
        // We notify the caller that the receiver (socket.user.id) answered
        io.to(callerSocketId).emit('call:connected', { callId, receiverId: socket.user.id });
        }
        
        // Spawn AI LiveKit Bot for Hybrid Translation
        // We need to fetch the call details to know the languages
        supabase.from('calls').select('caller_lang, receiver_lang').eq('id', callId).single().then(({ data: callData }) => {
          if (callData) {
            livekitAgent.joinCallAsBot(
              callId, 
              callerId, 
              socket.user.id, 
              callData.caller_lang, 
              callData.receiver_lang, 
              io, 
              userSocketMap
            );
            translationEngine.initCallContext(callId, callData.caller_lang, callData.receiver_lang);
          }
        });
    });

    // 3. Reject / Busy Call
    socket.on('call:reject', ({ callId, callerId, reason = 'declined' }) => {
      if (activeCallTimeouts.has(callId)) {
        clearTimeout(activeCallTimeouts.get(callId));
        activeCallTimeouts.delete(callId);
      }
      const callerSocketId = userSocketMap.get(callerId);
      if (callerSocketId) {
        // We notify the caller that the receiver (socket.user.id) rejected
        io.to(callerSocketId).emit('call:rejected', { callId, reason, receiverId: socket.user.id });
      }
    });

    // 4. Simultaneous AI Speech Processing Pipeline
    socket.on('call:speech_input', async ({ callId, speakerId, peerId, sourceLang, targetLang, rawText, audioBuffer, audioBase64, isFinal = true }) => {
      speakerId = socket.user.id; // Enforce authenticated speaker
      try {
        // Convert audioBase64 to Buffer if sent from frontend
        let finalAudioBuffer = audioBuffer;
        if (!finalAudioBuffer && audioBase64) {
          finalAudioBuffer = Buffer.from(audioBase64, 'base64');
        }

        const result = await translationEngine.processSimultaneousSpeech({
          callId,
          speakerId,
          sourceLang,
          targetLang,
          rawText,
          audioBuffer: finalAudioBuffer,
          isFinal
        });

        const peerSocketId = userSocketMap.get(peerId);
        if (peerSocketId) {
          // Emit translated audio metadata and buffer to recipient
          io.to(peerSocketId).emit('call:translated_audio', {
            callId,
            speechId: result.speechId,
            sourceLang,
            targetLang,
            originalText: result.originalText,
            translatedText: result.translatedText,
            audioBase64: result.audioBase64, // Real TTS Audio from ElevenLabs
            audioSynthesisMeta: result.audioSynthesisMeta,
            isDirect: result.isDirect,
            latencyMs: result.latencyMs
          });
        }

        // Acknowledge back to speaker with latency telemetry
        socket.emit('call:speech_processed', {
          speechId: result.speechId,
          latencyMs: result.latencyMs,
          isDirect: result.isDirect
        });
      } catch (err) {
        console.error('Speech translation pipeline error:', err);
        socket.emit('call:translation_error', { message: 'Translation service encountered a glitch' });
      }
    });

    // 5. Barge-in / Interruption handling
    socket.on('call:interrupt', ({ callId, speakerId, peerId }) => {
      const interruption = translationEngine.interruptActiveSpeech(callId, speakerId);
      const peerSocketId = userSocketMap.get(peerId);

      // Interruption signal disabled for Full Duplex mode
    });

    
    // WebRTC Signaling
    socket.on('call:toggle_mute', ({ callId, isMuted, peerId }) => {
      const peerSocketId = userSocketMap.get(peerId);
      if (peerSocketId) io.to(peerSocketId).emit('call:mute_toggled', { callId, isMuted });
    });

    socket.on('call:toggle_video', ({ callId, isVideo, peerId }) => {
      const peerSocketId = userSocketMap.get(peerId);
      if (peerSocketId) io.to(peerSocketId).emit('call:video_toggled', { callId, isVideo });
    });

    socket.on('video:offer', ({ callId, receiverId, sdp }) => {
      const peerSocketId = userSocketMap.get(receiverId);
      if (peerSocketId) io.to(peerSocketId).emit('video:offer', { callId, sdp });
    });
    
    socket.on('video:answer', ({ callId, receiverId, sdp }) => {
      const peerSocketId = userSocketMap.get(receiverId);
      if (peerSocketId) io.to(peerSocketId).emit('video:answer', { callId, sdp });
    });
    
    socket.on('ice:candidate', ({ callId, receiverId, candidate }) => {
      const peerSocketId = userSocketMap.get(receiverId);
      if (peerSocketId) io.to(peerSocketId).emit('ice:candidate', { callId, candidate });
    });


    // 6. End Call
    socket.on('call:end', async ({ callId, peerId, durationSeconds, avgLatencyMs }) => {
        if (activeCallTimeouts.has(callId)) {
          clearTimeout(activeCallTimeouts.get(callId));
          activeCallTimeouts.delete(callId);
        }
        
        const peerSocketId = userSocketMap.get(peerId);
        if (peerSocketId) {
          io.to(peerSocketId).emit('call:ended', { callId, durationSeconds });
        }
        
        // Generate Call Summary
        try {
          const summary = await translationEngine.generateCallSummary(callId);
          if (summary) {
            // Find chat ID
            const myId = socket.user.id;
            const { data: chats } = await supabase.rpc('get_direct_chat', { user1: myId, user2: peerId });
            let chatId;
            if (chats && chats.length > 0) {
              chatId = chats[0].id;
            } else {
              const { data: existingChat } = await supabase.from('chats')
                .select('id')
                .or(`and(participant1_id.eq.${myId},participant2_id.eq.${peerId}),and(participant1_id.eq.${peerId},participant2_id.eq.${myId})`)
                .single();
              if (existingChat) chatId = existingChat.id;
            }
            
            if (chatId) {
              const { data: newMsg } = await supabase.from('messages').insert({
                chat_id: chatId,
                sender_id: myId, // System generated but assigned to caller for now
                text: "📞 Call Summary (" + Math.floor((durationSeconds || 0)/60) + "m " + ((durationSeconds || 0)%60) + "s):\n\n" + summary,
                type: 'text'
              }).select().single();
              
              if (newMsg) {
                io.to(peerSocketId).emit('message:received', newMsg);
                socket.emit('message:received', newMsg);
              }
            }
          }
          translationEngine.clearCallContext(callId);
        } catch (e) {
          console.error('Call Summary Error:', e);
        }
    });

    // Disconnect handler
    socket.on('disconnect', async () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);

        const lastSeen = new Date().toISOString();
        await supabase
          .from('users')
          .update({
            online_status: 'offline',
            last_seen: lastSeen
          })
          .eq('id', userId);

        io.emit('user:presence_changed', { userId, status: 'offline', lastSeen });
      }
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });
};
