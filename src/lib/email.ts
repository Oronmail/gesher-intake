import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Gmail transporter as fallback
const createGmailTransporter = () => {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return null;
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
  
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] Resend API key not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'גשר אל הנוער <onboarding@resend.dev>',
      to: parentEmail,
      subject: `טופס ויתור סודיות - גשר אל הנוער`,
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
      `,
    });

    if (error) {
      console.error(`[EMAIL] Error sending consent email via Resend to ${parentEmail}:`, error);
      console.error('[EMAIL] Full error details:', JSON.stringify(error, null, 2));
      
      // Try Gmail as fallback if Resend fails with domain verification error
      if (error.message && error.message.includes('verify a domain')) {
        console.log('[EMAIL] Attempting Gmail fallback...');
        const gmailTransporter = createGmailTransporter();
        
        if (gmailTransporter) {
          try {
            const gmailResult = await gmailTransporter.sendMail({
              from: `"גשר אל הנוער" <${process.env.GMAIL_USER}>`,
              to: parentEmail,
              subject: `טופס ויתור סודיות - גשר אל הנוער`,
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
            console.log('[EMAIL] Gmail Message ID:', gmailResult.messageId);
            return { success: true, data: gmailResult };
          } catch (gmailError) {
            console.error('[EMAIL] Gmail fallback also failed:', gmailError);
            return { success: false, error: 'Both Resend and Gmail failed' };
          }
        }
      }
      
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] ✅ Consent email sent successfully to ${parentEmail}`);
    console.log('[EMAIL] Resend response:', data);
    return { success: true, data };
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
  
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] Resend API key not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'גשר אל הנוער <onboarding@resend.dev>',
      to: counselorEmail,
      subject: `הסכמת הורים התקבלה - ${studentName}`,
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
      `,
    });

    if (error) {
      console.error(`[EMAIL] Error sending counselor notification via Resend to ${counselorEmail}:`, error);
      console.error('[EMAIL] Full error details:', JSON.stringify(error, null, 2));
      
      // Try Gmail as fallback if Resend fails with domain verification error
      if (error.message && error.message.includes('verify a domain')) {
        console.log('[EMAIL] Attempting Gmail fallback for counselor notification...');
        const gmailTransporter = createGmailTransporter();
        
        if (gmailTransporter) {
          try {
            const gmailResult = await gmailTransporter.sendMail({
              from: `"גשר אל הנוער" <${process.env.GMAIL_USER}>`,
              to: counselorEmail,
              subject: `הסכמת הורים התקבלה - ${studentName}`,
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
            console.log('[EMAIL] Gmail Message ID:', gmailResult.messageId);
            return { success: true, data: gmailResult };
          } catch (gmailError) {
            console.error('[EMAIL] Gmail fallback also failed for counselor notification:', gmailError);
            return { success: false, error: 'Both Resend and Gmail failed' };
          }
        }
      }
      
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] ✅ Counselor notification sent successfully to ${counselorEmail}`);
    console.log('[EMAIL] Resend response:', data);
    return { success: true, data };
  } catch (error) {
    console.error(`[EMAIL] Failed to send counselor notification to ${counselorEmail}:`, error);
    console.error('[EMAIL] Exception details:', error instanceof Error ? error.stack : error);
    return { success: false, error: 'Failed to send email' };
  }
}