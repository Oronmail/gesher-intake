import Image from 'next/image'

export default function Logo({ className = "h-20 w-20" }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      <Image 
        src="/logo.png" 
        alt="גשר אל הנוער" 
        fill
        className="object-contain"
      />
    </div>
  )
}