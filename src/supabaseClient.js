import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hftpxfdxdqbilpfcgoqr.supabase.co'
const supabaseAnonKey = 'sb_publishable_Qf8nrCoSkByE419a0nMJTg_f-6qv4Mx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
