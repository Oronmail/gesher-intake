'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import Logo from './Logo'

const formSchema = z.object({
  // פרטים אישיים
  student_first_name: z.string().min(2, 'נא להזין שם פרטי'),
  student_last_name: z.string().min(2, 'נא להזין שם משפחה'),
  student_id: z.string().min(9, 'נא להזין תעודת זהות תקינה').max(9),
  date_of_birth: z.string().min(1, 'נא להזין תאריך לידה'),
  country_of_birth: z.string().min(2, 'נא להזין ארץ לידה'),
  immigration_year: z.string().optional(),
  gender: z.enum(['male', 'female'], { required_error: 'נא לבחור מין' }),
  address: z.string().min(5, 'נא להזין כתובת'),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  phone: z.string().min(9, 'נא להזין טלפון'),
  student_mobile: z.string().optional(),
  school_system_password: z.string().optional(),
  
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
  has_potential: z.boolean(),
  motivation_level: z.enum(['low', 'medium', 'high']),
  motivation_type: z.enum(['internal', 'external']),
  external_motivators: z.string().optional(),
  social_status: z.string().optional(),
  afternoon_activities: z.string().optional(),
  
  // הערכת למידה
  learning_disability: z.boolean(),
  requires_remedial_teaching: z.boolean().optional(),
  adhd: z.boolean(),
  adhd_treatment: z.string().optional(),
  assessment_done: z.boolean(),
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
  failing_subjects: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface StudentDataFormProps {
  referralNumber: string
}

export default function StudentDataForm({ referralNumber }: StudentDataFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  const totalSteps = 7

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
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

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate as any)
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
      case 3: return ['school_name', 'grade', 'homeroom_teacher', 'teacher_phone', 'counselor_name', 'counselor_phone']
      case 4: return ['behavioral_issues', 'has_potential', 'motivation_level', 'motivation_type']
      case 5: return ['learning_disability', 'adhd', 'assessment_done', 'assessment_needed']
      case 6: return ['criminal_record', 'drug_use', 'smoking', 'psychological_treatment', 'psychiatric_treatment', 'takes_medication']
      case 7: return ['military_service_potential', 'can_handle_program', 'risk_level', 'failing_grades_count']
      default: return []
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/referrals/student-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          referral_number: referralNumber,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: 'הטופס נשלח בהצלחה! המידע נשמר במערכת.',
        })
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'שגיאה בשליחת הטופס',
        })
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'אירעה שגיאה. אנא נסה שנית.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="h-20 w-20" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            טופס הפניית מועמד/ת
          </h1>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex-1">
                <div className="relative">
                  {index < totalSteps - 1 && (
                    <div className={`absolute top-5 w-full h-0.5 ${index < currentStep - 1 ? 'bg-blue-600' : 'bg-gray-300'}`} 
                         style={{ right: '-50%', left: '50%' }} />
                  )}
                  <div className={`relative z-10 w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-bold
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">פרטים אישיים</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם פרטי *
                  </label>
                  <input
                    {...register('student_first_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.student_first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.student_first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם משפחה *
                  </label>
                  <input
                    {...register('student_last_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.student_last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.student_last_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מספר תעודת זהות *
                  </label>
                  <input
                    {...register('student_id')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  {errors.student_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.student_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך לידה *
                  </label>
                  <input
                    {...register('date_of_birth')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ארץ לידה *
                  </label>
                  <input
                    {...register('country_of_birth')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.country_of_birth && (
                    <p className="mt-1 text-sm text-red-600">{errors.country_of_birth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שנת עלייה
                  </label>
                  <input
                    {...register('immigration_year')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מין *
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">בחר</option>
                    <option value="male">זכר</option>
                    <option value="female">נקבה</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    כתובת *
                  </label>
                  <input
                    {...register('address')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    קומה
                  </label>
                  <input
                    {...register('floor')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    דירה
                  </label>
                  <input
                    {...register('apartment')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון *
                  </label>
                  <input
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    נייד של התלמיד/ה
                  </label>
                  <input
                    {...register('student_mobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Family Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">מידע משפחתי</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מספר אחים
                  </label>
                  <input
                    {...register('siblings_count', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">פרטי האב</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם האב *
                  </label>
                  <input
                    {...register('father_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.father_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.father_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    נייד האב *
                  </label>
                  <input
                    {...register('father_mobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  {errors.father_mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.father_mobile.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    עיסוק *
                  </label>
                  <input
                    {...register('father_occupation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.father_occupation && (
                    <p className="mt-1 text-sm text-red-600">{errors.father_occupation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מקצוע *
                  </label>
                  <input
                    {...register('father_profession')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.father_profession && (
                    <p className="mt-1 text-sm text-red-600">{errors.father_profession.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    הכנסה
                  </label>
                  <input
                    {...register('father_income')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">פרטי האם</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם האם *
                  </label>
                  <input
                    {...register('mother_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mother_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.mother_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    נייד האם *
                  </label>
                  <input
                    {...register('mother_mobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  {errors.mother_mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mother_mobile.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    עיסוק *
                  </label>
                  <input
                    {...register('mother_occupation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mother_occupation && (
                    <p className="mt-1 text-sm text-red-600">{errors.mother_occupation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מקצוע *
                  </label>
                  <input
                    {...register('mother_profession')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mother_profession && (
                    <p className="mt-1 text-sm text-red-600">{errors.mother_profession.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    הכנסה
                  </label>
                  <input
                    {...register('mother_income')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    חובות/הלוואות/משכנתא
                  </label>
                  <input
                    {...register('debts_loans')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    רמת מעורבות ההורים
                  </label>
                  <select
                    {...register('parent_involvement')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="promoting">מקדמת</option>
                    <option value="no_involvement">ללא מעורבות</option>
                    <option value="inhibiting">מעכבת</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מצב כלכלי
                  </label>
                  <select
                    {...register('economic_status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">נמוך</option>
                    <option value="medium">בינוני</option>
                    <option value="high">גבוה</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    רקע משפחתי
                  </label>
                  <textarea
                    {...register('family_background')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: School Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">פרטי בית ספר</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    בית ספר *
                  </label>
                  <input
                    {...register('school_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.school_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.school_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    כיתה *
                  </label>
                  <input
                    {...register('grade')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.grade && (
                    <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מחנכת *
                  </label>
                  <input
                    {...register('homeroom_teacher')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.homeroom_teacher && (
                    <p className="mt-1 text-sm text-red-600">{errors.homeroom_teacher.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון מחנכת *
                  </label>
                  <input
                    {...register('teacher_phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  {errors.teacher_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.teacher_phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    יועצת *
                  </label>
                  <input
                    {...register('counselor_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.counselor_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.counselor_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון יועצת *
                  </label>
                  <input
                    {...register('counselor_phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  {errors.counselor_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.counselor_phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ססמא למערכת מידע בית ספרית
                  </label>
                  <input
                    {...register('school_system_password')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-700">מוכרות לרווחה</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        {...register('known_to_welfare')}
                        type="checkbox"
                        className="mr-2"
                      />
                      מוכרים ברווחה
                    </label>
                  </div>
                  
                  {watch('known_to_welfare') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          שם עו"ס מטפל
                        </label>
                        <input
                          {...register('social_worker_name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          טלפון עו"ס
                        </label>
                        <input
                          {...register('social_worker_phone')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          dir="ltr"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        {...register('youth_promotion')}
                        type="checkbox"
                        className="mr-2"
                      />
                      מטופל בקידום נוער
                    </label>
                  </div>
                  
                  {watch('youth_promotion') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          שם עובד קידום נוער
                        </label>
                        <input
                          {...register('youth_worker_name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          טלפון עובד קידום נוער
                        </label>
                        <input
                          {...register('youth_worker_phone')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          dir="ltr"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Intake Assessment */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">נתוני קליטה</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      {...register('behavioral_issues')}
                      type="checkbox"
                      className="mr-2"
                    />
                    בעיות התנהגות
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('has_potential')}
                      type="checkbox"
                      className="mr-2"
                    />
                    פוטנציאל
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    רמת מוטיבציה
                  </label>
                  <select
                    {...register('motivation_level')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">נמוך</option>
                    <option value="medium">בינוני</option>
                    <option value="high">גבוה</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    סוג מוטיבציה
                  </label>
                  <select
                    {...register('motivation_type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="internal">פנימית</option>
                    <option value="external">חיצונית</option>
                  </select>
                </div>

                {watch('motivation_type') === 'external' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      גורמים חיצוניים
                    </label>
                    <textarea
                      {...register('external_motivators')}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מצב חברתי
                  </label>
                  <textarea
                    {...register('social_status')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    פעילויות בשעות אחה"צ (חוגים, תנועות נוער, אימוני כושר, עבודה)
                  </label>
                  <textarea
                    {...register('afternoon_activities')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Learning Assessment */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">אבחונים והמלצות</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      {...register('learning_disability')}
                      type="checkbox"
                      className="mr-2"
                    />
                    לקוי למידה
                  </label>
                  
                  {watch('learning_disability') && (
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input
                          {...register('requires_remedial_teaching')}
                          type="checkbox"
                          className="mr-2"
                        />
                        מחייב הוראה מתקנת
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('adhd')}
                      type="checkbox"
                      className="mr-2"
                    />
                    הפרעת קשב וריכוז
                  </label>
                  
                  {watch('adhd') && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        האם הפרעת הקשב מטופלת? כיצד?
                      </label>
                      <textarea
                        {...register('adhd_treatment')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('assessment_done')}
                      type="checkbox"
                      className="mr-2"
                    />
                    נעשה אבחון
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('assessment_needed')}
                      type="checkbox"
                      className="mr-2"
                    />
                    יש צורך באבחון
                  </label>
                </div>

                {(watch('assessment_done') || watch('assessment_needed')) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      פרטים נוספים
                    </label>
                    <textarea
                      {...register('assessment_details')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Risk Assessment */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">הערכת סיכון</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      {...register('criminal_record')}
                      type="checkbox"
                      className="mr-2"
                    />
                    בעל/ת עבר פלילי
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('drug_use')}
                      type="checkbox"
                      className="mr-2"
                    />
                    שימוש בסמים
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('smoking')}
                      type="checkbox"
                      className="mr-2"
                    />
                    מעשן/ת
                  </label>
                </div>

                {watch('criminal_record') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        קצין ביקור סדיר
                      </label>
                      <input
                        {...register('probation_officer')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ק. שירות מבחן לנוער
                      </label>
                      <input
                        {...register('youth_probation_officer')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('psychological_treatment')}
                      type="checkbox"
                      className="mr-2"
                    />
                    טיפול פסיכולוגי
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('psychiatric_treatment')}
                      type="checkbox"
                      className="mr-2"
                    />
                    טיפול פסיכיאטרי
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('takes_medication')}
                      type="checkbox"
                      className="mr-2"
                    />
                    נוטל/ת תרופות
                  </label>
                  
                  {watch('takes_medication') && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        תיאור התרופות
                      </label>
                      <textarea
                        {...register('medication_description')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Final Assessment */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">חוות דעת אישית</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      {...register('military_service_potential')}
                      type="checkbox"
                      className="mr-2"
                    />
                    בעל/ת סיכויים להתגייס לצה"ל
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      {...register('can_handle_program')}
                      type="checkbox"
                      className="mr-2"
                    />
                    יכול/ה לעמוד בעומס המסגרת המוצעת
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    רמת הסיכון של הנער/ה (1-10)
                  </label>
                  <input
                    {...register('risk_level', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.risk_level && (
                    <p className="mt-1 text-sm text-red-600">{errors.risk_level.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מה הגורמים לסיכון?
                  </label>
                  <textarea
                    {...register('risk_factors')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    דעה אישית
                  </label>
                  <textarea
                    {...register('personal_opinion')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">תפקוד בבית הספר</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מספר ציונים שליליים
                    </label>
                    <input
                      {...register('failing_grades_count', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {watch('failing_grades_count') > 0 && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        תיאור המקצועות בהם יש שליליים
                      </label>
                      <textarea
                        {...register('failing_subjects')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {submitResult && (
            <div
              className={`p-4 rounded-md ${
                submitResult.success
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {submitResult.message}
            </div>
          )}

          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <ChevronRight className="ml-2 h-4 w-4" />
                הקודם
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mr-auto"
              >
                הבא
                <ChevronLeft className="mr-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mr-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin ml-2 h-5 w-5" />
                    שולח...
                  </>
                ) : (
                  'שליחת טופס'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}