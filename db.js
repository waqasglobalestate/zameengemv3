const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_API_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseApiKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseApiKey);

    // Test the connection
    supabase
      .from('properties')
      .select('*')
      .limit(1)
      .then(({ data, error }) => {
        if (error) console.error('Connection error:', error);
        else console.log('Connected to Supabase properties table:', data);
      })
      .catch((err) => {
        console.error('Connection exception:', err);
      });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.warn('Supabase URL or API Key is missing. Supabase client will not be initialized.');
}

module.exports = supabase;
