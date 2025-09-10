import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import salesforceJWT from '@/lib/salesforce-jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referral_number, ...studentData } = body

    // Get the referral from Supabase to validate consent and get parent/counselor data
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

    // Prepare complete data for Salesforce Queue
    const registrationData = {
      // Metadata
      referralNumber: referral_number,
      submissionDate: new Date().toISOString(),
      consentDate: referral.consent_timestamp || new Date().toISOString(),
      
      // Counselor & School (from Supabase)
      counselorName: referral.counselor_name,
      counselorEmail: referral.counselor_email,
      schoolName: referral.school_name,
      
      // Student Personal Information (from form)
      studentFirstName: studentData.student_first_name,
      studentLastName: studentData.student_last_name,
      studentId: studentData.student_id,
      dateOfBirth: studentData.date_of_birth,
      gender: studentData.gender,
      countryOfBirth: studentData.country_of_birth,
      immigrationYear: studentData.immigration_year,
      studentAddress: studentData.address,
      studentFloor: studentData.floor,
      studentApartment: studentData.apartment,
      studentPhone: studentData.phone,
      studentMobile: studentData.student_mobile,
      schoolSystemPassword: studentData.school_system_password,
      
      // Parent/Guardian Information (from Supabase consent)
      parent1Name: referral.parent_names?.split(',')[0]?.trim() || '',
      parent1Id: '', // We don't store parent IDs in Supabase currently
      parent1Address: '',
      parent1Phone: referral.parent_phone,
      parent1Signature: referral.signature_image || '',
      parent2Name: referral.parent_names?.split(',')[1]?.trim(),
      parent2Id: '',
      parent2Address: '',
      parent2Phone: '',
      parent2Signature: referral.signature_image2,
      parentEmail: referral.parent_email,
      
      // Family Information (from form)
      siblingsCount: studentData.siblings_count || 0,
      fatherName: studentData.father_name,
      fatherMobile: studentData.father_mobile,
      fatherOccupation: studentData.father_occupation,
      fatherProfession: studentData.father_profession,
      fatherIncome: studentData.father_income,
      motherName: studentData.mother_name,
      motherMobile: studentData.mother_mobile,
      motherOccupation: studentData.mother_occupation,
      motherProfession: studentData.mother_profession,
      motherIncome: studentData.mother_income,
      debtsLoans: studentData.debts_loans,
      parentInvolvement: studentData.parent_involvement,
      economicStatus: studentData.economic_status,
      economicDetails: studentData.economic_details,
      familyBackground: studentData.family_background,
      
      // School & Academic (from form)
      grade: studentData.grade,
      homeroomTeacher: studentData.homeroom_teacher,
      teacherPhone: studentData.teacher_phone,
      schoolCounselorName: studentData.counselor_name,
      schoolCounselorPhone: studentData.counselor_phone,
      failingGradesCount: studentData.failing_grades_count || 0,
      failingSubjects: studentData.failing_subjects,
      
      // Welfare & Social Services (from form)
      knownToWelfare: studentData.known_to_welfare || false,
      socialWorkerName: studentData.social_worker_name,
      socialWorkerPhone: studentData.social_worker_phone,
      youthPromotion: studentData.youth_promotion || false,
      youthWorkerName: studentData.youth_worker_name,
      youthWorkerPhone: studentData.youth_worker_phone,
      
      // Assessment (from form)
      behavioralIssues: studentData.behavioral_issues || false,
      hasPotential: studentData.has_potential || false,
      motivationLevel: studentData.motivation_level,
      motivationType: studentData.motivation_type,
      externalMotivators: studentData.external_motivators,
      socialStatus: studentData.social_status,
      afternoonActivities: studentData.afternoon_activities,
      
      // Learning & Health (from form)
      learningDisability: studentData.learning_disability || false,
      requiresRemedialTeaching: studentData.requires_remedial_teaching,
      adhd: studentData.adhd || false,
      adhdTreatment: studentData.adhd_treatment,
      assessmentDone: studentData.assessment_done || false,
      assessmentNeeded: studentData.assessment_needed || false,
      assessmentDetails: studentData.assessment_details,
      
      // Risk Assessment (from form)
      criminalRecord: studentData.criminal_record || false,
      drugUse: studentData.drug_use || false,
      smoking: studentData.smoking || false,
      probationOfficer: studentData.probation_officer,
      youthProbationOfficer: studentData.youth_probation_officer,
      psychologicalTreatment: studentData.psychological_treatment || false,
      psychiatricTreatment: studentData.psychiatric_treatment || false,
      takesMedication: studentData.takes_medication || false,
      medicationDescription: studentData.medication_description,
      riskLevel: studentData.risk_level || 1,
      riskFactors: studentData.risk_factors,
      
      // Final Assessment (from form)
      militaryServicePotential: studentData.military_service_potential || false,
      canHandleProgram: studentData.can_handle_program || false,
      personalOpinion: studentData.personal_opinion
    }

    // Update existing Salesforce record with student data
    if (!referral.salesforce_contact_id) {
      console.error('No Salesforce record ID found for this referral')
      return NextResponse.json(
        { error: 'Salesforce record not found' },
        { status: 400 }
      )
    }
    
    console.log('Updating Salesforce registration request with student data...')
    const sfResult = await salesforceJWT.updateWithStudentData(referral.salesforce_contact_id, registrationData)
    
    if (!sfResult.success) {
      console.error('Failed to update Registration Request in Salesforce:', sfResult.error)
      return NextResponse.json(
        { error: sfResult.error || 'Failed to submit to Salesforce' },
        { status: 500 }
      )
    }

    console.log('Registration Request updated in Salesforce')

    // Privacy-focused cleanup: Remove all personal data from Supabase after successful Salesforce submission
    // Keep only minimal record (referral_number, status, timestamps) to prevent link reuse
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString(),
        // Clear all personal/sensitive data for privacy
        school_id: null,
        school_name: null,
        counselor_name: null,
        counselor_email: null,
        parent_email: null,
        parent_phone: null,
        signature_image: null,
        signature_image2: null,
        parent_names: null,
        // Keep only the SF reference and status
        // referral_number, created_at, and salesforce_contact_id are preserved
      })
      .eq('referral_number', referral_number)

    if (updateError) {
      console.error('Error updating referral status:', updateError)
      // Continue anyway - data is in Salesforce, privacy cleanup is secondary
    } else {
      console.log(`Privacy cleanup completed for referral ${referral_number} - personal data removed from Supabase`)
    }

    return NextResponse.json({
      success: true,
      message: 'Student data submitted successfully to Salesforce',
      salesforceId: referral.salesforce_contact_id
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}