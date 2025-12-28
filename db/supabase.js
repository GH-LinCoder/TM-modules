
//supabase.js

console.log('Imported: supabase.js');
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kxdplsvojxgdskbbfonp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4ZHBsc3ZvanhnZHNrYmJmb25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjk4MzMsImV4cCI6MjA2ODk0NTgzM30.cbJAOYkEkNyd3VbgJQLEtWtWs_MKrpzA16ZHMuOP4bk'

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


