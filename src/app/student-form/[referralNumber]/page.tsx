'use client'

import { use, useEffect, useState } from 'react'
import StudentDataForm from '@/components/StudentDataForm'
import { supabase } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto py-12">
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <Logo warmHomeDestination={warmHomeDestination} />
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h1 className="text-2xl font-bold text-gray-800">
                  הטופס כבר הוגש
                </h1>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-lg w-full">
                  <p className="text-green-800 text-lg mb-4">
                    טופס נתוני התלמיד עבור הפניה מספר {resolvedParams.referralNumber} הוגש בהצלחה
                  </p>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    הנתונים נשמרו במערכת ונמצאים בטיפול
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <StudentDataForm referralNumber={resolvedParams.referralNumber} warmHomeDestination={warmHomeDestination} />
    </div>
  )
}