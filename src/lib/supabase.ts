import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Mangler NEXT_PUBLIC_SUPABASE_URL miljøvariabel')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Mangler NEXT_PUBLIC_SUPABASE_ANON_KEY miljøvariabel')
}


export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    }
  }
) 