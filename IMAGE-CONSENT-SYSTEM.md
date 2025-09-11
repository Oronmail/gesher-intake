# Image-Based Consent System Documentation

## Overview

The Gesher intake system uses PNG image generation instead of PDFs for consent forms. This approach was implemented to solve critical issues with Hebrew text rendering and digital signature display that were present in the original PDF solution.

## Background

### The Problem with PDFs
When we initially implemented PDF generation using jsPDF, we encountered several critical issues:

1. **Hebrew Text Gibberish**: jsPDF doesn't properly support Hebrew fonts, resulting in unreadable text
2. **RTL Layout Issues**: Right-to-left text direction wasn't handled correctly
3. **Black Square Signatures**: Base64 signature images appeared as black rectangles
4. **Large File Sizes**: PDFs with embedded images exceeded API payload limits (413 errors)
5. **Font Loading Issues**: External Hebrew fonts blocked by CSP policies

### The Image Solution
We replaced PDF generation with html2canvas to create PNG images of the consent forms. This approach:
- Renders Hebrew text perfectly using system fonts
- Preserves digital signatures as they appear in the browser
- Creates smaller files through compression
- Works universally across all platforms
- Allows for visual timestamp badges

## Technical Implementation

### Core Components

#### 1. Image Generator (`src/lib/consent-image-generator.ts`)

The main module that handles image generation:

```typescript
export const generateConsentImage = async (data: ConsentFormData): Promise<string>
export const generateConsentHTMLForStorage = (data: ConsentFormData): string
export const compressImage = async (base64String: string, maxSizeKB?: number): Promise<string>
export const getConsentImageFilename = (referralNumber: string): string
```

#### 2. HTML Template Generation

The system creates a styled HTML template with:
- Organization branding and logo
- Visual timestamp badge (top-left corner)
- Parent and student information
- Digital signature display
- Legal consent declaration

#### 3. Image Generation Process

```typescript
// 1. Create temporary HTML container
const container = document.createElement('div')
container.innerHTML = generateConsentHTML(data)
document.body.appendChild(container)

// 2. Convert to canvas with html2canvas
const canvas = await html2canvas(formElement, {
  scale: 2,              // High quality
  useCORS: true,         // Allow cross-origin images
  backgroundColor: '#ffffff',
  width: 800            // Fixed width for consistency
})

// 3. Convert to base64 PNG
const imageBase64 = canvas.toDataURL('image/png', 0.95)

// 4. Clean up and return
document.body.removeChild(container)
return imageBase64.split(',')[1]
```

### Visual Timestamp Badge

Every consent form includes a timestamp badge showing:
- "נחתם דיגיטלית" (Digitally Signed)
- Date in format: DD/MM/YYYY
- Time in format: HH:MM:SS
- Unique referral number

Badge styling:
```css
position: absolute;
top: 20px;
left: 20px;
background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
color: white;
padding: 12px 20px;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
```

### Triple Storage Strategy

The system implements three layers of data storage:

1. **PNG Image**: Primary visual record
   - Stored as ContentDocument in Salesforce
   - Includes timestamp badge for authenticity
   - Compressed to optimize size

2. **HTML Backup**: Complete HTML
   - Stored in `Consent_HTML__c` field
   - Can be re-rendered if needed
   - Preserves all styling and content

3. **Structured Fields**: Individual data fields
   - Parent names, IDs, signatures stored separately
   - Enables queries and reporting
   - Maintains data integrity

## Integration with Salesforce

### ContentDocument Upload

The system uploads consent images to Salesforce using the ContentDocument API:

```typescript
async uploadConsentImage(registrationId: string, imageBase64: string, filename: string) {
  // 1. Create ContentVersion
  const contentVersion = await this.createRecord('ContentVersion', {
    Title: filename,
    PathOnClient: filename,
    VersionData: imageBase64,
    FirstPublishLocationId: registrationId
  })
  
  // 2. Link to Registration Request
  // Automatically handled by FirstPublishLocationId
}
```

### Field Storage

In addition to the image, the system stores:
- `Consent_HTML__c`: Full HTML backup
- `Parent1_Signature_Display__c`: HTML-wrapped signature for display
- `Parent2_Signature_Display__c`: Second parent signature if provided
- Standard fields for all form data

## Configuration

### CSP Headers

The middleware was updated to allow required resources:

```typescript
'Content-Security-Policy': `
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com;
  img-src 'self' data: blob: https:;
`
```

### Dependencies

Required packages:
```json
{
  "html2canvas": "^1.4.1",
  "react-signature-canvas": "^1.0.6"
}
```

## Testing

### Test Files

1. **test-consent-image.html**
   - Standalone HTML file for testing image generation
   - Includes sample Hebrew text and mock signatures
   - Tests without running the full application

2. **test-workflow.js**
   - Complete workflow testing guide
   - Step-by-step checklist for verification
   - Troubleshooting tips

### Verification Steps

1. Submit counselor form
2. Open parent consent URL
3. Add digital signatures
4. Check browser console for "Consent image generated successfully"
5. Verify in Salesforce:
   ```bash
   sf data query --query "SELECT Id, Name, Consent_HTML__c FROM Registration_Request__c ORDER BY CreatedDate DESC LIMIT 1" -o gesher-sandbox
   ```

## Troubleshooting

### Common Issues and Solutions

#### Hebrew Text Appears as Gibberish
**Cause**: Font encoding issues
**Solution**: 
- Ensure html2canvas is loaded properly
- Set font-family to Arial or system font
- Check HTML meta charset is UTF-8

#### Signatures Show as Black Squares
**Cause**: Invalid base64 data or CORS issues
**Solution**:
- Verify signature data starts with `data:image/png;base64,`
- Add `useCORS: true` to html2canvas options
- Check signatures aren't empty strings

#### Image File Too Large
**Cause**: High resolution or uncompressed images
**Solution**:
- Use `compressImage()` function
- Reduce canvas scale factor
- Convert to JPEG with quality adjustment

#### Timestamp Badge Not Showing
**Cause**: CSS positioning issues
**Solution**:
- Ensure parent container has `position: relative`
- Check z-index values
- Verify badge HTML is included in template

#### CSP Blocking Resources
**Cause**: Strict Content Security Policy
**Solution**:
- Update middleware.ts to allow required domains
- Add fonts.googleapis.com and fonts.gstatic.com
- Include Vercel scripts in CSP

## Benefits Over PDF

1. **Perfect Hebrew Rendering**: System fonts render Hebrew correctly
2. **Signature Preservation**: Digital signatures display as intended
3. **Smaller Files**: Compressed PNGs are smaller than PDFs with images
4. **Universal Support**: PNG images work everywhere
5. **Visual Authenticity**: Timestamp badges add verification
6. **Faster Generation**: HTML to image is faster than PDF creation
7. **Better Debugging**: Can inspect HTML before conversion

## Future Enhancements

Potential improvements to consider:
- WebP format for even smaller files
- Watermark overlay for additional security
- QR code with verification link
- Multiple language support in timestamp
- Batch generation for multiple forms
- Template customization options

## Code Examples

### Basic Usage

```typescript
import { generateConsentImage, getConsentImageFilename } from '@/lib/consent-image-generator'

// Generate consent image
const imageBase64 = await generateConsentImage({
  referralNumber: 'REF-202511-001',
  studentName: 'דוד ישראלי',
  parent1Name: 'יעקב ישראלי',
  parent1Id: '123456789',
  parent1Signature: signatureDataUrl,
  consentDate: new Date()
})

// Get filename
const filename = getConsentImageFilename('REF-202511-001')
// Returns: ConsentForm_REF-202511-001_20251111.png

// Upload to Salesforce
await salesforce.uploadConsentImage(recordId, imageBase64, filename)
```

### HTML Backup Storage

```typescript
// Generate HTML for backup
const htmlContent = generateConsentHTMLForStorage(formData)

// Store in Salesforce
await salesforce.updateRecord('Registration_Request__c', recordId, {
  Consent_HTML__c: htmlContent
})
```

## Conclusion

The image-based consent system provides a robust, reliable solution for capturing and storing parental consent forms with proper Hebrew text and digital signature support. The triple storage strategy ensures data integrity while the visual timestamp adds an extra layer of authenticity to the digital consent process.