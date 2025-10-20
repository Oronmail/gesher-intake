import { NextRequest, NextResponse } from 'next/server'
import salesforceJWT from '@/lib/salesforce-jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ referralNumber: string }> }
) {
  try {
    const { referralNumber } = await params

    if (!referralNumber) {
      return NextResponse.json(
        { error: 'Referral number is required' },
        { status: 400 }
      )
    }

    // Fetch data from Salesforce
    const sfResult = await salesforceJWT.getRegistrationByReferralNumber(referralNumber)

    if (!sfResult.success || !sfResult.data) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    const sfData = sfResult.data

    // Map Salesforce fields back to form field names
    const formData = {
      // Personal Information
      student_first_name: sfData.Student_First_Name__c || '',
      student_last_name: sfData.Student_Last_Name__c || '',
      student_id: sfData.Student_ID__c || '',
      date_of_birth: sfData.Date_of_Birth__c || '',
      gender: sfData.Gender__c?.toLowerCase() || '',
      country_of_birth: sfData.Country_of_Birth__c || '',
      immigration_year: sfData.Immigration_Year__c || '',
      address: sfData.Student_Address__c || '',
      floor: sfData.Student_Floor__c || '',
      apartment: sfData.Student_Apartment__c || '',
      phone: sfData.Student_Phone__c || '',
      student_mobile: sfData.Student_Mobile__c || '',
      school_info_username: sfData.School_Info_Username__c || '',
      school_info_password: sfData.School_Info_Password__c || '',

      // Family Information
      siblings_count: sfData.Siblings_Count__c || 0,
      father_name: sfData.Father_Name__c || '',
      father_mobile: sfData.Father_Mobile__c || '',
      father_occupation: sfData.Father_Occupation__c || '',
      father_profession: sfData.Father_Profession__c || '',
      father_income: sfData.Father_Income__c || '',
      mother_name: sfData.Mother_Name__c || '',
      mother_mobile: sfData.Mother_Mobile__c || '',
      mother_occupation: sfData.Mother_Occupation__c || '',
      mother_profession: sfData.Mother_Profession__c || '',
      mother_income: sfData.Mother_Income__c || '',
      debts_loans: sfData.Debts_Loans__c || '',
      parent_involvement: sfData.Parent_Involvement__c?.toLowerCase().replace(' ', '_') || '',

      // Background
      economic_status: sfData.Economic_Status__c?.toLowerCase() || '',
      economic_details: sfData.Economic_Details__c || '',
      family_background: sfData.Family_Background__c || '',

      // School Information
      school_name: sfData.School_Name__c || '',
      grade: sfData.Grade__c || '',
      homeroom_teacher: sfData.Homeroom_Teacher__c || '',
      teacher_phone: sfData.Teacher_Phone__c || '',
      counselor_name: sfData.Counselor_Name__c || '',
      counselor_phone: sfData.Counselor_Phone__c || '',

      // Intake Assessment
      behavioral_issues: sfData.Behavioral_Issues__c || false,
      behavioral_issues_details: sfData.Behavioral_Issues_Details__c || '',
      has_potential: sfData.Has_Potential__c || false,
      potential_explanation: sfData.Potential_Explanation__c || '',
      motivation_level: sfData.Motivation_Level__c?.toLowerCase() || '',
      motivation_type: sfData.Motivation_Type__c?.toLowerCase() || '',
      external_motivators: sfData.External_Motivators__c || '',
      social_status: sfData.Social_Status__c || '',
      afternoon_activities: sfData.Afternoon_Activities__c || '',

      // Learning Assessment
      learning_disability: sfData.Learning_Disability__c || false,
      learning_disability_explanation: sfData.Learning_Disability_Explanation__c || '',
      requires_remedial_teaching: sfData.Requires_Remedial_Teaching__c || false,
      adhd: sfData.ADHD__c || false,
      adhd_treatment: sfData.ADHD_Treatment__c || '',
      assessment_done: sfData.Assessment_Done__c || false,
      assessment_needed: sfData.Assessment_Needed__c || false,
      assessment_details: sfData.Assessment_Details__c || '',

      // Risk Assessment
      criminal_record: sfData.Criminal_Record__c || false,
      drug_use: sfData.Drug_Use__c || false,
      smoking: sfData.Smoking__c || false,
      probation_officer: sfData.Probation_Officer__c || '',
      youth_probation_officer: sfData.Youth_Probation_Officer__c || '',
      psychological_treatment: sfData.Psychological_Treatment__c || false,
      psychiatric_treatment: sfData.Psychiatric_Treatment__c || false,
      takes_medication: sfData.Takes_Medication__c || false,
      medication_description: sfData.Medication_Description__c || '',

      // Final Assessment
      military_service_potential: sfData.Military_Service_Potential__c || false,
      can_handle_program: sfData.Can_Handle_Program__c || false,
      risk_level: sfData.Risk_Level__c || 1,
      risk_factors: sfData.Risk_Factors__c || '',
      personal_opinion: sfData.Personal_Opinion__c || '',
      failing_grades_count: sfData.Failing_Grades_Count__c || 0,
    }

    return NextResponse.json({
      success: true,
      data: formData
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
