// @ts-expect-error — @supabase/supabase-js is an optional peer dependency
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const isSupabaseConfigured = !!(createClient && supabaseUrl && supabaseAnonKey);

export const supabase: unknown = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Checkout and billing features will be disabled. ' +
    'Static plan information will be displayed instead.'
  );
}
