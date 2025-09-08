'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import Logo from './Logo'

const SignaturePad = dynamic(() => import('./SignaturePad'), { ssr: false })

const formSchema = z.object({
  parent1_name: z.string().min(2, 'נא להזין שם הורה'),
  parent1_id: z.string().min(5, 'נא להזין מספר תעודת זהות'),
  parent1_address: z.string().optional(),
  parent1_phone: z.string().optional(),
  parent2_name: z.string().optional(),
  parent2_id: z.string().optional(),
  parent2_address: z.string().optional(),
  parent2_phone: z.string().optional(),
  student_name: z.string().min(2, 'נא להזין שם התלמיד/ה'),
})

type FormData = z.infer<typeof formSchema>

interface ParentConsentFormProps {
  referralNumber: string
}

export default function ParentConsentForm({ referralNumber }: ParentConsentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signature1, setSignature1] = useState<string>('')
  const [signature2, setSignature2] = useState<string>('')
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const hasSecondParent = watch('parent2_name')

  const onSubmit = async (data: FormData) => {
    if (!signature1) {
      alert('נא לחתום הורה/אפוטרופוס 1')
      return
    }

    // Only require signature 2 if parent 2 name is filled
    if (data.parent2_name && !signature2) {
      alert('נא לחתום הורה/אפוטרופוס 2')
      return
    }

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/referrals/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          signature: signature1,
          signature2: hasSecondParent ? signature2 : null,
          referral_number: referralNumber,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Log the student form URL to console
        const studentFormUrl = `http://localhost:3000/student-form/${referralNumber}`
        console.log('====================================')
        console.log('✅ הטופס נשלח בהצלחה!')
        console.log('====================================')
        console.log('קישור לטופס נתוני התלמיד:')
        console.log(studentFormUrl)
        console.log('====================================')
        console.log('העתק והדבק את הקישור כדי להמשיך למילוי נתוני התלמיד')
        console.log('====================================')
        
        setSubmitResult({
          success: true,
          message: 'הטופס נשלח בהצלחה! היועצ/ת יקבל/תקבל הודעה להמשך הטיפול.',
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
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="h-20 w-20" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            ויתור סודיות לימודית/פסיכולוגית/רפואית
          </h1>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-gray-700">
            אני מאפשר להנהלת "גשר אל הנוער" לקבל מביה"ס/ רווחה/ גורם מטפל אחר כל מידע
            לימודי/פסיכולוגי/רפואי על בני/ביתי. אנו מוותרים בזאת על סודיות לגבי המידע הרלוונטי.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">פרטי התלמיד/ה</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם התלמיד/ה *
              </label>
              <input
                {...register('student_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="שם מלא של התלמיד/ה"
              />
              {errors.student_name && (
                <p className="mt-1 text-sm text-red-600">{errors.student_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">הורה/אפוטרופוס 1</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם מלא *
                </label>
                <input
                  {...register('parent1_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="שם מלא"
                />
                {errors.parent1_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent1_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר תעודת זהות *
                </label>
                <input
                  {...register('parent1_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="123456789"
                  dir="ltr"
                />
                {errors.parent1_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent1_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת
                </label>
                <input
                  {...register('parent1_address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="רחוב, מספר, עיר"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <input
                  {...register('parent1_phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="050-123-4567"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  חתימת הורה/אפוטרופוס 1 *
                </label>
                <SignaturePad 
                  onSave={setSignature1} 
                  disabled={isSubmitting}
                />
                {signature1 && (
                  <p className="mt-2 text-sm text-green-600">החתימה נקלטה ✓</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">הורה/אפוטרופוס 2 (אופציונלי)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם מלא
                </label>
                <input
                  {...register('parent2_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="שם מלא"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר תעודת זהות
                </label>
                <input
                  {...register('parent2_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="123456789"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת
                </label>
                <input
                  {...register('parent2_address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="רחוב, מספר, עיר"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <input
                  {...register('parent2_phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="050-123-4567"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  חתימת הורה/אפוטרופוס 2
                </label>
                <SignaturePad 
                  onSave={setSignature2} 
                  disabled={isSubmitting}
                />
                {signature2 && (
                  <p className="mt-2 text-sm text-green-600">החתימה נקלטה ✓</p>
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
            disabled={isSubmitting || !signature1}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin ml-2 h-5 w-5" />
                מעבד...
              </>
            ) : (
              'שליחת הסכמה'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}