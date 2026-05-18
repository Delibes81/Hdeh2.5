import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // We will need to generate this or use 'any' for now

// Create a single supabase client for interacting with your database
// Helper to clean keys from trailing spaces, newlines, carriage returns, or quotes
const sanitizeKey = (val: string | undefined) => {
    if (!val) return '';
    return val.replace(/[\r\n\t\s'"]/g, '').trim();
};

const supabaseUrl = sanitizeKey(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

