import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendConsentEmail } from '@/lib/email'
import salesforceJWT from '@/lib/salesforce-jwt'

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
    
    // Create initial Registration Request in Salesforce using JWT service
    const initialData = {
      referralNumber: referral_number,
      counselorName: counselor_name,
      counselorEmail: counselor_email,
      schoolName: school_name,
      parentEmail: parent_email,
      parentPhone: parent_phone,
    }
    
    const sfResult = await salesforceJWT.createInitialRegistration(initialData)
    
    if (!sfResult.success) {
      console.error('Failed to create Salesforce record:', sfResult.error)
      // Continue anyway - we don't want to block the process
    }
    
    const salesforceRecordId = sfResult.recordId || null
    console.log('Salesforce Record ID:', salesforceRecordId)
    
    // Create referral in Supabase (with Salesforce record ID)
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
        salesforce_contact_id: salesforceRecordId, // Store SF record ID
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

    // Send email to parent with consent form link
    const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/consent/${referral_number}`
    
    console.log('Consent URL:', consentUrl)
    
    // Send email if parent email is provided
    if (parent_email) {
      const emailResult = await sendConsentEmail({
        parentEmail: parent_email,
        parentPhone: parent_phone,
        counselorName: counselor_name,
        schoolName: school_name,
        referralNumber: referral_number,
        consentUrl: consentUrl,
      })
      
      if (emailResult.success) {
        console.log('Consent email sent to parent:', parent_email)
      } else {
        console.log('Failed to send email, but referral created:', emailResult.error)
      }
    }

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