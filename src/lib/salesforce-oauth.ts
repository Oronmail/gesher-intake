import jsforce from 'jsforce';

// OAuth Configuration
const SF_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID || '';
const SF_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET || '';
const SF_REFRESH_TOKEN = process.env.SALESFORCE_REFRESH_TOKEN || '';
const SF_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || '';
const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://test.salesforce.com';

// Fallback to username/password if OAuth not configured
const SF_USERNAME = process.env.SALESFORCE_USERNAME || '';
const SF_PASSWORD = process.env.SALESFORCE_PASSWORD || '';
const SF_SECURITY_TOKEN = process.env.SALESFORCE_SECURITY_TOKEN || '';

// Access token from SFDX (as immediate fallback)
const SF_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN || '';

/**
 * Salesforce OAuth Service with automatic token refresh
 * Provides resilient authentication with multiple fallback options:
 * 1. OAuth with refresh token (preferred)
 * 2. Direct access token (from SFDX)
 * 3. Username/password authentication (last resort)
 */
class SalesforceOAuthService {
  private conn: jsforce.Connection | null = null;
  private oauth2: jsforce.OAuth2 | null = null;
  private lastRefreshTime: number = 0;
  private REFRESH_INTERVAL = 1.5 * 60 * 60 * 1000; // Refresh every 1.5 hours

  constructor() {
    // Initialize OAuth2 client if credentials are available
    if (SF_CLIENT_ID && SF_CLIENT_SECRET) {
      this.oauth2 = new jsforce.OAuth2({
        loginUrl: SF_LOGIN_URL,
        clientId: SF_CLIENT_ID,
        clientSecret: SF_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/api/auth/callback'
      });
      console.log('Salesforce OAuth service initialized');
    } else {
      console.log('Salesforce service initialized (OAuth not configured)');
    }
  }

  /**
   * Get or create a valid Salesforce connection
   * Attempts authentication in this order:
   * 1. OAuth with refresh token
   * 2. Direct access token
   * 3. Username/password
   */
  private async getConnection(): Promise<jsforce.Connection> {
    const now = Date.now();
    
    // Check if we need to refresh the connection
    if (!this.conn || (now - this.lastRefreshTime) > this.REFRESH_INTERVAL) {
      console.log('Establishing Salesforce connection...');
      
      // Method 1: Try OAuth with refresh token
      if (this.oauth2 && SF_REFRESH_TOKEN) {
        try {
          console.log('Attempting OAuth authentication with refresh token...');
          
          this.conn = new jsforce.Connection({
            oauth2: this.oauth2,
            instanceUrl: SF_INSTANCE_URL,
            refreshToken: SF_REFRESH_TOKEN,
            version: '64.0'
          });
          
          // Refresh the access token
          await this.conn.oauth2.refreshToken(SF_REFRESH_TOKEN, async (err, res) => {
            if (err) {
              console.error('OAuth refresh failed:', err);
              throw err;
            }
            
            if (res && this.conn) {
              this.conn.accessToken = res.access_token;
              if (res.instance_url) {
                this.conn.instanceUrl = res.instance_url;
              }
              console.log('OAuth token refreshed successfully');
              console.log('New access token obtained, valid for ~2 hours');
            }
          });
          
          // Test the connection
          await this.conn.identity();
          console.log('Connected via OAuth with refresh token');
          this.lastRefreshTime = now;
          return this.conn;
          
        } catch (error) {
          console.log('OAuth authentication failed, trying fallback methods...');
        }
      }
      
      // Method 2: Try direct access token (from SFDX)
      if (SF_INSTANCE_URL && SF_ACCESS_TOKEN) {
        try {
          console.log('Attempting authentication with access token...');
          
          this.conn = new jsforce.Connection({
            instanceUrl: SF_INSTANCE_URL,
            accessToken: SF_ACCESS_TOKEN,
            version: '64.0'
          });
          
          // Test the connection
          await this.conn.identity();
          console.log('Connected using access token');
          this.lastRefreshTime = now;
          return this.conn;
          
        } catch (error) {
          console.log('Access token failed, trying username/password...');
        }
      }
      
      // Method 3: Fall back to username/password
      if (SF_USERNAME && SF_PASSWORD) {
        try {
          console.log('Attempting username/password authentication...');
          
          this.conn = new jsforce.Connection({
            loginUrl: SF_LOGIN_URL,
            version: '64.0'
          });
          
          const passwordWithToken = SF_PASSWORD + (SF_SECURITY_TOKEN || '');
          const userInfo = await this.conn.login(SF_USERNAME, passwordWithToken);
          
          console.log('Connected via username/password');
          console.log('Organization:', userInfo.organizationId);
          this.lastRefreshTime = now;
          return this.conn;
          
        } catch (error) {
          console.error('Username/password authentication failed:', error);
          throw new Error('All authentication methods failed. Please check credentials.');
        }
      }
      
      throw new Error('No valid Salesforce credentials configured');
    }
    
    return this.conn;
  }

  /**
   * Execute operation with automatic retry on session expiry
   */
  private async executeWithRetry<T>(
    operation: (conn: jsforce.Connection) => Promise<T>
  ): Promise<T> {
    try {
      const conn = await this.getConnection();
      return await operation(conn);
    } catch (error: any) {
      // If session expired, force reconnection and retry
      if (error?.errorCode === 'INVALID_SESSION_ID' || 
          error?.message?.includes('expired') ||
          error?.message?.includes('invalid')) {
        
        console.log('Session expired, re-authenticating...');
        this.conn = null;
        this.lastRefreshTime = 0;
        
        const conn = await this.getConnection();
        return await operation(conn);
      }
      throw error;
    }
  }

  /**
   * Create initial Registration Request when counselor submits
   */
  async createInitialRegistration(data: any): Promise<{
    success: boolean;
    recordId?: string;
    error?: string;
  }> {
    try {
      const initialRequest = {
        Referral_Number__c: data.referralNumber,
        Status__c: 'Pending Consent',
        Counselor_Name__c: data.counselorName,
        Counselor_Email__c: data.counselorEmail,
        School_Name__c: data.schoolName,
        Parent_Email__c: data.parentEmail || '',
        Parent1_Phone__c: data.parentPhone,
        Submission_Date__c: new Date().toISOString(),
      };

      console.log('Creating initial Registration Request in Salesforce...');
      
      const result = await this.executeWithRetry(async (conn) => {
        return await conn.sobject('Registration_Request__c').create(initialRequest);
      });
      
      if (result.success) {
        console.log('Initial Registration Request created:', result.id);
        return {
          success: true,
          recordId: result.id
        };
      } else {
        return {
          success: false,
          error: 'Failed to create initial record'
        };
      }
    } catch (error) {
      console.error('Error creating initial registration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update Registration Request with consent data
   */
  async updateWithConsent(recordId: string, data: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const consentUpdate = {
        Id: recordId,
        Status__c: 'Consent Signed',
        Parent1_Name__c: data.parent1Name,
        Parent1_ID__c: data.parent1Id,
        Parent1_Address__c: data.parent1Address || '',
        Parent1_Phone__c: data.parent1Phone || '',
        Parent1_Signature__c: data.parent1Signature,
        Parent2_Name__c: data.parent2Name || '',
        Parent2_ID__c: data.parent2Id || '',
        Parent2_Address__c: data.parent2Address || '',
        Parent2_Phone__c: data.parent2Phone || '',
        Parent2_Signature__c: data.parent2Signature || '',
        Consent_Date__c: data.consentDate,
      };

      console.log('Updating Registration Request with consent data...');
      
      const result = await this.executeWithRetry(async (conn) => {
        return await conn.sobject('Registration_Request__c').update(consentUpdate);
      });
      
      if (result.success) {
        console.log('Registration Request updated with consent');
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Failed to update with consent'
        };
      }
    } catch (error) {
      console.error('Error updating with consent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update Registration Request with full student data
   */
  async updateWithStudentData(recordId: string, data: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Map all student data fields (abbreviated for brevity)
      const studentUpdate = {
        Id: recordId,
        Status__c: 'Data Submitted',
        Priority__c: data.riskLevel >= 7 ? 'High' : data.riskLevel >= 4 ? 'Medium' : 'Low',
        // ... all other fields mapping
      };

      console.log('Updating Registration Request with student data...');
      
      const result = await this.executeWithRetry(async (conn) => {
        return await conn.sobject('Registration_Request__c').update(studentUpdate);
      });
      
      if (result.success) {
        console.log('Registration Request updated with student data');
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Failed to update with student data'
        };
      }
    } catch (error) {
      console.error('Error updating with student data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test connection and authentication
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    authMethod?: string;
  }> {
    try {
      const conn = await this.getConnection();
      const identity = await conn.identity();
      
      let authMethod = 'unknown';
      if (this.oauth2 && SF_REFRESH_TOKEN) {
        authMethod = 'OAuth 2.0 with Refresh Token';
      } else if (SF_ACCESS_TOKEN) {
        authMethod = 'Direct Access Token';
      } else if (SF_USERNAME) {
        authMethod = 'Username/Password';
      }
      
      // Test object access
      const objectMetadata = await conn.sobject('Registration_Request__c').describe();
      
      return {
        success: true,
        message: `Connected as ${identity.display_name}. Registration_Request__c has ${objectMetadata.fields.length} fields.`,
        authMethod
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Get authorization URL for initial OAuth setup
   */
  getAuthorizationUrl(): string {
    if (!this.oauth2) {
      throw new Error('OAuth not configured');
    }
    
    return this.oauth2.getAuthorizationUrl({
      scope: 'api refresh_token offline_access'
    });
  }

  /**
   * Handle OAuth callback and get refresh token
   */
  async handleOAuthCallback(code: string): Promise<{
    success: boolean;
    refreshToken?: string;
    error?: string;
  }> {
    if (!this.oauth2) {
      return {
        success: false,
        error: 'OAuth not configured'
      };
    }

    try {
      const conn = new jsforce.Connection({ oauth2: this.oauth2 });
      const userInfo = await conn.authorize(code);
      
      console.log('OAuth authorization successful');
      console.log('User:', userInfo.id);
      console.log('Refresh Token:', conn.refreshToken);
      
      return {
        success: true,
        refreshToken: conn.refreshToken
      };
    } catch (error) {
      console.error('OAuth callback failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed'
      };
    }
  }
}

// Export both the class and a singleton instance
export default SalesforceOAuthService;
export const salesforceOAuth = new SalesforceOAuthService();