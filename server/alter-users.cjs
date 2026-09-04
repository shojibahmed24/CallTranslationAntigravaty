
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:JibOn%40786400@db.kxkabnahclcsitfkllvg.supabase.co:5432/postgres'
});
(async () => {
  try {
    await client.connect();
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_details JSONB, ADD COLUMN IF NOT EXISTS crypto_details JSONB;');
    console.log('Columns added');
  } catch(e) {
    console.log('Error', e.message);
  } finally {
    await client.end();
  }
})();

