import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ohlgzwrhxxixubqjqqrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obGd6d3JoeHhpeHVicWpxcXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODEwOTEsImV4cCI6MjA3MjM1NzA5MX0.HiBlOSs8MGGSwhLcpslDlym8rYdy5jIqI4Qr-pmnfio';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoingByColumn() {
  console.log('Testing going_by column...');
  
  try {
    // Test 1: Try to select going_by column
    const { data, error } = await supabase
      .from('food_posts')
      .select('id, title, going_by')
      .limit(1);
    
    if (error) {
      console.error('Error selecting going_by:', error);
      console.log('The going_by column might not exist yet.');
    } else {
      console.log('Success! going_by column exists:', data);
    }
  } catch (err) {
    console.error('Failed to test going_by column:', err);
  }
}

testGoingByColumn();
