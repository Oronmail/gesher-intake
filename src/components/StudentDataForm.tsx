'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  School,
  GraduationCap,
  Brain,
  AlertTriangle,
  FileText,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Home,
  Heart,
  BookOpen,
  Trophy,
  Zap,
  Activity,
  Shield,
  Save,
  Check
} from 'lucide-react'
import Logo from './Logo'
import { getBrandingFromDestination } from '@/lib/branding'
import { supabase } from '@/lib/supabase'

// Add CSS for animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
  
  /* Slider styles */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }
  
  input[type="range"]::-webkit-slider-track {
    background: linear-gradient(to right, #10b981 0%, #eab308 50%, #ef4444 100%);
    height: 8px;
    border-radius: 4px;
  }
  
  input[type="range"]::-moz-range-track {
    background: linear-gradient(to right, #10b981 0%, #eab308 50%, #ef4444 100%);
    height: 8px;
    border-radius: 4px;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: white;
    border: 2px solid #6b7280;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    margin-top: -6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  input[type="range"]::-moz-range-thumb {
    background: white;
    border: 2px solid #6b7280;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
  
  input[type="range"]:hover::-webkit-slider-thumb {
    border-color: #3b82f6;
  }
  
  input[type="range"]:hover::-moz-range-thumb {
    border-color: #3b82f6;
  }
`

const formSchema = z.object({
  // פרטים אישיים
  student_first_name: z.string().min(2, 'נא להזין שם פרטי'),
  student_last_name: z.string().min(2, 'נא להזין שם משפחה'),
  student_id: z.string().min(9, 'נא להזין תעודת זהות תקינה').max(9),
  date_of_birth: z.string().min(1, 'נא להזין תאריך לידה'),
  country_of_birth: z.string().min(2, 'נא להזין ארץ לידה'),
  immigration_year: z.string().optional(),
  gender: z.enum(['male', 'female'] as const),
  address: z.string().min(5, 'נא להזין כתובת'),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  phone: z.string().min(9, 'נא להזין טלפון'),
  student_mobile: z.string().min(9, 'נא להזין נייד של התלמיד/ה'),
  school_info_username: z.string().optional(),
  school_info_password: z.string().optional(),
  
  // מצב רווחה - mandatory fields
  known_to_welfare: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  social_worker_name: z.string().optional(),
  social_worker_phone: z.string().optional(),
  youth_promotion: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  youth_worker_name: z.string().optional(),
  youth_worker_phone: z.string().optional(),
  
  // מידע משפחתי
  siblings_count: z.number().min(0).nullable(),
  parent1_name: z.string().min(2, 'נא להזין שם הורה 1'),
  parent1_phone: z.string().min(9, 'נא להזין טלפון הורה 1'),
  parent1_occupation: z.string().min(2, 'נא להזין עיסוק'),
  parent1_profession: z.string().min(2, 'נא להזין מקצוע'),
  parent1_income: z.string().optional(),
  parent2_name: z.string().optional(),
  parent2_phone: z.string().optional(),
  parent2_occupation: z.string().optional(),
  parent2_profession: z.string().optional(),
  parent2_income: z.string().optional(),
  debts_loans: z.string().min(1, 'נא למלא שדה זה'),
  parent_involvement: z.string().min(1, 'נא למלא שדה זה'),

  // רקע
  economic_status: z.enum(['', 'low', 'medium', 'high'], {
    message: 'נא לבחור מצב כלכלי'
  }).refine((val) => val !== '', {
    message: 'נא לבחור מצב כלכלי'
  }),
  economic_details: z.string().min(1, 'נא למלא פירוט מצב כלכלי'),
  family_background: z.string().min(1, 'נא למלא רקע משפחתי'),
  
  // פרטי בית ספר
  school_name: z.string().min(2, 'נא להזין שם בית ספר'),
  grade: z.string().min(1, 'נא להזין כיתה'),
  homeroom_teacher: z.string().min(2, 'נא להזין שם מחנכת'),
  teacher_phone: z.string().min(9, 'נא להזין טלפון מחנכת'),
  counselor_name: z.string().min(2, 'נא להזין שם יועצת'),
  counselor_phone: z.string().min(9, 'נא להזין טלפון יועצת'),
  
  // נתוני קליטה - mandatory dropdown fields
  behavioral_issues: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  behavioral_issues_details: z.string().optional(),
  potential_explanation: z.string().min(1, 'נא למלא שדה זה'),
  motivation_level: z.string().min(1, 'נא למלא שדה זה'),
  external_motivators: z.string().optional(),
  social_status: z.string().min(1, 'נא להזין מצב חברתי'),
  afternoon_activities: z.string().optional(),

  // הערכת למידה - mandatory dropdown fields
  learning_disability: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  learning_disability_explanation: z.string().optional(),
  requires_remedial_teaching: z.enum(['', 'כן', 'לא', 'לא ידוע']),
  adhd: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  adhd_treatment: z.string().optional(),
  assessment_done: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  assessment_file: z.any().optional(),
  assessment_needed: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  assessment_details: z.string().optional(),

  // הערכת סיכון - all mandatory dropdown fields
  criminal_record: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  criminal_record_details: z.string().optional(),
  drug_use: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  smoking: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  probation_officer: z.string().optional(),
  youth_probation_officer: z.string().optional(),
  psychological_treatment: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  psychiatric_treatment: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  takes_medication: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  medication_description: z.string().optional(),

  // הערכה סופית - all mandatory
  military_service_potential: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  can_handle_program: z.enum(['', 'כן', 'לא', 'לא ידוע']).refine((val) => val !== '', {
    message: 'נא לבחור אפשרות'
  }),
  risk_level: z.number().min(1, 'נא לבחור רמת סיכון').max(10).nullable(),
  risk_factors: z.string().min(1, 'נא להזין גורמי סיכון'),
  personal_opinion: z.string().min(1, 'נא להזין חוות דעת אישית'),
  
  // ביצועים אקדמיים
  failing_grades_count: z.number().min(0),
  failing_subjects: z.array(z.object({
    subject: z.string(),
    grade: z.string(),
    reason: z.string()
  })).optional(),
  grade_sheet: z.any().optional(),
}).refine((data) => {
  // If behavioral_issues is 'yes', behavioral_issues_details must be filled
  if (data.behavioral_issues === 'כן' && (!data.behavioral_issues_details || data.behavioral_issues_details.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'נא לפרט את בעיות ההתנהגות',
  path: ['behavioral_issues_details']
}).refine((data) => {
  // If parent2_name is filled, parent2_phone, parent2_occupation, and parent2_profession must be filled
  if (data.parent2_name && data.parent2_name.trim() !== '') {
    if (!data.parent2_phone || data.parent2_phone.trim() === '') {
      return false
    }
  }
  return true
}, {
  message: 'נא להזין נייד הורה 2',
  path: ['parent2_phone']
}).refine((data) => {
  if (data.parent2_name && data.parent2_name.trim() !== '') {
    if (!data.parent2_occupation || data.parent2_occupation.trim() === '') {
      return false
    }
  }
  return true
}, {
  message: 'נא להזין עיסוק הורה 2',
  path: ['parent2_occupation']
}).refine((data) => {
  if (data.parent2_name && data.parent2_name.trim() !== '') {
    if (!data.parent2_profession || data.parent2_profession.trim() === '') {
      return false
    }
  }
  return true
}, {
  message: 'נא להזין מקצוע הורה 2',
  path: ['parent2_profession']
}).refine((data) => {
  // If ADHD is 'yes', adhd_treatment must be filled
  if (data.adhd === 'כן' && (!data.adhd_treatment || data.adhd_treatment.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'נא למלא פירוט טיפול ב-ADHD',
  path: ['adhd_treatment']
}).refine((data) => {
  // If criminal_record is 'yes', criminal_record_details must be filled
  if (data.criminal_record === 'כן' && (!data.criminal_record_details || data.criminal_record_details.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'נא למלא פרטי עבר פלילי',
  path: ['criminal_record_details']
})

type FormData = z.infer<typeof formSchema>

interface StudentDataFormProps {
  referralNumber: string
  warmHomeDestination?: string | null
}

// Completion marker component
function CompletionMarker() {
  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-lg z-10">
      <Check className="h-3 w-3" />
    </span>
  )
}

// Helper component to show completion marker on any field
interface FieldWrapperProps {
  fieldName: string
  completedFields: Set<string>
  children: React.ReactNode
}

function FieldWrapper({ fieldName, completedFields, children }: FieldWrapperProps) {
  return (
    <div className="relative">
      {children}
      {completedFields.has(fieldName) && <CompletionMarker />}
    </div>
  )
}

export default function StudentDataForm({ referralNumber, warmHomeDestination }: StudentDataFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isIntentionalSubmit, setIsIntentionalSubmit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [riskLevelTouched, setRiskLevelTouched] = useState(false)

  const totalSteps = 6
  const branding = getBrandingFromDestination(warmHomeDestination || null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
    getValues,
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      known_to_welfare: '',
      youth_promotion: '',
      behavioral_issues: '',
      learning_disability: '',
      requires_remedial_teaching: '',
      adhd: '',
      assessment_done: '',
      assessment_needed: '',
      criminal_record: '',
      drug_use: '',
      smoking: '',
      psychological_treatment: '',
      psychiatric_treatment: '',
      takes_medication: '',
      military_service_potential: '',
      can_handle_program: '',
      siblings_count: null,
      failing_grades_count: 0,
      risk_level: null,
    }
  })

  // Fetch referral data from Supabase and existing progress from Salesforce
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        // First, get basic referral info from Supabase
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referral_number', referralNumber)
          .single()

        if (data && !error) {
          // Prepopulate school and counselor info
          if (data.school_name) setValue('school_name', data.school_name)
          if (data.counselor_name) setValue('counselor_name', data.counselor_name)
          // Pre-populate counselor phone if it was provided in the initial form
          if (data.counselor_phone) setValue('counselor_phone', data.counselor_phone)

          // NOTE: Parent phone fields are populated from Salesforce only (Parent1_Phone__c, Parent2_Phone__c)
          // Do NOT pre-populate from Supabase parent_phone (which is the consent signer's phone)

          // If parent names are stored (from consent form)
          if (data.parent_names) {
            const parentNames = data.parent_names.split(', ')
            if (parentNames[0]) {
              setValue('parent1_name', parentNames[0])
            }
            if (parentNames[1]) {
              setValue('parent2_name', parentNames[1])
            }
          }
        }

        // Fetch existing progress from Salesforce (only to show completion markers)
        try {
          const progressResponse = await fetch(`/api/referrals/get-progress/${referralNumber}`)
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            if (progressData.success && progressData.data) {
              const sfData = progressData.data
              const completedSet = new Set<string>()

              // Define all dropdown fields (former boolean checkboxes) with yes/no/unknown options
              const dropdownFields = new Set([
                'behavioral_issues', 'learning_disability',
                'requires_remedial_teaching', 'adhd', 'assessment_done', 'assessment_needed',
                'criminal_record', 'drug_use', 'smoking',
                'psychological_treatment', 'psychiatric_treatment', 'takes_medication',
                'military_service_potential', 'can_handle_program',
                'known_to_welfare', 'youth_promotion'
              ])

              // Define all numeric fields where 0 is a valid completed value
              const numericFields = new Set([
                'siblings_count', 'failing_grades_count', 'risk_level'
              ])

              // Track completed fields WITHOUT populating values (for privacy)
              Object.entries(sfData).forEach(([key, value]) => {
                const isDropdownField = dropdownFields.has(key)
                const isNumericField = numericFields.has(key)

                // IMPORTANT: Only mark field as completed if it has been explicitly set in Salesforce
                // null means "never answered" - don't show green checkmark

                let isCompleted = false

                if (isDropdownField) {
                  // For dropdown: any non-empty value means completed
                  isCompleted = (value !== null && value !== '' && value !== undefined)
                } else if (isNumericField) {
                  // For numeric: any number including 0 (but not null) means completed
                  isCompleted = (typeof value === 'number')
                } else {
                  // For text fields: non-empty string means completed
                  isCompleted = (value !== null && value !== '' && value !== false)
                }

                if (isCompleted) {
                  // Only add to completed set, do NOT setValue to maintain privacy
                  completedSet.add(key)
                }
              })

              // Check file upload boolean fields from Salesforce
              if (sfData.assessmentFileUploaded === true) {
                completedSet.add('assessment_file')
                // Auto-check "נעשה אבחון" dropdown when assessment file exists
                setValue('assessment_done', 'כן')
                completedSet.add('assessment_done')
              }
              if (sfData.gradeSheetUploaded === true) {
                completedSet.add('grade_sheet')
              }

              // Override parent phone fields with SF values if they exist
              // (Supabase parent_phone was used as initial fallback, but SF values take precedence)
              if (sfData.parent1_phone && sfData.parent1_phone.trim()) {
                setValue('parent1_phone', sfData.parent1_phone)
              }
              if (sfData.parent2_phone && sfData.parent2_phone.trim()) {
                setValue('parent2_phone', sfData.parent2_phone)
              }

              setCompletedFields(completedSet)
              console.log('Loaded completion markers from Salesforce (values hidden for privacy)')
            }
          }
        } catch (progressError) {
          console.log('No existing progress found, starting fresh:', progressError)
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [referralNumber, setValue])

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)

    // Filter out fields that are already completed (have green checkmark)
    // These don't need re-validation
    const fieldsNeedingValidation = fieldsToValidate.filter(field => !completedFields.has(field))

    // If all fields are completed, allow moving to next step
    if (fieldsNeedingValidation.length === 0) {
      setCurrentStep(currentStep + 1)
      return
    }

    // Validate only incomplete fields to show error messages
    const isValid = await trigger(fieldsNeedingValidation as (keyof FormData)[])

    // For Step 4, also manually validate conditional text fields
    // (Zod .optional() fields don't trigger validation, so we check manually)
    let conditionalValid = true
    if (currentStep === 4) {
      const formValues = getValues()

      // Clear previous conditional errors
      clearErrors(['behavioral_issues_details', 'potential_explanation', 'learning_disability_explanation', 'adhd_treatment', 'assessment_file'])

      // Check behavioral_issues_details if behavioral_issues is 'yes' AND not already completed
      if (formValues.behavioral_issues === 'כן' &&
          (!formValues.behavioral_issues_details || formValues.behavioral_issues_details.trim() === '') &&
          !completedFields.has('behavioral_issues_details')) {
        setError('behavioral_issues_details', { type: 'manual', message: 'נא למלא שדה זה' })
        conditionalValid = false
      }

      // Check learning_disability_explanation if learning_disability is 'yes' AND not already completed
      if (formValues.learning_disability === 'כן' &&
          (!formValues.learning_disability_explanation || formValues.learning_disability_explanation.trim() === '') &&
          !completedFields.has('learning_disability_explanation')) {
        setError('learning_disability_explanation', { type: 'manual', message: 'נא למלא שדה זה' })
        conditionalValid = false
      }

      // Check adhd_treatment if adhd is 'yes' AND not already completed
      if (formValues.adhd === 'כן' &&
          (!formValues.adhd_treatment || formValues.adhd_treatment.trim() === '') &&
          !completedFields.has('adhd_treatment')) {
        setError('adhd_treatment', { type: 'manual', message: 'נא למלא שדה זה' })
        conditionalValid = false
      }

      // Check assessment_file if assessment_done is 'yes'
      // Skip validation if file was already uploaded previously (marked in completedFields)
      if (formValues.assessment_done === 'כן' &&
          (!formValues.assessment_file || formValues.assessment_file.length === 0) &&
          !completedFields.has('assessment_file')) {
        setError('assessment_file', { type: 'manual', message: 'נא להעלות קובץ אבחון' })
        conditionalValid = false
      }
    }

    // For Step 5, validate criminal_record_details only when criminal_record is 'כן'
    if (currentStep === 5) {
      const formValues = getValues()

      // Clear previous conditional errors
      clearErrors(['criminal_record_details'])

      // Check criminal_record_details only if criminal_record is 'כן' AND not already completed
      if (formValues.criminal_record === 'כן' &&
          (!formValues.criminal_record_details || formValues.criminal_record_details.trim() === '') &&
          !completedFields.has('criminal_record_details')) {
        setError('criminal_record_details', { type: 'manual', message: 'נא למלא פרטי עבר פלילי' })
        conditionalValid = false
      }
    }

    if (isValid && conditionalValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else if (!isValid || !conditionalValid) {
      // Scroll to the first error if validation fails
      setTimeout(() => {
        const firstError = document.querySelector('.text-red-600')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Save progress function
  const saveProgress = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // Get all current form values
      const currentValues = watch()

      console.log('Saving progress for referral:', referralNumber)
      console.log('Current form values:', currentValues)

      // Check if there are any files to upload
      // File inputs return FileList, not File directly
      const hasFiles = (currentValues.assessment_file?.length > 0) || (currentValues.grade_sheet?.length > 0)

      let response: Response

      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData()
        formData.append('referral_number', referralNumber)

        // Add all form fields
        Object.entries(currentValues).forEach(([key, value]) => {
          // Handle file inputs (FileList objects)
          if (key === 'assessment_file' || key === 'grade_sheet') {
            if (value && value.length > 0) {
              formData.append(key, value[0]) // Get first file from FileList
            }
          }
          // Handle other values
          else if (value !== null && value !== undefined) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
          }
        })

        response = await fetch('/api/referrals/save-progress', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Use JSON for text-only data
        response = await fetch('/api/referrals/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referral_number: referralNumber,
            ...currentValues
          }),
        })
      }

      const result = await response.json()
      console.log('Save progress response:', result)

      if (response.ok) {
        setSaveSuccess(true)
        // Update completed fields after successful save
        const newCompleted = new Set(completedFields)

        // Define field types for proper completion detection
        const dropdownFields = new Set([
          'behavioral_issues', 'learning_disability',
          'requires_remedial_teaching', 'adhd', 'assessment_done', 'assessment_needed',
          'criminal_record', 'drug_use', 'smoking',
          'psychological_treatment', 'psychiatric_treatment', 'takes_medication',
          'military_service_potential', 'can_handle_program',
          'known_to_welfare', 'youth_promotion'
        ])

        const numericFields = new Set(['siblings_count', 'failing_grades_count', 'risk_level'])
        const fileFields = new Set(['assessment_file', 'grade_sheet'])

        Object.entries(currentValues).forEach(([key, value]) => {
          const isDropdownField = dropdownFields.has(key)
          const isNumericField = numericFields.has(key)
          const isFileField = fileFields.has(key)

          // Dropdown fields: mark as completed if any non-empty value
          if (isDropdownField) {
            if (value !== null && value !== '' && value !== undefined) {
              newCompleted.add(key)
            }
          }
          // Numeric fields: mark as completed for any number including 0
          else if (isNumericField) {
            if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
              newCompleted.add(key)
            }
          }
          // File fields: mark as completed only if file was uploaded (check FileList length)
          else if (isFileField) {
            if (value && value.length > 0) {
              newCompleted.add(key)
            }
          }
          // Text fields: mark as completed if non-empty
          else if (value !== null && value !== '' && value !== undefined) {
            newCompleted.add(key)
          }
        })

        setCompletedFields(newCompleted)

        // Hide success message after 5 seconds
        setTimeout(() => setSaveSuccess(false), 5000)
      } else {
        console.error('Failed to save progress:', result.error)
        alert('שגיאה בשמירת התקדמות: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      alert('שגיאה בשמירת התקדמות. אנא נסה שנית.')
    } finally {
      setIsSaving(false)
    }
  }

  const getFieldsForStep = (step: number): string[] => {
    switch(step) {
      case 1: return ['student_first_name', 'student_last_name', 'student_id', 'date_of_birth', 'country_of_birth', 'gender', 'address', 'phone', 'student_mobile']
      case 2: {
        // Base fields for step 2 (Parent 1 is always required)
        const fields = ['parent1_name', 'parent1_phone', 'parent1_occupation', 'parent1_profession', 'debts_loans', 'parent_involvement', 'economic_status', 'economic_details', 'family_background']
        const formValues = getValues()
        // If parent2_name is filled, add Parent 2 required fields
        if (formValues.parent2_name && formValues.parent2_name.trim() !== '') {
          fields.push('parent2_phone', 'parent2_occupation', 'parent2_profession')
        }
        return fields
      }
      case 3: return ['school_name', 'grade', 'homeroom_teacher', 'teacher_phone', 'counselor_name', 'counselor_phone', 'known_to_welfare', 'youth_promotion']
      // Step 4: Require dropdown fields + conditional fields if answered 'yes'
      case 4: {
        // Base mandatory fields: behavioral_issues, potential_explanation, motivation_level, social_status, learning fields
        const fields: string[] = ['behavioral_issues', 'potential_explanation', 'motivation_level', 'social_status', 'learning_disability', 'adhd', 'assessment_done', 'assessment_needed']
        const formValues = getValues()
        // Add conditional required fields if answered 'yes'
        if (formValues.behavioral_issues === 'כן') {
          fields.push('behavioral_issues_details')
        }
        if (formValues.learning_disability === 'כן') {
          fields.push('learning_disability_explanation')
        }
        if (formValues.adhd === 'כן') {
          fields.push('adhd_treatment')
        }
        if (formValues.assessment_done === 'כן') {
          fields.push('assessment_file')
        }
        return fields
      }
      // Step 5: All dropdown fields are mandatory
      case 5: {
        const fields: string[] = ['criminal_record', 'drug_use', 'smoking', 'psychological_treatment', 'psychiatric_treatment', 'takes_medication']
        const formValues = getValues()
        if (formValues.criminal_record === 'כן') {
          fields.push('criminal_record_details')
        }
        return fields
      }
      // Step 6: Include all mandatory fields (failing_subjects added dynamically in submit handler)
      case 6: return ['risk_level', 'risk_factors', 'personal_opinion']
      default: return []
    }
  }

  const onSubmit = async (data: FormData) => {
    console.log('🔥 [1/10] onSubmit function called with data:', Object.keys(data))

    // Prevent accidental double submission
    if (isSubmitting) {
      console.log('⚠️ [STOP] Already submitting, returning early')
      return
    }

    console.log('🔥 [2/10] Starting submission process')
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      console.log('🔥 [3/10] Inside try block')

      // Check if we have files to upload
      const hasFiles = data.assessment_file?.length > 0 || data.grade_sheet?.length > 0
      console.log('🔥 [4/10] Has files:', hasFiles)

      // Validate file sizes (10MB limit)
      const maxFileSize = 10 * 1024 * 1024 // 10MB in bytes

      if (hasFiles) {
        console.log('🔥 [5a/10] Validating files...')
        if (data.assessment_file?.length > 0) {
          const file = data.assessment_file[0]
          console.log('📎 Assessment file:', file.name, file.size, file.type)
          if (file.size > maxFileSize) {
            console.log('❌ Assessment file too large')
            setSubmitResult({
              success: false,
              message: `קובץ האבחון גדול מדי (${Math.round(file.size / 1024 / 1024)}MB). הגודל המקסימלי הוא 10MB`
            })
            setIsSubmitting(false)
            return
          }
          // Validate file type
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
          if (!allowedTypes.includes(file.type)) {
            console.log('❌ Assessment file wrong type')
            setSubmitResult({
              success: false,
              message: 'קובץ האבחון חייב להיות PDF, JPG או PNG'
            })
            setIsSubmitting(false)
            return
          }
        }

        if (data.grade_sheet?.length > 0) {
          const file = data.grade_sheet[0]
          console.log('📎 Grade sheet:', file.name, file.size, file.type)
          if (file.size > maxFileSize) {
            console.log('❌ Grade sheet too large')
            setSubmitResult({
              success: false,
              message: `גליון הציונים גדול מדי (${Math.round(file.size / 1024 / 1024)}MB). הגודל המקסימלי הוא 10MB`
            })
            setIsSubmitting(false)
            return
          }
          // Validate file type
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
          if (!allowedTypes.includes(file.type)) {
            console.log('❌ Grade sheet wrong type')
            setSubmitResult({
              success: false,
              message: 'גליון הציונים חייב להיות PDF, JPG או PNG'
            })
            setIsSubmitting(false)
            return
          }
        }
        console.log('✅ File validation passed')
      } else {
        console.log('🔥 [5b/10] No files to validate')
      }

      console.log('🔥 [6/10] Preparing request...')
      let response: Response

      if (hasFiles) {
        console.log('🔥 [7a/10] Creating FormData with files...')
        // Use FormData for file uploads
        const formData = new window.FormData()

        // Add all regular fields
        Object.keys(data).forEach(key => {
          if (key !== 'assessment_file' && key !== 'grade_sheet') {
            const value = (data as Record<string, unknown>)[key]
            if (value !== undefined && value !== null) {
              formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
            }
          }
        })

        // Add referral number
        formData.append('referral_number', referralNumber)

        // Add files if present
        if (data.assessment_file?.length > 0) {
          formData.append('assessment_file', data.assessment_file[0])
        }
        if (data.grade_sheet?.length > 0) {
          formData.append('grade_sheet', data.grade_sheet[0])
        }

        console.log('🔥 [8a/10] Sending FormData to API...')
        response = await fetch('/api/referrals/student-data', {
          method: 'POST',
          body: formData, // No Content-Type header needed, browser will set it with boundary
        })
        console.log('🔥 [9a/10] API response received:', response.status)
      } else {
        console.log('🔥 [7b/10] Creating JSON request...')
        // Use JSON for regular data without files
        console.log('🔥 [8b/10] Sending JSON to API...')
        response = await fetch('/api/referrals/student-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            referral_number: referralNumber,
          }),
        })
        console.log('🔥 [9b/10] API response received:', response.status)
      }

      console.log('🔥 [10/10] Parsing response...')
      const result = await response.json()
      console.log('📦 Response data:', result)

      if (response.ok) {
        console.log('✅ SUCCESS! Form submitted successfully')
        setSubmitResult({
          success: true,
          message: 'הטופס נשלח בהצלחה! המידע נשמר במערכת.',
        })
        // Form will be hidden after successful submission
      } else {
        console.log('❌ API returned error:', result.error)
        setSubmitResult({
          success: false,
          message: result.error || 'שגיאה בשליחת הטופס',
        })
      }
    } catch (error) {
      console.error('💥 EXCEPTION in onSubmit:', error)
      setSubmitResult({
        success: false,
        message: 'אירעה שגיאה. אנא נסה שנית.',
      })
    } finally {
      console.log('🏁 Finally block - setting isSubmitting to false')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2"></div>
            <div className="p-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="animate-spin h-12 w-12 text-blue-600 relative z-10" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent mb-2">
                    טוען נתונים
                  </h2>
                  <p className="text-gray-600">מכין את הטופס...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show success screen after successful submission
  if (submitResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2"></div>
            <div className="p-12">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full blur-xl animate-pulse"></div>
                  <CheckCircle className="h-24 w-24 text-green-500 relative z-10" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  הטופס נשלח בהצלחה!
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  המידע נשמר במערכת ויועבר לבדיקה
                </p>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 w-full shadow-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 p-2 rounded-lg ml-3">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">מערכת {branding.organizationName}</h3>
                  </div>
                  <p className="text-green-800 text-lg">
                    פרטי התלמיד/ה נקלטו במערכת ויועברו לצוות המקצועי לבחינה ואישור
                  </p>
                </div>
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl w-full border border-blue-200">
                  <div className="flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600 ml-2" />
                    <p className="text-blue-800 font-medium">
                      המידע נשמר באופן מאובטח ומוגן
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStepIcon = (stepNumber: number) => {
    const icons = [
      User,          // Step 1: Personal Information
      Users,         // Step 2: Family Information
      School,        // Step 3: School Information
      Brain,         // Step 4: Intake & Learning Assessment (merged)
      AlertTriangle, // Step 5: Risk Assessment
      FileText       // Step 6: Final Opinion
    ]
    return icons[stepNumber - 1]
  }

  const getStepTitle = (stepNumber: number) => {
    const titles = [
      'פרטים אישיים',
      'מידע משפחתי',
      'פרטי בית ספר',
      'נתוני קליטה',      // Merged stages 4 & 5
      'הערכת סיכון',
      'חוות דעת אישית'
    ]
    return titles[stepNumber - 1]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="max-w-5xl mx-auto">
        {/* Logo above the form */}
        <div className="flex justify-center mb-6">
          <Logo className="h-20 w-20" warmHomeDestination={warmHomeDestination} />
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                טופס רישום מועמד/ת
              </h1>
            </div>
          </div>

          {/* Enhanced Progress indicator - Responsive */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 border-b border-gray-200">
            {/* Mobile Progress Bar */}
            <div className="sm:hidden">
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-4 py-2 font-bold">
                    {currentStep} / {totalSteps}
                  </div>
                  <div className="text-gray-700 font-medium text-lg">
                    {getStepTitle(currentStep)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Circular Navigation */}
            <div className="hidden sm:flex justify-between items-center relative max-w-4xl mx-auto">
              {[...Array(totalSteps)].map((_, index) => {
                const StepIcon = getStepIcon(index + 1)
                const isCompleted = index < currentStep - 1
                const isCurrent = index === currentStep - 1
                const isUpcoming = index > currentStep - 1
                
                return (
                  <div key={index} className="flex flex-col items-center relative">
                    <div className={`
                      w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-all duration-300
                      ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg scale-105' : 
                        isCurrent ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg scale-110 animate-pulse' : 
                        'bg-gray-300'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 md:w-6 h-5 md:h-6" />
                      ) : (
                        <StepIcon className="w-4 md:w-5 h-4 md:h-5" />
                      )}
                    </div>
                    <div className="text-center hidden md:block">
                      <div className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        שלב {index + 1}
                      </div>
                      <div className={`text-xs mt-1 max-w-20 ${isCurrent ? 'text-blue-600 font-medium' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {getStepTitle(index + 1)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-8">
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                console.log('🚀 SUBMIT CLICKED - Validating Step 6 fields')
                if (isIntentionalSubmit) {
                  // Validate Step 6 fields before submitting
                  const step6Fields = getFieldsForStep(6)
                  console.log('📋 Step 6 fields to validate:', step6Fields)

                  // Add dynamic failing_subjects validation if count > 0
                  const formValues = getValues()
                  const failingCount = formValues.failing_grades_count || 0
                  if (failingCount > 0) {
                    for (let i = 0; i < failingCount; i++) {
                      step6Fields.push(`failing_subjects.${i}.subject`)
                      step6Fields.push(`failing_subjects.${i}.grade`)
                      step6Fields.push(`failing_subjects.${i}.reason`)
                    }
                  }

                  const isValid = await trigger(step6Fields as (keyof FormData)[])
                  console.log('✅ Step 6 validation result:', isValid)

                  if (!isValid) {
                    console.log('❌ Step 6 validation failed, not submitting')
                    setIsIntentionalSubmit(false)
                    return
                  }

                  console.log('✅ Submitting form after Step 6 validation passed')
                  await onSubmit(formValues as FormData)
                  setIsIntentionalSubmit(false)
                }
              }}
              onKeyDown={(e) => {
                // Prevent Enter key from submitting form except in textarea
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                  e.preventDefault()
                }
              }}
              className="space-y-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם פרטי
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="student_first_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('student_first_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם פרטי"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.student_first_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.student_first_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם משפחה
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="student_last_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('student_last_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם משפחה"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.student_last_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.student_last_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מספר תעודת זהות
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="student_id" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('student_id')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="000000000"
                              dir="ltr"
                            />
                            <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.student_id && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.student_id.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          תאריך לידה
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="date_of_birth" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('date_of_birth')}
                              type="date"
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            />
                            <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.date_of_birth && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.date_of_birth.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ארץ לידה
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="country_of_birth" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('country_of_birth')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="ישראל"
                            />
                            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.country_of_birth && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.country_of_birth.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שנת עלייה
                        </label>
                        <FieldWrapper fieldName="immigration_year" completedFields={completedFields}>
                          <div className="relative">
                            <select
                              {...register('immigration_year')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm appearance-none"
                            >
                              <option value="">בחר שנה</option>
                              {Array.from({ length: new Date().getFullYear() - 2004 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                            <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מגדר
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="gender" completedFields={completedFields}>
                          <div className="relative">
                            <select
                              {...register('gender')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm appearance-none"
                            >
                              <option value="">בחר מגדר</option>
                              <option value="male">זכר</option>
                              <option value="female">נקבה</option>
                            </select>
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.gender && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            נא לבחור מגדר
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          כתובת
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="address" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('address')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="רחוב, מספר בית, עיר"
                            />
                            <Home className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.address && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.address.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          קומה
                        </label>
                        <FieldWrapper fieldName="floor" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('floor')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="5"
                            />
                            <Home className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          דירה
                        </label>
                        <FieldWrapper fieldName="apartment" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('apartment')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="12"
                            />
                            <Home className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          טלפון
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="phone" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('phone')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="050-1234567"
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.phone && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          נייד של התלמיד/ה
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="student_mobile" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('student_mobile')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="050-1234567"
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.student_mobile && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.student_mobile.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Family Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Basic Family Info */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מספר אחים
                        </label>
                        <FieldWrapper fieldName="siblings_count" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('siblings_count', { valueAsNumber: true })}
                              type="number"
                              min="0"
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="0"
                            />
                            <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>

                    </div>
                  </div>

                  {/* Parent 1 Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 p-3 rounded-xl ml-3">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">פרטי הורה 1</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="parent1_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent1_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם מלא"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent1_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent1_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          נייד
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="parent1_phone" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent1_phone')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="050-1234567"
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent1_phone && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent1_phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          עיסוק
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="parent1_occupation" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent1_occupation')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="עבודה, לא עובד, גמלאי"
                            />
                            <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent1_occupation && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent1_occupation.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מקצוע
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="parent1_profession" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent1_profession')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="מה המקצוע הספציפי"
                            />
                            <Trophy className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent1_profession && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent1_profession.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          הכנסה חודשית
                        </label>
                        <FieldWrapper fieldName="parent1_income" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent1_income')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="10,000 ₪"
                            />
                            <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>
                    </div>
                  </div>

                  {/* Parent 2 Information */}
                  {(() => {
                    const parent2NameValue = watch('parent2_name')
                    const isParent2Required = parent2NameValue && parent2NameValue.trim() !== ''
                    return (
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-pink-100 p-3 rounded-xl ml-3">
                        <Heart className="w-6 h-6 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">פרטי הורה 2</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם
                        </label>
                        <FieldWrapper fieldName="parent2_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent2_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם מלא (אופציונלי)"
                            />
                            <Heart className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent2_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent2_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          נייד
                          {isParent2Required && <span className="text-red-500 mr-1">*</span>}
                        </label>
                        <FieldWrapper fieldName="parent2_phone" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent2_phone')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder={isParent2Required ? "050-1234567" : "050-1234567 (אופציונלי)"}
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent2_phone && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent2_phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          עיסוק
                          {isParent2Required && <span className="text-red-500 mr-1">*</span>}
                        </label>
                        <FieldWrapper fieldName="parent2_occupation" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent2_occupation')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder={isParent2Required ? "עבודה, לא עובדת, גמלאית" : "עבודה, לא עובדת, גמלאית (אופציונלי)"}
                            />
                            <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent2_occupation && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent2_occupation.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מקצוע
                          {isParent2Required && <span className="text-red-500 mr-1">*</span>}
                        </label>
                        <FieldWrapper fieldName="parent2_profession" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent2_profession')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder={isParent2Required ? "מה המקצוע הספציפי" : "מה המקצוע הספציפי (אופציונלי)"}
                            />
                            <Trophy className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent2_profession && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent2_profession.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          הכנסה חודשית
                        </label>
                        <FieldWrapper fieldName="parent2_income" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('parent2_income')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="8,000 ₪"
                            />
                            <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>
                    </div>
                  </div>
                    )
                  })()}

                  {/* Family Additional Information */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-green-100 p-3 rounded-xl ml-3">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">מידע כללי על המשפחה</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מהי רמת המעורבות של ההורים
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="parent_involvement" completedFields={completedFields}>
                          <div className="relative">
                            <textarea
                              {...register('parent_involvement')}
                              rows={3}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-y"
                              placeholder="תאר את רמת מעורבות ההורים (מעכבת, מקדמת, ללא מעורבות וכדומה)"
                            />
                            <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.parent_involvement && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.parent_involvement.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מצב כלכלי
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="economic_status" completedFields={completedFields}>
                          <div className="relative">
                            <select
                              {...register('economic_status')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm appearance-none"
                            >
                              <option value="">בחר מצב כלכלי</option>
                              <option value="low">נמוך</option>
                              <option value="medium">בינוני</option>
                              <option value="high">גבוה</option>
                            </select>
                            <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.economic_status && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.economic_status.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          פירוט מצב כלכלי
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="economic_details" completedFields={completedFields}>
                          <div className="relative">
                            <textarea
                              {...register('economic_details')}
                              rows={2}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                              placeholder="פרט את המצב הכלכלי של המשפחה..."
                            />
                            <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.economic_details && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.economic_details.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          חובות/הלוואות/משכנתא
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="debts_loans" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('debts_loans')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="פרטי חובות והלוואות"
                            />
                            <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.debts_loans && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.debts_loans.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          רקע משפחתי
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="family_background" completedFields={completedFields}>
                          <div className="relative">
                            <textarea
                              {...register('family_background')}
                              rows={3}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                              placeholder="רקע כללי על המשפחה והמצב..."
                            />
                            <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.family_background && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.family_background.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: School Information */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Basic School Info */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-indigo-100 p-3 rounded-xl ml-3">
                        <School className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">פרטי בית הספר</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם בית הספר
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="school_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('school_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם בית הספר המלא"
                            />
                            <School className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.school_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.school_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          כיתה
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="grade" completedFields={completedFields}>
                          <div className="relative">
                            <select
                              {...register('grade')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm appearance-none"
                            >
                              <option value="">בחר כיתה</option>
                              <option value="ח">ח</option>
                              <option value="ט">ט</option>
                              <option value="י">י</option>
                              <option value="יא">יא</option>
                              <option value="יב">יב</option>
                            </select>
                            <GraduationCap className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.grade && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.grade.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מחנכ/ת
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="homeroom_teacher" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('homeroom_teacher')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם מלא של המחנכ/ת"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.homeroom_teacher && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.homeroom_teacher.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          טלפון מחנכ/ת
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="teacher_phone" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('teacher_phone')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="050-1234567"
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.teacher_phone && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.teacher_phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          יועץ/ת
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="counselor_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('counselor_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם מלא של היועץ/ת"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.counselor_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.counselor_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          טלפון יועץ/ת
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="counselor_phone" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('counselor_phone')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="050-1234567"
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.counselor_phone && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.counselor_phone.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                          גישה למערכת מידע בית ספרית
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              שם משתמש
                            </label>
                        <FieldWrapper fieldName="school_info_username" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('school_info_username')}
                              type="text"
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="הזן שם משתמש"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              סיסמה
                            </label>
                        <FieldWrapper fieldName="school_info_password" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('school_info_password')}
                              type="text"
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="הזן סיסמה"
                            />
                            <Shield className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Welfare Services Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 shadow-sm mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg ml-3">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      מוכרות לרווחה
                    </h3>
                    
                    {/* Known to Welfare */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מוכרים ברווחה
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <FieldWrapper fieldName="known_to_welfare" completedFields={completedFields}>
                        <select
                          {...register('known_to_welfare')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="">בחר</option>
                          <option value="כן">כן</option>
                          <option value="לא">לא</option>
                          <option value="לא ידוע">לא ידוע</option>
                        </select>
                      </FieldWrapper>
                      {errors.known_to_welfare && (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          נא לבחור אפשרות
                        </p>
                      )}

                      {watch('known_to_welfare') === 'כן' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fadeIn">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              שם עו&quot;ס מטפל
                            </label>
                        <FieldWrapper fieldName="social_worker_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('social_worker_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                              placeholder="שם מלא של העו&quot;ס"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              טלפון עו&quot;ס
                            </label>
                        <FieldWrapper fieldName="social_worker_phone" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('social_worker_phone')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                              placeholder="050-1234567"
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Youth Promotion */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מטופל בקידום נוער
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <FieldWrapper fieldName="youth_promotion" completedFields={completedFields}>
                        <select
                          {...register('youth_promotion')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="">בחר</option>
                          <option value="כן">כן</option>
                          <option value="לא">לא</option>
                          <option value="לא ידוע">לא ידוע</option>
                        </select>
                      </FieldWrapper>
                      {errors.youth_promotion && (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          נא לבחור אפשרות
                        </p>
                      )}
                      
                      {watch('youth_promotion') === 'כן' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fadeIn">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              שם עובד קידום נוער
                            </label>
                        <FieldWrapper fieldName="youth_worker_name" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('youth_worker_name')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                              placeholder="שם מלא של העובד"
                            />
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              טלפון עובד קידום נוער
                            </label>
                        <FieldWrapper fieldName="youth_worker_phone" completedFields={completedFields}>
                          <div className="relative">
                            <input
                              {...register('youth_worker_phone')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                              placeholder="050-1234567"
                              dir="ltr"
                            />
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

          {/* Step 4: Intake Assessment */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                <div className="space-y-6">
                  {/* Behavioral Issues Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      בעיות התנהגות
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="behavioral_issues" completedFields={completedFields}>
                      <select
                        {...register('behavioral_issues')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.behavioral_issues && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        נא לבחור אפשרות
                      </p>
                    )}
                  </div>

                  {/* Conditional Detail Fields */}
                  {watch('behavioral_issues') === 'כן' && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        פרט בעיות התנהגות
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <FieldWrapper fieldName="behavioral_issues_details" completedFields={completedFields}>
                        <textarea
                          {...register('behavioral_issues_details')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                          rows={3}
                          placeholder="תאר את בעיות ההתנהגות..."
                        />
                      </FieldWrapper>
                      {errors.behavioral_issues_details && (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          {errors.behavioral_issues_details.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Student Potential */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      פוטנציאל התלמיד
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="potential_explanation" completedFields={completedFields}>
                      <textarea
                        {...register('potential_explanation')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        rows={3}
                        placeholder="פרט על הפוטנציאל של התלמיד..."
                      />
                    </FieldWrapper>
                    {errors.potential_explanation && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.potential_explanation.message}
                      </p>
                    )}
                  </div>

                  {/* Motivation Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      רמת מוטיבציה
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="motivation_level" completedFields={completedFields}>
                      <div className="relative">
                        <textarea
                          {...register('motivation_level')}
                          rows={4}
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 resize-y"
                          placeholder="ציין האם המוטיבציה פנימית או חיצונית. במידה וחיצונית פרט מי הגורם המניע"
                        />
                        <Zap className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </FieldWrapper>
                    {errors.motivation_level && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.motivation_level.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מצב חברתי
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="social_status" completedFields={completedFields}>
                      <div className="relative">
                        <textarea
                          {...register('social_status')}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                          placeholder="תאר את המצב החברתי..."
                        />
                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      </div>
                    </FieldWrapper>
                    {errors.social_status && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.social_status.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      פעילויות בשעות אחה&quot;צ
                      <span className="text-gray-500 text-xs mr-2">(חוגים, תנועות נוער, אימוני כושר, עבודה)</span>
                    </label>
                    <FieldWrapper fieldName="afternoon_activities" completedFields={completedFields}>
                      <div className="relative">
                        <textarea
                          {...register('afternoon_activities')}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                          placeholder="פרט את הפעילויות..."
                        />
                        <Activity className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      </div>
                    </FieldWrapper>
                  </div>
                </div>
              </div>

              {/* Learning Disabilities Section (merged from old Step 5) */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-3 rounded-xl ml-3">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">לקויות למידה</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      לקוי למידה
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="learning_disability" completedFields={completedFields}>
                      <select
                        {...register('learning_disability')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.learning_disability && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        נא לבחור אפשרות
                      </p>
                    )}

                    {watch('learning_disability') === 'כן' && (
                      <div className="mt-4 animate-fadeIn space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            פרט על לקות הלמידה
                            <span className="text-red-500 mr-1">*</span>
                          </label>
                          <FieldWrapper fieldName="learning_disability_explanation" completedFields={completedFields}>
                            <textarea
                              {...register('learning_disability_explanation')}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 resize-none"
                              placeholder="תאר את סוג הלקות ואופן ההתמודדות..."
                            />
                          </FieldWrapper>
                          {errors.learning_disability_explanation && (
                            <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                              <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                              {errors.learning_disability_explanation.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            מחייב הוראה מתקנת
                          </label>
                          <FieldWrapper fieldName="requires_remedial_teaching" completedFields={completedFields}>
                            <select
                              {...register('requires_remedial_teaching')}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                            >
                              <option value="">בחר</option>
                              <option value="כן">כן</option>
                              <option value="לא">לא</option>
                              <option value="לא ידוע">לא ידוע</option>
                            </select>
                          </FieldWrapper>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      הפרעת קשב וריכוז (ADHD)
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="adhd" completedFields={completedFields}>
                      <select
                        {...register('adhd')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.adhd && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        נא לבחור אפשרות
                      </p>
                    )}

                    {watch('adhd') === 'כן' && (
                      <div className="mt-4 animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          האם הפרעת הקשב מטופלת? כיצד?
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="adhd_treatment" completedFields={completedFields}>
                          <div className="relative">
                            <textarea
                              {...register('adhd_treatment')}
                              rows={3}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                              placeholder="תאר את הטיפול הנוכחי..."
                            />
                            <Brain className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                        {errors.adhd_treatment && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.adhd_treatment.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assessment Section (merged from old Step 5) */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-teal-100 p-3 rounded-xl ml-3">
                    <FileText className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">אבחונים</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        נעשה אבחון
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <FieldWrapper fieldName="assessment_done" completedFields={completedFields}>
                        <select
                          {...register('assessment_done')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="">בחר</option>
                          <option value="כן">כן</option>
                          <option value="לא">לא</option>
                          <option value="לא ידוע">לא ידוע</option>
                        </select>
                      </FieldWrapper>
                      {errors.assessment_done && (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          נא לבחור אפשרות
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        יש צורך באבחון
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <FieldWrapper fieldName="assessment_needed" completedFields={completedFields}>
                        <select
                          {...register('assessment_needed')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="">בחר</option>
                          <option value="כן">כן</option>
                          <option value="לא">לא</option>
                          <option value="לא ידוע">לא ידוע</option>
                        </select>
                      </FieldWrapper>
                      {errors.assessment_needed && (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          נא לבחור אפשרות
                        </p>
                      )}
                    </div>
                  </div>

                  {watch('assessment_done') === 'כן' && (
                    <div className="animate-fadeIn space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          העלאת קובץ אבחון
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="assessment_file" completedFields={completedFields}>
                          <input
                            {...register('assessment_file')}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          />
                        </FieldWrapper>
                        {errors.assessment_file && !completedFields.has('assessment_file') && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {typeof errors.assessment_file.message === 'string' ? errors.assessment_file.message : 'נא להעלות קובץ אבחון'}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                          קבצים מותרים: PDF, JPG, PNG (עד 10MB)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          פרטים נוספים על האבחון
                        </label>
                        <FieldWrapper fieldName="assessment_details" completedFields={completedFields}>
                          <div className="relative">
                            <textarea
                              {...register('assessment_details')}
                              rows={4}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                              placeholder="פרט על האבחון שנעשה..."
                            />
                            <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>
                    </div>
                    )}

                  {watch('assessment_needed') === 'כן' && watch('assessment_done') !== 'כן' && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        פרטים על האבחון הנדרש
                      </label>
                      <FieldWrapper fieldName="assessment_details" completedFields={completedFields}>
                        <div className="relative">
                          <textarea
                            {...register('assessment_details')}
                            rows={4}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                            placeholder="פרט על האבחון הנדרש..."
                          />
                          <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </FieldWrapper>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Risk Assessment (was Step 6) */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Risk Factors Section */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-red-100 p-3 rounded-xl ml-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">גורמי סיכון</h3>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    <strong>שים לב:</strong> אנא המנע/י מלענות על השאלות הבאות במידה ואינך יודע/ת את המצב הנוכחי
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      בעל/ת עבר פלילי
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="criminal_record" completedFields={completedFields}>
                      <select
                        {...register('criminal_record')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.criminal_record && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        נא לבחור אפשרות
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שימוש בסמים
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="drug_use" completedFields={completedFields}>
                      <select
                        {...register('drug_use')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.drug_use && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        נא לבחור אפשרות
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מעשן/ת
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="smoking" completedFields={completedFields}>
                      <select
                        {...register('smoking')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.smoking && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        נא לבחור אפשרות
                      </p>
                    )}
                  </div>
                </div>

                {watch('criminal_record') === 'כן' && (
                  <div className="mt-6 animate-fadeIn">
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-red-800 mb-2">
                          פרטי עבר פלילי
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <FieldWrapper fieldName="criminal_record_details" completedFields={completedFields}>
                          <textarea
                            {...register('criminal_record_details')}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-red-300 resize-y"
                            placeholder="פרט את העבר הפלילי (סוג העבירות, תאריכים, מעורבות משפטית וכדומה)..."
                          />
                        </FieldWrapper>
                        {errors.criminal_record_details && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.criminal_record_details.message}
                          </p>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-red-800 mb-4 flex items-center">
                        <Shield className="w-4 h-4 ml-2" />
                        פרטי גורמים מטפלים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            קצין ביקור סדיר
                          </label>
                          <FieldWrapper fieldName="probation_officer" completedFields={completedFields}>
                            <div className="relative">
                              <input
                                {...register('probation_officer')}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                placeholder="שם הקצין"
                              />
                              <Shield className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                          </FieldWrapper>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ק. שירות מבחן לנוער
                          </label>
                          <FieldWrapper fieldName="youth_probation_officer" completedFields={completedFields}>
                            <div className="relative">
                              <input
                                {...register('youth_probation_officer')}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                placeholder="שם הקצין"
                              />
                              <Shield className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                          </FieldWrapper>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Treatment Section */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-orange-100 p-3 rounded-xl ml-3">
                    <Heart className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">טיפולים רפואיים ונפשיים</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מקבל/ת טיפול פסיכולוגי
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <FieldWrapper fieldName="psychological_treatment" completedFields={completedFields}>
                        <select
                          {...register('psychological_treatment')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="">בחר</option>
                          <option value="כן">כן</option>
                          <option value="לא">לא</option>
                          <option value="לא ידוע">לא ידוע</option>
                        </select>
                      </FieldWrapper>
                      {errors.psychological_treatment && (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          נא לבחור אפשרות
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מקבל/ת טיפול פסיכיאטרי
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <FieldWrapper fieldName="psychiatric_treatment" completedFields={completedFields}>
                        <select
                          {...register('psychiatric_treatment')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="">בחר</option>
                          <option value="כן">כן</option>
                          <option value="לא">לא</option>
                          <option value="לא ידוע">לא ידוע</option>
                        </select>
                      </FieldWrapper>
                      {errors.psychiatric_treatment && (
                        <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                          <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          נא לבחור אפשרות
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      נוטל/ת תרופות
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="takes_medication" completedFields={completedFields}>
                      <select
                        {...register('takes_medication')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.takes_medication && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        נא לבחור אפשרות
                      </p>
                    )}

                    {watch('takes_medication') === 'כן' && (
                      <div className="mt-4 animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          תיאור התרופות והמינונים
                        </label>
                        <FieldWrapper fieldName="medication_description" completedFields={completedFields}>
                          <div className="relative">
                            <textarea
                              {...register('medication_description')}
                              rows={3}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                              placeholder="פרט את סוגי התרופות, מינונים ומטרת הטיפול..."
                            />
                            <Heart className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FieldWrapper>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Final Assessment (was Step 7) */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Assessment Results Section */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-100 p-3 rounded-xl ml-3">
                    <CheckCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">הערכה כללית</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      בעל/ת סיכויים להתגייס לצה&quot;ל
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="military_service_potential" completedFields={completedFields}>
                      <select
                        {...register('military_service_potential')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.military_service_potential && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.military_service_potential.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      יכול/ה לעמוד בעומס המסגרת המוצעת
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="can_handle_program" completedFields={completedFields}>
                      <select
                        {...register('can_handle_program')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                      >
                        <option value="">בחר</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                        <option value="לא ידוע">לא ידוע</option>
                      </select>
                    </FieldWrapper>
                    {errors.can_handle_program && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.can_handle_program.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Level Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-yellow-100 p-3 rounded-xl ml-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">הערכת סיכון</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      רמת הסיכון של הנער/ה
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="risk_level" completedFields={completedFields}>
                      <div className="relative">
                        <input
                          type="range"
                          min={1}
                          max={10}
                          step={1}
                          {...register('risk_level', { valueAsNumber: true })}
                          onMouseDown={() => {
                            if (!riskLevelTouched) {
                              setRiskLevelTouched(true)
                              setValue('risk_level', 5)
                            }
                          }}
                          onTouchStart={() => {
                            if (!riskLevelTouched) {
                              setRiskLevelTouched(true)
                              setValue('risk_level', 5)
                            }
                          }}
                          className={`w-full h-3 rounded-lg appearance-none cursor-pointer transition-all duration-200 ${
                            riskLevelTouched ? '' : 'opacity-40 grayscale'
                          }`}
                          style={{
                            background: riskLevelTouched
                              ? 'linear-gradient(to right, #10b981 0%, #eab308 50%, #ef4444 100%)'
                              : '#d1d5db'
                          }}
                        />
                        {riskLevelTouched && watch('risk_level') !== null && (
                          <div className="text-center text-3xl font-bold mt-3 text-gray-800">
                            {watch('risk_level')}
                          </div>
                        )}
                        {!riskLevelTouched && (
                          <div className="text-center text-sm text-gray-500 mt-3">
                            לחץ על הסרגל לבחירת רמת סיכון
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                        <span className="text-green-600 font-medium">סיכון נמוך (1)</span>
                        <span className="text-red-600 font-medium">סיכון גבוה (10)</span>
                      </div>
                    </FieldWrapper>
                    {errors.risk_level && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.risk_level.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מה הגורמים לסיכון?
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="risk_factors" completedFields={completedFields}>
                      <div className="relative">
                        <textarea
                          {...register('risk_factors')}
                          rows={4}
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                          placeholder="פרט את הגורמים העיקריים לסיכון..."
                        />
                        <AlertTriangle className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </FieldWrapper>
                    {errors.risk_factors && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.risk_factors.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Opinion Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-orange-100 p-3 rounded-xl ml-3">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">דעה מקצועית</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    דעה אישית והמלצות
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <FieldWrapper fieldName="personal_opinion" completedFields={completedFields}>
                    <div className="relative">
                      <textarea
                        {...register('personal_opinion')}
                        rows={5}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                        placeholder="שתף את דעתך המקצועית והמלצותיך לגבי קבלת המועמד/ת..."
                      />
                      <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </FieldWrapper>
                  {errors.personal_opinion && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                      {errors.personal_opinion.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Performance Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl ml-3">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">תפקוד בבית הספר</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      גליון ציונים
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <FieldWrapper fieldName="grade_sheet" completedFields={completedFields}>
                      <input
                        {...register('grade_sheet')}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required={!completedFields.has('grade_sheet')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </FieldWrapper>
                    <p className="mt-2 text-sm text-gray-500">
                      חובה להעלות גליון ציונים עדכני (PDF, JPG, PNG - עד 10MB)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר ציונים שליליים
                    </label>
                    <FieldWrapper fieldName="failing_grades_count" completedFields={completedFields}>
                      <div className="relative">
                        <input
                          {...register('failing_grades_count', { valueAsNumber: true })}
                          type="number"
                          min="0"
                          max="10"
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          placeholder="0"
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            setValue('failing_grades_count', count);
                            // Initialize failing_subjects array based on count
                            if (count > 0) {
                              const subjects = Array(count).fill(null).map(() => ({
                                subject: '',
                                grade: '',
                                reason: ''
                              }));
                              setValue('failing_subjects', subjects);
                            } else {
                              setValue('failing_subjects', []);
                            }
                          }}
                        />
                        <BookOpen className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </FieldWrapper>
                  </div>

                  {watch('failing_grades_count') > 0 && (
                    <div className="animate-fadeIn space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        פרט על הציונים השליליים:
                        <span className="text-red-500 mr-1">*</span>
                      </h4>
                      {Array.from({ length: watch('failing_grades_count') || 0 }).map((_, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                מקצוע {index + 1}
                                <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                {...register(`failing_subjects.${index}.subject`, { required: true })}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="שם המקצוע"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                ציון
                                <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                {...register(`failing_subjects.${index}.grade`, { required: true })}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="הציון"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                סיבה לציון השלילי
                                <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                {...register(`failing_subjects.${index}.reason`, { required: true })}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="הסיבה לכישלון"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

              {/* Error Display */}
              {submitResult && !submitResult.success && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg ml-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-red-800 font-medium">
                      {submitResult.message}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="group px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 flex items-center transition-all duration-200 hover:shadow-sm font-medium"
                    >
                      <ChevronRight className="ml-3 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                      הקודם
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <div className="flex items-center gap-3">
                    {/* Save Progress Button */}
                    <button
                      type="button"
                      onClick={saveProgress}
                      disabled={isSaving}
                      className="group px-6 py-3 bg-white border-2 border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin ml-2 h-4 w-4" />
                          שומר...
                        </>
                      ) : (
                        <>
                          <Save className="ml-2 h-4 w-4" />
                          שמור התקדמות
                        </>
                      )}
                    </button>

                    {/* Next/Submit Button */}
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 flex items-center transition-all duration-200 hover:shadow-lg hover:scale-105 transform font-medium"
                      >
                        הבא
                        <ChevronLeft className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={() => setIsIntentionalSubmit(true)}
                        className="group px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center transition-all duration-200 hover:shadow-lg hover:scale-105 transform font-medium text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin ml-3 h-6 w-6" />
                            שולח טופס...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
                            שליחת טופס
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Success Toast Notification */}
                {saveSuccess && (
                  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">הטופס נשמר בהצלחה!</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}