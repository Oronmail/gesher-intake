import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendCounselorNotification } from '@/lib/email'
import salesforceJWT from '@/lib/salesforce-jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      referral_number,
      parent1_name,
      parent1_id,
      parent1_address,
      parent1_phone,
      parent2_name,
      parent2_id,
      parent2_address,
      parent2_phone,
      signature,
      signature2,
      student_name,
      pdf_base64,
      pdf_filename,
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

    // Update Salesforce record with consent data
    if (data.salesforce_contact_id) {
      const consentData = {
        parent1Name: parent1_name,
        parent1Id: parent1_id,
        parent1Address: parent1_address,
        parent1Phone: parent1_phone,
        parent1Signature: signature,
        parent2Name: parent2_name,
        parent2Id: parent2_id,
        parent2Address: parent2_address,
        parent2Phone: parent2_phone,
        parent2Signature: signature2,
        consentDate: new Date().toISOString(),
      }
      
      const sfResult = await salesforceJWT.updateWithConsent(data.salesforce_contact_id, consentData)
      
      if (!sfResult.success) {
        console.error('Failed to update Salesforce record with consent:', sfResult.error)
        // Continue anyway - we don't want to block the process
      } else {
        console.log('Salesforce record updated with consent data')
        
        // Upload PDF if available
        if (pdf_base64 && pdf_filename) {
          const pdfResult = await salesforceJWT.uploadConsentPDF(
            data.salesforce_contact_id,
            pdf_base64,
            pdf_filename
          )
          
          if (pdfResult.success) {
            console.log('Consent PDF uploaded successfully to Salesforce')
          } else {
            console.error('Failed to upload consent PDF:', pdfResult.error)
            // Continue anyway - PDF upload is not critical
          }
        }
      }
    }

    // Send notification to counselor that consent is signed
    const studentFormUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student-form/${referral_number}`
    
    // Send email to counselor
    if (data.counselor_email) {
      const emailResult = await sendCounselorNotification({
        counselorEmail: data.counselor_email,
        counselorName: data.counselor_name,
        parentNames: parent_names,
        studentName: student_name,
        studentFormUrl: studentFormUrl,
        referralNumber: referral_number,
      })
      
      if (emailResult.success) {
        console.log('Notification email sent to counselor:', data.counselor_email)
      } else {
        console.log('Failed to send counselor notification:', emailResult.error)
      }
    }
    
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