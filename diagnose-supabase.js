// Diagnose Supabase issue
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

console.log('🔍 Diagnosing Supabase...\n')

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnose() {
  // Test 1: Can we connect to Supabase at all?
  console.log('Test 1: Basic connectivity')
  try {
    const { data, error } = await supabase.from('_supabase_functions').select('*').limit(1)
    if (error && error.code !== 'PGRST116') {
      console.log('   ❌ Cannot connect to Supabase')
      console.log('   Error:', error.message)
      return
    }
    console.log('   ✅ Can connect to Supabase\n')
  } catch (e) {
    console.log('   ⚠️  Basic connection test inconclusive\n')
  }

  // Test 2: Does referrals table exist?
  console.log('Test 2: Check if referrals table exists')
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .limit(0)

  if (error) {
    console.log('   ❌ referrals table does NOT exist or has errors')
    console.log('   Error code:', error.code)
    console.log('   Error message:', error.message)
    console.log('\n📋 SOLUTION: Create the table using SQL in Supabase dashboard')
    console.log('   URL: https://supabase.com/dashboard/project/fftnsfaakvahqyfwhtku/sql')
    console.log('\n   Run the SQL in create-table.sql file')
    return
  }

  console.log('   ✅ referrals table exists!\n')

  // Test 3: Check table structure
  console.log('Test 3: Check table columns')
  const { data: sampleData, error: selectError } = await supabase
    .from('referrals')
    .select('*')
    .limit(1)

  if (selectError) {
    console.log('   ❌ Cannot read from table:', selectError.message)
    return
  }

  if (sampleData && sampleData.length > 0) {
    const columns = Object.keys(sampleData[0])
    console.log('   📋 Existing columns:', columns.join(', '))
  } else {
    console.log('   ℹ️  Table is empty, cannot determine columns from data')
  }

  // Check for required columns
  const requiredColumns = [
    'id', 'referral_number', 'school_id', 'school_name',
    'warm_home_destination', 'counselor_name', 'counselor_email',
    'counselor_mobile', 'parent_email', 'parent_phone', 'status',
    'salesforce_contact_id', 'created_at', 'updated_at'
  ]

  if (sampleData && sampleData.length > 0) {
    const existingColumns = Object.keys(sampleData[0])
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length > 0) {
      console.log('\n   ⚠️  Missing columns:', missingColumns.join(', '))
      console.log('\n📋 SOLUTION: Add missing columns using SQL in Supabase dashboard')
      console.log('   URL: https://supabase.com/dashboard/project/fftnsfaakvahqyfwhtku/sql')
      console.log('\n   Run these ALTER TABLE commands:')
      missingColumns.forEach(col => {
        let type = 'TEXT'
        if (col.includes('timestamp') || col.includes('_at')) type = 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
        if (col === 'id') type = 'UUID DEFAULT gen_random_uuid()'
        console.log(`   ALTER TABLE referrals ADD COLUMN IF NOT EXISTS ${col} ${type};`)
      })
    } else {
      console.log('\n   ✅ All required columns present!')
    }
  }

  console.log('\n✅ Diagnosis complete!')
}

diagnose().catch(err => {
  console.error('❌ Diagnostic failed:', err.message)
})
