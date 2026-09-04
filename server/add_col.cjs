const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:JibOn%40786400@db.kxkabnahclcsitfkllvg.supabase.co:5432/postgres'
});

client.connect()
  .then(() => client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;'))
  .then(() => { console.log('Column added'); client.end(); })
  .catch(err => { console.error('Error:', err); client.end(); });
