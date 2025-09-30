export interface InitialReferralForm {
  counselor_name: string
  counselor_email: string
  school_name: string
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
  known_to_welfare: boolean
  social_worker_name?: string
  social_worker_phone?: string
  youth_promotion: boolean
  youth_worker_name?: string
  youth_worker_phone?: string
  
  // Family Information
  siblings_count: number
  father_name: string
  father_mobile: string
  father_occupation: string
  father_profession: string
  father_income?: string
  mother_name: string
  mother_mobile: string
  mother_occupation: string
  mother_profession: string
  mother_income?: string
  debts_loans?: string
  parent_involvement: 'inhibiting' | 'promoting' | 'no_involvement'
  
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
  behavioral_issues: boolean
  behavioral_issues_details?: string
  has_potential: boolean
  potential_explanation?: string
  motivation_level: 'low' | 'medium' | 'high'
  motivation_type: 'internal' | 'external'
  external_motivators?: string
  social_status?: string
  afternoon_activities?: string
  
  // Learning Assessment
  learning_disability: boolean
  requires_remedial_teaching?: boolean
  adhd: boolean
  adhd_treatment?: string
  assessment_done: boolean
  assessment_needed: boolean
  assessment_details?: string
  
  // Risk Assessment
  criminal_record: boolean
  drug_use: boolean
  smoking: boolean
  probation_officer?: string
  youth_probation_officer?: string
  psychological_treatment: boolean
  psychiatric_treatment: boolean
  takes_medication: boolean
  medication_description?: string
  
  // Final Assessment
  military_service_potential: boolean
  can_handle_program: boolean
  risk_level: number // 1-10
  risk_factors?: string
  personal_opinion?: string
  
  // Academic Performance
  failing_grades_count: number
  failing_subjects?: string
}