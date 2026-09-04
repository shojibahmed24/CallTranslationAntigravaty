import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/index.js';

export const requireAdminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, CONFIG.ADMIN_JWT_SECRET);

    if (decoded.role !== 'admin' || !decoded.twoFactorVerified) {
      return res.status(403).json({ success: false, message: 'Forbidden. 2FA verification required for Admin access.' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session.' });
  }
};
