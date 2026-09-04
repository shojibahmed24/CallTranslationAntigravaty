import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import supabase from '../database/supabaseClient.js';
import { CONFIG } from '../config/index.js';
import { telemetryService } from '../services/telemetryService.js';


const verifyAdminPassword = async (inputPassword) => {
  const hashOrPlaintext = CONFIG.ADMIN_PASSWORD_HASH;
  if (hashOrPlaintext.startsWith('$2') && hashOrPlaintext.length >= 59) {
    return await bcrypt.compare(inputPassword, hashOrPlaintext);
  }
  return inputPassword === hashOrPlaintext;
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password are required.' });
    }

    if (email !== CONFIG.ADMIN_EMAIL || !(await verifyAdminPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    // Check if 2FA secret exists in database
    const { data } = await supabase.from('settings').select('value').eq('key', 'admin_2fa_secret').maybeSingle();
    let secret = data?.value;
    let qrCodeUrl = null;

    if (!secret) {
      // Generate new secret for the first time
      secret = authenticator.generateSecret();
      await supabase.from('settings').insert([{ key: 'admin_2fa_secret', value: secret }]);
      
      const otpauth = authenticator.keyuri(email, 'UNICOM_Admin', secret);
      qrCodeUrl = await qrcode.toDataURL(otpauth);
    }

    // Generate temporary 2FA token
    const twoFactorToken = jwt.sign(
      { email, role: 'admin_pending_2fa' },
      CONFIG.ADMIN_JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.json({
      success: true,
      requires2FA: true,
      twoFactorToken,
      qrCodeUrl,
      message: qrCodeUrl 
        ? 'Please scan this QR code with Google Authenticator and enter the 6-digit code to complete setup.'
        : 'Password verified. Enter your 6-digit 2FA authenticator code to proceed.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Admin login failed.' });
  }
};

export const verifyAdmin2FA = async (req, res) => {
  try {
    const { twoFactorToken, code } = req.body;

    if (!twoFactorToken || !code) {
      return res.status(400).json({ success: false, message: '2FA code is required.' });
    }

    const decoded = jwt.verify(twoFactorToken, CONFIG.ADMIN_JWT_SECRET);
    if (decoded.role !== 'admin_pending_2fa') {
      return res.status(403).json({ success: false, message: 'Invalid token role.' });
    }

    const { data } = await supabase.from('settings').select('value').eq('key', 'admin_2fa_secret').single();
    const secret = data?.value;

    if (!secret) {
      return res.status(500).json({ success: false, message: '2FA is not configured on the server.' });
    }

    const isValid = authenticator.verify({ token: code, secret });
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA authenticator code.' });
    }

    const token = jwt.sign(
      { email: decoded.email, role: 'admin', twoFactorVerified: true },
      CONFIG.ADMIN_JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      token,
      message: 'Admin authentication successful.',
      admin: { email: decoded.email }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired 2FA token.' });
  }
};

export const getOverview = async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: activeCallsCount },
      { count: totalCallsCompleted },
      { count: pendingUsdtPayments },
      { count: openTickets },
      { data: users },
      { data: calls }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('calls').select('*', { count: 'exact', head: true }).in('status', ['in_progress', 'initiating']),
      supabase.from('calls').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('users').select('storage_used_bytes'),
      supabase.from('calls').select('translation_minutes_charged').eq('status', 'completed')
    ]);

    const totalStorageBytes = users?.reduce((sum, u) => sum + (Number(u.storage_used_bytes) || 0), 0) || 0;
    const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
    const totalMinutesTranslated = calls?.reduce((sum, c) => sum + (Number(c.translation_minutes_charged) || 0), 0) || 0;

    const telemetryStats = await telemetryService.getAggregatedStats();

    return res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        activeCallsCount: activeCallsCount || 0,
        totalCallsCompleted: totalCallsCompleted || 0,
        totalMinutesTranslated,
        pendingUsdtPayments: pendingUsdtPayments || 0,
        openTickets: openTickets || 0,
        totalStorageGB: parseFloat(totalStorageGB),
        successRatePercent: telemetryStats.successRatePercent,
        avgLatencyMs: telemetryStats.avgLatencyMs
      }
    });
  } catch (err) {
    console.error('getOverview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin overview.' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone_number,
      language: u.language,
      plan: u.plan,
      storageUsedMB: Math.round((Number(u.storage_used_bytes) || 0) / (1024 * 1024)),
      translatedMinutesUsedToday: Number(u.translated_minutes_used_today) || 0,
      translatedMinutesUsedMonth: Number(u.translated_minutes_used_month) || 0,
      onlineStatus: u.online_status,
      lastSeen: u.last_seen,
      isBanned: u.is_banned || false,
      createdAt: u.created_at
    }));

    return res.json({ success: true, users: formatted });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

export const updateUserQuota = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan, bonusMinutes, isBanned } = req.body;

    const { data: u, error: fetchErr } = await supabase.from('users').select('*').eq('id', userId).single();
    if (fetchErr || !u) return res.status(404).json({ success: false, message: 'User not found.' });

    const updates = {};
    if (plan !== undefined) updates.plan = plan;
    if (bonusMinutes !== undefined) {
      updates.translated_minutes_used_month = Math.max(0, (Number(u.translated_minutes_used_month) || 0) - bonusMinutes);
    }
    if (isBanned !== undefined) updates.is_banned = isBanned;

    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.json({ success: true, message: 'User updated successfully.', user: updatedUser });
  } catch (err) {
    console.error('updateUserQuota error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

export const getManualPayments = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase.from('payments').select('*').order('submitted_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data: payments, error } = await query;
    if (error) throw error;

    return res.json({ success: true, payments });
  } catch (err) {
    console.error('getManualPayments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
};

export const reviewManualPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action, reason = null } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject.' });
    }

    const { data: payment, error: fetchErr } = await supabase.from('payments').select('*').eq('id', paymentId).single();
    if (fetchErr || !payment) return res.status(404).json({ success: false, message: 'Payment record not found.' });

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: updatedPayment, error: payErr } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.admin.email,
        rejection_reason: reason
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (payErr) throw payErr;

    let userUpgraded = null;
    if (action === 'approve') {
      const { data: u } = await supabase.from('users').select('*').eq('id', payment.user_id).single();
      if (u) {
        const { data: updatedU } = await supabase
          .from('users')
          .update({
            plan: payment.plan_id,
            translated_minutes_used_today: 0
          })
          .eq('id', payment.user_id)
          .select()
          .single();
        userUpgraded = updatedU;
      }
    }

    // Audit Log
    await supabase.from('audit_logs').insert([{
      id: `audit_${uuidv4().substring(0, 8)}`,
      admin_email: req.admin.email,
      action: action === 'approve' ? 'MANUAL_PAYMENT_APPROVED' : 'MANUAL_PAYMENT_REJECTED',
      details: `Payment ${paymentId} (${action.toUpperCase()}) for User ${payment.user_name}. TxHash: ${payment.tx_hash}`,
      ip: req.ip || '127.0.0.1'
    }]);

    return res.json({
      success: true,
      message: `Payment ${action === 'approve' ? 'approved and plan activated' : 'rejected'}.`,
      payment: updatedPayment,
      user: userUpgraded
    });
  } catch (err) {
    console.error('reviewManualPayment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process payment review.' });
  }
};

export const getSettings = async (req, res) => {
  try {
    const { data: settingsRow } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
    return res.json({ success: true, settings: settingsRow?.value || {} });
  } catch (err) {
    console.error('getSettings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings, confirmationPassword } = req.body;

    if (!(await verifyAdminPassword(confirmationPassword))) {
      return res.status(403).json({ success: false, message: 'Invalid admin confirmation password.' });
    }

    // Get current settings first
    const { data: currentSettingsRow } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
    const currentSettings = currentSettingsRow?.value || {};
    
    const newSettings = { ...currentSettings, ...settings };

    await supabase.from('settings').upsert({
      key: 'global_config',
      value: newSettings
    });

    await supabase.from('audit_logs').insert([{
      id: `audit_${uuidv4().substring(0, 8)}`,
      admin_email: req.admin.email,
      action: 'PAYMENT_SETTINGS_MODIFIED',
      details: `Updated settings: Pro Price: $${settings.proPlanPriceUSD || 'unchanged'}`,
      ip: req.ip || '127.0.0.1'
    }]);

    return res.json({ success: true, message: 'Settings updated successfully.', settings: newSettings });
  } catch (err) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { data: auditLogs, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, auditLogs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};

export const getTelemetry = async (req, res) => {
  const telemetryStats = await telemetryService.getAggregatedStats();
  return res.json({ success: true, telemetry: telemetryStats });
};

export const getSupportTickets = async (req, res) => {
  try {
    const { data: tickets, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, tickets });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch support tickets.' });
  }
};

export const adminReplyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, status = 'in_progress' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message is required.' });
    }

    const { data: ticket, error: fetchErr } = await supabase.from('support_tickets').select('*').eq('id', ticketId).single();
    if (fetchErr || !ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    const currentMessages = ticket.messages || [];
    currentMessages.push({
      sender: 'admin',
      senderName: 'UNICOM Support Team',
      text: message,
      createdAt: new Date().toISOString()
    });

    const { data: updatedTicket, error: updateErr } = await supabase
      .from('support_tickets')
      .update({
        messages: currentMessages,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.json({ success: true, message: 'Reply sent to user.', ticket: updatedTicket });
  } catch (err) {
    console.error('adminReplyTicket error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reply to ticket.' });
  }
};
