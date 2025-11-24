// Test the exact insert that's failing
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing insert with ANON key (same as the form uses)...\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  const testData = {
    referral_number: 'TEST-' + Date.now(),
    school_id: 'test-school',
    school_name: 'Test School',
    warm_home_destination: 'bet-elazraki',
    counselor_name: 'Test Counselor',
    counselor_email: 'test@example.com',
    counselor_mobile: '0501234567',
    parent_email: 'parent@example.com',
    parent_phone: '0501234567',
    status: 'pending_consent',
    salesforce_contact_id: 'a04cW000004TEST',
  }

  console.log('Attempting insert with data:', testData)
  console.log('')

  const { data, error } = await supabase
    .from('referrals')
    .insert(testData)
    .select()
    .single()

  if (error) {
    console.error('❌ INSERT FAILED')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
    console.error('Full error:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Insert successful!')
    console.log('Created record:', data)

    // Clean up
    await supabase
      .from('referrals')
      .delete()
      .eq('referral_number', testData.referral_number)
    console.log('Cleaned up test record')
  }
}

testInsert()
