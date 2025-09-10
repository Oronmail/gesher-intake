/**
 * Inwise SMS Service
 * Sends SMS notifications via Inwise API
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

class InwiseSMS {
  private config: SMSConfig;

  constructor() {
    this.config = {
      apiKey: process.env.INWISE_API_KEY || '',
      baseUrl: process.env.INWISE_BASE_URL || 'https://api.inwise.com/rest/v1',
      senderId: process.env.INWISE_SENDER_ID || 'GesherYouth',
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
   * Send SMS via Inwise Transactional SMS API
   */
  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    const { phone, message, referralNumber } = params;

    if (!this.config.apiKey) {
      console.error('Inwise API key not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // Inwise API endpoint for transactional SMS
      const endpoint = `${this.config.baseUrl}/transactional/sms/send`;
      
      const requestBody = {
        phoneNumber: formattedPhone,
        message: message,
        sender: this.config.senderId,
        // Add tracking info if available
        customField: referralNumber || undefined,
      };

      console.log('Sending SMS via Inwise to:', formattedPhone);
      console.log('Message:', message);

      // Inwise authentication: Use X-API-Key header
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': this.config.apiKey,
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Inwise SMS API Error:', response.status, responseText);
        
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
        // If response is not JSON, treat as success with the response as ID
        result = { messageId: responseText };
      }

      console.log('SMS sent successfully via Inwise:', result);
      
      return {
        success: true,
        messageId: result.messageId || result.id || 'sent',
      };
    } catch (error) {
      console.error('Inwise SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
const smsService = new InwiseSMS();

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