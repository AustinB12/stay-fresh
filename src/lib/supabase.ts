import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    'Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.',
  );
}

export const supabase = isConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get(_, prop) {
        throw new Error(
          `Supabase is not configured. Field "${String(prop)}" cannot be accessed. ` +
            `Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.`,
        );
      },
    });
