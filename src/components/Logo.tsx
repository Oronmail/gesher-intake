'use client'

import Image from 'next/image'
import { getBrandingFromDestination } from '@/contexts/BrandingContext'

interface LogoProps {
  className?: string
  warmHomeDestination?: string | null
}

export default function Logo({ className = "h-20 w-20", warmHomeDestination = null }: LogoProps) {
  const branding = getBrandingFromDestination(warmHomeDestination)

  return (
    <div className={`${className} relative`}>
      <Image
        src={branding.logoPath}
        alt={branding.organizationName}
        fill
        className="object-contain"
      />
    </div>
  )
}