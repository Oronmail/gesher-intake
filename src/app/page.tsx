import CounselorInitialForm from '@/components/CounselorInitialForm'
import Logo from '@/components/Logo'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Logo className="h-24 w-24" />
          </div>
        </div>
        <CounselorInitialForm />
      </div>
    </div>
  );
}
