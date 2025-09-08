const fetch = require('node-fetch');

const SUPABASE_URL = 'https://fftnsfaakvahqyfwhtku.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdG5zZmFha3ZhaHF5ZndodGt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjM1MDIxOCwiZXhwIjoyMDUxOTI2MjE4fQ.NRd5IXZ8dWPaa6eriTwiNQ_6daaBaFS';

async function checkRecords() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/referrals?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('=================================');
    console.log('SUPABASE REFERRALS TABLE');
    console.log('=================================');
    console.log(`Total Records: ${data.length}`);
    console.log('=================================\n');

    if (data.length === 0) {
      console.log('No records found in the referrals table.');
    } else {
      // Group by status
      const statusCounts = {};
      data.forEach(record => {
        statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
      });

      console.log('Records by Status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      console.log('\nRecent Records (last 5):');
      console.log('---------------------------------');
      
      data.slice(0, 5).forEach(record => {
        console.log(`\nReferral: ${record.referral_number}`);
        console.log(`  Status: ${record.status}`);
        console.log(`  Counselor: ${record.counselor_name}`);
        console.log(`  School: ${record.school_name}`);
        console.log(`  Parent Email: ${record.parent_email || 'N/A'}`);
        console.log(`  Created: ${new Date(record.created_at).toLocaleString()}`);
        if (record.consent_timestamp) {
          console.log(`  Consent Signed: ${new Date(record.consent_timestamp).toLocaleString()}`);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching records:', error.message);
  }
}

checkRecords();