const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://kxkabnahclcsitfkllvg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4a2FibmFoY2xjc2l0ZmtsbHZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzIxMTYyOSwiZXhwIjoyMTAyNzg3NjI5fQ.sjenz4ljy_gIGLEBaBU1wzGHWB4CoozEK2dgYYNBTEI');

async function test() {
  const { data, error } = await supabase.from('messages').select('metadata, file_name, reply_to_id').limit(1);
  console.log(error ? error : 'Columns exist!');
}
test();
