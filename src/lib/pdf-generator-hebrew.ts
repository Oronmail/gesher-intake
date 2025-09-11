import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

// Generate HTML content for the consent form
const generateHTMLContent = (data: ConsentFormData): string => {
  const dateStr = new Date(data.consentDate).toLocaleDateString('he-IL')
  
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;700&display=swap');
        
        body {
          font-family: 'Rubik', 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 40px;
          background: white;
          color: #333;
          direction: rtl;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .logo {
          width: 150px;
          height: auto;
          margin-bottom: 20px;
        }
        
        h1 {
          color: #2563eb;
          font-size: 28px;
          margin: 10px 0;
          font-weight: 700;
        }
        
        .subtitle {
          color: #666;
          font-size: 18px;
          margin: 5px 0;
        }
        
        .info-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          align-items: center;
        }
        
        .info-label {
          font-weight: 600;
          color: #555;
          min-width: 120px;
        }
        
        .info-value {
          flex: 1;
          color: #333;
          margin-right: 10px;
        }
        
        .parent-section {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .parent-title {
          font-size: 20px;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .signature-container {
          margin: 20px 0;
          padding: 15px;
          background: #fafafa;
          border-radius: 5px;
        }
        
        .signature-label {
          font-weight: 600;
          margin-bottom: 10px;
          color: #555;
        }
        
        .signature-image {
          max-width: 200px;
          height: auto;
          border: 1px solid #ddd;
          background: white;
          padding: 5px;
          border-radius: 4px;
        }
        
        .consent-text {
          background: #fff9e6;
          border-right: 4px solid #ffc107;
          padding: 20px;
          margin: 30px 0;
          border-radius: 5px;
        }
        
        .consent-text h3 {
          color: #d97706;
          margin-bottom: 10px;
        }
        
        .consent-text p {
          line-height: 1.8;
          color: #555;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #888;
          font-size: 12px;
        }
        
        .date-stamp {
          display: inline-block;
          background: #f0f0f0;
          padding: 5px 15px;
          border-radius: 4px;
          margin: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>טופס הסכמת הורים</h1>
        <div class="subtitle">עמותת גשר אל הנוער</div>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">מספר הפניה:</span>
          <span class="info-value">${data.referralNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">תאריך:</span>
          <span class="info-value">${dateStr}</span>
        </div>
        <div class="info-row">
          <span class="info-label">שם התלמיד/ה:</span>
          <span class="info-value"><strong>${data.studentName}</strong></span>
        </div>
      </div>
      
      <div class="parent-section">
        <div class="parent-title">הורה/אפוטרופוס 1</div>
        <div class="info-row">
          <span class="info-label">שם מלא:</span>
          <span class="info-value">${data.parent1Name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">תעודת זהות:</span>
          <span class="info-value">${data.parent1Id}</span>
        </div>
        ${data.parent1Address ? `
        <div class="info-row">
          <span class="info-label">כתובת:</span>
          <span class="info-value">${data.parent1Address}</span>
        </div>` : ''}
        ${data.parent1Phone ? `
        <div class="info-row">
          <span class="info-label">טלפון:</span>
          <span class="info-value">${data.parent1Phone}</span>
        </div>` : ''}
        
        <div class="signature-container">
          <div class="signature-label">חתימה דיגיטלית:</div>
          <img src="${data.parent1Signature}" class="signature-image" alt="חתימת הורה 1" />
        </div>
      </div>
      
      ${data.parent2Name ? `
      <div class="parent-section">
        <div class="parent-title">הורה/אפוטרופוס 2</div>
        <div class="info-row">
          <span class="info-label">שם מלא:</span>
          <span class="info-value">${data.parent2Name}</span>
        </div>
        ${data.parent2Id ? `
        <div class="info-row">
          <span class="info-label">תעודת זהות:</span>
          <span class="info-value">${data.parent2Id}</span>
        </div>` : ''}
        ${data.parent2Address ? `
        <div class="info-row">
          <span class="info-label">כתובת:</span>
          <span class="info-value">${data.parent2Address}</span>
        </div>` : ''}
        ${data.parent2Phone ? `
        <div class="info-row">
          <span class="info-label">טלפון:</span>
          <span class="info-value">${data.parent2Phone}</span>
        </div>` : ''}
        
        ${data.parent2Signature ? `
        <div class="signature-container">
          <div class="signature-label">חתימה דיגיטלית:</div>
          <img src="${data.parent2Signature}" class="signature-image" alt="חתימת הורה 2" />
        </div>` : ''}
      </div>
      ` : ''}
      
      <div class="consent-text">
        <h3>הצהרת הסכמה</h3>
        <p>
          אני/אנו החתומים מטה, הורי/אפוטרופוסים של התלמיד/ה הנ"ל, נותנים בזאת את הסכמתנו המלאה לעמותת "גשר אל הנוער" לקבל, לאסוף ולעבד את המידע האישי של ילדנו לצורך השתתפות בתוכנית החינוכית והטיפולית של העמותה.
        </p>
        <p>
          אנו מאשרים כי המידע נמסר מרצוננו החופשי וכי אנו מבינים את מטרות השימוש במידע לטובת קידום וסיוע לילדנו.
        </p>
        <p>
          ידוע לנו כי המידע יישמר בסודיות מלאה ויעשה בו שימוש אך ורק למטרות הטיפול והליווי החינוכי במסגרת פעילות העמותה.
        </p>
      </div>
      
      <div class="footer">
        <div>מסמך זה נוצר באופן דיגיטלי ממערכת ההרשמה של עמותת גשר אל הנוער</div>
        <div class="date-stamp">נוצר בתאריך: ${new Date().toLocaleString('he-IL')}</div>
        <div style="margin-top: 10px; font-size: 11px; color: #999;">
          © כל הזכויות שמורות לעמותת גשר אל הנוער
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate PDF using HTML content
export const generateConsentPDF = async (data: ConsentFormData): Promise<string> => {
  try {
    // Create a temporary container for the HTML
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '210mm' // A4 width
    container.innerHTML = generateHTMLContent(data)
    document.body.appendChild(container)
    
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    // Remove temporary container
    document.body.removeChild(container)
    
    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Calculate dimensions
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pageHeight = 297 // A4 height in mm
    let heightLeft = imgHeight
    let position = 0
    
    // Add image to PDF (handling multiple pages if needed)
    const imgData = canvas.toDataURL('image/png')
    
    if (heightLeft < pageHeight) {
      // Single page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      // Multiple pages
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
    }
    
    // Convert to base64
    const pdfBase64 = pdf.output('datauristring').split(',')[1]
    
    return pdfBase64
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate consent PDF')
  }
}

// Generate PDF using server-side approach (for API routes)
export const generateConsentPDFServer = async (data: ConsentFormData): Promise<string> => {
  try {
    // For server-side generation, we'll create a simpler PDF without HTML rendering
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Use UTF-8 encoding for text
    const encoder = new TextEncoder()
    
    // Add content with proper Unicode support
    let y = 20
    
    // Title
    pdf.setFontSize(20)
    pdf.text('Consent Form - Gesher Al HaNoar', 105, y, { align: 'center' })
    y += 15
    
    // Reference info
    pdf.setFontSize(12)
    pdf.text(`Reference: ${data.referralNumber}`, 20, y)
    y += 8
    pdf.text(`Date: ${new Date(data.consentDate).toLocaleDateString('en-US')}`, 20, y)
    y += 8
    pdf.text(`Student: ${data.studentName}`, 20, y)
    y += 15
    
    // Parent 1
    pdf.setFontSize(14)
    pdf.text('Parent/Guardian 1', 20, y)
    y += 8
    pdf.setFontSize(12)
    pdf.text(`Name: ${data.parent1Name}`, 20, y)
    y += 6
    pdf.text(`ID: ${data.parent1Id}`, 20, y)
    y += 6
    if (data.parent1Address) {
      pdf.text(`Address: ${data.parent1Address}`, 20, y)
      y += 6
    }
    if (data.parent1Phone) {
      pdf.text(`Phone: ${data.parent1Phone}`, 20, y)
      y += 6
    }
    
    // Add signature
    if (data.parent1Signature) {
      try {
        pdf.addImage(data.parent1Signature, 'PNG', 20, y + 5, 60, 30)
        y += 40
      } catch (e) {
        console.error('Error adding signature:', e)
        y += 10
      }
    }
    
    // Parent 2 (if exists)
    if (data.parent2Name) {
      y += 10
      pdf.setFontSize(14)
      pdf.text('Parent/Guardian 2', 20, y)
      y += 8
      pdf.setFontSize(12)
      pdf.text(`Name: ${data.parent2Name}`, 20, y)
      y += 6
      if (data.parent2Id) {
        pdf.text(`ID: ${data.parent2Id}`, 20, y)
        y += 6
      }
      if (data.parent2Address) {
        pdf.text(`Address: ${data.parent2Address}`, 20, y)
        y += 6
      }
      if (data.parent2Phone) {
        pdf.text(`Phone: ${data.parent2Phone}`, 20, y)
        y += 6
      }
      
      if (data.parent2Signature) {
        try {
          pdf.addImage(data.parent2Signature, 'PNG', 20, y + 5, 60, 30)
        } catch (e) {
          console.error('Error adding signature:', e)
        }
      }
    }
    
    // Footer
    pdf.setFontSize(10)
    pdf.text('This document was generated digitally', 105, 280, { align: 'center' })
    pdf.text(`Created: ${new Date().toLocaleString('en-US')}`, 105, 285, { align: 'center' })
    
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