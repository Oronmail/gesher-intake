import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendConsentEmail } from '@/lib/email'
import { sendConsentSMS } from '@/lib/sms'
import { getBrandingFromDestination } from '@/lib/branding'
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
      counselor_mobile,
      school_name,
      warm_home_destination,
      consent_method,
      parent_email,
      parent_phone,
    } = validationResult.data

    // Determine initial status based on consent method
    const initialStatus = consent_method === 'manual' ? 'consent_signed' : 'pending_consent'

    // Generate unique referral number
    const referral_number = generateReferralNumber()

    // Create initial Registration Request in Salesforce using JWT service
    const initialData = {
      referralNumber: referral_number,
      counselorName: counselor_name,
      counselorEmail: counselor_email,
      counselorMobile: counselor_mobile,
      schoolName: school_name,
      warmHomeDestination: warm_home_destination,
      parentEmail: parent_email,
      parentPhone: parent_phone,
      consentMethod: consent_method,
      status: initialStatus,
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
        counselor_mobile,
        parent_email: parent_email || null,
        parent_phone: parent_phone || null,
        status: initialStatus,
        consent_method: consent_method,
        salesforce_contact_id: salesforceRecordId, // Store SF record ID
        // For manual consent, set consent_timestamp immediately
        ...(consent_method === 'manual' && {
          consent_timestamp: new Date().toISOString(),
          parent_names: 'הסכמה ידנית (טופס נייר)',
        }),
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

    // Handle different flows based on consent method
    if (consent_method === 'manual') {
      // For manual consent, return student form URL directly (skip notifications)
      const studentFormUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student-form/${referral_number}`

      console.log('====================================')
      console.log('MANUAL CONSENT - Direct to student form')
      console.log('Student form URL:', studentFormUrl)
      console.log('====================================')

      return NextResponse.json({
        success: true,
        referral_number,
        consent_method: 'manual',
        student_form_url: studentFormUrl,
        data,
      })
    }

    // Digital consent flow - send notifications to parent
    const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/consent/${referral_number}`

    console.log('Consent URL:', consentUrl)

    // Track notification results
    const notifications = {
      email: false,
      sms: false,
    }

    // Get branding based on warm home destination
    const branding = getBrandingFromDestination(warm_home_destination)

    // Send email if parent email is provided
    if (parent_email) {
      const emailResult = await sendConsentEmail({
        parentEmail: parent_email,
        parentPhone: parent_phone || '',
        counselorName: counselor_name,
        schoolName: school_name,
        referralNumber: referral_number,
        consentUrl: consentUrl,
        organizationName: branding.organizationName,
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
      consent_method: 'digital',
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