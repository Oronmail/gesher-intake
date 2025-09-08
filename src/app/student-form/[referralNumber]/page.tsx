import StudentDataForm from '@/components/StudentDataForm'

export default function StudentFormPage({ 
  params 
}: { 
  params: { referralNumber: string } 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <StudentDataForm referralNumber={params.referralNumber} />
    </div>
  )
}