import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@unicom.global',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || crypto.randomBytes(64).toString('hex'),
  ADMIN_2FA_SECRET: process.env.ADMIN_2FA_SECRET || crypto.randomBytes(32).toString('hex'),
  
  // Storage & Call Limits
  PLANS: {
    free: {
      id: 'free',
      name: 'Free Starter',
      priceUSD: 0,
      storageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
      storageGB: 5,
      translatedMinutesPerDay: 100,
      translatedMinutesPerMonth: 150,
      features: ['5 GB Cloud Storage', '100 Mins/Day Translated Calls', 'Unlimited Direct Same-Language Calls', 'All Document Types up to 25MB']
    },
    pro: {
      id: 'pro',
      name: 'Pro Freelancer',
      priceUSD: 9.99,
      storageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
      storageGB: 50,
      translatedMinutesPerDay: 300,
      translatedMinutesPerMonth: 300,
      features: ['50 GB Cloud Storage', '300 Mins/Month Translated Calls', 'Priority Translation Engine', 'Priority 24/7 Support']
    },
    unlimited: {
      id: 'unlimited',
      name: 'Unlimited / Business',
      priceUSD: 19.99,
      storageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
      storageGB: 100,
      translatedMinutesPerDay: 500,
      translatedMinutesPerMonth: 500,
      features: ['100 GB Cloud Storage', '500 Mins/Month Translated Calls', 'Ultra-Low Latency Interpretation', 'Dedicated Account Manager']
    }
  },

  // Crypto USDT Details
  USDT: {
    network: 'TRC-20 (Tron Network)',
    walletAddress: 'TK7R9xPnQ8wZyU2vAmK34sLmN6pQrB91vD',
    qrCodePlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK7R9xPnQ8wZyU2vAmK34sLmN6pQrB91vD',
    businessName: 'UNICOM Global Communications Ltd.',
    supportEmail: 'support@unicom.global'
  },

  // File Upload Limits
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25 MB
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.jpg', '.jpeg', '.png', '.webp', '.gif'],
  
  UPLOAD_DIR: path.join(__dirname, '../../uploads'),
  DATA_DIR: path.join(__dirname, '../../data')
};
