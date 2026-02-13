import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Copy client/.env.example to client/.env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. " +
    "See README.md for details."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
