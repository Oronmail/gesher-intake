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
  Shield
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
  student_mobile: z.string().optional(),
  school_info_username: z.string().optional(),
  school_info_password: z.string().optional(),
  
  // מצב רווחה
  known_to_welfare: z.boolean(),
  social_worker_name: z.string().optional(),
  social_worker_phone: z.string().optional(),
  youth_promotion: z.boolean(),
  youth_worker_name: z.string().optional(),
  youth_worker_phone: z.string().optional(),
  
  // מידע משפחתי
  siblings_count: z.number().min(0),
  father_name: z.string().min(2, 'נא להזין שם אב'),
  father_mobile: z.string().min(9, 'נא להזין טלפון אב'),
  father_occupation: z.string().min(2, 'נא להזין עיסוק'),
  father_profession: z.string().min(2, 'נא להזין מקצוע'),
  father_income: z.string().optional(),
  mother_name: z.string().min(2, 'נא להזין שם אם'),
  mother_mobile: z.string().min(9, 'נא להזין טלפון אם'),
  mother_occupation: z.string().min(2, 'נא להזין עיסוק'),
  mother_profession: z.string().min(2, 'נא להזין מקצוע'),
  mother_income: z.string().optional(),
  debts_loans: z.string().optional(),
  parent_involvement: z.enum(['inhibiting', 'promoting', 'no_involvement']),
  
  // רקע
  economic_status: z.enum(['low', 'medium', 'high']),
  economic_details: z.string().optional(),
  family_background: z.string().optional(),
  
  // פרטי בית ספר
  school_name: z.string().min(2, 'נא להזין שם בית ספר'),
  grade: z.string().min(1, 'נא להזין כיתה'),
  homeroom_teacher: z.string().min(2, 'נא להזין שם מחנכת'),
  teacher_phone: z.string().min(9, 'נא להזין טלפון מחנכת'),
  counselor_name: z.string().min(2, 'נא להזין שם יועצת'),
  counselor_phone: z.string().min(9, 'נא להזין טלפון יועצת'),
  
  // נתוני קליטה
  behavioral_issues: z.boolean(),
  behavioral_issues_details: z.string().optional(),
  has_potential: z.boolean(),
  potential_explanation: z.string().optional(),
  motivation_level: z.enum(['low', 'medium', 'high']),
  motivation_type: z.enum(['internal', 'external']),
  external_motivators: z.string().optional(),
  social_status: z.string().optional(),
  afternoon_activities: z.string().optional(),
  
  // הערכת למידה
  learning_disability: z.boolean(),
  learning_disability_explanation: z.string().optional(),
  requires_remedial_teaching: z.boolean().optional(),
  adhd: z.boolean(),
  adhd_treatment: z.string().optional(),
  assessment_done: z.boolean(),
  assessment_file: z.any().optional(),
  assessment_needed: z.boolean(),
  assessment_details: z.string().optional(),
  
  // הערכת סיכון
  criminal_record: z.boolean(),
  drug_use: z.boolean(),
  smoking: z.boolean(),
  probation_officer: z.string().optional(),
  youth_probation_officer: z.string().optional(),
  psychological_treatment: z.boolean(),
  psychiatric_treatment: z.boolean(),
  takes_medication: z.boolean(),
  medication_description: z.string().optional(),
  
  // הערכה סופית
  military_service_potential: z.boolean(),
  can_handle_program: z.boolean(),
  risk_level: z.number().min(1).max(10),
  risk_factors: z.string().optional(),
  personal_opinion: z.string().optional(),
  
  // ביצועים אקדמיים
  failing_grades_count: z.number().min(0),
  failing_subjects: z.array(z.object({
    subject: z.string(),
    grade: z.string(),
    reason: z.string()
  })).optional(),
  grade_sheet: z.any().optional(),
})

type FormData = z.infer<typeof formSchema>

interface StudentDataFormProps {
  referralNumber: string
  warmHomeDestination?: string | null
}

export default function StudentDataForm({ referralNumber, warmHomeDestination }: StudentDataFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isIntentionalSubmit, setIsIntentionalSubmit] = useState(false)

  const totalSteps = 6
  const branding = getBrandingFromDestination(warmHomeDestination || null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      known_to_welfare: false,
      youth_promotion: false,
      behavioral_issues: false,
      has_potential: true,
      learning_disability: false,
      adhd: false,
      assessment_done: false,
      assessment_needed: false,
      criminal_record: false,
      drug_use: false,
      smoking: false,
      psychological_treatment: false,
      psychiatric_treatment: false,
      takes_medication: false,
      military_service_potential: true,
      can_handle_program: true,
      siblings_count: 0,
      failing_grades_count: 0,
      risk_level: 1,
    }
  })

  // Fetch referral data from Supabase and prepopulate fields
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
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
          
          // Prepopulate parent contact info if available
          if (data.parent_phone) {
            setValue('father_mobile', data.parent_phone)
            setValue('mother_mobile', data.parent_phone)
          }
          
          // If parent names are stored (from consent form)
          if (data.parent_names) {
            const parentNames = data.parent_names.split(', ')
            if (parentNames[0]) {
              const firstName = parentNames[0].split(' ')[0] || ''
              setValue('father_name', firstName)
            }
            if (parentNames[1]) {
              const secondName = parentNames[1].split(' ')[0] || ''
              setValue('mother_name', secondName)
            }
          }

          // Prepopulate student name if available from consent form
          // This would be in a separate field if stored
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
    const isValid = await trigger(fieldsToValidate as (keyof FormData)[])
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): string[] => {
    switch(step) {
      case 1: return ['student_first_name', 'student_last_name', 'student_id', 'date_of_birth', 'country_of_birth', 'gender', 'address', 'phone']
      case 2: return ['father_name', 'father_mobile', 'father_occupation', 'father_profession', 'mother_name', 'mother_mobile', 'mother_occupation', 'mother_profession']
      case 3: return ['school_name', 'grade', 'homeroom_teacher', 'teacher_phone', 'counselor_name', 'counselor_phone', 'school_info_username', 'school_info_password']
      case 4: return ['behavioral_issues', 'has_potential', 'motivation_level', 'motivation_type', 'learning_disability', 'adhd', 'assessment_done', 'assessment_needed'] // Merged stages 4 & 5
      case 5: return ['criminal_record', 'drug_use', 'smoking', 'psychological_treatment', 'psychiatric_treatment', 'takes_medication'] // Was step 6
      case 6: return ['military_service_potential', 'can_handle_program', 'risk_level', 'failing_grades_count'] // Was step 7
      default: return []
    }
  }

  const onSubmit = async (data: FormData) => {
    // Prevent accidental double submission
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      // Check if we have files to upload
      const hasFiles = data.assessment_file?.length > 0 || data.grade_sheet?.length > 0

      // Validate file sizes (10MB limit)
      const maxFileSize = 10 * 1024 * 1024 // 10MB in bytes

      if (hasFiles) {
        if (data.assessment_file?.length > 0) {
          const file = data.assessment_file[0]
          if (file.size > maxFileSize) {
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
          if (file.size > maxFileSize) {
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
            setSubmitResult({
              success: false,
              message: 'גליון הציונים חייב להיות PDF, JPG או PNG'
            })
            setIsSubmitting(false)
            return
          }
        }
      }

      let response: Response

      if (hasFiles) {
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

        response = await fetch('/api/referrals/student-data', {
          method: 'POST',
          body: formData, // No Content-Type header needed, browser will set it with boundary
        })
      } else {
        // Use JSON for regular data without files
        response = await fetch('/api/referrals/student-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            referral_number: referralNumber,
          }),
        })
      }

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: 'הטופס נשלח בהצלחה! המידע נשמר במערכת.',
        })
        // Form will be hidden after successful submission
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'שגיאה בשליחת הטופס',
        })
      }
    } catch {
      setSubmitResult({
        success: false,
        message: 'אירעה שגיאה. אנא נסה שנית.',
      })
    } finally {
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
              onSubmit={(e) => {
                e.preventDefault()
                if (isIntentionalSubmit) {
                  handleSubmit(onSubmit)(e)
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
                        <div className="relative">
                          <input
                            {...register('student_first_name')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="שם פרטי"
                          />
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('student_last_name')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="שם משפחה"
                          />
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('student_id')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="000000000"
                            dir="ltr"
                          />
                          <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('date_of_birth')}
                            type="date"
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          />
                          <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('country_of_birth')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="ישראל"
                          />
                          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מגדר
                          <span className="text-red-500 mr-1">*</span>
                        </label>
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
                        <div className="relative">
                          <input
                            {...register('address')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="רחוב, מספר בית, עיר"
                          />
                          <Home className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('floor')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="5"
                          />
                          <Home className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          דירה
                        </label>
                        <div className="relative">
                          <input
                            {...register('apartment')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="12"
                          />
                          <Home className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          טלפון
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('phone')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="050-1234567"
                            dir="ltr"
                          />
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        </label>
                        <div className="relative">
                          <input
                            {...register('student_mobile')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="050-1234567"
                            dir="ltr"
                          />
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                      </div>

                    </div>
                  </div>

                  {/* Father Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 p-3 rounded-xl ml-3">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">פרטי האב</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם האב
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('father_name')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="שם מלא של האב"
                          />
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.father_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.father_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          נייד האב
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('father_mobile')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="050-1234567"
                            dir="ltr"
                          />
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.father_mobile && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.father_mobile.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          עיסוק
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('father_occupation')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="עבודה, לא עובד, גמלאי"
                          />
                          <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.father_occupation && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.father_occupation.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מקצוע
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('father_profession')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="מה המקצוע הספציפי"
                          />
                          <Trophy className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.father_profession && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.father_profession.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          הכנסה חודשית
                        </label>
                        <div className="relative">
                          <input
                            {...register('father_income')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="10,000 ₪"
                          />
                          <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mother Information */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="bg-pink-100 p-3 rounded-xl ml-3">
                        <Heart className="w-6 h-6 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">פרטי האם</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם האם
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('mother_name')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="שם מלא של האם"
                          />
                          <Heart className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.mother_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.mother_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          נייד האם
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('mother_mobile')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="050-1234567"
                            dir="ltr"
                          />
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.mother_mobile && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.mother_mobile.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          עיסוק
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('mother_occupation')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="עבודה, לא עובדת, גמלאית"
                          />
                          <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.mother_occupation && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.mother_occupation.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מקצוע
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('mother_profession')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="מה המקצוע הספציפי"
                          />
                          <Trophy className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.mother_profession && (
                          <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                            {errors.mother_profession.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          הכנסה חודשית
                        </label>
                        <div className="relative">
                          <input
                            {...register('mother_income')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="8,000 ₪"
                          />
                          <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

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
                          חובות/הלוואות/משכנתא
                        </label>
                        <div className="relative">
                          <input
                            {...register('debts_loans')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="פרטי חובות והלוואות"
                          />
                          <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          רמת מעורבות ההורים
                        </label>
                        <div className="relative">
                          <select
                            {...register('parent_involvement')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm appearance-none"
                          >
                            <option value="promoting">מקדמת</option>
                            <option value="no_involvement">ללא מעורבות</option>
                            <option value="inhibiting">מעכבת</option>
                          </select>
                          <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מצב כלכלי
                        </label>
                        <div className="relative">
                          <select
                            {...register('economic_status')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm appearance-none"
                          >
                            <option value="low">נמוך</option>
                            <option value="medium">בינוני</option>
                            <option value="high">גבוה</option>
                          </select>
                          <Activity className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          פירוט מצב כלכלי
                        </label>
                        <div className="relative">
                          <textarea
                            {...register('economic_details')}
                            rows={2}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                            placeholder="פרט את המצב הכלכלי של המשפחה..."
                          />
                          <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          רקע משפחתי
                        </label>
                        <div className="relative">
                          <textarea
                            {...register('family_background')}
                            rows={3}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                            placeholder="רקע כללי על המשפחה והמצב..."
                          />
                          <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('school_name')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="שם בית הספר המלא"
                          />
                          <School className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('homeroom_teacher')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="שם מלא של המחנכ/ת"
                          />
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('teacher_phone')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="050-1234567"
                            dir="ltr"
                          />
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('counselor_name')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="שם מלא של היועץ/ת"
                          />
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                        <div className="relative">
                          <input
                            {...register('counselor_phone')}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            placeholder="050-1234567"
                            dir="ltr"
                          />
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                            <div className="relative">
                              <input
                                {...register('school_info_username')}
                                type="text"
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                placeholder="הזן שם משתמש"
                              />
                              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              סיסמה
                            </label>
                            <div className="relative">
                              <input
                                {...register('school_info_password')}
                                type="text"
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                placeholder="הזן סיסמה"
                              />
                              <Shield className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
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
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            {...register('known_to_welfare')}
                            type="checkbox"
                            className="ml-3 w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                          />
                          <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                            מוכרים ברווחה
                          </span>
                        </label>
                      </div>
                      
                      {watch('known_to_welfare') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fadeIn">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              שם עו&quot;ס מטפל
                            </label>
                            <div className="relative">
                              <input
                                {...register('social_worker_name')}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                                placeholder="שם מלא של העו&quot;ס"
                              />
                              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              טלפון עו&quot;ס
                            </label>
                            <div className="relative">
                              <input
                                {...register('social_worker_phone')}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                                placeholder="050-1234567"
                                dir="ltr"
                              />
                              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Youth Promotion */}
                    <div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            {...register('youth_promotion')}
                            type="checkbox"
                            className="ml-3 w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                          />
                          <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                            מטופל בקידום נוער
                          </span>
                        </label>
                      </div>
                      
                      {watch('youth_promotion') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fadeIn">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              שם עובד קידום נוער
                            </label>
                            <div className="relative">
                              <input
                                {...register('youth_worker_name')}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                                placeholder="שם מלא של העובד"
                              />
                              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              טלפון עובד קידום נוער
                            </label>
                            <div className="relative">
                              <input
                                {...register('youth_worker_phone')}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                                placeholder="050-1234567"
                                dir="ltr"
                              />
                              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
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
                  {/* Checkboxes Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          {...register('behavioral_issues')}
                          type="checkbox"
                          className="ml-3 w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors">
                          בעיות התנהגות
                        </span>
                      </label>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          {...register('has_potential')}
                          type="checkbox"
                          className="ml-3 w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors">
                          פוטנציאל
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Conditional Detail Fields */}
                  {watch('behavioral_issues') && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        פרט בעיות התנהגות
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <textarea
                        {...register('behavioral_issues_details')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        rows={3}
                        placeholder="תאר את בעיות ההתנהגות..."
                      />
                    </div>
                  )}

                  {watch('has_potential') && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        הסבר על הפוטנציאל
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <textarea
                        {...register('potential_explanation')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        rows={3}
                        placeholder="פרט על הפוטנציאל של התלמיד..."
                      />
                    </div>
                  )}

                  {/* Motivation Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        רמת מוטיבציה
                      </label>
                      <div className="relative">
                        <select
                          {...register('motivation_level')}
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="low">נמוך</option>
                          <option value="medium">בינוני</option>
                          <option value="high">גבוה</option>
                        </select>
                        <Zap className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        סוג מוטיבציה
                      </label>
                      <div className="relative">
                        <select
                          {...register('motivation_type')}
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                        >
                          <option value="internal">פנימית</option>
                          <option value="external">חיצונית</option>
                        </select>
                        <Heart className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {watch('motivation_type') === 'external' && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        גורמים חיצוניים
                      </label>
                      <textarea
                        {...register('external_motivators')}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="פרט את הגורמים החיצוניים..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מצב חברתי
                    </label>
                    <div className="relative">
                      <textarea
                        {...register('social_status')}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="תאר את המצב החברתי..."
                      />
                      <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      פעילויות בשעות אחה&quot;צ
                      <span className="text-gray-500 text-xs mr-2">(חוגים, תנועות נוער, אימוני כושר, עבודה)</span>
                    </label>
                    <div className="relative">
                      <textarea
                        {...register('afternoon_activities')}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="פרט את הפעילויות..."
                      />
                      <Activity className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
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
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('learning_disability')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-green-600 transition-colors">
                        לקוי למידה
                      </span>
                    </label>

                    {watch('learning_disability') && (
                      <div className="mt-4 animate-fadeIn space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            פרט על לקות הלמידה
                            <span className="text-red-500 mr-1">*</span>
                          </label>
                          <textarea
                            {...register('learning_disability_explanation')}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 resize-none"
                            placeholder="תאר את סוג הלקות ואופן ההתמודדות..."
                          />
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                          <label className="flex items-center cursor-pointer group">
                            <input
                              {...register('requires_remedial_teaching')}
                              type="checkbox"
                              className="ml-3 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <span className="text-gray-700 font-medium group-hover:text-green-600 transition-colors">
                              מחייב הוראה מתקנת
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('adhd')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-green-600 transition-colors">
                        הפרעת קשב וריכוז (ADHD)
                      </span>
                    </label>

                    {watch('adhd') && (
                      <div className="mt-4 animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          האם הפרעת הקשב מטופלת? כיצד?
                        </label>
                        <div className="relative">
                          <textarea
                            {...register('adhd_treatment')}
                            rows={3}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                            placeholder="תאר את הטיפול הנוכחי..."
                          />
                          <Brain className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          {...register('assessment_done')}
                          type="checkbox"
                          className="ml-3 w-5 h-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium group-hover:text-teal-600 transition-colors">
                          נעשה אבחון
                        </span>
                      </label>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          {...register('assessment_needed')}
                          type="checkbox"
                          className="ml-3 w-5 h-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium group-hover:text-teal-600 transition-colors">
                          יש צורך באבחון
                        </span>
                      </label>
                    </div>
                  </div>

                  {watch('assessment_done') && (
                    <div className="animate-fadeIn space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          העלאת קובץ אבחון
                          <span className="text-red-500 mr-1">*</span>
                        </label>
                        <input
                          {...register('assessment_file')}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          קבצים מותרים: PDF, JPG, PNG (עד 10MB)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          פרטים נוספים על האבחון
                        </label>
                        <div className="relative">
                          <textarea
                            {...register('assessment_details')}
                            rows={4}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                            placeholder="פרט על האבחון שנעשה..."
                          />
                          <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {watch('assessment_needed') && !watch('assessment_done') && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        פרטים על האבחון הנדרש
                      </label>
                      <div className="relative">
                        <textarea
                          {...register('assessment_details')}
                          rows={4}
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                          placeholder="פרט על האבחון הנדרש..."
                        />
                        <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
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
                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-200 transition-all duration-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('criminal_record')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-red-600 transition-colors">
                        בעל/ת עבר פלילי
                      </span>
                    </label>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-200 transition-all duration-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('drug_use')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-red-600 transition-colors">
                        שימוש בסמים
                      </span>
                    </label>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-200 transition-all duration-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('smoking')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-red-600 transition-colors">
                        מעשן/ת
                      </span>
                    </label>
                  </div>
                </div>

                {watch('criminal_record') && (
                  <div className="mt-6 animate-fadeIn">
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <h4 className="text-sm font-semibold text-red-800 mb-4 flex items-center">
                        <Shield className="w-4 h-4 ml-2" />
                        פרטי גורמים מטפלים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            קצין ביקור סדיר
                          </label>
                          <div className="relative">
                            <input
                              {...register('probation_officer')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם הקצין"
                            />
                            <Shield className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ק. שירות מבחן לנוער
                          </label>
                          <div className="relative">
                            <input
                              {...register('youth_probation_officer')}
                              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              placeholder="שם הקצין"
                            />
                            <Shield className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          </div>
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
                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-200 transition-all duration-200">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          {...register('psychological_treatment')}
                          type="checkbox"
                          className="ml-3 w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                          טיפול פסיכולוגי
                        </span>
                      </label>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-200 transition-all duration-200">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          {...register('psychiatric_treatment')}
                          type="checkbox"
                          className="ml-3 w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                          טיפול פסיכיאטרי
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-200 transition-all duration-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('takes_medication')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                        נוטל/ת תרופות
                      </span>
                    </label>
                    
                    {watch('takes_medication') && (
                      <div className="mt-4 animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          תיאור התרופות והמינונים
                        </label>
                        <div className="relative">
                          <textarea
                            {...register('medication_description')}
                            rows={3}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                            placeholder="פרט את סוגי התרופות, מינונים ומטרת הטיפול..."
                          />
                          <Heart className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
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
                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-amber-200 transition-all duration-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('military_service_potential')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-amber-600 transition-colors">
                        בעל/ת סיכויים להתגייס לצה&quot;ל
                      </span>
                    </label>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-amber-200 transition-all duration-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        {...register('can_handle_program')}
                        type="checkbox"
                        className="ml-3 w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium group-hover:text-amber-600 transition-colors">
                        יכול/ה לעמוד בעומס המסגרת המוצעת
                      </span>
                    </label>
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
                    </label>
                    <div className="space-y-2">
                      <input
                        {...register('risk_level', { valueAsNumber: true })}
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        defaultValue="5"
                        className="w-full cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                        <span>8</span>
                        <span>9</span>
                        <span>10</span>
                      </div>
                    </div>
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
                    </label>
                    <div className="relative">
                      <textarea
                        {...register('risk_factors')}
                        rows={4}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                        placeholder="פרט את הגורמים העיקריים לסיכון..."
                      />
                      <AlertTriangle className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
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
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('personal_opinion')}
                      rows={5}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 hover:shadow-sm resize-none"
                      placeholder="שתף את דעתך המקצועית והמלצותיך לגבי קבלת המועמד/ת..."
                    />
                    <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
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
                    <input
                      {...register('grade_sheet')}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      חובה להעלות גליון ציונים עדכני (PDF, JPG, PNG - עד 10MB)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר ציונים שליליים
                    </label>
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
                  </div>

                  {watch('failing_grades_count') > 0 && (
                    <div className="animate-fadeIn space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">פרט על הציונים השליליים:</h4>
                      {Array.from({ length: watch('failing_grades_count') || 0 }).map((_, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                מקצוע {index + 1}
                              </label>
                              <input
                                {...register(`failing_subjects.${index}.subject`)}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="שם המקצוע"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                ציון
                              </label>
                              <input
                                {...register(`failing_subjects.${index}.grade`)}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="הציון"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                סיבה לציון השלילי
                              </label>
                              <input
                                {...register(`failing_subjects.${index}.reason`)}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}