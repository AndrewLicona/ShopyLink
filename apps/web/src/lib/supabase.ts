import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export const createBrowserClient = () => {
    if (client) return client;
    client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    return client;
};

// Alias to maintain compatibility with my previous pages
export { createBrowserClient as createClient };

