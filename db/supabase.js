//supabase.js

console.log('Imported: supabase.js');
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
Dec 4 the connection is different.

//removed keys 4 Dec 2025
const supabaseUrl = 'https://*********.supabase.co'
const supabaseAnonKey = '*****'

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
  
  // If not, create a new client and store it in our variable.
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true }
  });

  // Acknowledge the creation of the client
  console.log('🎉 Supabase client created successfully!');

  // Return the newly created client.
  return supabaseClient;
}


