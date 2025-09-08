import StudentDataForm from '@/components/StudentDataForm'
import Logo from '@/components/Logo'

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