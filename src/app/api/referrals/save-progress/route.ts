import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import salesforceJWT from '@/lib/salesforce-jwt'

export async function POST(request: NextRequest) {
  try {
    let referral_number: string
    let studentData: Record<string, unknown>
    const files: { assessment_file?: File; grade_sheet?: File } = {}

    // Check if request is FormData (contains files) or JSON
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with files
      const formData = await request.formData()

      // Extract referral number
      referral_number = formData.get('referral_number') as string

      // Extract files
      const assessmentFile = formData.get('assessment_file') as File
      const gradeSheetFile = formData.get('grade_sheet') as File

      if (assessmentFile && assessmentFile.size > 0) {
        files.assessment_file = assessmentFile
      }
      if (gradeSheetFile && gradeSheetFile.size > 0) {
        files.grade_sheet = gradeSheetFile
      }

      // Extract other form data
      studentData = {}
      for (const [key, value] of formData.entries()) {
        if (key !== 'referral_number' && key !== 'assessment_file' && key !== 'grade_sheet') {
          // Convert FormDataEntryValue to string
          const stringValue = value.toString()

          // Try to parse JSON for complex objects
          try {
            studentData[key] = JSON.parse(stringValue)
          } catch {
            // If not JSON, use string value
            studentData[key] = stringValue
          }
        }
      }
    } else {
      // Handle regular JSON
      const body = await request.json()
      referral_number = body.referral_number
      studentData = { ...body }
      delete studentData.referral_number
    }

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

    // Filter out false boolean values - only save true checkboxes
    const filteredData: Record<string, unknown> = {}
    Object.entries(studentData).forEach(([key, value]) => {
      // Skip boolean fields that are false (unchecked/default)
      if (typeof value === 'boolean' && value === false) {
        return
      }
      // Include all other values
      filteredData[key] = value
    })

    // Prepare data in camelCase format expected by Salesforce service
    const mappedData = {
      // Personal Information
      studentFirstName: filteredData.student_first_name,
      studentLastName: filteredData.student_last_name,
      studentId: filteredData.student_id,
      dateOfBirth: filteredData.date_of_birth,
      gender: filteredData.gender,
      countryOfBirth: filteredData.country_of_birth,
      immigrationYear: filteredData.immigration_year,
      studentAddress: filteredData.address,
      studentFloor: filteredData.floor,
      studentApartment: filteredData.apartment,
      studentPhone: filteredData.phone,
      studentMobile: filteredData.student_mobile,
      schoolInfoUsername: filteredData.school_info_username,
      schoolInfoPassword: filteredData.school_info_password,

      // Family Information
      siblingsCount: filteredData.siblings_count,
      fatherName: filteredData.father_name,
      fatherMobile: filteredData.father_mobile,
      fatherOccupation: filteredData.father_occupation,
      fatherProfession: filteredData.father_profession,
      fatherIncome: filteredData.father_income,
      motherName: filteredData.mother_name,
      motherMobile: filteredData.mother_mobile,
      motherOccupation: filteredData.mother_occupation,
      motherProfession: filteredData.mother_profession,
      motherIncome: filteredData.mother_income,
      debtsLoans: filteredData.debts_loans,
      parentInvolvement: filteredData.parent_involvement,

      // Background
      economicStatus: filteredData.economic_status,
      economicDetails: filteredData.economic_details,
      familyBackground: filteredData.family_background,

      // School Information
      schoolName: filteredData.school_name,
      grade: filteredData.grade,
      homeroomTeacher: filteredData.homeroom_teacher,
      teacherPhone: filteredData.teacher_phone,
      schoolCounselorName: filteredData.counselor_name,
      schoolCounselorPhone: filteredData.counselor_phone,

      // Intake Assessment
      behavioralIssues: filteredData.behavioral_issues,
      behavioralIssuesDetails: filteredData.behavioral_issues_details,
      hasPotential: filteredData.has_potential,
      potentialExplanation: filteredData.potential_explanation,
      motivationLevel: filteredData.motivation_level,
      motivationType: filteredData.motivation_type,
      externalMotivators: filteredData.external_motivators,
      socialStatus: filteredData.social_status,
      afternoonActivities: filteredData.afternoon_activities,

      // Learning Assessment
      learningDisability: filteredData.learning_disability,
      learningDisabilityExplanation: filteredData.learning_disability_explanation,
      requiresRemedialTeaching: filteredData.requires_remedial_teaching,
      adhd: filteredData.adhd,
      adhdTreatment: filteredData.adhd_treatment,
      assessmentDone: filteredData.assessment_done,
      assessmentNeeded: filteredData.assessment_needed,
      assessmentDetails: filteredData.assessment_details,

      // Risk Assessment
      criminalRecord: filteredData.criminal_record,
      drugUse: filteredData.drug_use,
      smoking: filteredData.smoking,
      probationOfficer: filteredData.probation_officer,
      youthProbationOfficer: filteredData.youth_probation_officer,
      psychologicalTreatment: filteredData.psychological_treatment,
      psychiatricTreatment: filteredData.psychiatric_treatment,
      takesMedication: filteredData.takes_medication,
      medicationDescription: filteredData.medication_description,

      // Final Assessment
      militaryServicePotential: filteredData.military_service_potential,
      canHandleProgram: filteredData.can_handle_program,
      riskLevel: filteredData.risk_level,
      riskFactors: filteredData.risk_factors,
      personalOpinion: filteredData.personal_opinion,
      failingGradesCount: filteredData.failing_grades_count,
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

    // Upload files if provided
    const uploadedFiles: string[] = []
    let assessmentFileUploaded = false
    let gradeSheetUploaded = false

    if (files.assessment_file) {
      try {
        const fileExtension = files.assessment_file.name.split('.').pop() || 'pdf'
        const fileName = `קובץ_אבחון_${referral_number}.${fileExtension}`

        // Convert file to Buffer
        const arrayBuffer = await files.assessment_file.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        await salesforceJWT.uploadFile(
          referral.salesforce_contact_id,
          fileBuffer,
          fileName,
          files.assessment_file.type,
          'Assessment File'
        )
        uploadedFiles.push('assessment_file')
        assessmentFileUploaded = true
        console.log('Assessment file uploaded successfully')
      } catch (fileError) {
        console.error('Failed to upload assessment file:', fileError)
        // Don't fail the whole request if file upload fails
      }
    }

    if (files.grade_sheet) {
      try {
        const fileExtension = files.grade_sheet.name.split('.').pop() || 'pdf'
        const fileName = `גליון_ציונים_${referral_number}.${fileExtension}`

        // Convert file to Buffer
        const arrayBuffer = await files.grade_sheet.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        await salesforceJWT.uploadFile(
          referral.salesforce_contact_id,
          fileBuffer,
          fileName,
          files.grade_sheet.type,
          'Grade Sheet'
        )
        uploadedFiles.push('grade_sheet')
        gradeSheetUploaded = true
        console.log('Grade sheet uploaded successfully')
      } catch (fileError) {
        console.error('Failed to upload grade sheet:', fileError)
        // Don't fail the whole request if file upload fails
      }
    }

    // Update Salesforce with file upload status if any files were uploaded
    if (assessmentFileUploaded || gradeSheetUploaded) {
      try {
        await salesforceJWT.updatePartialStudentData(
          referral.salesforce_contact_id,
          {
            assessmentFileUploaded,
            gradeSheetUploaded
          }
        )
        console.log('File upload status updated in Salesforce')
      } catch (statusError) {
        console.error('Failed to update file upload status:', statusError)
        // Don't fail the whole request if status update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
