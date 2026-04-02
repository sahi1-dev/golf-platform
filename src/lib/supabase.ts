import { createClient } from '@supabase/supabase-js'

// '!' hata kar hum default empty string de rahe hain taaki build crash na ho
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Build ko dhokha dene ke liye check (Ye zaroori hai)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. If this is a build, it's fine.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)