
//supabase.js

console.log('Imported: supabase.js');
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =import.meta.env.VITE_SUPABASE_ANON_KEY
let supabaseClient;

export function createSupabaseClient() {

//console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
//console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true }
    });
    console.log('🎉 Supabase client created successfully!');
  }
  return supabaseClient;
}


