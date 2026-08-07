import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// Sem as env vars, o modo convidado (dados em cache local) ainda deve funcionar.
// Um proxy que só lança erro quando efetivamente usado evita quebrar o app no boot.
function createUnconfiguredClient(): SupabaseClient<Database> {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          'Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes). Use o modo convidado.',
        )
      },
    },
  ) as SupabaseClient<Database>
}

export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : createUnconfiguredClient()
