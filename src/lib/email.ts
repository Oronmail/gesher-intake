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
}

interface SendCounselorNotificationParams {
  counselorEmail: string;
  counselorName: string;
  parentNames: string;
  studentName: string;
  studentFormUrl: string;
  referralNumber: string;
}

export async function sendConsentEmail({
  parentEmail,
  counselorName, // eslint-disable-line @typescript-eslint/no-unused-vars
  schoolName,
  referralNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
  consentUrl,
}: SendConsentEmailParams) {
  console.log(`[EMAIL] Attempting to send consent email to: ${parentEmail}`);
  
  const transporter = createGmailTransporter();
  
  if (!transporter) {
    console.log('[EMAIL] Gmail credentials not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  // Generate unique message ID
  const messageId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}@gesher-intake.vercel.app`;
  
  // Plain text version for better deliverability
  const textContent = `
    גשר אל הנוער - טופס ויתור סודיות
    
    שלום,
    
    יועץ משפחה מבית ספר ${schoolName} הפנה את ילדכם לתוכנית "גשר אל הנוער".
    
    לצורך המשך הטיפול בבקשה, אנו זקוקים להסכמתכם לויתור סודיות לימודית/פסיכולוגית/רפואית.
    
    לחצו על הקישור למילוי טופס ויתור הסודיות:
    ${consentUrl}
    
    זהו מייל אוטומטי. אנא אל תשיבו למייל זה.
    לשאלות ובירורים, צרו קשר עם היועצ/ת החינוכי/ת.
  `.trim();

  try {
    const result = await transporter.sendMail({
      from: `גשר אל הנוער <${process.env.GMAIL_USER}>`, // Include Hebrew name to match Gmail settings
      to: parentEmail,
      subject: `טופס ויתור סודיות - גשר אל הנוער`,
      text: textContent, // Plain text version
      replyTo: `גשר אל הנוער <${process.env.GMAIL_USER}>`,
      messageId: messageId,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://gesher-intake.vercel.app/logo.png" alt="גשר אל הנוער" style="height: 80px; width: auto;">
          </div>
          <h2 style="color: #2563eb;">מועמדות במסגרת עמותת ״גשר אל הנוער״</h2>
          
          <p>שלום,</p>
          
          <p>יועץ משפחה מבית ספר ${schoolName} הפנה את ילדכם לתוכנית "גשר אל הנוער".</p>
          
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
            לשאלות ובירורים, צרו קשר עם היועצ/ת החינוכי/ת.
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
}: SendCounselorNotificationParams) {
  console.log(`[EMAIL] Attempting to send counselor notification to: ${counselorEmail}`);
  
  const transporter = createGmailTransporter();
  
  if (!transporter) {
    console.log('[EMAIL] Gmail credentials not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  // Generate unique message ID
  const messageId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}@gesher-intake.vercel.app`;
  
  // Plain text version for better deliverability
  const textContent = `
    הסכמת הורים התקבלה בהצלחה
    
    שלום ${counselorName},
    
    ההורים ${parentNames} חתמו על טופס ההסכמה.
    
    שם התלמיד/ה: ${studentName}
    
    כעת ניתן למלא את טופס נתוני התלמיד/ה:
    ${studentFormUrl}
    
    זהו מייל אוטומטי מהמערכת.
  `.trim();

  try {
    const result = await transporter.sendMail({
      from: `גשר אל הנוער <${process.env.GMAIL_USER}>`, // Include Hebrew name to match Gmail settings
      to: counselorEmail,
      subject: `הסכמת הורים התקבלה - ${studentName}`,
      text: textContent, // Plain text version
      replyTo: `גשר אל הנוער <${process.env.GMAIL_USER}>`,
      messageId: messageId,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://gesher-intake.vercel.app/logo.png" alt="גשר אל הנוער" style="height: 80px; width: auto;">
          </div>
          <h2 style="color: #10b981;">✅ הסכמת הורים התקבלה בהצלחה</h2>
          
          <p>שלום ${counselorName},</p>
          
          <p>ההורים ${parentNames} חתמו על טופס ההסכמה.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>שם התלמיד/ה:</strong> ${studentName}</p>
            <p>כעת ניתן למלא את טופס נתוני התלמיד/ה:</p>
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