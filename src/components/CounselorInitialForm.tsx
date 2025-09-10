'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, User, School, Mail, Phone, Send, ArrowRight, UserPlus } from 'lucide-react'
import Logo from './Logo'

const formSchema = z.object({
  counselor_name: z.string().min(2, 'נא להזין שם מלא'),
  counselor_email: z.string().email('כתובת אימייל לא תקינה'),
  school_name: z.string().min(2, 'נא להזין שם בית ספר'),
  parent_email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  parent_phone: z.string().regex(/^[\d\-\+\(\)\s]*$/, 'מספר טלפון לא תקין').optional().or(z.literal('')),
}).refine(
  (data) => data.parent_email || data.parent_phone,
  {
    message: "חובה להזין לפחות אמצעי קשר אחד (טלפון או אימייל)",
    path: ["parent_phone"], // Show error on phone field
  }
)

type FormData = z.infer<typeof formSchema>

export default function CounselorInitialForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/referrals/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: `בקשה לחתימה על טופס ויתור סודיות נשלחה להורים. לאחר חתימתם תישלח התראה ל-${data.counselor_email} להמשך מילוי נתוני התלמיד`,
        })
        reset()
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'שגיאה ביצירת ההפניה',
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

  // Show success message only after successful submission
  if (submitResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-2"></div>
            <div className="p-12">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full blur-xl animate-pulse"></div>
                  <CheckCircle className="h-24 w-24 text-green-500 relative z-10" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  ההפניה נוצרה בהצלחה!
                </h1>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 max-w-lg shadow-sm">
                  <p className="text-green-800 text-lg leading-relaxed">
                    {submitResult.message}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSubmitResult(null)
                    reset()
                  }}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transform transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
                >
                  <UserPlus className="h-5 w-5 ml-2" />
                  יצירת הפניה נוספת
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Logo above the form */}
        <div className="flex justify-center mb-6">
          <Logo className="h-20 w-20" />
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold">טופס הגשת מועמדות</h1>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Counselor Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg ml-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                פרטי היועץ/ת
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="counselor_name" className="block text-sm font-medium text-gray-700 mb-2">
                    שם מלא
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('counselor_name')}
                      type="text"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="הזן שם מלא"
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
                  <label htmlFor="counselor_email" className="block text-sm font-medium text-gray-700 mb-2">
                    כתובת אימייל
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('counselor_email')}
                      type="email"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="example@school.edu"
                      dir="ltr"
                    />
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.counselor_email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                      {errors.counselor_email.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-2">
                    שם בית הספר
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('school_name')}
                      type="text"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="הזן שם בית ספר"
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
              </div>
            </div>

            {/* Parent Contact Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <div className="bg-indigo-100 p-2 rounded-lg ml-3">
                  <Phone className="w-5 h-5 text-indigo-600" />
                </div>
                פרטי התקשרות להורה
              </h2>
              <p className="text-sm text-gray-600 mb-6 mr-11">
                נא להזין לפחות אמצעי קשר אחד - טלפון או אימייל
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-2">
                    אימייל הורה
                    <span className="text-gray-500 text-xs mr-2">(אופציונלי)</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('parent_email')}
                      type="email"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="parent@example.com"
                      dir="ltr"
                    />
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.parent_email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                      {errors.parent_email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    טלפון הורה
                    <span className="text-gray-500 text-xs mr-2">(אופציונלי)</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('parent_phone')}
                      type="tel"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="050-1234567"
                      dir="ltr"
                    />
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.parent_phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                      {errors.parent_phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {submitResult && !submitResult.success && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-start animate-fadeIn">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="mr-3 font-medium">{submitResult.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium text-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] shadow-xl group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 ml-2" />
                  שולח את ההפניה...
                </>
              ) : (
                <>
                  יצירת הפניה
                  <ArrowRight className="h-5 w-5 mr-3 group-hover:translate-x-[-4px] transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}