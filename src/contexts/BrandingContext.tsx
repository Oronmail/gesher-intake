'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface BrandingContextType {
  organizationName: string
  logoPath: string
  warmHomeDestination: string | null
  isFriedman: boolean
}

const BrandingContext = createContext<BrandingContextType>({
  organizationName: 'גשר אל הנוער',
  logoPath: '/logo.png',
  warmHomeDestination: null,
  isFriedman: false,
})

export const useBranding = () => {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}

interface BrandingProviderProps {
  children: ReactNode
  warmHomeDestination?: string | null
}

export function BrandingProvider({ children, warmHomeDestination = null }: BrandingProviderProps) {
  // Determine if this is a Friedman path based on warm home destination
  const isFriedman = warmHomeDestination ?
    warmHomeDestination.includes('בית פרידמן') : false

  const brandingValue: BrandingContextType = {
    organizationName: isFriedman ? 'בית פרידמן' : 'גשר אל הנוער',
    logoPath: isFriedman ? '/Friedmanlogo.png' : '/logo.png',
    warmHomeDestination,
    isFriedman,
  }

  return (
    <BrandingContext.Provider value={brandingValue}>
      {children}
    </BrandingContext.Provider>
  )
}

// Helper function to determine branding from warm home destination
export function getBrandingFromDestination(destination: string | null | undefined): {
  organizationName: string
  logoPath: string
  isFriedman: boolean
} {
  const isFriedman = destination ? destination.includes('בית פרידמן') : false

  return {
    organizationName: isFriedman ? 'בית פרידמן' : 'גשר אל הנוער',
    logoPath: isFriedman ? '/Friedmanlogo.png' : '/logo.png',
    isFriedman,
  }
}