
//supabase.js

//console.log('Imported: supabase.js');
import { createClient } from '@supabase/supabase-js';


// ✅ Safe — keys come from .env, not hardcoded
//const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
//const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

//const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kxdplsvojxgdskbbfonp.supabase.co';
//const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4ZHBsc3ZvanhnZHNrYmJmb25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjk4MzMsImV4cCI6MjA2ODk0NTgzM30.cbJAOYkEkNyd3VbgJQLEtWtWs_MKrpzA16ZHMuOP4bk';

const supabaseUrl = 'https://kxdplsvojxgdskbbfonp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4ZHBsc3ZvanhnZHNrYmJmb25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjk4MzMsImV4cCI6MjA2ODk0NTgzM30.cbJAOYkEkNyd3VbgJQLEtWtWs_MKrpzA16ZHMuOP4bk';



let supabaseClient;

export function createSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true }
    });
    console.log('🎉 Supabase client created successfully!');
  }
  return supabaseClient;
}