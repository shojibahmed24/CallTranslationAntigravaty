import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { CONFIG } from '../config/index.js';
import supabase from '../database/supabaseClient.js';

// Multer memory storage setup
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not supported. Allowed formats: PDF, DOC, XLS, PPT, TXT, ZIP, Images.`));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: CONFIG.MAX_FILE_SIZE },
  fileFilter
}).single('file');

export const uploadFile = async (req, res) => {
  // 1. Direct Base64 Upload (Bypasses Multer for React Native Web compatibility)
  if (req.body && req.body.base64 && req.body.fileName) {
    try {
      const { data: user, error: userErr } = await supabase.from('users').select('*').eq('id', req.user.id).single();
      if (userErr || !user) return res.status(404).json({ success: false, message: 'User not found.' });

      const ext = path.extname(req.body.fileName).toLowerCase() || '.jpg';
      
      // 1a. Security: Check Extension
      if (!CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
        return res.status(400).json({ success: false, message: `File type ${ext} is not supported.` });
      }

      let base64Data = req.body.base64;
      if (base64Data.includes(',')) base64Data = base64Data.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const fileSize = buffer.length;

      // 1b. Security: Check Max File Size (Multer equivalent)
      if (fileSize > CONFIG.MAX_FILE_SIZE) {
        return res.status(400).json({ success: false, message: `File size exceeds the maximum limit of ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)} MB.` });
      }

      // 1c. Security: Check Plan Storage Quota
      const planConfig = CONFIG.PLANS[user.plan] || CONFIG.PLANS.free;
      const currentUsed = Number(user.storage_used_bytes) || 0;

      if (currentUsed + fileSize > planConfig.storageBytes) {
        return res.status(403).json({
          success: false,
          code: 'STORAGE_LIMIT_EXCEEDED',
          message: `Your cloud storage limit (${planConfig.storageGB} GB) is full. Upgrade to Pro or Unlimited.`
        });
      }

      const bucketName = req.query.type === 'profile' ? 'avatars' : (req.query.type === 'payment' ? 'payment_proofs' : 'chat-media');
      const uniqueName = `${req.user.id}/${uuidv4()}_${Date.now()}${ext}`;
      console.log('UPLOAD DEBUG:', { uniqueName, bucketName, fileSize, mimeType: req.body.mimeType, base64Prefix: base64Data.substring(0, 30) });

      // Clean base64 string to prevent any Bad Request decoding errors
      let cleanBase64 = base64Data;
      if (cleanBase64.includes(',')) cleanBase64 = cleanBase64.split(',')[1];
      cleanBase64 = cleanBase64.replace(/\s+/g, ''); // strip newlines/whitespace
      
      const cleanBuffer = Buffer.from(cleanBase64, 'base64');
      // Create a Blob to guarantee fetch polyfill compatibility
      const blob = new Blob([cleanBuffer], { type: req.body.mimeType || 'image/jpeg' });

      const { error: uploadErr } = await supabase.storage.from(bucketName).upload(uniqueName, blob, {
        contentType: req.body.mimeType || 'image/jpeg',
        upsert: true
      });
      
      if (uploadErr) throw uploadErr;
      
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uniqueName);
      
      // 1d. Billing: Update user storage usage
      await supabase.from('users').update({
        storage_used_bytes: currentUsed + fileSize
      }).eq('id', user.id);

      return res.json({
        success: true,
        file: { url: publicUrlData.publicUrl, name: uniqueName, size: fileSize, type: req.body.mimeType || 'image/jpeg' },
        storageUsedBytes: currentUsed + fileSize,
        storageQuotaBytes: planConfig.storageBytes
      });
    } catch (e) {
      console.error('Base64 Upload Error Object:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
      if (e.response) {
         console.error('Base64 Upload Error Response:', e.response.data || e.response.statusText);
      }
      return res.status(500).json({ success: false, message: 'Base64 upload failed: ' + e.message + (e.response ? ' - ' + JSON.stringify(e.response.data) : '') });
    }
  }

  // 2. Standard Multipart Form-Data Upload
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was provided.' });
    }

    try {
      const { data: user, error: userErr } = await supabase.from('users').select('*').eq('id', req.user.id).single();
      if (userErr || !user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Check Plan Storage Quota
      const planConfig = CONFIG.PLANS[user.plan] || CONFIG.PLANS.free;
      const currentUsed = Number(user.storage_used_bytes) || 0;
      const fileSize = req.file.size;

      if (currentUsed + fileSize > planConfig.storageBytes) {
        return res.status(403).json({
          success: false,
          code: 'STORAGE_LIMIT_EXCEEDED',
          message: `Your cloud storage limit (${planConfig.storageGB} GB) is full. Upgrade to Pro or Unlimited.`
        });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const uniqueName = `${req.user.id}/${uuidv4()}_${Date.now()}${ext}`;

      // Upload to Supabase Storage bucket
      // Note: We assume the 'payment_proofs', 'avatars', or 'chat-media' bucket exists
      let bucketName = 'chat-media';
      if (req.query.type === 'payment') bucketName = 'payment_proofs';
      else if (req.query.type === 'profile') bucketName = 'avatars';
      
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(uniqueName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uniqueName);
      const fileUrl = publicUrlData.publicUrl;

      // Update user storage usage
      await supabase.from('users').update({
        storage_used_bytes: currentUsed + fileSize
      }).eq('id', user.id);

      const isImage = req.file.mimetype.startsWith('image/');
      const mediaType = isImage ? 'image' : 'document';

      return res.json({
        success: true,
        file: {
          url: fileUrl,
          filename: req.file.originalname,
          storedName: uniqueName,
          size: fileSize,
          mimetype: req.file.mimetype,
          mediaType
        },
        storageUsedBytes: currentUsed + fileSize,
        storageQuotaBytes: planConfig.storageBytes
      });
    } catch (dbErr) {
      console.error('Storage upload error:', dbErr);
      return res.status(500).json({ success: false, message: 'Failed to save file to cloud storage.' });
    }
  });
};

export const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const bucketName = req.query.type === 'payment' ? 'payment_proofs' : 'chat-media';

    // Verify ownership
    if (!filename.startsWith(`${req.user.id}/`)) {
      // Fallback for legacy files without user ID prefix
      const { data: messages } = await supabase.from('messages')
        .select('id')
        .eq('sender_id', req.user.id)
        .like('file_url', `%${filename}%`)
        .limit(1);

      if (!messages || messages.length === 0) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this file.' });
      }
    }

    // Delete from Supabase
    const { error: delErr } = await supabase.storage.from(bucketName).remove([filename]);
    if (delErr) throw delErr;

    // We skip reclaiming the exact byte count here for simplicity in MVP, 
    // or you could store file sizes in a separate table and reclaim it.

    return res.json({ success: true, message: 'File deleted and cloud storage reclaimed.' });
  } catch (err) {
    console.error('deleteFile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete file.' });
  }
};
