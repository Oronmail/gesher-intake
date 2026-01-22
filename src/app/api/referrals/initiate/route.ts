import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendConsentEmail, sendCounselorNotification, sendHouseManagerNotification } from '@/lib/email'
import { sendConsentSMS, sendCounselorSMS, sendHouseManagerSMS } from '@/lib/sms'
import { getBrandingFromDestination, getHouseManagerContact } from '@/lib/branding'
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
    // Check content type to determine if it's FormData or JSON
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown>
    let consentFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      const formData = await request.formData()
      body = {}

      for (const [key, value] of formData.entries()) {
        if (key === 'consent_file' && value instanceof File) {
          consentFile = value
        } else {
          // Convert string 'true'/'false' to boolean for checkbox
          if (key === 'manual_consent_confirmed') {
            body[key] = value === 'true'
          } else {
            body[key] = value
          }
        }
      }

      // If a consent file was uploaded, that satisfies the manual consent requirement
      if (consentFile && body.consent_method === 'manual') {
        body.manual_consent_confirmed = true
      }
    } else {
      // Handle JSON
      body = await request.json()
    }

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
      rep_position,
      school_name,
      warm_home_destination,
      consent_method,
      parent_email,
      parent_phone,
      student_first_name,
      student_last_name,
    } = validationResult.data

    // Determine initial status based on consent method and whether file was uploaded
    // - Digital consent: pending_consent
    // - Manual consent WITH file: consent_signed (file proves consent was received)
    // - Manual consent WITHOUT file (checkbox only): consent_with_rep (need to collect paper form)
    let initialStatus: string
    let consentFormSigned = false

    if (consent_method === 'digital') {
      initialStatus = 'pending_consent'
    } else if (consentFile) {
      // File uploaded - consent form is confirmed
      initialStatus = 'consent_signed'
      consentFormSigned = true
    } else {
      // Checkbox only - consent form is with the rep, not yet submitted
      initialStatus = 'consent_with_rep'
    }

    // Generate unique referral number
    const referral_number = generateReferralNumber()

    // Build student full name for manual consent
    const studentFullName = consent_method === 'manual' && student_first_name && student_last_name
      ? `${student_first_name} ${student_last_name}`
      : null

    // Create initial Registration Request in Salesforce using JWT service
    const initialData = {
      referralNumber: referral_number,
      counselorName: counselor_name,
      counselorEmail: counselor_email,
      counselorMobile: counselor_mobile,
      repPosition: rep_position,
      schoolName: school_name,
      warmHomeDestination: warm_home_destination,
      parentEmail: parent_email,
      parentPhone: parent_phone,
      consentMethod: consent_method,
      status: initialStatus,
      consentFormSigned: consentFormSigned,
      // Include student name for manual consent
      ...(consent_method === 'manual' && student_first_name && {
        studentFirstName: student_first_name,
        studentLastName: student_last_name,
      }),
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
        parent_phone: parent_phone || '',  // Use empty string instead of null (NOT NULL constraint)
        status: initialStatus,
        consent_method: consent_method,
        salesforce_contact_id: salesforceRecordId, // Store SF record ID
        // Only set consent_timestamp when we actually have the consent form (file uploaded)
        ...(consentFormSigned && {
          consent_timestamp: new Date().toISOString(),
          parent_names: 'הסכמה ידנית (טופס נייר)',
        }),
        // For consent_with_rep status, don't set timestamp - it's pending
        ...(initialStatus === 'consent_with_rep' && {
          parent_names: 'ויתור סודיות אצל הנציג',
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
      // If a consent file was uploaded, attach it to the Salesforce record
      if (consentFile && salesforceRecordId) {
        try {
          const fileBuffer = Buffer.from(await consentFile.arrayBuffer())
          const uploadResult = await salesforceJWT.uploadFile(
            salesforceRecordId,
            fileBuffer,
            `consent-form-${referral_number}.${consentFile.name.split('.').pop()}`,
            consentFile.type,
            `טופס הסכמה חתום - ${referral_number}`
          )

          if (uploadResult.success) {
            console.log('Consent file uploaded to Salesforce:', uploadResult.contentDocumentId)
          } else {
            console.error('Failed to upload consent file:', uploadResult.error)
          }
        } catch (uploadError) {
          console.error('Error uploading consent file:', uploadError)
          // Continue anyway - don't block the process
        }
      }

      // For manual consent, send confirmation to counselor and return student form URL
      const studentFormUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student-form/${referral_number}`

      console.log('====================================')
      console.log('MANUAL CONSENT - Direct to student form')
      console.log('Student form URL:', studentFormUrl)
      if (consentFile) {
        console.log('Consent file uploaded:', consentFile.name)
      }
      console.log('====================================')

      // Get branding for organization name
      const branding = getBrandingFromDestination(warm_home_destination)

      // Track notification results for manual consent
      const manualNotifications = {
        email: false,
        sms: false,
      }

      // Send email confirmation to counselor
      if (counselor_email && studentFullName) {
        const emailResult = await sendCounselorNotification({
          counselorEmail: counselor_email,
          counselorName: counselor_name,
          parentNames: 'הסכמה ידנית (טופס נייר)',
          studentName: studentFullName,
          studentFormUrl: studentFormUrl,
          referralNumber: referral_number,
          organizationName: branding.organizationName,
          isManualConsent: true, // Flag to use manual consent template
        })

        if (emailResult.success) {
          console.log('Manual consent confirmation email sent to counselor:', counselor_email)
          manualNotifications.email = true
        } else {
          console.log('Failed to send counselor email:', emailResult.error)
        }
      }

      // Send SMS confirmation to counselor with custom message for manual consent
      if (counselor_mobile && studentFullName) {
        const smsResult = await sendCounselorSMS({
          counselorPhone: counselor_mobile,
          studentName: studentFullName,
          formUrl: studentFormUrl,
          isManualConsent: true, // Flag to use different SMS template
        })

        if (smsResult.success) {
          console.log('Manual consent confirmation SMS sent to counselor:', counselor_mobile)
          manualNotifications.sms = true
        } else {
          console.log('Failed to send counselor SMS:', smsResult.error)
        }
      }

      console.log('Manual consent notifications sent:', manualNotifications)

      // Send notification to house manager about new referral
      const houseManager = getHouseManagerContact(warm_home_destination)
      if (houseManager && studentFullName) {
        // Build consent warning if consent form wasn't uploaded
        const consentWarning = initialStatus === 'consent_with_rep'
          ? `טופס ויתור סודיות לא הוגש, יש לוודא קבלת הטופס מ-${counselor_name}`
          : undefined

        // Send email to house manager
        const managerEmailResult = await sendHouseManagerNotification({
          managerEmail: houseManager.email,
          managerName: houseManager.name,
          warmHomeDestination: warm_home_destination,
          studentName: studentFullName,
          schoolName: school_name,
          counselorName: counselor_name,
          referralNumber: referral_number,
          salesforceRecordId: salesforceRecordId,
          notificationType: 'new_referral',
          organizationName: branding.organizationName,
          consentWarning: consentWarning,
        })

        if (managerEmailResult.success) {
          console.log('House manager email notification sent:', houseManager.email)
        } else {
          console.log('Failed to send house manager email:', managerEmailResult.error)
        }

        // Send SMS to house manager
        const managerSmsResult = await sendHouseManagerSMS({
          managerPhone: houseManager.phone,
          studentName: studentFullName,
          schoolName: school_name,
          warmHomeDestination: warm_home_destination,
          notificationType: 'new_referral',
        })

        if (managerSmsResult.success) {
          console.log('House manager SMS notification sent:', houseManager.phone)
        } else {
          console.log('Failed to send house manager SMS:', managerSmsResult.error)
        }
      }

      return NextResponse.json({
        success: true,
        referral_number,
        consent_method: 'manual',
        student_form_url: studentFormUrl,
        student_name: studentFullName,
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

    // Send notification to house manager about new referral (digital flow - no student name yet)
    const houseManager = getHouseManagerContact(warm_home_destination)
    if (houseManager) {
      // Send email to house manager
      const managerEmailResult = await sendHouseManagerNotification({
        managerEmail: houseManager.email,
        managerName: houseManager.name,
        warmHomeDestination: warm_home_destination,
        studentName: 'ממתין לאישור הורים', // Student name not yet available in digital flow
        schoolName: school_name,
        counselorName: counselor_name,
        referralNumber: referral_number,
        salesforceRecordId: salesforceRecordId,
        notificationType: 'new_referral',
        organizationName: branding.organizationName,
      })

      if (managerEmailResult.success) {
        console.log('House manager email notification sent (digital):', houseManager.email)
      } else {
        console.log('Failed to send house manager email:', managerEmailResult.error)
      }

      // Send SMS to house manager
      const managerSmsResult = await sendHouseManagerSMS({
        managerPhone: houseManager.phone,
        studentName: 'תלמיד/ה חדש/ה',
        schoolName: school_name,
        warmHomeDestination: warm_home_destination,
        notificationType: 'new_referral',
      })

      if (managerSmsResult.success) {
        console.log('House manager SMS notification sent (digital):', houseManager.phone)
      } else {
        console.log('Failed to send house manager SMS:', managerSmsResult.error)
      }
    }

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