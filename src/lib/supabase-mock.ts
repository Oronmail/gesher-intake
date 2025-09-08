// Mock Supabase for local testing
interface MockReferral {
  id: string
  referral_number: string
  school_id: string
  school_name: string
  counselor_name: string
  counselor_email: string
  parent_email: string | null
  parent_phone: string
  status: string
  signature_image?: string
  signature_image2?: string
  parent_names?: string
  consent_timestamp?: string
  created_at: string
  updated_at: string
}

// In-memory storage for testing
const mockData: Map<string, MockReferral> = new Map()

export const supabaseMock = {
  from: () => ({
    insert: (data: MockReferral) => ({
      select: () => ({
        single: async () => {
          const referral: MockReferral = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          mockData.set(referral.referral_number, referral)
          console.log('Mock: Created referral', referral)
          return { data: referral, error: null }
        }
      })
    }),
    update: (updates: Partial<MockReferral>) => ({
      eq: (field: string, value: string) => ({
        select: () => ({
          single: async () => {
            const referral = mockData.get(value)
            if (!referral) {
              return { data: null, error: { message: 'Not found' } }
            }
            const updated = { ...referral, ...updates, updated_at: new Date().toISOString() }
            mockData.set(value, updated)
            console.log('Mock: Updated referral', updated)
            return { data: updated, error: null }
          }
        })
      })
    }),
    select: () => ({
      eq: (field: string, value: string) => ({
        single: async () => {
          const referral = mockData.get(value)
          console.log('Mock: Fetched referral', referral)
          return { data: referral || null, error: referral ? null : { message: 'Not found' } }
        }
      })
    })
  })
}