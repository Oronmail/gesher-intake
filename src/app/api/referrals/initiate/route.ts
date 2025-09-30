import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendConsentEmail } from '@/lib/email'
import { sendConsentSMS } from '@/lib/sms'
import salesforceJWT from '@/lib/salesforce-jwt'
import { 
  secureFormSchemas, 
  redactSensitiveData 
} from '@/lib/security'
import crypto from 'crypto'

function generateReferralNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  // Use crypto for better randomness
  const random = crypto.randomInt(1000, 9999).toString()
  return `REF-${year}${month}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input
    const validationResult = secureFormSchemas.counselorInitial.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const {
      counselor_name,
      counselor_email,
      school_name,
      warm_home_destination,
      parent_email,
      parent_phone,
    } = validationResult.data

    // Generate unique referral number
    const referral_number = generateReferralNumber()

    // Create initial Registration Request in Salesforce using JWT service
    const initialData = {
      referralNumber: referral_number,
      counselorName: counselor_name,
      counselorEmail: counselor_email,
      schoolName: school_name,
      warmHomeDestination: warm_home_destination,
      parentEmail: parent_email,
      parentPhone: parent_phone,
    }
    
    const sfResult = await salesforceJWT.createInitialRegistration(initialData)
    
    if (!sfResult.success) {
      console.error('Failed to create Salesforce record:', sfResult.error)
      // Continue anyway - we don't want to block the process
    }
    
    const salesforceRecordId = sfResult.recordId || null
    // Log with redacted sensitive data
    console.log('Salesforce Record Created:', redactSensitiveData({ recordId: salesforceRecordId }))
    
    // Create referral in Supabase (with Salesforce record ID)
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referral_number,
        school_id: school_name.toLowerCase().replace(/\s+/g, '-'),
        school_name,
        warm_home_destination,
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

    // Send notifications to parent with consent form link
    const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/consent/${referral_number}`
    
    console.log('Consent URL:', consentUrl)
    
    // Track notification results
    const notifications = {
      email: false,
      sms: false,
    }
    
    // Send email if parent email is provided
    if (parent_email) {
      const emailResult = await sendConsentEmail({
        parentEmail: parent_email,
        parentPhone: parent_phone || '',
        counselorName: counselor_name,
        schoolName: school_name,
        referralNumber: referral_number,
        consentUrl: consentUrl,
      })
      
      if (emailResult.success) {
        console.log('Consent email sent to parent:', parent_email)
        notifications.email = true
      } else {
        console.log('Failed to send email, but referral created:', emailResult.error)
      }
    }
    
    // Send SMS if parent phone is provided
    if (parent_phone) {
      const smsResult = await sendConsentSMS({
        parentPhone: parent_phone,
        referralNumber: referral_number,
        consentUrl: consentUrl,
      })
      
      if (smsResult.success) {
        console.log('Consent SMS sent to parent:', parent_phone)
        notifications.sms = true
      } else {
        console.log('Failed to send SMS:', smsResult.error)
        // SMS failure is not critical - continue anyway
      }
    }
    
    // Log notification summary
    console.log('Notifications sent:', notifications)

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