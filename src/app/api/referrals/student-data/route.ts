import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import SalesforceService, { StudentReferralData } from '@/lib/salesforce'

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

    if (referral.status !== 'consent_signed' && referral.status !== 'completed') {
      return NextResponse.json(
        { error: 'Parent consent not yet provided' },
        { status: 400 }
      )
    }

    // Send data to Salesforce
    const salesforce = new SalesforceService()
    
    // Prepare data for Salesforce
    const sfData: StudentReferralData = {
      referralNumber: referral_number,
      counselorName: referral.counselor_name,
      counselorEmail: referral.counselor_email,
      schoolName: referral.school_name,
      firstName: studentData.student_first_name,
      lastName: studentData.student_last_name,
      studentId: studentData.student_id,
      dateOfBirth: studentData.date_of_birth,
      gender: studentData.gender === 'male' ? 'Male' : 'Female',
      address: studentData.address,
      phone: studentData.phone || studentData.student_mobile,
      email: studentData.student_email,
      parentNames: referral.parent_names,
      parentPhone: referral.parent_phone,
      parentEmail: referral.parent_email,
      grade: studentData.grade,
      homeroomTeacher: studentData.homeroom_teacher,
      failingGradesCount: studentData.failing_grades_count || 0,
      failingSubjects: studentData.failing_subjects,
      behavioralIssues: studentData.behavioral_issues,
      hasPotential: studentData.has_potential,
      motivationLevel: studentData.motivation_level,
      learningDisability: studentData.learning_disability,
      adhd: studentData.adhd,
      riskLevel: studentData.risk_level,
      riskFactors: studentData.risk_factors,
      criminalRecord: studentData.criminal_record,
      drugUse: studentData.drug_use,
      economicStatus: studentData.economic_status,
      familyBackground: studentData.family_background,
      parentInvolvement: studentData.parent_involvement,
      personalOpinion: studentData.personal_opinion,
      consentTimestamp: referral.consent_timestamp,
      status: 'New'
    }

    // Try to send to Salesforce (but don't fail if it doesn't work)
    try {
      const sfResult = await salesforce.processReferral(sfData)
      if (sfResult.success) {
        console.log('Data sent to Salesforce successfully:', sfResult)
        
        // Update referral with Salesforce ID if available
        if (sfResult.leadId) {
          await supabase
            .from('referrals')
            .update({ 
              salesforce_contact_id: sfResult.leadId,
              updated_at: new Date().toISOString()
            })
            .eq('referral_number', referral_number)
        }
      } else {
        console.error('Failed to send to Salesforce:', sfResult.error)
      }
    } catch (sfError) {
      console.error('Salesforce integration error:', sfError)
      // Don't fail the whole request if Salesforce fails
    }

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