import { sendPushNotification } from './pushController.js';
import { callStartTimes } from '../socket/socketHandler.js';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../database/supabaseClient.js';
import { CONFIG } from '../config/index.js';
import { translationEngine } from '../services/aiTranslationService.js';
import { telemetryService } from '../services/telemetryService.js';
import { livekitProvider } from '../services/providers/webrtc/LiveKitProvider.js';

export const initiateCall = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required.' });
    }

    // Fetch caller from DB to get real language and plan
    const { data: caller, error: callerErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (callerErr || !caller) {
      return res.status(404).json({ success: false, message: 'Caller not found in database.' });
    }

    const { data: receiver, error: recErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', receiverId)
      .single();

    if (recErr || !receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }

    if (caller.is_banned) {
      return res.status(403).json({ success: false, message: 'Your account is banned from making calls.' });
    }
    
    if (receiver.is_banned) {
      return res.status(403).json({ success: false, message: 'This user is currently unavailable.' });
    }

    // Check if receiver is already in an active call
    const { data: activeCalls } = await supabase
      .from('calls')
      .select('id, created_at')
      .or(`caller_id.eq.${receiver.id},receiver_id.eq.${receiver.id}`)
      .in('status', ['initiating', 'in_progress']);

    if (activeCalls && activeCalls.length > 0) {
      // Ignore stale calls (older than 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const trulyActive = activeCalls.filter(c => new Date(c.created_at) > twoHoursAgo);
      if (trulyActive.length > 0) {
        return res.status(409).json({ success: false, message: 'User is currently busy on another call.' });
      }
    }

    const callerLang = caller.language || 'bn';
    const receiverLang = receiver.language || 'en';
    const isSameLang = translationEngine.isSameLanguage(callerLang, receiverLang);
    const isSupported = translationEngine.isPairSupported(callerLang, receiverLang);

    if (!isSupported) {
      return res.status(400).json({
        success: false,
        code: 'UNSUPPORTED_LANGUAGE_PAIR',
        message: `Real-time interpretation between ${callerLang.toUpperCase()} and ${receiverLang.toUpperCase()} is not yet supported in this release.`
      });
    }

    if (!isSameLang) {
      const plan = caller.plan || 'free';
      const planConfig = CONFIG.PLANS[plan] || CONFIG.PLANS.free;

      if (plan === 'free') {
        const usedToday = Number(caller.translated_minutes_used_today || 0);
        if (usedToday >= planConfig.translatedMinutesPerDay) {
          return res.status(403).json({
            success: false,
            code: 'DAILY_TRANSLATION_LIMIT_REACHED',
            message: `You have exhausted your Free daily translation limit (100 minutes). Upgrade to Pro or Unlimited to continue translated calling.`
          });
        }
      } else {
        const usedMonth = Number(caller.translated_minutes_used_month || 0);
        if (usedMonth >= planConfig.translatedMinutesPerMonth) {
          return res.status(403).json({
            success: false,
            code: 'MONTHLY_TRANSLATION_LIMIT_REACHED',
            message: `You have reached your monthly translation allowance (${planConfig.translatedMinutesPerMonth} minutes).`
          });
        }
      }
    }

    const callId = `call_${uuidv4().substring(0, 8)}`;
    translationEngine.initCallContext(callId, callerLang, receiverLang);

    const newCall = {
      id: callId,
      caller_id: caller.id,
      receiver_id: receiver.id,
      caller_lang: callerLang,
      receiver_lang: receiverLang,
      is_translated: !isSameLang,
      duration_seconds: 0,
      translation_minutes_charged: 0,
      status: 'initiating'
    };

    const { error: insertErr } = await supabase.from('calls').insert([newCall]);
    if (insertErr) throw insertErr;

    // Generate LiveKit Token for the caller
    const livekitToken = await livekitProvider.createToken(callId, caller.name, caller.id);

    return res.json({
      success: true,
      call: newCall,
      livekitToken, // Provide token to frontend
      receiver: {
        id: receiver.id,
        name: receiver.name,
        avatar: receiver.profile_picture,
        language: receiver.language,
        onlineStatus: receiver.online_status
      },
      isTranslated: !isSameLang
    });
  } catch (err) {
    console.error('initiateCall error:', err);
    return res.status(500).json({ success: false, message: 'Failed to initiate voice call.' });
  }
};

export const joinCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const user = req.user;

    const { data: call, error: fetchErr } = await supabase.from('calls').select('*').eq('id', callId).single();
    if (fetchErr || !call) {
      return res.status(404).json({ success: false, message: 'Call not found.' });
    }

    if (call.caller_id !== user.id && call.receiver_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to join this call.' });
    }
    
    if (call.status === 'completed' || call.status === 'missed') {
      return res.status(400).json({ success: false, message: 'Cannot join an ended call.' });
    }

    const livekitToken = await livekitProvider.createToken(callId, user.name, user.id);

    return res.json({ success: true, livekitToken });
  } catch (err) {
    console.error('joinCall error:', err);
    return res.status(500).json({ success: false, message: 'Failed to join call.' });
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId, avgLatencyMs = 140, bargeInEvents = 0 } = req.body;
    let durationSeconds = req.body.durationSeconds || 0;
    
    // H6 Fix: Override client-provided duration with server-tracked duration to prevent billing tampering
    if (callStartTimes.has(callId)) {
      durationSeconds = Math.floor((Date.now() - callStartTimes.get(callId)) / 1000);
      callStartTimes.delete(callId);
    }
    const user = req.user;
    
    // Generate summary BEFORE clearing the context
    const aiSummary = await translationEngine.generateCallSummary(callId);
    
    translationEngine.clearCallContext(callId);

    const { data: call, error: fetchErr } = await supabase.from('calls').select('*').eq('id', callId).single();
    if (fetchErr || !call) {
      return res.status(404).json({ success: false, message: 'Call not found.' });
    }

    if (call.caller_id !== user.id && call.receiver_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to end this call.' });
    }

    // State machine protection: Prevent re-ending an already ended call to avoid double-billing
    if (call.status === 'completed' || call.status === 'missed') {
      return res.json({ success: true, message: 'Call is already ended.' });
    }

    let minutesToCharge = 0;
    if (call.is_translated && durationSeconds > 0) {
      minutesToCharge = Math.ceil(durationSeconds / 60);
      
      // Fetch caller and update minutes
      const { data: caller } = await supabase.from('users').select('*').eq('id', call.caller_id).single();
      if (caller) {
        await supabase.from('users').update({
          translated_minutes_used_today: Number(caller.translated_minutes_used_today || 0) + minutesToCharge,
          translated_minutes_used_month: Number(caller.translated_minutes_used_month || 0) + minutesToCharge
        }).eq('id', call.caller_id);
      }
    }

    // Try to update with ai_summary (if column exists, else it might error, but we'll conditionally omit it if error)
    // To be safe, we will just pass it, assuming migration is done.
    const { data: updatedCall, error: updateErr } = await supabase.from('calls').update({
      status: 'completed',
      duration_seconds: durationSeconds,
      translation_minutes_charged: minutesToCharge,
      ai_summary: aiSummary || null
    }).eq('id', callId).select().single();

    if (updateErr) throw updateErr;

    telemetryService.recordCallMetric({
      callId,
      pair: `${updatedCall.caller_lang}-${updatedCall.receiver_lang}`,
      durationSeconds,
      avgLatencyMs,
      bargeInEvents,
      success: true
    });

    return res.json({
      success: true,
      message: 'Call ended successfully.',
      call: updatedCall,
      chargedMinutes: minutesToCharge
    });
  } catch (err) {
    console.error('endCall error:', err);
    return res.status(500).json({ success: false, message: 'Failed to end call.' });
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: calls, error } = await supabase
      .from('calls')
      .select(`
        *,
        caller:users!caller_id(id, name, profile_picture, language, phone_number),
        receiver:users!receiver_id(id, name, profile_picture, language, phone_number)
      `)
      .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = calls.map(c => {
      const isOutgoing = c.caller_id === userId;
      const peer = isOutgoing ? c.receiver : c.caller;

      return {
        id: c.id,
        isOutgoing,
        peer: peer ? {
          id: peer.id,
          name: peer.name,
          avatar: peer.profile_picture,
          language: peer.language,
          phone: peer.phone_number
        } : null,
        isTranslated: c.is_translated,
        callerLang: c.caller_lang,
        receiverLang: c.receiver_lang,
        durationSeconds: c.duration_seconds,
        translationMinutesCharged: c.translation_minutes_charged,
        status: c.status,
        createdAt: c.created_at,
        aiSummary: c.ai_summary
      };
    });

    return res.json({ success: true, calls: formatted });
  } catch (err) {
    console.error('getCallHistory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch call history.' });
  }
};

export const reportTranslationIssue = async (req, res) => {
  try {
    const { callId, reason = 'latency', details = '' } = req.body;
    
    if (!callId) {
      return res.status(400).json({ success: false, message: 'Missing required parameter: callId' });
    }
    
    const validReasons = ['latency', 'accuracy', 'audio_quality', 'connection_drop', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid issue reason provided.' });
    }

    telemetryService.recordCallMetric({
      callId,
      pair: 'user_reported',
      durationSeconds: 0,
      avgLatencyMs: 0,
      success: false,
      failureReason: `${reason}: ${details}`
    });

    return res.json({ success: true, message: 'Thank you for reporting. Our engineering team is optimizing the AI translation model.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
};

export const deleteCallLog = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    // Check ownership
    const { data: call, error: fetchErr } = await supabase.from('calls').select('caller_id, receiver_id').eq('id', callId).single();
    
    if (fetchErr || !call) {
      return res.status(404).json({ success: false, message: 'Call not found' });
    }

    if (call.caller_id !== userId && call.receiver_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this call log' });
    }

    const { error } = await supabase
      .from('calls')
      .delete()
      .eq('id', callId);
      
    if (error) throw error;
    return res.json({ success: true, message: 'Call log deleted' });
  } catch (err) {
    console.error('deleteCallLog error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete call log' });
  }
};


export const clearCallHistory = async (req, res) => {
  try {
    const { error } = await supabase
      .from('calls')
      .delete()
      .or(`caller_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`);
      
    if (error) throw error;
    
    return res.json({ success: true, message: 'Call history cleared' });
  } catch (err) {
    console.error('Clear call history error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear call history' });
  }
};
