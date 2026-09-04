import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const defaultConfig = {
    usdtWalletAddress: "TK7R9xPnQ8wZyU2vAmK34sLmN6pQrB91vD",
    usdtNetwork: "TRC-20 (Tron Network)",
    bkashNumber: "01700000000",
    nagadNumber: "01700000000",
    rocketNumber: "01700000000",
    proPlanPriceUSD: 9.99,
    unlimitedPlanPriceUSD: 19.99,
    freeStorageGB: 5,
    proStorageGB: 50,
    unlimitedStorageGB: 100,
    freeCallMinutesDaily: 5,
    proCallMinutesMonthly: 300,
    unlimitedCallMinutesMonthly: 500,
    businessName: "UNICOM Global Communications Ltd.",
    supportEmail: "support@unicom.global"
};

async function fixSettings() {
  const { data, error } = await supabase.from('settings').upsert({
      key: 'global_config',
      value: defaultConfig
  });
  console.log('Upsert result:', data, error);
}
fixSettings();
