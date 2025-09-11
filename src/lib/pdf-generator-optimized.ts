import jsPDF from 'jspdf'

interface ConsentFormData {
  referralNumber: string
  studentName: string
  parent1Name: string
  parent1Id: string
  parent1Address?: string
  parent1Phone?: string
  parent1Signature: string
  parent2Name?: string
  parent2Id?: string
  parent2Address?: string
  parent2Phone?: string
  parent2Signature?: string
  consentDate: Date
}

// Compress image to reduce size
const compressImage = async (base64String: string, maxWidth: number = 300): Promise<string> => {
  return new Promise((resolve) => {
    // If it's already small, return as is
    if (base64String.length < 10000) {
      resolve(base64String)
      return
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Calculate new dimensions
      const scale = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * scale
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Convert to compressed base64 with lower quality
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5)
      resolve(compressedBase64)
    }
    
    img.onerror = () => resolve(base64String) // Return original if error
    img.src = base64String
  })
}

// Generate simple PDF without external dependencies
export const generateConsentPDF = async (data: ConsentFormData): Promise<string> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true // Enable compression
    })
    
    // Use built-in fonts only
    pdf.setFont('helvetica')
    
    let y = 20
    const pageWidth = pdf.internal.pageSize.getWidth()
    const leftMargin = 20
    const rightMargin = 20
    const contentWidth = pageWidth - leftMargin - rightMargin
    
    // Helper function for RTL text (simple approach)
    const addRTLText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
      // For Hebrew text, we'll add it as is and let the PDF reader handle RTL
      pdf.text(text, x, y, options)
    }
    
    // Title
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    addRTLText('Consent Form - Gesher Al HaNoar', pageWidth / 2, y, { align: 'center' })
    y += 10
    
    // Hebrew title (as subtitle)
    pdf.setFontSize(14)
    addRTLText('טופס הסכמת הורים - גשר אל הנוער', pageWidth / 2, y, { align: 'center' })
    y += 15
    
    // Reference info
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    
    // Create a box for reference info
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(leftMargin, y - 5, contentWidth, 25, 'S')
    
    pdf.text(`Reference Number: ${data.referralNumber}`, leftMargin + 5, y)
    y += 6
    pdf.text(`Date: ${new Date(data.consentDate).toLocaleDateString('en-US')}`, leftMargin + 5, y)
    y += 6
    pdf.text(`Student Name: ${data.studentName}`, leftMargin + 5, y)
    y += 15
    
    // Parent 1 Section
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Parent/Guardian 1', leftMargin, y)
    pdf.setFont('helvetica', 'normal')
    y += 8
    
    pdf.setFontSize(11)
    const parent1Info = [
      `Name: ${data.parent1Name}`,
      `ID: ${data.parent1Id}`,
      data.parent1Address ? `Address: ${data.parent1Address}` : '',
      data.parent1Phone ? `Phone: ${data.parent1Phone}` : ''
    ].filter(Boolean)
    
    parent1Info.forEach(info => {
      pdf.text(info, leftMargin + 5, y)
      y += 6
    })
    
    // Add compressed signature for Parent 1
    if (data.parent1Signature) {
      try {
        y += 5
        pdf.text('Signature:', leftMargin + 5, y)
        y += 5
        
        // Compress signature before adding
        const compressedSig1 = await compressImage(data.parent1Signature, 200)
        pdf.addImage(compressedSig1, 'JPEG', leftMargin + 5, y, 50, 25)
        y += 30
      } catch (e) {
        console.error('Error adding parent 1 signature:', e)
        y += 10
      }
    }
    
    // Parent 2 Section (if exists)
    if (data.parent2Name) {
      y += 10
      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Parent/Guardian 2', leftMargin, y)
      pdf.setFont('helvetica', 'normal')
      y += 8
      
      pdf.setFontSize(11)
      const parent2Info = [
        `Name: ${data.parent2Name}`,
        data.parent2Id ? `ID: ${data.parent2Id}` : '',
        data.parent2Address ? `Address: ${data.parent2Address}` : '',
        data.parent2Phone ? `Phone: ${data.parent2Phone}` : ''
      ].filter(Boolean)
      
      parent2Info.forEach(info => {
        pdf.text(info, leftMargin + 5, y)
        y += 6
      })
      
      // Add compressed signature for Parent 2
      if (data.parent2Signature) {
        try {
          y += 5
          pdf.text('Signature:', leftMargin + 5, y)
          y += 5
          
          // Compress signature before adding
          const compressedSig2 = await compressImage(data.parent2Signature, 200)
          pdf.addImage(compressedSig2, 'JPEG', leftMargin + 5, y, 50, 25)
          y += 30
        } catch (e) {
          console.error('Error adding parent 2 signature:', e)
          y += 10
        }
      }
    }
    
    // Consent Declaration
    y += 10
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Consent Declaration', leftMargin, y)
    y += 8
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    
    const consentText = [
      'The undersigned parent(s)/guardian(s) hereby give full consent to Gesher Al HaNoar',
      'organization to collect, process, and use the personal information of our child for',
      'participation in the educational and support programs offered by the organization.',
      '',
      'We confirm that this information is provided voluntarily and understand its use for',
      'the benefit and advancement of our child. We acknowledge that all information will',
      'be kept strictly confidential and used solely for the purposes of treatment and',
      'educational support within the organization\'s activities.'
    ]
    
    consentText.forEach(line => {
      if (y > 270) { // Check if we need a new page
        pdf.addPage()
        y = 20
      }
      pdf.text(line, leftMargin, y)
      y += 5
    })
    
    // Hebrew consent text (simplified)
    y += 10
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(9)
    const hebrewNote = 'Original Hebrew: הסכמת הורים לעיבוד נתונים - גשר אל הנוער'
    pdf.text(hebrewNote, leftMargin, y)
    
    // Footer
    const pageHeight = pdf.internal.pageSize.getHeight()
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(128, 128, 128)
    pdf.text('This document was generated digitally by Gesher Al HaNoar Intake System', pageWidth / 2, pageHeight - 15, { align: 'center' })
    pdf.text(`Generated on: ${new Date().toLocaleString('en-US')}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
    
    // Convert to base64 with compression
    const pdfBase64 = pdf.output('datauristring', { compress: true }).split(',')[1]
    
    return pdfBase64
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate consent PDF')
  }
}

// Generate server-side PDF (for API routes)
export const generateConsentPDFServer = async (data: ConsentFormData): Promise<string> => {
  // For server-side, use the simpler version without image compression
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })
  
  let y = 20
  const pageWidth = pdf.internal.pageSize.getWidth()
  const leftMargin = 20
  
  // Title
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Consent Form - Gesher Al HaNoar', pageWidth / 2, y, { align: 'center' })
  y += 15
  
  // Reference info
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Reference: ${data.referralNumber}`, leftMargin, y)
  y += 6
  pdf.text(`Date: ${new Date(data.consentDate).toLocaleDateString('en-US')}`, leftMargin, y)
  y += 6
  pdf.text(`Student: ${data.studentName}`, leftMargin, y)
  y += 15
  
  // Parent 1
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Parent/Guardian 1', leftMargin, y)
  y += 8
  
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Name: ${data.parent1Name}`, leftMargin + 5, y)
  y += 6
  pdf.text(`ID: ${data.parent1Id}`, leftMargin + 5, y)
  y += 6
  
  if (data.parent1Address) {
    pdf.text(`Address: ${data.parent1Address}`, leftMargin + 5, y)
    y += 6
  }
  
  if (data.parent1Phone) {
    pdf.text(`Phone: ${data.parent1Phone}`, leftMargin + 5, y)
    y += 6
  }
  
  // Skip signatures in server-side version to reduce size
  y += 10
  pdf.text('[Digital Signature Recorded]', leftMargin + 5, y)
  y += 15
  
  // Parent 2 (if exists)
  if (data.parent2Name) {
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Parent/Guardian 2', leftMargin, y)
    y += 8
    
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Name: ${data.parent2Name}`, leftMargin + 5, y)
    y += 6
    
    if (data.parent2Id) {
      pdf.text(`ID: ${data.parent2Id}`, leftMargin + 5, y)
      y += 6
    }
    
    if (data.parent2Address) {
      pdf.text(`Address: ${data.parent2Address}`, leftMargin + 5, y)
      y += 6
    }
    
    if (data.parent2Phone) {
      pdf.text(`Phone: ${data.parent2Phone}`, leftMargin + 5, y)
      y += 6
    }
    
    y += 10
    pdf.text('[Digital Signature Recorded]', leftMargin + 5, y)
  }
  
  // Footer
  const pageHeight = pdf.internal.pageSize.getHeight()
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text('Generated by Gesher Al HaNoar Digital System', pageWidth / 2, pageHeight - 10, { align: 'center' })
  
  // Convert to base64 with compression
  const pdfBase64 = pdf.output('datauristring', { compress: true }).split(',')[1]
  
  return pdfBase64
}

// Helper function to format the filename
export const getConsentPDFFilename = (referralNumber: string): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `ConsentForm_${referralNumber}_${date}.pdf`
}