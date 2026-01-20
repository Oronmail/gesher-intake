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
        { error: 'מספר הפניה חסר' },
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
        { error: 'לא נמצאה הפניה במערכת' },
        { status: 404 }
      )
    }

    if (!referral.salesforce_contact_id) {
      return NextResponse.json(
        { error: 'רשומה לא נמצאה במערכת Salesforce' },
        { status: 404 }
      )
    }

    // Filter out false boolean values - only save true checkboxes
    // Prepare data in camelCase format expected by Salesforce service
    // Include all fields, including boolean false values, so checkboxes can be properly saved
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

      // Welfare Status
      knownToWelfare: studentData.known_to_welfare,
      socialWorkerName: studentData.social_worker_name,
      socialWorkerPhone: studentData.social_worker_phone,
      youthPromotion: studentData.youth_promotion,
      youthWorkerName: studentData.youth_worker_name,
      youthWorkerPhone: studentData.youth_worker_phone,

      // Family Information
      siblingsCount: studentData.siblings_count,
      parent1Name: studentData.parent1_name,
      parent1Phone: studentData.parent1_phone,
      parent1Occupation: studentData.parent1_occupation,
      parent1Profession: studentData.parent1_profession,
      parent1Income: studentData.parent1_income,
      parent2Name: studentData.parent2_name,
      parent2Phone: studentData.parent2_phone,
      parent2Occupation: studentData.parent2_occupation,
      parent2Profession: studentData.parent2_profession,
      parent2Income: studentData.parent2_income,
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
      schoolCounselorName: studentData.counselor_name,
      schoolCounselorPhone: studentData.counselor_phone,

      // Intake Assessment
      behavioralIssues: studentData.behavioral_issues,
      behavioralIssuesDetails: studentData.behavioral_issues_details,
      potentialExplanation: studentData.potential_explanation,
      motivationLevel: studentData.motivation_level,
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
      criminalRecordDetails: studentData.criminal_record_details,
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
        { error: 'שגיאה בשמירת הנתונים. אנא נסה שנית.' },
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
      { error: 'שגיאה פנימית בשרת. אנא נסה שנית.' },
      { status: 500 }
    )
  }
}
