const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:JibOn%40786400@db.kxkabnahclcsitfkllvg.supabase.co:5432/postgres'
});
(async () => {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Enable RLS and add public insert policies for the storage buckets
    const query = `
      DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
      DROP POLICY IF EXISTS "Public Update" ON storage.objects;
      DROP POLICY IF EXISTS "Public Select" ON storage.objects;
      DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

      CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'chat-media'));
      CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('avatars', 'chat-media'));
      CREATE POLICY "Public Select" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'chat-media'));
      CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('avatars', 'chat-media'));
    `;
    await client.query(query);
    console.log('Policies applied successfully');
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await client.end();
  }
})();
