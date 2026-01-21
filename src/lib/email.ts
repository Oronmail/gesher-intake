import nodemailer from 'nodemailer';

// Create Gmail transporter as primary email service
const createGmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('[EMAIL] Gmail credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

interface SendConsentEmailParams {
  parentEmail: string;
  parentPhone: string;
  counselorName: string;
  schoolName: string;
  referralNumber: string;
  consentUrl: string;
  organizationName?: string;
}

interface SendCounselorNotificationParams {
  counselorEmail: string;
  counselorName: string;
  parentNames: string;
  studentName: string;
  studentFormUrl: string;
  referralNumber: string;
  organizationName?: string;
  isManualConsent?: boolean; // Flag to use different text for manual consent
}

export async function sendConsentEmail({
  parentEmail,
  counselorName,
  schoolName,
  referralNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
  consentUrl,
  organizationName = 'גשר אל הנוער',
}: SendConsentEmailParams) {
  console.log(`[EMAIL] Attempting to send consent email to: ${parentEmail}`);

  const transporter = createGmailTransporter();

  if (!transporter) {
    console.log('[EMAIL] Gmail credentials not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  // Generate unique message ID using gmail domain to improve trust
  const messageId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}@gmail.com`;

  // Plain text version for better deliverability
  const textContent = `
    ${organizationName} - טופס ויתור סודיות

    שלום,

    ${counselorName} מבית ספר ${schoolName} הפנה/תה את ילדכם לתוכנית "${organizationName}".

    לצורך המשך הטיפול בבקשה, אנו זקוקים להסכמתכם לויתור סודיות לימודית/פסיכולוגית/רפואית.

    לחצו על הקישור למילוי טופס ויתור הסודיות:
    ${consentUrl}

    זהו מייל אוטומטי. אנא אל תשיבו למייל זה.
    לשאלות ובירורים, צרו קשר עם נציג/ת בית הספר.
  `.trim();

  try {
    const result = await transporter.sendMail({
      from: `${organizationName} <${process.env.GMAIL_USER}>`, // Include Hebrew name to match Gmail settings
      to: parentEmail,
      subject: `טופס ויתור סודיות - ${organizationName}`,
      text: textContent, // Plain text version
      replyTo: `${organizationName} <${process.env.GMAIL_USER}>`,
      messageId: messageId,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Gesher-Youth-Intake-System',
        'Importance': 'Normal',
        'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=Unsubscribe>`,
        'Precedence': 'bulk'
      },
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${organizationName}</h1>
          </div>
          <h2 style="color: #2563eb;">מועמדות במסגרת עמותת ״${organizationName}״</h2>

          <p>שלום,</p>

          <p>${counselorName} מבית ספר ${schoolName} הפנה/תה את ילדכם לתוכנית "${organizationName}".</p>

          <p>לצורך המשך הטיפול בבקשה, אנו זקוקים להסכמתכם לויתור סודיות לימודית/פסיכולוגית/רפואית.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>לחצו על הקישור למילוי טופס ויתור הסודיות:</p>
            <a href="${consentUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              מילוי טופס
            </a>
          </div>
          
          <p style="margin-top: 20px;">או העתיקו את הקישור:</p>
          <p style="background: #f9fafb; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${consentUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            זהו מייל אוטומטי. אנא אל תשיבו למייל זה.<br>
            לשאלות ובירורים, צרו קשר עם נציג/ת בית הספר.
          </p>
        </div>
      `
    });
    
    console.log(`[EMAIL] ✅ Consent email sent successfully via Gmail to ${parentEmail}`);
    console.log('[EMAIL] Gmail Message ID:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[EMAIL] Failed to send consent email to ${parentEmail}:`, error);
    console.error('[EMAIL] Exception details:', error instanceof Error ? error.stack : error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendCounselorNotification({
  counselorEmail,
  counselorName,
  parentNames,
  studentName,
  studentFormUrl,
  referralNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
  organizationName = 'גשר אל הנוער',
  isManualConsent = false,
}: SendCounselorNotificationParams) {
  console.log(`[EMAIL] Attempting to send counselor notification to: ${counselorEmail} (manual consent: ${isManualConsent})`);

  const transporter = createGmailTransporter();

  if (!transporter) {
    console.log('[EMAIL] Gmail credentials not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  // Generate unique message ID using gmail domain to improve trust
  const messageId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}@gmail.com`;

  // Different text for manual consent vs digital consent
  const emailSubject = isManualConsent
    ? `בקשה נוצרה בהצלחה - ${studentName}`
    : `הסכמת הורים התקבלה - ${studentName}`;

  const emailTitle = isManualConsent
    ? '✅ הבקשה נוצרה בהצלחה'
    : '✅ הסכמת הורים התקבלה בהצלחה';

  const emailDescription = isManualConsent
    ? `הבקשה עבור ${studentName} נוצרה בהצלחה עם טופס הסכמה פיזי.`
    : `ההורים ${parentNames} חתמו על טופס ההסכמה.`;

  const emailInstruction = isManualConsent
    ? 'להשלמת הרישום, יש למלא את טופס נתוני התלמיד/ה:'
    : 'כעת ניתן למלא את טופס נתוני התלמיד/ה:';

  // Plain text version for better deliverability
  const textContent = `
    ${emailTitle.replace('✅ ', '')}

    שלום ${counselorName},

    ${emailDescription}

    שם התלמיד/ה: ${studentName}

    ${emailInstruction}
    ${studentFormUrl}

    זהו מייל אוטומטי מהמערכת.
  `.trim();

  try {
    const result = await transporter.sendMail({
      from: `${organizationName} <${process.env.GMAIL_USER}>`, // Include Hebrew name to match Gmail settings
      to: counselorEmail,
      subject: emailSubject,
      text: textContent, // Plain text version
      replyTo: `${organizationName} <${process.env.GMAIL_USER}>`,
      messageId: messageId,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Gesher-Youth-Intake-System',
        'Importance': 'Normal',
        'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=Unsubscribe>`,
        'Precedence': 'bulk'
      },
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${organizationName}</h1>
          </div>
          <h2 style="color: #10b981;">${emailTitle}</h2>

          <p>שלום ${counselorName},</p>

          <p>${emailDescription}</p>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>שם התלמיד/ה:</strong> ${studentName}</p>
            <p>${emailInstruction}</p>
            <a href="${studentFormUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              מילוי נתוני תלמיד/ה
            </a>
          </div>

          <p style="margin-top: 20px;">או העתיקו את הקישור:</p>
          <p style="background: #f9fafb; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${studentFormUrl}
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 14px;">
            זהו מייל אוטומטי מהמערכת.
          </p>
        </div>
      `
    });

    console.log(`[EMAIL] ✅ Counselor notification sent successfully via Gmail to ${counselorEmail}`);
    console.log('[EMAIL] Gmail Message ID:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[EMAIL] Failed to send counselor notification to ${counselorEmail}:`, error);
    console.error('[EMAIL] Exception details:', error instanceof Error ? error.stack : error);
    return { success: false, error: 'Failed to send email' };
  }
}

interface SendHouseManagerNotificationParams {
  managerEmail: string;
  managerName: string;
  warmHomeDestination: string;
  studentName: string;
  schoolName: string;
  counselorName: string;
  referralNumber: string;
  salesforceRecordId: string | null;
  notificationType: 'new_referral' | 'registration_complete';
  organizationName?: string;
}

export async function sendHouseManagerNotification({
  managerEmail,
  managerName,
  warmHomeDestination,
  studentName,
  schoolName,
  counselorName,
  referralNumber,
  salesforceRecordId,
  notificationType,
  organizationName = 'גשר אל הנוער',
}: SendHouseManagerNotificationParams) {
  console.log(`[EMAIL] Attempting to send house manager notification to: ${managerEmail} (type: ${notificationType})`);

  const transporter = createGmailTransporter();

  if (!transporter) {
    console.log('[EMAIL] Gmail credentials not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  // Generate unique message ID
  const messageId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}@gmail.com`;

  // Build Salesforce link
  const sfBaseUrl = process.env.SALESFORCE_INSTANCE_URL || 'https://geh--partialsb.sandbox.my.salesforce.com';
  const sfRecordLink = salesforceRecordId
    ? `${sfBaseUrl}/lightning/r/Registration_Request__c/${salesforceRecordId}/view`
    : null;

  // Different content based on notification type
  const isNewReferral = notificationType === 'new_referral';

  const emailSubject = isNewReferral
    ? `הפניה חדשה התקבלה - ${studentName} (${warmHomeDestination})`
    : `רישום הושלם - ${studentName} (${warmHomeDestination})`;

  const emailTitle = isNewReferral
    ? '📋 הפניה חדשה התקבלה'
    : '✅ רישום תלמיד/ה הושלם';

  const emailDescription = isNewReferral
    ? `התקבלה הפניה חדשה עבור ${studentName} מבית ספר ${schoolName}.`
    : `הרישום עבור ${studentName} מבית ספר ${schoolName} הושלם בהצלחה.`;

  const statusText = isNewReferral
    ? 'ממתין להשלמת נתוני תלמיד/ה'
    : 'נתוני התלמיד/ה הוזנו במלואם';

  // Plain text version
  const textContent = `
    ${emailTitle}

    שלום ${managerName},

    ${emailDescription}

    פרטי ההפניה:
    - שם התלמיד/ה: ${studentName}
    - בית ספר: ${schoolName}
    - נציג/ת בית הספר: ${counselorName}
    - בית חם: ${warmHomeDestination}
    - מספר הפניה: ${referralNumber}
    - סטטוס: ${statusText}

    ${sfRecordLink ? `צפייה ברשומה ב-Salesforce: ${sfRecordLink}` : ''}

    זהו מייל אוטומטי מהמערכת.
  `.trim();

  try {
    const result = await transporter.sendMail({
      from: `${organizationName} <${process.env.GMAIL_USER}>`,
      to: managerEmail,
      subject: emailSubject,
      text: textContent,
      replyTo: `${organizationName} <${process.env.GMAIL_USER}>`,
      messageId: messageId,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Gesher-Youth-Intake-System',
        'Importance': 'Normal',
        'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=Unsubscribe>`,
        'Precedence': 'bulk'
      },
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, ${isNewReferral ? '#3b82f6' : '#10b981'} 0%, ${isNewReferral ? '#6366f1' : '#059669'} 100%); border-radius: 8px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${organizationName}</h1>
          </div>
          <h2 style="color: ${isNewReferral ? '#3b82f6' : '#10b981'};">${emailTitle}</h2>

          <p>שלום ${managerName},</p>

          <p>${emailDescription}</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">פרטי ההפניה:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>שם התלמיד/ה:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>בית ספר:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${schoolName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>נציג/ת בית הספר:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${counselorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>בית חם:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${warmHomeDestination}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>מספר הפניה:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${referralNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>סטטוס:</strong></td>
                <td style="padding: 8px 0; color: ${isNewReferral ? '#f59e0b' : '#10b981'}; font-weight: bold;">${statusText}</td>
              </tr>
            </table>
          </div>

          ${sfRecordLink ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${sfRecordLink}" style="display: inline-block; background: ${isNewReferral ? '#3b82f6' : '#10b981'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              צפייה ברשומה ב-Salesforce
            </a>
          </div>
          ` : ''}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 14px;">
            זהו מייל אוטומטי מהמערכת.
          </p>
        </div>
      `
    });

    console.log(`[EMAIL] ✅ House manager notification sent successfully to ${managerEmail}`);
    console.log('[EMAIL] Gmail Message ID:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[EMAIL] Failed to send house manager notification to ${managerEmail}:`, error);
    console.error('[EMAIL] Exception details:', error instanceof Error ? error.stack : error);
    return { success: false, error: 'Failed to send email' };
  }
}