import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sql = fs.readFileSync('./add_counselor_mobile.sql', 'utf8')

console.log('Executing migration...')
console.log(sql)

// Execute the SQL
const { data, error } = await supabase.rpc('exec_sql', { query: sql })

if (error) {
  console.error('Migration failed:', error)
  // Try direct query instead
  console.log('Trying direct ALTER TABLE...')
  const { error: alterError } = await supabase
    .from('referrals')
    .select('counselor_mobile')
    .limit(0)

  if (alterError && alterError.message.includes('column')) {
    console.log('Column does not exist, need to add it via SQL editor or Supabase dashboard')
    console.log('\nPlease run this SQL in your Supabase SQL Editor:')
    console.log('\n' + sql)
  }
} else {
  console.log('Migration successful!', data)
}
