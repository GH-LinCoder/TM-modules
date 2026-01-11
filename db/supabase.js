
//supabase.js

console.log('Imported: supabase.js');
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =import.meta.env.VITE_SUPABASE_ANON_KEY
let supabaseClient;

if(!supabaseUrl) console.log('Missing env URL');
if(!supabaseAnonKey) console.log('Missing env anon');

export function createSupabaseClient() {

//console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
//console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true,
         autoRefreshToken: true,  // ← Auto-refreshes expired tokens
    detectSessionInUrl: true // ← Handles OAuth redirects
       }
    });
    console.log('🎉 Supabase client created successfully!');


//console.log('🔍 CLIENT TEST:');
//console.log('Has from?', typeof supabaseClient.from);
//console.log('Has rpc?', typeof supabaseClient.rpc);
//console.log('URL:', supabaseClient.supabaseUrl);



  }
  return supabaseClient;
}


