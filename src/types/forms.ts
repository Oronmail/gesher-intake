export interface InitialReferralForm {
  counselor_name: string
  counselor_email: string
  school_name: string
  warm_home_destination: string
  parent_email: string
  parent_phone: string
}

export interface ConsentForm {
  parent1_name: string
  parent1_id: string
  parent1_address?: string
  parent1_phone?: string
  parent2_name?: string
  parent2_id?: string
  parent2_address?: string
  parent2_phone?: string
  student_name: string
  signature: string
}

export interface StudentDataForm {
  // Personal Information
  student_first_name: string
  student_last_name: string
  student_id: string
  date_of_birth: string
  country_of_birth: string
  immigration_year?: string
  gender: 'male' | 'female'
  address: string
  floor?: string
  apartment?: string
  phone: string
  student_mobile?: string
  school_info_username?: string
  school_info_password?: string
  
  // Welfare Status
  known_to_welfare: '' | 'yes' | 'no' | 'unknown'
  social_worker_name?: string
  social_worker_phone?: string
  youth_promotion: '' | 'yes' | 'no' | 'unknown'
  youth_worker_name?: string
  youth_worker_phone?: string
  
  // Family Information
  siblings_count: number | null
  father_name: string
  father_mobile: string
  father_occupation: string
  father_profession: string
  father_income?: string
  mother_name?: string
  mother_mobile?: string
  mother_occupation?: string
  mother_profession?: string
  mother_income?: string
  debts_loans?: string
  parent_involvement: string
  
  // Background
  economic_status: 'low' | 'medium' | 'high'
  economic_details?: string
  family_background?: string
  
  // School Information
  school_name: string
  grade: string
  homeroom_teacher: string
  teacher_phone: string
  counselor_name: string
  counselor_phone: string
  
  // Intake Assessment
  behavioral_issues: '' | 'yes' | 'no' | 'unknown'
  behavioral_issues_details?: string
  has_potential: '' | 'yes' | 'no' | 'unknown'
  potential_explanation?: string
  motivation_level: string
  motivation_type: 'internal' | 'external'
  external_motivators?: string
  social_status?: string
  afternoon_activities?: string

  // Learning Assessment
  learning_disability: '' | 'yes' | 'no' | 'unknown'
  learning_disability_explanation?: string
  requires_remedial_teaching: '' | 'yes' | 'no' | 'unknown'
  adhd: '' | 'yes' | 'no' | 'unknown'
  adhd_treatment?: string
  assessment_done: '' | 'yes' | 'no' | 'unknown'
  assessment_file?: File | null
  assessment_needed: '' | 'yes' | 'no' | 'unknown'
  assessment_details?: string

  // Risk Assessment
  criminal_record: '' | 'yes' | 'no' | 'unknown'
  criminal_record_details?: string
  drug_use: '' | 'yes' | 'no' | 'unknown'
  smoking: '' | 'yes' | 'no' | 'unknown'
  probation_officer?: string
  youth_probation_officer?: string
  psychological_treatment: '' | 'yes' | 'no' | 'unknown'
  psychiatric_treatment: '' | 'yes' | 'no' | 'unknown'
  takes_medication: '' | 'yes' | 'no' | 'unknown'
  medication_description?: string

  // Final Assessment
  military_service_potential: '' | 'yes' | 'no' | 'unknown'
  can_handle_program: '' | 'yes' | 'no' | 'unknown'
  risk_level: number | null // 1-10
  risk_factors?: string
  personal_opinion?: string
  
  // Academic Performance
  failing_grades_count: number
  failing_subjects?: Array<{
    subject: string
    grade: string
    reason: string
  }>
  grade_sheet?: File | null
}