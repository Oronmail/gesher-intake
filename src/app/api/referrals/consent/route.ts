import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      referral_number,
      parent1_name,
      parent2_name,
      signature,
      signature2,
      student_name,
    } = body

    // Combine parent names
    const parent_names = parent2_name 
      ? `${parent1_name}, ${parent2_name}`
      : parent1_name

    // Update referral with consent information
    const { data, error } = await supabase
      .from('referrals')
      .update({
        parent_names,
        signature_image: signature,
        signature_image2: signature2 || null,
        consent_timestamp: new Date().toISOString(),
        status: 'consent_signed',
      })
      .eq('referral_number', referral_number)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update consent' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    // TODO: Send notification to counselor that consent is signed
    // In production, send email to counselor_email from the referral record
    
    const studentFormUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student-form/${referral_number}`
    console.log('====================================')
    console.log('✅ CONSENT SIGNED SUCCESSFULLY!')
    console.log('====================================')
    console.log('Student form URL for counselor:')
    console.log(studentFormUrl)
    console.log('====================================')
    console.log('Copy and paste this URL to continue with student data form')
    console.log('====================================')
    
    // Also return it in the response for the frontend to log
    if (typeof window !== 'undefined') {
      console.log('Student Form URL:', studentFormUrl)
    }

    return NextResponse.json({
      success: true,
      message: 'Consent submitted successfully',
      student_form_url: studentFormUrl,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}