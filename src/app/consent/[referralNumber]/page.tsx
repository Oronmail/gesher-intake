'use client'

import { use, useEffect, useState } from 'react'
import ParentConsentForm from '@/components/ParentConsentForm'
import { supabase } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'

interface ConsentInfo {
  status: string
  consent_timestamp: string
  parent_names: string
  warm_home_destination?: string
}

export default function ConsentPage({ 
  params 
}: { 
  params: Promise<{ referralNumber: string }>
}) {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [alreadySigned, setAlreadySigned] = useState(false)
  const [consentInfo, setConsentInfo] = useState<ConsentInfo | null>(null)
  const [warmHomeDestination, setWarmHomeDestination] = useState<string | null>(null)

  useEffect(() => {
    checkConsentStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkConsentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('status, consent_timestamp, parent_names, warm_home_destination')
        .eq('referral_number', resolvedParams.referralNumber)
        .single()

      if (error) {
        console.error('Error checking consent status:', error)
      } else if (data) {
        setWarmHomeDestination(data.warm_home_destination || null)
        if (data.status === 'consent_signed' || data.status === 'completed') {
          setAlreadySigned(true)
          setConsentInfo(data)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">בודק סטטוס...</p>
        </div>
      </div>
    )
  }

  if (alreadySigned && consentInfo) {
    const consentDate = consentInfo.consent_timestamp 
      ? new Date(consentInfo.consent_timestamp).toLocaleDateString('he-IL')
      : ''

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto py-12">
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <Logo warmHomeDestination={consentInfo.warm_home_destination || null} />
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h1 className="text-2xl font-bold text-gray-800">
                  טופס ההסכמה כבר נחתם
                </h1>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-lg w-full">
                  <p className="text-green-800 text-lg mb-4">
                    טופס ההסכמה עבור הפניה מספר {resolvedParams.referralNumber} נחתם בהצלחה
                  </p>
                  {consentInfo.parent_names && (
                    <p className="text-gray-600 mb-2">
                      <strong>נחתם על ידי:</strong> {consentInfo.parent_names}
                    </p>
                  )}
                  {consentDate && (
                    <p className="text-gray-600">
                      <strong>תאריך חתימה:</strong> {consentDate}
                    </p>
                  )}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    היועצ/ת קיבל/ה הודעה על החתימה וימשיך/תמשיך בתהליך
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
    <>
      <ParentConsentForm referralNumber={resolvedParams.referralNumber} warmHomeDestination={warmHomeDestination} />
    </>
  )
}