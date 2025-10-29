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
   * Format Israeli phone number to Inwise format (972-XX-XXXXXXX)
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

    // Format as 972-XX-XXXXXXX (Inwise format)
    // Example: 972501234567 -> 972-50-1234567
    if (cleaned.startsWith('972')) {
      const countryCode = cleaned.substring(0, 3); // 972
      const areaCode = cleaned.substring(3, 5);     // 50
      const number = cleaned.substring(5);          // 1234567
      return `${countryCode}-${areaCode}-${number}`;
    }

    return cleaned;
  }

  /**
   * Send SMS via Inwise Transactional SMS API
   */
  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    const { phone, message, referralNumber } = params;

    if (!this.config.apiKey) {
      console.error('[SMS] Inwise API key not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);

      // Inwise API endpoint for transactional SMS
      const endpoint = `${this.config.baseUrl}/transactional/sms/send`;

      // Inwise API request format (based on official documentation)
      const requestBody = {
        message: {
          content: message,
          charset: 'unicode', // Required for Hebrew text
          to: [
            {
              mobile_number: formattedPhone
            }
          ]
        },
        // Optional: Add tags for tracking if referralNumber provided
        ...(referralNumber && {
          message: {
            ...{ content: message, charset: 'unicode', to: [{ mobile_number: formattedPhone }] },
            tags: [referralNumber]
          }
        })
      };

      console.log('[SMS] Sending SMS via Inwise to:', formattedPhone);
      console.log('[SMS] Message preview:', message.substring(0, 50) + '...');
      console.log('[SMS] Request body:', JSON.stringify(requestBody, null, 2));

      // Inwise authentication - use Bearer token in Authorization header
      // Based on API testing, Inwise uses standard OAuth-style Bearer authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      }

      console.log('[SMS] Authentication: Bearer token');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('[SMS] Inwise SMS API Error:', response.status, responseText);

        // Check for common error codes
        if (response.status === 401) {
          return {
            success: false,
            error: 'Authentication failed - check API key',
          };
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
        // If response is not JSON, treat as success with the response as ID
        result = { messageId: responseText };
      }

      console.log('[SMS] ✅ SMS sent successfully via Inwise');
      console.log('[SMS] Response:', result);

      // Check for status in response
      if (result.status === 'rejected' || result.status === 'invalid') {
        console.error('[SMS] Message rejected:', result.reject_reason);
        return {
          success: false,
          error: `Message rejected: ${result.reject_reason || 'unknown reason'}`,
        };
      }

      return {
        success: true,
        messageId: result.messageId || result.id || result.status || 'sent',
      };
    } catch (error) {
      console.error('[SMS] Inwise SMS sending error:', error);
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