// Quick script to check Supabase connection and table structure
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Checking Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

// Test: Try to select from referrals table
async function checkTable() {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error querying referrals table:', error)
      return
    }

    console.log('✅ Successfully connected to Supabase')
    console.log('📋 Sample row structure:', data?.[0] ? Object.keys(data[0]) : 'No rows yet')

    // Try a test insert to see what columns are missing
    console.log('\n🧪 Testing insert with all fields...')
    const { data: insertData, error: insertError } = await supabase
      .from('referrals')
      .insert({
        referral_number: 'TEST-2025-0000',
        school_id: 'test-school',
        school_name: 'Test School',
        warm_home_destination: 'bet-elazraki',
        counselor_name: 'Test Counselor',
        counselor_email: 'test@test.com',
        counselor_mobile: '0501234567',
        parent_email: 'parent@test.com',
        parent_phone: '0501234567',
        status: 'pending_consent',
        salesforce_contact_id: null,
      })
      .select()

    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
      console.error('   Code:', insertError.code)
      console.error('   Details:', insertError.details)
      console.error('   Hint:', insertError.hint)
    } else {
      console.log('✅ Test insert successful!')
      console.log('   Inserted ID:', insertData?.[0]?.id)

      // Clean up test data
      await supabase
        .from('referrals')
        .delete()
        .eq('referral_number', 'TEST-2025-0000')
      console.log('🧹 Test data cleaned up')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

checkTable()
