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

// Hebrew font configuration for jsPDF
const addHebrewFont = (pdf: jsPDF) => {
  // We'll use the default font with RTL text direction
  // For production, you might want to embed a Hebrew font
  pdf.setFont('helvetica')
}

export const generateConsentPDF = async (data: ConsentFormData): Promise<string> => {
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Configure for Hebrew
    addHebrewFont(pdf)
    
    // Page margins
    const leftMargin = 20
    const rightMargin = 20
    const pageWidth = pdf.internal.pageSize.getWidth()
    const contentWidth = pageWidth - leftMargin - rightMargin
    let yPosition = 20

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    // For Hebrew text, we'll reverse it for proper RTL display
    const title = 'טופס ויתור סודיות - גשר אל הנוער'
    pdf.text(title.split('').reverse().join(''), pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Date and Reference Number
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const dateStr = new Date(data.consentDate).toLocaleDateString('he-IL')
    pdf.text(`תאריך: ${dateStr}`, pageWidth - rightMargin, yPosition, { align: 'right' })
    yPosition += 8
    pdf.text(`מספר הפניה: ${data.referralNumber}`, pageWidth - rightMargin, yPosition, { align: 'right' })
    yPosition += 15

    // Student Name
    pdf.setFont('helvetica', 'bold')
    pdf.text('שם התלמיד/ה:', pageWidth - rightMargin, yPosition, { align: 'right' })
    pdf.setFont('helvetica', 'normal')
    pdf.text(data.studentName, pageWidth - rightMargin - 30, yPosition, { align: 'right' })
    yPosition += 15

    // Parent 1 Section
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('הורה/אפוטרופוס 1', pageWidth - rightMargin, yPosition, { align: 'right' })
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    
    // Parent 1 Details
    pdf.text(`שם: ${data.parent1Name}`, pageWidth - rightMargin, yPosition, { align: 'right' })
    yPosition += 8
    pdf.text(`ת.ז.: ${data.parent1Id}`, pageWidth - rightMargin, yPosition, { align: 'right' })
    yPosition += 8
    
    if (data.parent1Address) {
      pdf.text(`כתובת: ${data.parent1Address}`, pageWidth - rightMargin, yPosition, { align: 'right' })
      yPosition += 8
    }
    
    if (data.parent1Phone) {
      pdf.text(`טלפון: ${data.parent1Phone}`, pageWidth - rightMargin, yPosition, { align: 'right' })
      yPosition += 8
    }

    // Parent 1 Signature
    yPosition += 5
    pdf.text('חתימה:', pageWidth - rightMargin, yPosition, { align: 'right' })
    if (data.parent1Signature) {
      try {
        // Add signature image (base64)
        pdf.addImage(data.parent1Signature, 'PNG', leftMargin, yPosition + 5, 60, 30)
      } catch (e) {
        console.error('Error adding parent 1 signature:', e)
      }
    }
    yPosition += 45

    // Parent 2 Section (if exists)
    if (data.parent2Name) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('הורה/אפוטרופוס 2', pageWidth - rightMargin, yPosition, { align: 'right' })
      yPosition += 10

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      
      pdf.text(`שם: ${data.parent2Name}`, pageWidth - rightMargin, yPosition, { align: 'right' })
      yPosition += 8
      
      if (data.parent2Id) {
        pdf.text(`ת.ז.: ${data.parent2Id}`, pageWidth - rightMargin, yPosition, { align: 'right' })
        yPosition += 8
      }
      
      if (data.parent2Address) {
        pdf.text(`כתובת: ${data.parent2Address}`, pageWidth - rightMargin, yPosition, { align: 'right' })
        yPosition += 8
      }
      
      if (data.parent2Phone) {
        pdf.text(`טלפון: ${data.parent2Phone}`, pageWidth - rightMargin, yPosition, { align: 'right' })
        yPosition += 8
      }

      // Parent 2 Signature
      if (data.parent2Signature) {
        yPosition += 5
        pdf.text('חתימה:', pageWidth - rightMargin, yPosition, { align: 'right' })
        try {
          pdf.addImage(data.parent2Signature, 'PNG', leftMargin, yPosition + 5, 60, 30)
        } catch (e) {
          console.error('Error adding parent 2 signature:', e)
        }
        yPosition += 45
      }
    }

    // Consent Text
    yPosition += 10
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const consentText = 'אני/אנו החתומים מטה נותנים בזאת את הסכמתנו לעמותת גשר אל הנוער לקבל ולעבד את הנתונים האישיים של ילדנו לצורך השתתפות בתוכנית החינוכית.'
    
    // Wrap text for proper display
    const lines = pdf.splitTextToSize(consentText, contentWidth)
    lines.forEach((line: string) => {
      pdf.text(line, pageWidth - rightMargin, yPosition, { align: 'right' })
      yPosition += 7
    })

    // Footer
    yPosition = pdf.internal.pageSize.getHeight() - 20
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    pdf.text('מסמך זה נוצר באופן אוטומטי ממערכת ההרשמה הדיגיטלית', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5
    pdf.text(`נוצר בתאריך: ${new Date().toLocaleString('he-IL')}`, pageWidth / 2, yPosition, { align: 'center' })

    // Convert to base64
    const pdfBase64 = pdf.output('datauristring').split(',')[1]
    
    return pdfBase64
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate consent PDF')
  }
}

// Helper function to format the filename
export const getConsentPDFFilename = (referralNumber: string): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `ConsentForm_${referralNumber}_${date}.pdf`
}