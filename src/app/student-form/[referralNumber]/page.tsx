'use client'

import { use, useEffect, useState } from 'react'
import StudentDataForm from '@/components/StudentDataForm'
import { supabase } from '@/lib/supabase'
import { CheckCircle, GraduationCap, Shield } from 'lucide-react'
import Logo from '@/components/Logo'

export default function StudentFormPage({
  params
}: {
  params: Promise<{ referralNumber: string }>
}) {
  const resolvedParams = use(params)
  const [warmHomeDestination, setWarmHomeDestination] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('warm_home_destination, status')
          .eq('referral_number', resolvedParams.referralNumber)
          .single()

        if (data) {
          setWarmHomeDestination(data.warm_home_destination || null)
          if (data.status === 'completed') {
            setAlreadySubmitted(true)
          }
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [resolvedParams.referralNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2"></div>
            <div className="p-12">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full blur-xl animate-pulse"></div>
                  <CheckCircle className="h-24 w-24 text-green-500 relative z-10" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  הטופס כבר הוגש
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  טופס נתוני התלמיד עבור הפניה מספר {resolvedParams.referralNumber} הוגש בהצלחה
                </p>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 w-full shadow-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 p-2 rounded-lg ml-3">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">מערכת גשר אל הנוער</h3>
                  </div>
                  <p className="text-green-800 text-lg">
                    פרטי התלמיד/ה נקלטו במערכת ויועברו לצוות המקצועי לבחינה ואישור
                  </p>
                </div>
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl w-full border border-blue-200">
                  <div className="flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600 ml-2" />
                    <p className="text-blue-800 font-medium">
                      הנתונים נשמרו במערכת ונמצאים בטיפול
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <StudentDataForm referralNumber={resolvedParams.referralNumber} warmHomeDestination={warmHomeDestination} />
    </div>
  )
}