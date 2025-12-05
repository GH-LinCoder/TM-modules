//supabase.js

console.log('Imported: supabase.js');
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kxdplsvojxgdskbbfonp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4ZHBsc3ZvanhnZHNrYmJmb25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjk4MzMsImV4cCI6MjA2ODk0NTgzM30.cbJAOYkEkNyd3VbgJQLEtWtWs_MKrpzA16ZHMuOP4bk'

let supabaseClient;

/**
 * Creates and returns a single Supabase client instance.
 * Subsequent calls will return the same instance.
 * @returns {import('@supabase/supabase-js').SupabaseClient} The Supabase client.
 */
export function createSupabaseClient() {
  // If a client instance already exists, just return it.
  if (supabaseClient) {
    return supabaseClient;
  }
  try{
  // If not, create a new client and store it in our variable.
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true }
  });

  // Acknowledge the creation of the client
  console.log('🎉 Supabase client created successfully!');

//added 19:40 Dec 4 after error 
/*Uncaught TypeError: can't access property "AuthClient", H is null
    <anonymous> wrapper.mjs:1
wrapper.mjs:1:1
    <anonymous> wrapper.mjs:1
 */
 } catch (err) {
    console.error('Supabase client creation failed:', err);
    supabaseClient = null;
  }


  // Return the newly created client.
  return supabaseClient;
}


