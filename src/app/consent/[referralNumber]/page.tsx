import ParentConsentForm from '@/components/ParentConsentForm'

export default function ConsentPage({ 
  params 
}: { 
  params: { referralNumber: string } 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12">
        <ParentConsentForm referralNumber={params.referralNumber} />
      </div>
    </div>
  )
}