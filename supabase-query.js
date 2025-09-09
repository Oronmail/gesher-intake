#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function queryReferrals() {
  console.log('\n📊 Querying Supabase Referrals Table');
  console.log('═'.repeat(60));
  
  // Get all referrals, ordered by most recent
  const { data, error } = await supabase
    .from('referrals')
    .select('referral_number, status, counselor_name, school_name, parent_email, created_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No referrals found in database');
    return;
  }
  
  console.log(`\nTotal Records: ${data.length}\n`);
  
  // Show summary by status
  const statusCounts = {};
  data.forEach(ref => {
    statusCounts[ref.status] = (statusCounts[ref.status] || 0) + 1;
  });
  
  console.log('Status Summary:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  // Show recent referrals
  console.log('\n' + '─'.repeat(60));
  console.log('Recent Referrals (last 10):');
  console.log('─'.repeat(60));
  
  const recent = data.slice(0, 10);
  recent.forEach((ref, index) => {
    const date = new Date(ref.created_at).toLocaleString('he-IL', { 
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(`\n${index + 1}. ${ref.referral_number}`);
    console.log(`   Status: ${ref.status}`);
    console.log(`   School: ${ref.school_name}`);
    console.log(`   Counselor: ${ref.counselor_name}`);
    console.log(`   Parent Email: ${ref.parent_email || 'Not provided'}`);
    console.log(`   Created: ${date}`);
  });
  
  console.log('\n' + '═'.repeat(60));
}

// Count by status
async function countByStatus(status) {
  const { count, error } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);
  
  if (error) {
    console.error('Error:', error.message);
    return 0;
  }
  
  return count;
}

// Main execution
(async () => {
  await queryReferrals();
  
  // Additional statistics
  console.log('\n📈 Quick Statistics:');
  const pendingCount = await countByStatus('pending_consent');
  const signedCount = await countByStatus('consent_signed');
  const completedCount = await countByStatus('completed');
  
  console.log(`  Pending Consent: ${pendingCount}`);
  console.log(`  Consent Signed: ${signedCount}`);
  console.log(`  Completed: ${completedCount}`);
  
  console.log('\n✅ Query complete\n');
})();