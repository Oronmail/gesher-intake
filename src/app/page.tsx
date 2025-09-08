import CounselorInitialForm from '@/components/CounselorInitialForm'
import Logo from '@/components/Logo'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="h-24 w-24" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            מערכת הפניית תלמידים
          </h1>
        </div>
        <CounselorInitialForm />
      </div>
    </div>
  );
}
