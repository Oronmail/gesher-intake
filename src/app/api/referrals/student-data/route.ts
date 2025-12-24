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
          // Try to parse JSON for complex objects
          try {
            studentData[key] = JSON.parse(value as string)
          } catch {
            // If not JSON, use as is
            studentData[key] = value
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
      schoolInfoUsername: studentData.school_info_username,
      schoolInfoPassword: studentData.school_info_password,
      
      // Parent/Guardian Information (form data takes precedence over Supabase consent data)
      parent1Name: studentData.parent1_name || referral.parent_names?.split(',')[0]?.trim() || '',
      parent1Id: '', // We don't store parent IDs in Supabase currently
      parent1Address: '',
      parent1Phone: studentData.parent1_phone || referral.parent_phone || '',
      parent1Signature: referral.signature_image || '',
      parent2Name: studentData.parent2_name || referral.parent_names?.split(',')[1]?.trim() || '',
      parent2Id: '',
      parent2Address: '',
      parent2Phone: studentData.parent2_phone || '',
      parent2Signature: referral.signature_image2,
      parentEmail: referral.parent_email,

      // Family Information (from form)
      siblingsCount: studentData.siblings_count || 0,
      parent1Occupation: studentData.parent1_occupation,
      parent1Profession: studentData.parent1_profession,
      parent1Income: studentData.parent1_income,
      parent2Occupation: studentData.parent2_occupation,
      parent2Profession: studentData.parent2_profession,
      parent2Income: studentData.parent2_income,
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
      failingSubjects: '', // Legacy field, keeping for backward compatibility
      failingSubjectsDetails: studentData.failing_subjects ? JSON.stringify(studentData.failing_subjects) : '',
      
      // Welfare & Social Services (from form)
      knownToWelfare: studentData.known_to_welfare || false,
      socialWorkerName: studentData.social_worker_name,
      socialWorkerPhone: studentData.social_worker_phone,
      youthPromotion: studentData.youth_promotion || false,
      youthWorkerName: studentData.youth_worker_name,
      youthWorkerPhone: studentData.youth_worker_phone,
      
      // Assessment (from form)
      behavioralIssues: studentData.behavioral_issues || false,
      behavioralIssuesDetails: studentData.behavioral_issues_details,
      potentialExplanation: studentData.potential_explanation,
      motivationLevel: studentData.motivation_level,
      motivationType: studentData.motivation_type,
      externalMotivators: studentData.external_motivators,
      socialStatus: studentData.social_status,
      afternoonActivities: studentData.afternoon_activities,
      
      // Learning & Health (from form)
      learningDisability: studentData.learning_disability || false,
      learningDisabilityExplanation: studentData.learning_disability_explanation,
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

    // Upload files to Salesforce if present
    const uploadedFiles: string[] = []
    let assessmentFileUploaded = false
    let gradeSheetUploaded = false

    // Get student full name for file naming
    const studentFullName = `${studentData.student_first_name || ''} ${studentData.student_last_name || ''}`.trim() || 'Student'

    if (files.assessment_file) {
      try {
        // Create new file name with student name
        const fileExtension = files.assessment_file.name.split('.').pop() || 'pdf'
        const newFileName = `${studentFullName} - אבחון.${fileExtension}`

        console.log(`Uploading assessment file as: ${newFileName}`)
        const arrayBuffer = await files.assessment_file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const uploadResult = await salesforceJWT.uploadFile(
          referral.salesforce_contact_id,
          buffer,
          newFileName,
          files.assessment_file.type,
          'קובץ אבחון - Assessment File'
        )

        if (uploadResult.success) {
          console.log(`Assessment file uploaded successfully: ${uploadResult.contentDocumentId}`)
          uploadedFiles.push('assessment_file')
          assessmentFileUploaded = true
        } else {
          console.error(`Failed to upload assessment file: ${uploadResult.error}`)
        }
      } catch (error) {
        console.error('Error uploading assessment file:', error)
      }
    }

    if (files.grade_sheet) {
      try {
        // Create new file name with student name
        const fileExtension = files.grade_sheet.name.split('.').pop() || 'pdf'
        const newFileName = `${studentFullName} - גליון ציונים.${fileExtension}`

        console.log(`Uploading grade sheet as: ${newFileName}`)
        const arrayBuffer = await files.grade_sheet.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const uploadResult = await salesforceJWT.uploadFile(
          referral.salesforce_contact_id,
          buffer,
          newFileName,
          files.grade_sheet.type,
          'גליון ציונים - Grade Sheet'
        )

        if (uploadResult.success) {
          console.log(`Grade sheet uploaded successfully: ${uploadResult.contentDocumentId}`)
          uploadedFiles.push('grade_sheet')
          gradeSheetUploaded = true
        } else {
          console.error(`Failed to upload grade sheet: ${uploadResult.error}`)
        }
      } catch (error) {
        console.error('Error uploading grade sheet:', error)
      }
    }

    if (uploadedFiles.length > 0) {
      console.log(`Successfully uploaded ${uploadedFiles.length} file(s) to Salesforce`)
    }

    // Update Salesforce with file upload status if any files were uploaded
    // Pass false for updateStatus to NOT change the 'Data Submitted' status back to 'In Progress'
    if (assessmentFileUploaded || gradeSheetUploaded) {
      try {
        await salesforceJWT.updatePartialStudentData(
          referral.salesforce_contact_id,
          {
            assessmentFileUploaded,
            gradeSheetUploaded
          },
          false // Don't update status - already set to 'Data Submitted'
        )
        console.log('File upload status updated in Salesforce')
      } catch (statusError) {
        console.error('Failed to update file upload status:', statusError)
        // Don't fail the whole request if status update fails
      }
    }

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
      salesforceId: referral.salesforce_contact_id,
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