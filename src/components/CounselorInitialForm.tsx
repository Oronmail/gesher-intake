'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  counselor_name: z.string().min(2, 'נא להזין שם מלא'),
  counselor_email: z.string().email('כתובת אימייל לא תקינה'),
  school_name: z.string().min(2, 'נא להזין שם בית ספר'),
  parent_email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  parent_phone: z.string().regex(/^[\d\-\+\(\)\s]+$/, 'מספר טלפון לא תקין'),
})

type FormData = z.infer<typeof formSchema>

export default function CounselorInitialForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [counselorEmail, setCounselorEmail] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitResult(null)
    setCounselorEmail(data.counselor_email)

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
          message: `בקשה לחתימה על טופס ויתור סודיות נשלחה להורים, ברגע שיחתמו תישלח התראה ל-${data.counselor_email} להמשך מילוי נתוני התלמיד`,
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          הגשת מועמדות
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם היועצ/ת *
              </label>
              <input
                {...register('counselor_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="שם מלא"
              />
              {errors.counselor_name && (
                <p className="mt-1 text-sm text-red-600">{errors.counselor_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                אימייל יועצ/ת *
              </label>
              <input
                {...register('counselor_email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@school.edu"
                dir="ltr"
              />
              {errors.counselor_email && (
                <p className="mt-1 text-sm text-red-600">{errors.counselor_email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם בית הספר *
            </label>
            <input
              {...register('school_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="שם בית הספר"
            />
            {errors.school_name && (
              <p className="mt-1 text-sm text-red-600">{errors.school_name.message}</p>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              פרטי התקשרות של ההורים
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל הורה (אופציונלי)
                </label>
                <input
                  {...register('parent_email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="parent@email.com"
                  dir="ltr"
                />
                {errors.parent_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון הורה *
                </label>
                <input
                  {...register('parent_phone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="050-123-4567"
                  dir="ltr"
                />
                {errors.parent_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_phone.message}</p>
                )}
              </div>
            </div>
          </div>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin ml-2 h-5 w-5" />
                מעבד...
              </>
            ) : (
              'יצירת הפניה'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}