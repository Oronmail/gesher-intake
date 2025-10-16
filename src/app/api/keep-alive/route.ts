import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Simple query to keep the database active
    await supabase
      .from('referrals')
      .select('referral_number')
      .limit(1)

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Database keep-alive ping successful'
    })
  } catch (error) {
    console.error('Keep-alive error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}