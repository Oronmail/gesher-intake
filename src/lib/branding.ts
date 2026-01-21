/**
 * Branding configuration for dual organization support
 */

export interface BrandingConfig {
  organizationName: string
  logoPath: string
  isFriedman: boolean
}

export interface HouseManagerContact {
  name: string
  email: string
  phone: string
}

/**
 * House manager contacts by warm home destination
 * NOTE: For testing, all use the same contact. Update with real contacts for production.
 */
const houseManagerContacts: Record<string, HouseManagerContact> = {
  'נוה שרת': {
    name: 'מנהל/ת נוה שרת',
    email: 'oronmail@gmail.com', // TODO: Replace with real email for production
    phone: '0506470578', // TODO: Replace with real phone for production
  },
  'כפר שלם': {
    name: 'מנהל/ת כפר שלם',
    email: 'oronmail@gmail.com', // TODO: Replace with real email for production
    phone: '0506470578', // TODO: Replace with real phone for production
  },
  'בן יהודה': {
    name: 'מנהל/ת בן יהודה',
    email: 'oronmail@gmail.com', // TODO: Replace with real email for production
    phone: '0506470578', // TODO: Replace with real phone for production
  },
}

/**
 * Get house manager contact info for a warm home destination
 */
export function getHouseManagerContact(warmHomeDestination: string | null): HouseManagerContact | null {
  if (!warmHomeDestination) return null
  return houseManagerContacts[warmHomeDestination] || null
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