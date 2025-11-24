// Setup Supabase tables
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

console.log('🚀 Setting up Supabase...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setup() {
  try {
    console.log('\n📝 Creating referrals table...')

    // Read the SQL file
    const sql = fs.readFileSync('create-table.sql', 'utf8')

    // Execute via RPC (Supabase function) or direct SQL
    // Note: We need to use Supabase's SQL editor or REST API

    // Try using the rpc method to execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql })

    if (error) {
      console.error('❌ Error:', error)
      console.log('\n⚠️  The SQL needs to be run manually in Supabase dashboard.')
      console.log('   Go to: https://supabase.com/dashboard/project/fftnsfaakvahqyfwhtku/sql')
      console.log('\n📋 Copy and paste this SQL:\n')
      console.log(sql)
    } else {
      console.log('✅ Table created successfully!')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    console.log('\n⚠️  Please run the SQL manually in Supabase dashboard.')
    console.log('   Go to: https://supabase.com/dashboard/project/fftnsfaakvahqyfwhtku/sql')
    console.log('\n📋 SQL to run:')
    const sql = fs.readFileSync('create-table.sql', 'utf8')
    console.log(sql)
  }
}

setup()
