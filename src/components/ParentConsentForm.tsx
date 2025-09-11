'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, User, CreditCard, MapPin, Phone, PenTool, Shield, FileSignature, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import Logo from './Logo'
import { generateConsentPDF, getConsentPDFFilename } from '@/lib/pdf-generator'

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
  const [showSecondParent, setShowSecondParent] = useState(false)

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
      // Generate PDF before sending to API
      let pdfBase64 = ''
      let pdfFilename = ''
      
      try {
        const pdfData = {
          referralNumber,
          studentName: data.student_name,
          parent1Name: data.parent1_name,
          parent1Id: data.parent1_id,
          parent1Address: data.parent1_address,
          parent1Phone: data.parent1_phone,
          parent1Signature: signature1,
          parent2Name: data.parent2_name,
          parent2Id: data.parent2_id,
          parent2Address: data.parent2_address,
          parent2Phone: data.parent2_phone,
          parent2Signature: hasSecondParent ? signature2 : undefined,
          consentDate: new Date()
        }
        
        pdfBase64 = await generateConsentPDF(pdfData)
        pdfFilename = getConsentPDFFilename(referralNumber)
        console.log('PDF generated successfully:', pdfFilename)
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError)
        // Continue without PDF - don't block the submission
      }

      const response = await fetch('/api/referrals/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          signature: signature1,
          signature2: hasSecondParent ? signature2 : null,
          referral_number: referralNumber,
          pdf_base64: pdfBase64,
          pdf_filename: pdfFilename,
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
    } catch {
      setSubmitResult({
        success: false,
        message: 'אירעה שגיאה. אנא נסה שנית.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success page after successful submission
  if (submitResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
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
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 w-full shadow-sm">
                  <p className="text-green-800 text-xl leading-relaxed">
                    {submitResult.message}
                  </p>
                </div>
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl w-full border border-blue-200">
                  <p className="text-blue-800 font-medium text-lg">
                    מספר סימוכין: <span className="font-mono text-xl">{referralNumber}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Logo above the form */}
        <div className="flex justify-center mb-6">
          <Logo className="h-20 w-20" />
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                ויתור סודיות לימודית/פסיכולוגית/רפואית
              </h1>
            </div>
          </div>

          {/* Consent Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 m-6 rounded-lg">
            <div className="flex items-start">
              <FileSignature className="h-6 w-6 text-blue-600 mt-1 ml-3 flex-shrink-0" />
              <p className="text-gray-700 leading-relaxed">
                אני מאפשר להנהלת &quot;גשר אל הנוער&quot; לקבל מביה&quot;ס/ רווחה/ גורם מטפל אחר כל מידע
                לימודי/פסיכולוגי/רפואי על בני/ביתי. אנו מוותרים בזאת על סודיות לגבי המידע הרלוונטי.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Student Name */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg ml-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                פרטי התלמיד/ה
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם מלא
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('student_name')}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                    placeholder="שם פרטי ומשפחה"
                  />
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.student_name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                    {errors.student_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Parent 1 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg ml-3">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                הורה/אפוטרופוס 1
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם מלא
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('parent1_name')}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="שם פרטי ומשפחה"
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.parent1_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                      {errors.parent1_name.message}
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
                      {...register('parent1_id')}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="000000000"
                      dir="ltr"
                    />
                    <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.parent1_id && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                      {errors.parent1_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    כתובת
                    <span className="text-gray-500 text-xs mr-2">(אופציונלי)</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('parent1_address')}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="רחוב, מספר, עיר"
                    />
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    טלפון
                    <span className="text-gray-500 text-xs mr-2">(אופציונלי)</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('parent1_phone')}
                      type="tel"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                      placeholder="050-0000000"
                      dir="ltr"
                    />
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Signature 1 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  חתימה דיגיטלית
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
                  <SignaturePad
                    onSave={setSignature1}
                  />
                </div>
              </div>
            </div>

            {/* Toggle for second parent */}
            {!showSecondParent && (
              <button
                type="button"
                onClick={() => setShowSecondParent(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center"
              >
                <Users className="h-5 w-5 ml-2" />
                הוסף הורה/אפוטרופוס נוסף
              </button>
            )}

            {/* Parent 2 (Optional) */}
            {showSecondParent && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg ml-3">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  הורה/אפוטרופוס 2
                  <span className="text-gray-500 text-sm mr-2">(אופציונלי)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שם מלא
                    </label>
                    <div className="relative">
                      <input
                        {...register('parent2_name')}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="שם פרטי ומשפחה"
                      />
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר תעודת זהות
                    </label>
                    <div className="relative">
                      <input
                        {...register('parent2_id')}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="000000000"
                        dir="ltr"
                      />
                      <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      כתובת
                    </label>
                    <div className="relative">
                      <input
                        {...register('parent2_address')}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="רחוב, מספר, עיר"
                      />
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      טלפון
                    </label>
                    <div className="relative">
                      <input
                        {...register('parent2_phone')}
                        type="tel"
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="050-0000000"
                        dir="ltr"
                      />
                      <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Signature 2 */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    חתימה דיגיטלית
                  </label>
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
                    <SignaturePad
                      onSave={setSignature2}
                    />
                  </div>
                </div>
              </div>
            )}

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
              className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium text-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] shadow-xl group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 ml-2" />
                  שולח את הטופס...
                </>
              ) : (
                <>
                  שליחת טופס הסכמה
                  <PenTool className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}