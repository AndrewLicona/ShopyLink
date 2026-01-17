
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createBrowserClient = () => createClient(supabaseUrl, supabaseAnonKey);

// Alias to maintain compatibility with my previous pages
export { createBrowserClient as createClient };

