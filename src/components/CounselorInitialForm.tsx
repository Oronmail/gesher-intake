'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, User, School, Mail, Phone, ArrowRight, UserPlus, FileCheck, CheckSquare, Upload, X } from 'lucide-react'
import Logo from './Logo'

const formSchema = z.object({
  counselor_name: z.string().min(2, 'נא להזין שם מלא'),
  counselor_email: z.string().email('כתובת אימייל לא תקינה'),
  counselor_mobile: z.string().min(9, 'נא להזין טלפון נייד').regex(/^[\d\-\+\(\)\s]*$/, 'מספר טלפון לא תקין'),
  school_name: z.string().min(2, 'נא להזין שם בית ספר'),
  warm_home_destination: z.string().min(1, 'נא לבחור בית חם'),
  consent_method: z.enum(['digital', 'manual']),
  parent_email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  parent_phone: z.string().regex(/^[\d\-\+\(\)\s]*$/, 'מספר טלפון לא תקין').optional().or(z.literal('')),
  manual_consent_confirmed: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Only require parent contact when digital consent is selected
  if (data.consent_method === 'digital') {
    if (!data.parent_email && !data.parent_phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "חובה להזין לפחות אמצעי קשר אחד (טלפון או אימייל)",
        path: ["parent_phone"],
      })
    }
  }
  // For manual consent: require either file upload OR checkbox confirmation
  // Note: File validation is handled separately in the component since Zod doesn't handle File objects
})

type FormData = z.infer<typeof formSchema>

export default function CounselorInitialForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; studentFormUrl?: string } | null>(null)
  const [consentMethod, setConsentMethod] = useState<'digital' | 'manual'>('digital')
  const [consentFile, setConsentFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      consent_method: 'digital',
    },
  })

  // Keep form state in sync with local state
  const handleConsentMethodChange = (method: 'digital' | 'manual') => {
    setConsentMethod(method)
    setValue('consent_method', method)
    // Clear validation errors when switching
    if (method === 'manual') {
      setValue('parent_email', '')
      setValue('parent_phone', '')
    }
    setValue('manual_consent_confirmed', false)
    setConsentFile(null)
    setFileError(null)
  }

  // Compress image to reduce file size (for Vercel's 4.5MB limit)
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        // Calculate new dimensions (max 1600px width/height while maintaining aspect ratio)
        const maxDim = 1600
        let { width, height } = img

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim
            width = maxDim
          } else {
            width = (width / height) * maxDim
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to JPEG with 0.7 quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          0.7
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null)

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setFileError('סוג קובץ לא נתמך. יש להעלות תמונה (JPG, PNG, HEIC) או PDF')
        setConsentFile(null)
        return
      }

      // For PDFs, check size limit (4MB for Vercel)
      if (file.type === 'application/pdf') {
        if (file.size > 4 * 1024 * 1024) {
          setFileError('גודל קובץ PDF חורג מ-4MB. נא להקטין את הקובץ')
          setConsentFile(null)
          return
        }
        setConsentFile(file)
      } else {
        // For images, compress if needed
        try {
          if (file.size > 3 * 1024 * 1024) {
            // Compress images larger than 3MB
            const compressedFile = await compressImage(file)
            setConsentFile(compressedFile)
          } else {
            setConsentFile(file)
          }
        } catch {
          setFileError('שגיאה בעיבוד התמונה. נסה שנית')
          setConsentFile(null)
          return
        }
      }

      // If file is uploaded, uncheck the confirmation checkbox
      setValue('manual_consent_confirmed', false)
    } else {
      setConsentFile(null)
    }
  }

  // Remove uploaded file
  const removeFile = () => {
    setConsentFile(null)
    setFileError(null)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitResult(null)
    setFileError(null)

    // For manual consent: validate that either file or checkbox is provided
    if (data.consent_method === 'manual' && !consentFile && !data.manual_consent_confirmed) {
      setFileError('נא להעלות צילום טופס הסכמה או לאשר שהטופס יימסר למנהל/ת בית החם')
      setIsSubmitting(false)
      return
    }

    try {
      let response: Response

      // If there's a file, use FormData; otherwise use JSON
      if (consentFile) {
        const formData = new window.FormData()
        formData.append('consent_file', consentFile)
        // Add all other fields to FormData
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })

        response = await fetch('/api/referrals/initiate', {
          method: 'POST',
          body: formData,
        })
      } else {
        response = await fetch('/api/referrals/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }

      const result = await response.json()

      if (response.ok) {
        if (result.consent_method === 'manual') {
          setSubmitResult({
            success: true,
            message: 'הבקשה נוצרה בהצלחה! כעת ניתן למלא את נתוני התלמיד/ה',
            studentFormUrl: result.student_form_url,
          })
        } else {
          setSubmitResult({
            success: true,
            message: `בקשה לחתימה על טופס ויתור סודיות נשלחה להורים. לאחר חתימתם תישלח התראה ל-${data.counselor_email} להמשך מילוי נתוני התלמיד`,
          })
        }
        reset()
        setConsentMethod('digital')
        setConsentFile(null)
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

                {/* Show button to continue to student form for manual consent */}
                {submitResult.studentFormUrl && (
                  <a
                    href={submitResult.studentFormUrl}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transform transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
                  >
                    <ArrowRight className="h-5 w-5 ml-2" />
                    המשך למילוי נתוני תלמיד
                  </a>
                )}

                <button
                  onClick={() => {
                    setSubmitResult(null)
                    reset()
                    setConsentMethod('digital')
                    setConsentFile(null)
                  }}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transform transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
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
              <h1 className="text-4xl font-bold">הגשת מועמדות</h1>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Counselor Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg ml-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                פרטי נציג/ת בית הספר
              </h2>
              
              <div className="space-y-6">
                {/* Row 1: School name (right) and Counselor name (left) */}
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

                {/* Row 2: Email (left) and Mobile (right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label htmlFor="counselor_mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      טלפון נייד
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        {...register('counselor_mobile')}
                        type="tel"
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder="050-1234567"
                        dir="ltr"
                      />
                      <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.counselor_mobile && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                        {errors.counselor_mobile.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Warm Home Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מיועד לבית החם
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('warm_home_destination')}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 appearance-none"
                    >
                      <option value="">בחר בית חם</option>
                      <option value="בן יהודה">בן יהודה</option>
                      <option value="כפר שלם">כפר שלם</option>
                      <option value="נוה שרת">נוה שרת</option>
                    </select>
                    <School className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.warm_home_destination && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                      <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                      {errors.warm_home_destination.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Consent Method Selection */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <div className="bg-amber-100 p-2 rounded-lg ml-3">
                  <FileCheck className="w-5 h-5 text-amber-600" />
                </div>
                אופן קבלת הסכמת הורים
              </h2>

              <div className="space-y-4">
                <label
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-amber-300 ${
                    consentMethod === 'digital' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    value="digital"
                    checked={consentMethod === 'digital'}
                    onChange={() => handleConsentMethodChange('digital')}
                    className="h-5 w-5 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="mr-4">
                    <p className="font-medium text-gray-800">שליחת טופס הסכמה להורים לחתימה</p>
                    <p className="text-sm text-gray-600">יישלח טופס דיגיטלי להורים בדוא&quot;ל או SMS</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-amber-300 ${
                    consentMethod === 'manual' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    value="manual"
                    checked={consentMethod === 'manual'}
                    onChange={() => handleConsentMethodChange('manual')}
                    className="h-5 w-5 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="mr-4">
                    <p className="font-medium text-gray-800">החתמה פיזית על ידי נציג בית הספר</p>
                    <p className="text-sm text-gray-600">יש לוודא החתמה לפני מילוי פרטי התלמיד</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Parent Contact Section - Only show for digital consent */}
            {consentMethod === 'digital' && (
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
            )}

            {/* Manual Consent Options - Only show for manual consent */}
            {consentMethod === 'manual' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  נא לבחור אחת מהאפשרויות הבאות:
                  <span className="text-red-500 mr-1">*</span>
                </h3>

                {/* Option 1: Upload consent file */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">אפשרות 1: העלאת צילום טופס הסכמה חתום</p>

                  {!consentFile ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-xl cursor-pointer bg-white hover:bg-green-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-green-500" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-green-600">לחץ להעלאה</span> או גרור קובץ
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, HEIC או PDF (עד 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/heic,application/pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-white border-2 border-green-300 rounded-xl">
                      <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-500 ml-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{consentFile.name}</p>
                          <p className="text-xs text-gray-500">{(consentFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">או</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Option 2: Checkbox confirmation */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">אפשרות 2: אישור שהטופס יימסר בהמשך</p>
                  <label className={`flex items-start cursor-pointer p-4 rounded-xl border-2 transition-colors ${consentFile ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'border-gray-200 bg-white hover:border-green-300'}`}>
                    <input
                      type="checkbox"
                      {...register('manual_consent_confirmed')}
                      disabled={!!consentFile}
                      className="mt-1 h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500 disabled:opacity-50"
                    />
                    <span className="mr-3 text-gray-800">
                      <span className="font-medium flex items-center">
                        <CheckSquare className="h-5 w-5 ml-2 text-green-600" />
                        אני מאשר/ת שיש בידי טופס הסכמה חתום על ידי ההורים
                      </span>
                      <span className="block text-sm text-gray-600 mt-1 mr-7">
                        הטופס יימסר למנהל/ת בית החם
                      </span>
                    </span>
                  </label>
                </div>

                {/* Error message */}
                {fileError && (
                  <p className="mt-4 text-sm text-red-600 flex items-center animate-fadeIn">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                    {fileError}
                  </p>
                )}
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

            {/* Process Explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
              <p className="text-gray-700 leading-relaxed text-sm">
                {consentMethod === 'digital' ? (
                  'לאחר הגשת הטופס, יישלח להורים (באמצעי הקשר שהזנתם) טופס ויתור סודיות דיגיטלי לחתימה. כשההורים יאשרו, תקבל/י התראה במייל/סמס עם קישור למילוי נתוני התלמיד/ה והשלמת הגשת הבקשה'
                ) : consentFile ? (
                  'לאחר הגשת הטופס, תועבר/י ישירות לטופס מילוי נתוני התלמיד/ה. צילום טופס ההסכמה יצורף לבקשה.'
                ) : (
                  'לאחר הגשת הטופס, תועבר/י ישירות לטופס מילוי נתוני התלמיד/ה. טופס ההסכמה הפיזי החתום יימסר למנהל/ת בית החם.'
                )}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium text-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] shadow-xl group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 ml-2" />
                  שולח...
                </>
              ) : (
                <>
                  הגש
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