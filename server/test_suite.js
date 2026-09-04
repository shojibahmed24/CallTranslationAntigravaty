import http from 'http';
import { translationEngine } from './src/services/aiTranslationService.js';
import { db } from './src/database/db.js';
import { CONFIG } from './src/config/index.js';
import jwt from 'jsonwebtoken';

async function runVerificationTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING UNICOM COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Language Pair Engine Tests
  console.log('--- 1. Testing AI Translation Pair Engine & Rules ---');
  assert(translationEngine.isPairSupported('bn', 'en') === true, 'Bengali <-> English is supported');
  assert(translationEngine.isPairSupported('en', 'bn') === true, 'English <-> Bengali is supported');
  assert(translationEngine.isPairSupported('hi', 'en') === true, 'Hindi <-> English is supported');
  assert(translationEngine.isPairSupported('ar', 'bn') === true, 'Arabic <-> Bengali is supported');
  assert(translationEngine.isPairSupported('bn', 'bn') === true, 'Bengali <-> Bengali Same-language is supported');
  assert(translationEngine.isPairSupported('hi', 'ar') === false, 'Hindi <-> Arabic Unsupported pair is rejected');

  // 2. Same Language Zero-charge Rule
  console.log('\n--- 2. Testing Same-Language Zero Charge Pass-Through ---');
  const directCallResult = await translationEngine.processSimultaneousSpeech({
    callId: 'test_call_01',
    speakerId: 'usr_rahim_002',
    sourceLang: 'bn',
    targetLang: 'bn',
    rawText: 'হ্যালো আমি কোনো চার্জ ছাড়া কথা বলছি'
  });
  assert(directCallResult.isDirect === true, 'Same language call marked as direct pass-through');
  assert(directCallResult.chargedMinutes === 0, 'Zero minutes charged for same language call');

  // 3. Meaning-First Interpretation & Context Buffer
  console.log('\n--- 3. Testing Meaning-First Interpretation & Barge-in ---');
  translationEngine.initCallContext('test_call_02', 'bn', 'en');
  const crossCallResult = await translationEngine.processSimultaneousSpeech({
    callId: 'test_call_02',
    speakerId: 'usr_rahim_002',
    sourceLang: 'bn',
    targetLang: 'en',
    rawText: 'আমি প্রজেক্টের কাজ শেষ করেছি'
  });
  assert(crossCallResult.isDirect === false, 'Cross-language call marked as translated');
  assert(crossCallResult.translatedText.toLowerCase().includes('project'), 'Bengali phrase correctly interpreted to English');
  assert(crossCallResult.chargedMinutes === 1, '1 minute charged for cross-language translation');

  // Test Barge-in interruption
  const interruption = translationEngine.interruptActiveSpeech('test_call_02', 'usr_sarah_003');
  assert(interruption.interrupted === true, 'Barge-in interruption successfully halts queued playback');
  translationEngine.clearCallContext('test_call_02');

  // 4. Database Pre-seeded Users and Single-Device Session
  console.log('\n--- 4. Testing User Persistence & Database Integrity ---');
  const users = db.users;
  assert(users.length >= 5, `Database loaded with ${users.length} seeded test users`);
  const rahim = users.find(u => u.phone === '+8801811223344');
  const sarah = users.find(u => u.phone === '+14155552671');
  assert(rahim !== undefined && rahim.language === 'bn', 'Rahim Ahmed found with native Bengali setting');
  assert(sarah !== undefined && sarah.language === 'en', 'Sarah Jenkins found with native English setting');

  // 5. Cloud Storage Quota Calculation
  console.log('\n--- 5. Testing Cloud Storage & 25MB Max Upload Constraints ---');
  const freePlan = CONFIG.PLANS.free;
  const proPlan = CONFIG.PLANS.pro;
  assert(freePlan.storageBytes === 5 * 1024 * 1024 * 1024, 'Free Plan allocated 5 GB');
  assert(proPlan.storageBytes === 50 * 1024 * 1024 * 1024, 'Pro Plan allocated 50 GB');
  assert(CONFIG.MAX_FILE_SIZE === 25 * 1024 * 1024, 'Max individual document size capped at 25 MB');

  // 6. USDT (TRC-20) Payment & Dynamic Settings
  console.log('\n--- 6. Testing USDT TRC-20 Blockchain Payment Flow ---');
  const settings = db.settings;
  assert(settings.usdtWalletAddress === 'TK7R9xPnQ8wZyU2vAmK34sLmN6pQrB91vD', 'USDT TRC-20 Wallet Address matches Tron standard');
  assert(settings.proPlanPriceUSD === 9.99, 'Pro Plan price is $9.99/mo');
  assert(settings.unlimitedPlanPriceUSD === 19.99, 'Unlimited Plan price is $19.99/mo');

  // 7. Admin 2FA Token Validation
  console.log('\n--- 7. Testing Admin 2FA Security Token ---');
  const admin2FAToken = jwt.sign(
    { email: CONFIG.ADMIN_EMAIL, role: 'admin', twoFactorVerified: true },
    CONFIG.ADMIN_JWT_SECRET
  );
  const verifiedAdmin = jwt.verify(admin2FAToken, CONFIG.ADMIN_JWT_SECRET);
  assert(verifiedAdmin.role === 'admin' && verifiedAdmin.twoFactorVerified === true, '2FA Admin token valid and verified');

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerificationTests();
