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
  organizationName?: string
}

/**
 * Generate HTML content for the consent form with visual timestamp
 */
const generateConsentHTML = (data: ConsentFormData): string => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  const signedDate = new Date(data.consentDate)
  const dateStr = formatDate(signedDate)
  const timeStr = formatTime(signedDate)
  const organizationName = data.organizationName || 'גשר אל הנוער'
  
  return `
    <div id="consent-form-capture" style="
      width: 800px;
      background: white;
      font-family: 'Arial', 'Helvetica Neue', sans-serif;
      direction: rtl;
      padding: 40px;
      position: relative;
      box-sizing: border-box;
    ">
      <!-- Timestamp Badge -->
      <div style="
        position: absolute;
        top: 20px;
        left: 20px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 13px;
        font-weight: bold;
        z-index: 10;
        border: 2px solid white;
      ">
        <div>נחתם דיגיטלית</div>
        <div style="font-size: 11px; margin-top: 4px; opacity: 0.95;">
          ${dateStr} | ${timeStr}
        </div>
        <div style="font-size: 10px; margin-top: 2px; opacity: 0.9;">
          ${data.referralNumber}
        </div>
      </div>
      
      <!-- Logo and Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="
          display: inline-block;
          padding: 20px 40px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 12px;
          margin-bottom: 20px;
        ">
          <h1 style="
            color: #2563eb;
            margin: 0;
            font-size: 32px;
            font-weight: bold;
          ">${organizationName}</h1>
          <div style="
            color: #6b7280;
            font-size: 18px;
            margin-top: 8px;
          ">טופס הסכמת הורים</div>
        </div>
      </div>
      
      <!-- Reference Info Box -->
      <div style="
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div style="font-weight: bold; color: #374151;">מספר הפניה:</div>
          <div style="color: #111827; font-family: monospace;">${data.referralNumber}</div>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div style="font-weight: bold; color: #374151;">שם התלמיד/ה:</div>
          <div style="color: #111827; font-size: 18px; font-weight: bold;">${data.studentName}</div>
        </div>
      </div>
      
      <!-- Parent 1 Section -->
      <div style="
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      ">
        <h2 style="
          color: #1f2937;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        ">הורה/אפוטרופוס 1</h2>
        
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">שם מלא:</span>
          <span style="color: #111827;">${data.parent1Name}</span>
        </div>
        
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">תעודת זהות:</span>
          <span style="color: #111827;">${data.parent1Id}</span>
        </div>
        
        ${data.parent1Address ? `
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">כתובת:</span>
          <span style="color: #111827;">${data.parent1Address}</span>
        </div>` : ''}
        
        ${data.parent1Phone ? `
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">טלפון:</span>
          <span style="color: #111827;">${data.parent1Phone}</span>
        </div>` : ''}
        
        <div style="
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          margin-top: 15px;
        ">
          <div style="font-weight: 600; color: #6b7280; margin-bottom: 10px;">חתימה דיגיטלית:</div>
          <img src="${data.parent1Signature}" style="
            max-width: 250px;
            height: auto;
            border: 2px solid #d1d5db;
            background: white;
            padding: 8px;
            border-radius: 4px;
          " alt="חתימת הורה 1" />
        </div>
      </div>
      
      <!-- Parent 2 Section (if exists) -->
      ${data.parent2Name ? `
      <div style="
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      ">
        <h2 style="
          color: #1f2937;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        ">הורה/אפוטרופוס 2</h2>
        
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">שם מלא:</span>
          <span style="color: #111827;">${data.parent2Name}</span>
        </div>
        
        ${data.parent2Id ? `
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">תעודת זהות:</span>
          <span style="color: #111827;">${data.parent2Id}</span>
        </div>` : ''}
        
        ${data.parent2Address ? `
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">כתובת:</span>
          <span style="color: #111827;">${data.parent2Address}</span>
        </div>` : ''}
        
        ${data.parent2Phone ? `
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #6b7280; margin-left: 10px;">טלפון:</span>
          <span style="color: #111827;">${data.parent2Phone}</span>
        </div>` : ''}
        
        ${data.parent2Signature ? `
        <div style="
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          margin-top: 15px;
        ">
          <div style="font-weight: 600; color: #6b7280; margin-bottom: 10px;">חתימה דיגיטלית:</div>
          <img src="${data.parent2Signature}" style="
            max-width: 250px;
            height: auto;
            border: 2px solid #d1d5db;
            background: white;
            padding: 8px;
            border-radius: 4px;
          " alt="חתימת הורה 2" />
        </div>` : ''}
      </div>
      ` : ''}
      
      <!-- Consent Declaration -->
      <div style="
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-right: 4px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      ">
        <h3 style="
          color: #92400e;
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 18px;
        ">הצהרת הסכמה</h3>
        <p style="
          line-height: 1.8;
          color: #78350f;
          margin: 0;
          font-size: 15px;
        ">
          אני מאפשר/ת להנהלת "${organizationName}" לקבל מביה"ס/ רווחה/ גורם מטפל אחר כל מידע
          לימודי/פסיכולוגי/רפואי על בני/ביתי. אנו מוותרים בזאת על סודיות לגבי המידע הרלוונטי.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 2px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
      ">
        <div>מסמך זה נוצר באופן דיגיטלי במערכת ההרשמה של ${organizationName}</div>
        <div style="margin-top: 5px;">
          © כל הזכויות שמורות ל${organizationName}
        </div>
      </div>
    </div>
  `
}

/**
 * Generate consent form as PNG image using html2canvas
 */
export const generateConsentImage = async (data: ConsentFormData): Promise<string> => {
  try {
    // Create a temporary container for the HTML
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '-9999px'
    container.style.zIndex = '-1000'
    container.innerHTML = generateConsentHTML(data)
    document.body.appendChild(container)
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Find the form element
    const formElement = container.querySelector('#consent-form-capture') as HTMLElement
    
    if (!formElement) {
      throw new Error('Form element not found')
    }
    
    // Convert HTML to canvas with high quality
    const canvas = await html2canvas(formElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      windowWidth: 800,
      onclone: (clonedDoc) => {
        // Ensure Hebrew text renders properly in the clone
        const clonedElement = clonedDoc.querySelector('#consent-form-capture') as HTMLElement
        if (clonedElement) {
          clonedElement.style.fontFamily = 'Arial, sans-serif'
        }
      }
    })
    
    // Remove temporary container
    document.body.removeChild(container)
    
    // Convert canvas to base64 PNG
    const imageBase64 = canvas.toDataURL('image/png', 0.95)
    
    // Return just the base64 part (without data:image/png;base64, prefix)
    return imageBase64.split(',')[1]
    
  } catch (error) {
    console.error('Error generating consent image:', error)
    throw new Error('Failed to generate consent image')
  }
}

/**
 * Generate consent form HTML for storage (without rendering)
 */
export const generateConsentHTMLForStorage = (data: ConsentFormData): string => {
  // Return the full HTML with inline styles for storage
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>טופס הסכמת הורים - ${data.referralNumber}</title>
</head>
<body style="margin: 0; padding: 0; background: white;">
  ${generateConsentHTML(data)}
</body>
</html>`
}

/**
 * Compress image to reduce size if needed
 */
export const compressImage = async (base64String: string, maxSizeKB: number = 500): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      const maxDimension = 1200 // Maximum width or height
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension
          width = maxDimension
        } else {
          width = (width / height) * maxDimension
          height = maxDimension
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Try different quality levels to get under maxSizeKB
      let quality = 0.9
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      
      while (compressedBase64.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1
        compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      }
      
      resolve(compressedBase64.split(',')[1])
    }
    
    img.onerror = () => resolve(base64String) // Return original if error
    img.src = `data:image/png;base64,${base64String}`
  })
}

/**
 * Get filename for the consent image
 */
export const getConsentImageFilename = (referralNumber: string): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `ConsentForm_${referralNumber}_${date}.png`
}