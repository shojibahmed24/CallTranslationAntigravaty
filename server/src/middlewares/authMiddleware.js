import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/index.js';
import supabase from '../database/supabaseClient.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User account not found or deleted.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned by an administrator.' });
    }

    // Enforce 1 primary device session policy
    if (decoded.deviceId && user.active_device_id && decoded.deviceId !== user.active_device_id) {
      return res.status(403).json({ 
        success: false, 
        code: 'DEVICE_SESSION_TERMINATED',
        message: 'Your account was logged in from another device. UNICOM enforces single-device security.' 
      });
    }

    req.user = user;
    req.tokenDeviceId = decoded.deviceId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};
