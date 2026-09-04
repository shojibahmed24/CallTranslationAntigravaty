import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import twilio from 'twilio';
import supabase from '../database/supabaseClient.js';
import { CONFIG } from '../config/index.js';
import { auth as adminAuth } from '../config/firebaseAdmin.js';

// Setup Twilio if ENV variables are provided
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ success: false, message: 'Valid international phone number is required (e.g. +8801811223344).' });
    }

    const cleanPhone = phone.trim();
    const { mode } = req.body; // 'login' or 'register'

    if (mode === 'register') {
      const { data: existingUser } = await supabase.from('users').select('id').eq('phone_number', cleanPhone).maybeSingle();
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'This number is already registered. Please log in instead.' });
      }
    } else if (mode === 'login') {
      const { data: existingUser } = await supabase.from('users').select('id').eq('phone_number', cleanPhone).maybeSingle();
      if (!existingUser) {
        return res.status(404).json({ success: false, message: 'Account not found. Please register first.' });
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Always log OTP to console for easy development testing
    console.log(`[OTP GENERATED] Phone: ${cleanPhone} | Code: ${otpCode}`);

    // Store in Supabase 'settings' table to prevent in-memory loss across server restarts/clusters
    const otpKey = `otp_${cleanPhone}`;
    const otpData = {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins
    };

    await supabase.from('settings').upsert([{ key: otpKey, value: otpData }]);

        let smsStatusMessage = 'Verification SMS OTP dispatched successfully.';
    // PRODUCTION TWILIO LOGIC WITH DEV FALLBACK
    // HACK: To remove this fallback in the future, just delete the catch block content and throw the error.
    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: `Your UNICOM verification code is: ${otpCode}. It expires in 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
          to: cleanPhone
        });
        console.log(`[Twilio SMS] OTP sent to ${cleanPhone}`);
      } catch (twilioErr) {
        console.error('[Twilio Error]:', twilioErr.message);
        
        // --- DEV FALLBACK (Remove in final production if strict SMS is required) ---
        console.log(`[DEV FALLBACK SMS-GATEWAY] OTP generated for ${cleanPhone}: ${otpCode}`);
        smsStatusMessage = 'Twilio SMS failed (Trial limitation). OTP generated locally for dev testing.';
        return res.json({ success: true, message: smsStatusMessage, phone: cleanPhone, devOtp: otpCode });
        // -------------------------------------------------------------------------
      }
    } else {
      console.log(`[Local SMS-GATEWAY] OTP sent to ${cleanPhone}: ${otpCode}`);
      smsStatusMessage = 'Verification code generated locally. (Twilio not configured)';
    }

    return res.json({
      success: true,
      message: smsStatusMessage,
      phone: cleanPhone
    });
  } catch (err) {
    console.error('requestOtp error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, code, deviceId = `dev_${Date.now()}` } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone and OTP code are required.' });
    }

    const cleanPhone = phone.trim();
    const otpKey = `otp_${cleanPhone}`;

    // Retrieve from Supabase
    const { data: settingRecord } = await supabase.from('settings').select('value').eq('key', otpKey).maybeSingle();
    const stored = settingRecord ? settingRecord.value : null;

    const isDevPass = process.env.NODE_ENV !== 'production' && code === '123456';
    if (!isDevPass && (!stored || stored.code !== code || Date.now() > stored.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    // Delete OTP after successful verification
    await supabase.from('settings').delete().eq('key', otpKey);

    // Fetch user from Supabase
    let { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (fetchErr) {
      console.error(fetchErr);
      return res.status(500).json({ success: false, message: 'Database query failed.' });
    }

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const newUser = {
        phone_number: cleanPhone,
        name: 'New UNICOM User',
        profile_picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
        status: 'Hey there! I am using UNICOM.',
        active_device_id: deviceId,
        role: 'user',
        wallet_balance: 0.0,
        is_approved: true, // Assuming auto-approve for now
        last_seen: new Date().toISOString()
      };

      const { data: insertedUser, error: insertErr } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ success: false, message: 'Failed to create user.' });
      }
      user = insertedUser;
    } else {
      // Update active device session
      const { data: updatedUser, error: updateErr } = await supabase
        .from('users')
        .update({
          active_device_id: deviceId,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateErr) {
        console.error(updateErr);
      } else {
        user = updatedUser;
      }
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone_number, deviceId },
      CONFIG.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Map DB fields back to what the frontend expects temporarily
    const frontendUser = {
      id: user.id,
      phone: user.phone_number,
      name: user.name,
          avatar: user.profile_picture,
          about: user.status,
          language: user.language, translated_minutes_used_today: user.translated_minutes_used_today,
          translated_minutes_used_today: user.translated_minutes_used_today,
      plan: 'free',
      onlineStatus: 'online',
      lastSeen: user.last_seen
    };

    return res.json({
      success: true,
      token,
      isNewUser,
      user: frontendUser
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ success: false, message: 'Authentication verification failed.' });
  }
};

export const devDemoLogin = async (req, res) => {
  try {
    const { userId, deviceId = `dev_quick_${Date.now()}` } = req.body;
    
    // Fallback logic mostly disabled for Supabase unless we have a specific ID, 
    // but we can query it.
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!user) {
      const isShojib = userId === '7daea47d-b5de-49a4-bd78-3b233c76cffd';
      const newUser = {
        id: userId,
        phone_number: isShojib ? '+8801700000001' : '+8801700000002',
        name: isShojib ? 'Shojib' : 'Sadaf',
        status: 'Developer Mode',
        role: 'user',
        is_approved: true
      };
      await supabase.from('users').insert(newUser);
      user = newUser;
    }

    await supabase
      .from('users')
      .update({ active_device_id: deviceId, last_seen: new Date().toISOString() })
      .eq('id', user.id);

    const token = jwt.sign(
      { userId: user.id, phone: user.phone_number, deviceId },
      CONFIG.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone_number,
        name: user.name,
        avatar: user.profile_picture
      }
    });
  } catch (err) {
    console.error('devDemoLogin error:', err);
    return res.status(500).json({ success: false, message: 'Dev demo login failed.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: {
      id: user.id,
      phone: user.phone_number,
      name: user.name,
        avatar: user.profile_picture,
        about: user.status,
        language: user.language, translated_minutes_used_today: user.translated_minutes_used_today
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, about, status, avatar, profile_picture, language, theme, chat_wallpaper, privacy, bank_details, crypto_details, notifications } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name.trim();
      if (about !== undefined) updates.status = about.trim();
      if (status !== undefined) updates.status = status.trim();
      if (avatar !== undefined) updates.profile_picture = avatar;
      if (profile_picture !== undefined) updates.profile_picture = profile_picture;
      
    if (language !== undefined) updates.language = language;
    if (theme !== undefined) updates.theme = theme;
    if (chat_wallpaper !== undefined) updates.chat_wallpaper = chat_wallpaper;
    
    // Using the privacy JSONB column to store extra settings if necessary
    if (privacy !== undefined) {
      if (bank_details !== undefined) privacy.bank_details = bank_details;
      if (crypto_details !== undefined) privacy.crypto_details = crypto_details;
      updates.privacy = privacy;
    } else if (bank_details !== undefined || crypto_details !== undefined) {
      // Fetch existing privacy object to merge
      const { data: existingUser } = await supabase.from('users').select('privacy').eq('id', req.user.id).single();
      const currentPrivacy = existingUser?.privacy || {};
      if (bank_details !== undefined) currentPrivacy.bank_details = bank_details;
      if (crypto_details !== undefined) currentPrivacy.crypto_details = crypto_details;
      updates.privacy = currentPrivacy;
    }

    if (Object.keys(updates).length === 0) {
        return res.json({ success: true, message: 'No valid fields to update.' });
      }
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Supabase update failed.' });
    }

    return res.json({ success: true, message: 'Profile updated successfully.', user: {
      id: user.id,
      phone: user.phone_number,
      name: user.name,
      avatar: user.profile_picture,
      about: user.status,
      language: user.language, translated_minutes_used_today: user.translated_minutes_used_today
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.user.id);
      
    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete account in Supabase.' });
    }
    return res.json({ success: true, message: 'Your account has been deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'User ID is required' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, status, language, profile_picture, chat_wallpaper, created_at, phone_number')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    const priv = user.privacy || {};
    let profileData = {
      id: user.id,
      name: user.name || 'Unknown User',
      status: user.status || 'Hey there! I am using UNICOM.',
      avatar: user.profile_picture,
        profile_picture: user.profile_picture,
      phone: user.phone_number,
      last_active: user.last_active
    };
    
    if (priv.profilePhoto === 'Nobody') profileData.avatar = null;
    if (priv.lastSeen === 'Nobody') {
      profileData.last_active = null;
      profileData.status = null;
    }

    return res.json({
      success: true,
      user: profileData
    });

  } catch (err) {
    console.error('getPublicProfile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
};

export const toggleMuteUser = async (req, res) => {
  try {
    const { userIdToMute } = req.body;
    if (!userIdToMute) return res.status(400).json({ success: false, message: 'userIdToMute is required' });

    const { data: user } = await supabase.from('users').select('settings').eq('id', req.user.id).single();
    let settings = user?.settings || {};
    let mutedUsers = settings.muted_users || [];

    const isMuted = mutedUsers.includes(userIdToMute);
    if (isMuted) {
      mutedUsers = mutedUsers.filter(id => id !== userIdToMute);
    } else {
      mutedUsers.push(userIdToMute);
    }

    settings.muted_users = mutedUsers;

    const { error } = await supabase.from('users').update({ settings }).eq('id', req.user.id);
    if (error) throw error;

    return res.json({ success: true, isMuted: !isMuted, mutedUsers });
  } catch (err) {
    console.error('toggleMuteUser error:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle mute' });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    if (!blockedId) return res.status(400).json({ success: false, message: 'blockedId is required' });

    // Check if already blocked
    const { data: existing } = await supabase
      .from('blocked_users')
      .select('*')
      .eq('blocker_id', req.user.id)
      .eq('blocked_id', blockedId)
      .single();

    if (!existing) {
      await supabase
        .from('blocked_users')
        .insert({ blocker_id: req.user.id, blocked_id: blockedId });
    }
    
    return res.json({ success: true, message: 'User blocked successfully' });
  } catch (err) {
    console.error('blockUser error:', err);
    return res.status(500).json({ success: false, message: 'Failed to block user' });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { blockedId } = req.params;
    
    await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', req.user.id)
      .eq('blocked_id', blockedId);

    return res.json({ success: true, message: 'User unblocked successfully' });
  } catch (err) {
    console.error('unblockUser error:', err);
    return res.status(500).json({ success: false, message: 'Failed to unblock user' });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const { data: blocks } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', req.user.id);
    
    const arr = blocks ? blocks.map(b => b.blocked_id) : [];
    return res.json({ success: true, blockedUsers: arr });
  } catch (err) {
    console.error('getBlockedUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch blocked users' });
  }
};

export const verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken, deviceId = `dev_${Date.now()}` } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    }

    // Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number not found in Firebase token.' });
    }

    // Upsert user into Supabase
    const { data: existingUsers } = await supabase.from('users').select('*').eq('phone_number', phone);
    let user = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

    if (!user) {
      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert([{
          phone_number: phone,
          name: 'New User',
          language: 'en',
          created_at: new Date().toISOString(),
          active_device_id: deviceId,
          last_seen: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (insertErr) throw insertErr;
      user = newUser;
    } else {
      const { data: updatedUser, error: updateErr } = await supabase
        .from('users')
        .update({ active_device_id: deviceId, last_seen: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
        
      if (updateErr) throw updateErr;
      user = updatedUser;
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone_number, deviceId },
      CONFIG.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone_number,
        name: user.name,
        avatar: user.profile_picture,
        language: user.language, translated_minutes_used_today: user.translated_minutes_used_today
      }
    });

  } catch (err) {
    console.error('verifyFirebaseToken error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify Firebase token.', error: err.message });
  }
};

export const updatePushToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pushToken } = req.body;
    
    // Implementation can just return success for now if it doesn't exist
    return res.json({ success: true, message: 'Push token updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};