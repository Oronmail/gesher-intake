import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Health Check Endpoint
 *
 * Purpose: Check the health of all system components
 *
 * Usage:
 * - Manual: curl https://gesher-intake.vercel.app/api/health
 * - Monitoring: Use with uptime monitoring services (UptimeRobot, etc.)
 *
 * Returns:
 * - Overall status (healthy/degraded/unhealthy)
 * - Status of each component (Supabase, Email, SMS)
 * - Response times
 */

interface HealthCheck {
  status: string;
  responseTime?: number;
  error?: string | null;
  service?: string;
  authMethod?: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, HealthCheck> = {};

  // 1. Check Supabase
  try {
    const supabaseStart = Date.now();
    const { error } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true });

    checks.supabase = {
      status: error ? 'unhealthy' : 'healthy',
      responseTime: Date.now() - supabaseStart,
      error: error?.message || null
    };
  } catch (error) {
    checks.supabase = {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // 2. Check Email Service (Gmail SMTP)
  checks.email = {
    status: process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? 'configured' : 'not_configured',
    service: 'Gmail SMTP'
  };

  // 3. Check SMS Service (Inwise)
  checks.sms = {
    status: process.env.INWISE_API_KEY ? 'configured' : 'not_configured',
    service: 'Inwise API'
  };

  // 4. Check Salesforce
  checks.salesforce = {
    status: process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_PRIVATE_KEY ? 'configured' : 'not_configured',
    authMethod: 'JWT Bearer'
  };

  // Determine overall status
  const overallStatus =
    checks.supabase.status === 'unhealthy' ? 'unhealthy' :
    checks.supabase.status === 'healthy' ? 'healthy' :
    'degraded';

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalResponseTime: Date.now() - startTime,
    checks,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}

// Allow this route to run for up to 10 seconds
export const maxDuration = 10;
