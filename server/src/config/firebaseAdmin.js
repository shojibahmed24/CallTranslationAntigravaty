import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('../../firebase-service-account.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

export const auth = getAuth(app);
