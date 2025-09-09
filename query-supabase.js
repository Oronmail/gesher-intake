#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to run queries
async function runQuery(query) {
  try {
    console.log('\n📊 Running query:', query);
    console.log('─'.repeat(50));
    
    // Parse the query type
    if (query.toLowerCase().startsWith('select')) {
      // Handle SELECT query
      const tableName = query.match(/from\s+(\w+)/i)?.[1];
      if (!tableName) {
        console.error('Could not parse table name from query');
        return;
      }
      
      // Build query
      let queryBuilder = supabase.from(tableName).select('*');
      
      // Check for WHERE clause
      const whereMatch = query.match(/where\s+(.+?)(?:order|limit|$)/i);
      if (whereMatch) {
        const conditions = whereMatch[1].trim();
        // Parse simple conditions (this is a basic implementation)
        const conditionMatch = conditions.match(/(\w+)\s*=\s*'([^']+)'/);
        if (conditionMatch) {
          queryBuilder = queryBuilder.eq(conditionMatch[1], conditionMatch[2]);
        }
      }
      
      // Check for ORDER BY
      const orderMatch = query.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/i);
      if (orderMatch) {
        queryBuilder = queryBuilder.order(orderMatch[1], { 
          ascending: orderMatch[2]?.toLowerCase() !== 'desc' 
        });
      }
      
      // Check for LIMIT
      const limitMatch = query.match(/limit\s+(\d+)/i);
      if (limitMatch) {
        queryBuilder = queryBuilder.limit(parseInt(limitMatch[1]));
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        console.error('❌ Query error:', error.message);
      } else {
        console.log(`✅ Found ${data.length} record(s):\n`);
        if (data.length > 0) {
          console.table(data);
        }
      }
    } else {
      console.log('⚠️  Only SELECT queries are supported via this script');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Interactive mode
async function interactive() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'supabase> '
  });
  
  console.log('🚀 Supabase Query Tool');
  console.log('Connected to:', supabaseUrl);
  console.log('Type "exit" to quit, "tables" to list tables, or enter SQL query\n');
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      rl.close();
      return;
    }
    
    if (input.toLowerCase() === 'tables') {
      // List all tables
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .limit(0);
      
      if (!error) {
        console.log('\n📋 Available tables:');
        console.log('  - referrals');
        console.log('\nSample queries:');
        console.log('  SELECT * FROM referrals');
        console.log('  SELECT * FROM referrals WHERE status = \'pending_consent\'');
        console.log('  SELECT * FROM referrals ORDER BY created_at DESC LIMIT 5');
      }
    } else if (input) {
      await runQuery(input);
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\nGoodbye! 👋');
    process.exit(0);
  });
}

// Main execution
if (process.argv.length > 2) {
  // Run query from command line
  const query = process.argv.slice(2).join(' ');
  runQuery(query).then(() => process.exit(0));
} else {
  // Interactive mode
  interactive();
}