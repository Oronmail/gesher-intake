import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Supabase Keep-Alive Cron Job
 *
 * Purpose: Prevents Supabase free tier from pausing due to inactivity
 *
 * Supabase free tier pauses projects after 7 days of inactivity.
 * This cron job runs every 3 days to keep the database active.
 *
 * Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
 *
 * Schedule: Every 3 days at 2:00 AM UTC
 * Configured in: vercel.json
 */

export async function GET(request: NextRequest) {
  console.log('[KEEP-ALIVE] Supabase keep-alive cron job triggered');

  // Verify this is actually a cron request (security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[KEEP-ALIVE] ❌ Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Simple query to keep Supabase active
    // Just count records - lightweight operation
    const { data, error, count } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('[KEEP-ALIVE] ❌ Supabase query failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    console.log('[KEEP-ALIVE] ✅ Supabase connection successful');
    console.log(`[KEEP-ALIVE] Database active - ${count || 0} referrals in database`);

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive successful',
      timestamp: new Date().toISOString(),
      recordCount: count || 0,
      nextRun: 'In 3 days'
    });

  } catch (error) {
    console.error('[KEEP-ALIVE] ❌ Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Allow this route to run for up to 10 seconds
export const maxDuration = 10;
