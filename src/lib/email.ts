import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
  studentFormUrl: string;
  referralNumber: string;
}

export async function sendConsentEmail({
  parentEmail,
  counselorName,
  schoolName,
  referralNumber,
  consentUrl,
}: SendConsentEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'גשר אל הנוער <noreply@gesher-intake.vercel.app>',
      to: parentEmail,
      subject: `טופס הסכמה - גשר אל הנוער - ${referralNumber}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">גשר אל הנוער - טופס הסכמה להורים</h2>
          
          <p>שלום,</p>
          
          <p>${counselorName} מבית ספר ${schoolName} הפנה את ילדכם לתוכנית "גשר אל הנוער".</p>
          
          <p>לצורך המשך הטיפול בבקשה, אנו זקוקים להסכמתכם לשיתוף מידע.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>מספר הפניה:</strong> ${referralNumber}</p>
            <p>לחצו על הקישור למילוי טופס ההסכמה:</p>
            <a href="${consentUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              מילוי טופס הסכמה
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
      `,
    });

    if (error) {
      console.error('Error sending consent email:', error);
      return { success: false, error: error.message };
    }

    console.log('Consent email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send consent email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendCounselorNotification({
  counselorEmail,
  counselorName,
  parentNames,
  studentFormUrl,
  referralNumber,
}: SendCounselorNotificationParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'גשר אל הנוער <noreply@gesher-intake.vercel.app>',
      to: counselorEmail,
      subject: `הסכמת הורים התקבלה - ${referralNumber}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ הסכמת הורים התקבלה בהצלחה</h2>
          
          <p>שלום ${counselorName},</p>
          
          <p>ההורים ${parentNames} חתמו על טופס ההסכמה.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>מספר הפניה:</strong> ${referralNumber}</p>
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
      `,
    });

    if (error) {
      console.error('Error sending counselor notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Counselor notification sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send counselor notification:', error);
    return { success: false, error: 'Failed to send email' };
  }
}