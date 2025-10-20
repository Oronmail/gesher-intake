import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import salesforceJWT from '@/lib/salesforce-jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referral_number, ...studentData } = body

    if (!referral_number) {
      return NextResponse.json(
        { error: 'Referral number is required' },
        { status: 400 }
      )
    }

    // Get the referral from Supabase to get Salesforce record ID
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('salesforce_contact_id')
      .eq('referral_number', referral_number)
      .single()

    if (referralError || !referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    if (!referral.salesforce_contact_id) {
      return NextResponse.json(
        { error: 'Salesforce record not found' },
        { status: 404 }
      )
    }

    // Prepare data in camelCase format expected by Salesforce service
    const mappedData = {
      // Personal Information
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
      schoolInfoUsername: studentData.school_info_username,
      schoolInfoPassword: studentData.school_info_password,

      // Family Information
      siblingsCount: studentData.siblings_count,
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

      // Background
      economicStatus: studentData.economic_status,
      economicDetails: studentData.economic_details,
      familyBackground: studentData.family_background,

      // School Information
      schoolName: studentData.school_name,
      grade: studentData.grade,
      homeroomTeacher: studentData.homeroom_teacher,
      teacherPhone: studentData.teacher_phone,

      // Intake Assessment
      behavioralIssues: studentData.behavioral_issues,
      behavioralIssuesDetails: studentData.behavioral_issues_details,
      hasPotential: studentData.has_potential,
      potentialExplanation: studentData.potential_explanation,
      motivationLevel: studentData.motivation_level,
      motivationType: studentData.motivation_type,
      externalMotivators: studentData.external_motivators,
      socialStatus: studentData.social_status,
      afternoonActivities: studentData.afternoon_activities,

      // Learning Assessment
      learningDisability: studentData.learning_disability,
      learningDisabilityExplanation: studentData.learning_disability_explanation,
      requiresRemedialTeaching: studentData.requires_remedial_teaching,
      adhd: studentData.adhd,
      adhdTreatment: studentData.adhd_treatment,
      assessmentDone: studentData.assessment_done,
      assessmentNeeded: studentData.assessment_needed,
      assessmentDetails: studentData.assessment_details,

      // Risk Assessment
      criminalRecord: studentData.criminal_record,
      drugUse: studentData.drug_use,
      smoking: studentData.smoking,
      probationOfficer: studentData.probation_officer,
      youthProbationOfficer: studentData.youth_probation_officer,
      psychologicalTreatment: studentData.psychological_treatment,
      psychiatricTreatment: studentData.psychiatric_treatment,
      takesMedication: studentData.takes_medication,
      medicationDescription: studentData.medication_description,

      // Final Assessment
      militaryServicePotential: studentData.military_service_potential,
      canHandleProgram: studentData.can_handle_program,
      riskLevel: studentData.risk_level,
      riskFactors: studentData.risk_factors,
      personalOpinion: studentData.personal_opinion,
      failingGradesCount: studentData.failing_grades_count,
    }

    // Update Salesforce with partial data
    const sfResult = await salesforceJWT.updatePartialStudentData(
      referral.salesforce_contact_id,
      mappedData
    )

    if (!sfResult.success) {
      console.error('Failed to save progress to Salesforce:', sfResult.error)
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
