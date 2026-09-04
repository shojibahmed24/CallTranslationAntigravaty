import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireAdminAuth } from '../middlewares/adminAuthMiddleware.js';
import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { success: false, message: 'Too many OTP requests from this IP, please try again after 15 minutes.' }
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many failed verification attempts, please try again later.' }
});

import * as authController from '../controllers/authController.js';
import * as chatController from '../controllers/chatController.js';
import * as storageController from '../controllers/storageController.js';
import * as callController from '../controllers/callController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as supportController from '../controllers/supportController.js';
import * as adminController from '../controllers/adminController.js';
import * as pushController from '../controllers/pushController.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'UNICOM API Core',
    timestamp: new Date().toISOString()
  });
});

// --- AUTH & PROFILE ---
router.post('/auth/request-otp', otpLimiter, authController.requestOtp);
router.post('/auth/verify-otp', verifyLimiter, authController.verifyOtp);
router.post('/auth/verify-firebase', authController.verifyFirebaseToken);
router.get('/auth/profile', requireAuth, authController.getProfile);
router.put('/auth/profile', requireAuth, authController.updateProfile);
router.post('/users/push-token', requireAuth, authController.updatePushToken);
router.delete('/auth/account', requireAuth, authController.deleteAccount);
router.get('/users/:id/public-profile', requireAuth, authController.getPublicProfile);

// --- BLOCK SYSTEM ---
router.post('/users/block', requireAuth, authController.blockUser);
router.delete('/users/block/:blockedId', requireAuth, authController.unblockUser);
router.get('/users/blocked', requireAuth, authController.getBlockedUsers);

// --- PUSH NOTIFICATIONS ---
// router.get('/push/public-key', pushController.getPublicKey);
// router.post('/push/subscribe', requireAuth, pushController.saveSubscription);

// --- MESSAGING & CHATS ---
router.get('/chat/conversations', requireAuth, chatController.getConversations);
router.post('/chat/group', requireAuth, chatController.createGroup);
router.get('/chat/messages/:contactId', requireAuth, chatController.getMessages);
router.post('/chat/send', requireAuth, chatController.sendMessage);
router.post('/chat/read', requireAuth, chatController.markMessagesAsRead);
router.post('/chat/messages/:messageId/mark-paid', requireAuth, chatController.markMessageAsPaid);
router.delete('/chat/messages/:messageId', requireAuth, chatController.deleteMessage);
  router.put('/chat/messages/:messageId/metadata', requireAuth, chatController.updateMessageMetadata);
router.post('/chat/messages/:messageId/react', requireAuth, chatController.reactToMessage);
router.post('/chat/sync-contacts', requireAuth, chatController.syncContacts);
router.post('/chat/mute', requireAuth, chatController.muteChat);
router.delete('/chat/mute/:chatId', requireAuth, chatController.unmuteChat);
router.get('/chat/media/:chatId', requireAuth, chatController.getChatMedia);

// --- CLOUD STORAGE & DOCUMENTS ---
router.post('/storage/upload', requireAuth, storageController.uploadFile);
router.delete('/storage/files/:filename', requireAuth, storageController.deleteFile);

// --- VOICE CALLS & SIMULTANEOUS TRANSLATION ---
router.post('/calls/initiate', requireAuth, callController.initiateCall);
router.post('/calls/:callId/join', requireAuth, callController.joinCall);
router.post('/calls/end', requireAuth, callController.endCall);
router.get('/calls/history', requireAuth, callController.getCallHistory);
router.delete('/calls/:callId', requireAuth, callController.deleteCallLog);
router.delete('/calls', requireAuth, callController.clearCallHistory);
router.post('/calls/report-issue', requireAuth, callController.reportIssue || callController.reportTranslationIssue);

// --- PAYMENTS, SUBSCRIPTIONS & USDT ---
router.get('/payments/plans-wallet', requireAuth, paymentController.getPlansAndWallet);
router.post('/payments/submit-usdt', requireAuth, paymentController.submitManualPayment);
router.post('/payments/submit-manual', requireAuth, paymentController.submitManualPayment);
router.post('/payments/local-gateway', requireAuth, paymentController.createLocalPayment);
router.post('/payments/local-ipn', paymentController.localPaymentIPN);
router.post('/payments/stripe-checkout', requireAuth, paymentController.createStripeCheckout);
router.get('/payments/history', requireAuth, paymentController.getUserPayments);

// --- HELP & SUPPORT DESK ---
router.post('/support/tickets', requireAuth, supportController.createTicket);
router.get('/support/tickets', requireAuth, supportController.getUserTickets);
router.post('/support/tickets/:ticketId/reply', requireAuth, supportController.addTicketMessage);

// --- ADMIN PORTAL (2FA SECURED) ---
router.post('/admin/login', adminController.adminLogin);
router.post('/admin/verify-2fa', adminController.verifyAdmin2FA);
router.get('/admin/overview', requireAdminAuth, adminController.getOverview);
router.get('/admin/users', requireAdminAuth, adminController.getUsers);
router.put('/admin/users/:userId/quota', requireAdminAuth, adminController.updateUserQuota);
router.get('/admin/payments', requireAdminAuth, adminController.getManualPayments);
router.post('/admin/payments/:paymentId/review', requireAdminAuth, adminController.reviewManualPayment);
router.get('/admin/settings', requireAdminAuth, adminController.getSettings);
router.put('/admin/settings', requireAdminAuth, adminController.updateSettings);
router.get('/admin/audit-logs', requireAdminAuth, adminController.getAuditLogs);
router.get('/admin/telemetry', requireAdminAuth, adminController.getTelemetry);
router.get('/admin/support/tickets', requireAdminAuth, adminController.getSupportTickets);
router.post('/admin/support/tickets/:ticketId/reply', requireAdminAuth, adminController.adminReplyTicket);

export default router;



