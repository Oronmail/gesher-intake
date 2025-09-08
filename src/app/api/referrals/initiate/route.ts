import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateReferralNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `REF-${year}${month}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      counselor_name,
      counselor_email,
      school_name,
      parent_email,
      parent_phone,
    } = body

    // Generate unique referral number
    const referral_number = generateReferralNumber()
    
    // Create referral in Supabase
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referral_number,
        school_id: school_name.toLowerCase().replace(/\s+/g, '-'),
        school_name,
        counselor_name,
        counselor_email,
        parent_email: parent_email || null,
        parent_phone,
        status: 'pending_consent',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create referral' },
        { status: 500 }
      )
    }

    // TODO: Send email/SMS to parent with consent form link
    const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/consent/${referral_number}`
    
    console.log('Consent URL:', consentUrl)
    // In production, send this URL via email/SMS to parent

    return NextResponse.json({
      success: true,
      referral_number,
      consent_url: consentUrl,
      data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}