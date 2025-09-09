/**
 * ActiveTrail SMS Service
 * Sends SMS notifications via ActiveTrail API
 */

interface SMSConfig {
  apiKey: string;
  baseUrl: string;
  senderId?: string;
}

interface SendSMSParams {
  phone: string;
  message: string;
  referralNumber?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class ActiveTrailSMS {
  private config: SMSConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ACTIVETRAIL_API_KEY || '',
      baseUrl: process.env.ACTIVETRAIL_BASE_URL || 'https://webapi.mymarketing.co.il',
      senderId: process.env.ACTIVETRAIL_SENDER_ID || 'GesherYouth', // Default sender ID
    };
  }

  /**
   * Format Israeli phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Israeli numbers
    if (cleaned.startsWith('0')) {
      // Remove leading 0 and add country code
      cleaned = '972' + cleaned.substring(1);
    } else if (!cleaned.startsWith('972')) {
      // Assume it's Israeli if no country code
      cleaned = '972' + cleaned;
    }
    
    // Add + prefix for international format
    return '+' + cleaned;
  }

  /**
   * Send SMS via ActiveTrail Operational Message API
   */
  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    const { phone, message, referralNumber } = params;

    if (!this.config.apiKey) {
      console.error('ActiveTrail API key not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // ActiveTrail API endpoint for operational SMS
      const endpoint = `${this.config.baseUrl}/api/external/operational/sms_message`;
      
      const requestBody = {
        phone_number: formattedPhone,
        message: message,
        sender_id: this.config.senderId,
        // Add tracking info if available
        custom_field: referralNumber || undefined,
      };

      console.log('Sending SMS to:', formattedPhone);
      console.log('Message:', message);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey, // Try as Bearer token first
          'X-API-KEY': this.config.apiKey,    // Alternative header format
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('SMS API Error:', response.status, responseText);
        
        // Try alternative endpoint if first one fails
        if (response.status === 404) {
          return this.sendSMSAlternative(params);
        }
        
        return {
          success: false,
          error: `SMS sending failed: ${response.status} - ${responseText}`,
        };
      }

      // Try to parse response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message_id: responseText };
      }

      console.log('SMS sent successfully:', result);
      
      return {
        success: true,
        messageId: result.message_id || result.id || 'sent',
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Alternative SMS sending method using campaign API
   */
  private async sendSMSAlternative(params: SendSMSParams): Promise<SMSResponse> {
    const { phone, message } = params;
    
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const endpoint = `${this.config.baseUrl}/api/smscampaign/OperationalMessage`;
      
      const requestBody = {
        to: formattedPhone,
        message: message,
        from: this.config.senderId,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Alternative SMS API Error:', response.status, errorText);
        return {
          success: false,
          error: `SMS sending failed (alt): ${response.status}`,
        };
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.message_id || 'sent',
      };
    } catch (error) {
      console.error('Alternative SMS error:', error);
      return {
        success: false,
        error: 'SMS service unavailable',
      };
    }
  }
}

// SMS Templates
export const SMS_TEMPLATES = {
  CONSENT_REQUEST: (referralNumber: string, consentUrl: string) => 
    `גשר אל הנוער: נדרשת חתימתך על טופס ויתור סודיות עבור הרשמת ילדך לתוכנית. לחץ על הקישור: ${consentUrl}`,
  
  CONSENT_REMINDER: (studentName: string, consentUrl: string) =>
    `תזכורת - גשר אל הנוער: טופס ויתור סודיות עבור ${studentName} ממתין לחתימתך: ${consentUrl}`,
  
  COUNSELOR_NOTIFICATION: (studentName: string, formUrl: string) =>
    `גשר אל הנוער: ההורים חתמו על ויתור סודיות עבור ${studentName}. השלם את הרישום: ${formUrl}`,
};

// Export singleton instance
const smsService = new ActiveTrailSMS();

/**
 * Send consent request SMS to parent
 */
export async function sendConsentSMS(params: {
  parentPhone: string;
  referralNumber: string;
  consentUrl: string;
}): Promise<SMSResponse> {
  const message = SMS_TEMPLATES.CONSENT_REQUEST(
    params.referralNumber,
    params.consentUrl
  );
  
  return smsService.sendSMS({
    phone: params.parentPhone,
    message,
    referralNumber: params.referralNumber,
  });
}

/**
 * Send notification SMS to counselor
 */
export async function sendCounselorSMS(params: {
  counselorPhone: string;
  studentName: string;
  formUrl: string;
}): Promise<SMSResponse> {
  const message = SMS_TEMPLATES.COUNSELOR_NOTIFICATION(
    params.studentName,
    params.formUrl
  );
  
  return smsService.sendSMS({
    phone: params.counselorPhone,
    message,
  });
}

export default smsService;