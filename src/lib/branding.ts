/**
 * Branding configuration for dual organization support
 */

export interface BrandingConfig {
  organizationName: string
  logoPath: string
  isFriedman: boolean
}

/**
 * Get branding configuration based on warm home destination
 */
export function getBrandingFromDestination(warmHomeDestination: string | null): BrandingConfig {
  // Check if it's a Friedman location
  const isFriedman = warmHomeDestination?.includes('בית פרידמן') || false

  return {
    organizationName: isFriedman ? 'בית פרידמן' : 'גשר אל הנוער',
    logoPath: isFriedman ? '/Friedmanlogo.png' : '/logo.png',
    isFriedman
  }
}