'use client'

import { use, useEffect, useState } from 'react'
import StudentDataForm from '@/components/StudentDataForm'
import { supabase } from '@/lib/supabase'

export default function StudentFormPage({
  params
}: {
  params: Promise<{ referralNumber: string }>
}) {
  const resolvedParams = use(params)
  const [warmHomeDestination, setWarmHomeDestination] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('warm_home_destination')
          .eq('referral_number', resolvedParams.referralNumber)
          .single()

        if (data) {
          setWarmHomeDestination(data.warm_home_destination || null)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <StudentDataForm referralNumber={resolvedParams.referralNumber} warmHomeDestination={warmHomeDestination} />
    </div>
  )
}