// config/supabase.js
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()

const supabaseUrl = process.env.SUPABASE_ENDPOINT
const supabaseKey = process.env.SUPABASE_SECRET_KEY // This must be the service_role key

console.log('--- Supabase Config Loaded ---')
console.log('ENDPOINT:', supabaseUrl)
console.log('SECRET KEY LOADED:', !!supabaseKey) // This will print true if the key is loaded
console.log('----------------------------')

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
