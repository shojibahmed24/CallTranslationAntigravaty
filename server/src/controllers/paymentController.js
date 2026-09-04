import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../database/supabaseClient.js';
import { CONFIG } from '../config/index.js';

export const getPlansAndWallet = async (req, res) => {
  try {
    const { data: settingsRow, error: setErr } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
    if (setErr && setErr.code !== 'PGRST116') throw setErr; // Ignore not found
    
    const settings = settingsRow?.value || {};

    const { data: user, error: userErr } = await supabase.from('users').select('*').eq('id', req.user.id).single();
    if (userErr) throw userErr;

    const plans = [
      {
        id: 'free',
        name: 'Free Starter',
        priceUSD: 0,
        priceBDT: 0,
        translatedMinutesMonthly: 5,
        features: [
          '5 Mins/Month Translated Voice Calls',
          'Unlimited Direct Same-Language Calls',
          'End-to-End Encrypted Messaging'
        ]
      },
      {
        id: 'basic',
        name: 'Basic Minutes',
        priceUSD: 2,
        priceBDT: 250,
        translatedMinutesMonthly: 100,
        features: [
          '100 Mins/Month Translated Voice Calls',
          'Priority Natural Interpretation',
          'End-to-End Encrypted Messaging'
        ]
      },
      {
        id: 'standard',
        name: 'Standard Minutes',
        priceUSD: 4,
        priceBDT: 500,
        translatedMinutesMonthly: 300,
        features: [
          '300 Mins/Month Translated Voice Calls',
          'Priority Natural Interpretation',
          'Priority Support'
        ]
      },
      {
        id: 'pro',
        name: 'Pro Minutes',
        priceUSD: 10,
        priceBDT: 1250,
        translatedMinutesMonthly: 1000,
        features: [
          '1000 Mins/Month Translated Voice Calls',
          'Priority Natural Interpretation',
          'Premium 24/7 Support'
        ]
      }
    ];

    return res.json({
      success: true,
      plans,
      currentPlan: user?.plan || 'free',
      manualPaymentDetails: {
        usdt: {
          network: settings.usdtNetwork || 'TRC-20 (Tron Network)',
          walletAddress: settings.usdtWalletAddress || 'TXYZ1234567890abcdef',
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(settings.usdtWalletAddress || 'TXYZ')}`
        },
        bkash: settings.bkashNumber || '01700000000',
        nagad: settings.nagadNumber || '01700000000',
        rocket: settings.rocketNumber || '01700000000',
        supportEmail: settings.supportEmail || 'support@unicom.com',
        instructions: 'Please send exact amount to the selected address/number. After transaction, submit your TrxID and Screenshot below for Admin verification.'
      }
    });
  } catch (err) {
    console.error('getPlans error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment details.' });
  }
};

export const submitManualPayment = async (req, res) => {
  try {
    const user = req.user;
    const { planId, txHash, paymentMethod, screenshotUrl, amountPaid } = req.body;

    if (!['basic', 'standard', 'pro', 'unlimited'].includes(planId)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
    }
    if (!txHash || txHash.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Valid Transaction ID / TxHash is required.' });
    }

    const { data: settingsRow } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
    const settings = settingsRow?.value || {};
    const planPriceUSD = planId === 'pro' ? (settings.proPlanPriceUSD || 9.99) : (settings.unlimitedPlanPriceUSD || 19.99);

    const paymentRecord = {
      id: `pay_${paymentMethod}_${uuidv4().substring(0, 8)}`,
      user_id: user.id,
      user_name: user.name,
      user_phone: user.phone_number,
      plan_id: planId,
      plan_name: planId === 'pro' ? 'Pro Freelancer' : 'Unlimited / Business',
      amount_usd: planPriceUSD,
      amount_usdt: planPriceUSD, // Keep for legacy schema compatibility
      network: paymentMethod, // 'usdt', 'bkash', 'nagad', 'rocket'
      wallet_address: screenshotUrl, // REUSING wallet_address column for Screenshot URL as schema didn't have screenshot_url
      tx_hash: txHash.trim(),
      status: 'pending'
    };

    const { error } = await supabase.from('payments').insert([paymentRecord]);
    if (error) throw error;

    return res.json({
      success: true,
      message: `${paymentMethod.toUpperCase()} payment submitted successfully. Under review by Admin.`,
      payment: paymentRecord
    });
  } catch (err) {
    console.error('submitManualPayment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit payment.' });
  }
};

import Stripe from 'stripe';
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const createStripeCheckout = async (req, res) => {
  try {
    const user = req.user;
    const { planId } = req.body;

    if (!['basic', 'standard', 'pro', 'unlimited'].includes(planId)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Stripe API keys are missing in the server configuration.' });
    }

    // You would map your DB plans to actual Stripe Price IDs from your dashboard
    const priceId = planId === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_UNLIMITED;
    
    if (!priceId) {
      return res.status(500).json({ success: false, message: 'Stripe Price IDs are not configured.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:8085'}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:8085'}/settings`,
      client_reference_id: user.id,
      customer_email: user.phone_number + '@unicom.local', // Since users sign up with phone
      metadata: {
        userId: user.id,
        planId: planId
      }
    });

    return res.json({
      success: true,
      checkoutUrl: session.url
    });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ success: false, message: 'Stripe checkout failed. ' + err.message });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).send('Webhook secret not configured.');

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const planId = session.metadata.planId;

    if (userId && planId) {
      await supabase.from('users').update({ plan: planId }).eq('id', userId);
    }
  }

  res.json({ received: true });
};

export const getUserPayments = async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
};

export const createLocalPayment = async (req, res) => {
  try {
    const { planId, paymentMethod = 'bkash' } = req.body;
    
    // Check if the admin enabled automated local payments
    const { data: settingsRow } = await supabase.from('settings').select('value').eq('key', 'global_config').maybeSingle();
    const settings = settingsRow?.value || {};
    const mode = settings.localPaymentMode || 'manual';

    if (mode === 'manual') {
      return res.status(400).json({ success: false, message: 'Automated gateway is disabled. Please use manual payment mode.' });
    }

    // Pseudo-code for SSLCommerz / bKash Gateway Initialization
    // In production, we'd initialize SSLCommerz with process.env.SSLCOMMERZ_STORE_ID
    const transactionId = `TRX_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Create a pending payment record in Supabase
    await supabase.from('payments').insert([{
      user_id: req.user.id,
      amount: planId === 'unlimited' ? 2000 : 1000,
      currency: 'BDT',
      method: paymentMethod, // 'sslcommerz', 'bkash_api'
      transaction_id: transactionId,
      status: 'pending',
      details: 'Automated Local Payment Initiated'
    }]);

    // Ensure gateway is configured in production
    const baseUrl = process.env.SSLCOMMERZ_GATEWAY_URL;
    if (!baseUrl) {
      return res.status(500).json({ success: false, message: 'Payment gateway URL is not configured in environment.' });
    }
    
    const gatewayUrl = `${baseUrl}?trxId=${transactionId}`;

    return res.json({ success: true, gatewayUrl, transactionId });
  } catch (err) {
    console.error('createLocalPayment err:', err);
    return res.status(500).json({ success: false, message: 'Failed to initiate local gateway.' });
  }
};

export const localPaymentIPN = async (req, res) => {
  try {
    // SSLCommerz/bKash sends POST data to IPN
    const { tran_id, status, amount, signature } = req.body;
    
    // IPN Signature Check
    const expectedSignature = process.env.IPN_SECRET || crypto.randomBytes(64).toString('hex');
    if (signature !== expectedSignature) {
      return res.status(403).json({ success: false, message: 'Invalid IPN signature.' });
    }

    if (status === 'VALID' || status === 'VALIDATED') {
      const { data: payment } = await supabase.from('payments').select('*').eq('transaction_id', tran_id).maybeSingle();
      if (payment && payment.status === 'pending') {
        // Update payment status to completed
        await supabase.from('payments').update({ status: 'completed', details: 'Paid via Gateway API' }).eq('id', payment.id);
        
        // Upgrade user plan
        await supabase.from('users').update({ plan: amount > 1500 ? 'unlimited' : 'pro' }).eq('id', payment.user_id);
      }
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error('IPN Error:', err);
    return res.status(500).json({ success: false });
  }
};

