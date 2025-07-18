const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()

const supabaseUrl = process.env.SUPABASE_ENDPOINT
const supabaseKey = process.env.SUPABASE_SECRET_KEY 

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL and service_role Key are required in your .env file.'
  )
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

module.exports = supabase
