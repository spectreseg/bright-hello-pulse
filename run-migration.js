import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ohlgzwrhxxixubqjqqrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obGd6d3JoeHhpeHVicWpxcXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODEwOTEsImV4cCI6MjA3MjM1NzA5MX0.HiBlOSs8MGGSwhLcpslDlym8rYdy5jIqI4Qr-pmnfio';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Adding going_by column to food_posts table...');
  
  // This needs to be done with service role key, not anon key
  // For now, we'll try with SQL function or direct database access
  
  const migrationSQL = `
    -- Add going_by column to track users who indicated they're going to pick up food
    ALTER TABLE public.food_posts 
    ADD COLUMN IF NOT EXISTS going_by uuid[] DEFAULT '{}';
    
    -- Add index for better performance on going_by queries
    CREATE INDEX IF NOT EXISTS idx_food_posts_going_by ON public.food_posts USING GIN(going_by);
  `;
  
  try {
    const { data, error } = await supabase.rpc('run_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error running migration:', error);
    } else {
      console.log('Migration completed successfully');
    }
  } catch (err) {
    console.error('Failed to run migration:', err);
    console.log('You may need to run this SQL manually in the Supabase dashboard:');
    console.log(migrationSQL);
  }
}

runMigration();
