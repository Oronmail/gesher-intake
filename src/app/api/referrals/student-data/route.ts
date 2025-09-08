import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referral_number, ...studentData } = body

    // Get the referral to ensure it exists and has consent
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_number', referral_number)
      .single()

    if (referralError || !referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    if (referral.status !== 'consent_signed') {
      return NextResponse.json(
        { error: 'Parent consent not yet provided' },
        { status: 400 }
      )
    }

    // TODO: Send data to Salesforce
    // This is where you would integrate with Salesforce API
    // For now, we'll just log the data
    console.log('Student data ready for Salesforce:', {
      referral,
      studentData
    })

    // Update referral status to completed
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('referral_number', referral_number)

    if (updateError) {
      console.error('Error updating referral status:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Student data submitted successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}