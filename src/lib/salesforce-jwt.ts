import { Connection } from 'jsforce';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// JWT Bearer Configuration
const SF_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID || '';
const SF_USERNAME = process.env.SALESFORCE_USERNAME || '';
const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://test.salesforce.com';
const SF_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || '';

// Fallback to direct access token if JWT not configured
const SF_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN || '';

/**
 * Salesforce JWT Bearer Authentication Service
 * 
 * This provides fully automated server-to-server authentication
 * No user interaction or manual token refresh needed!
 * 
 * How it works:
 * 1. Uses a certificate to sign JWT tokens
 * 2. Exchanges JWT for access token automatically
 * 3. Refreshes tokens before they expire
 * 4. Falls back to direct access token if needed
 */
class SalesforceJWTService {
  private conn: Connection | null = null;
  private lastAuthTime: number = 0;
  private TOKEN_DURATION = 50 * 60 * 1000; // Refresh every 50 minutes (tokens last 1 hour)
  private privateKey: string | null = null;

  constructor() {
    // Load private key from environment variable first (for Vercel)
    if (process.env.SALESFORCE_PRIVATE_KEY) {
      this.privateKey = process.env.SALESFORCE_PRIVATE_KEY.replace(/\\n/g, '\n');
      console.log('JWT private key loaded from environment variable');
    } else {
      // Fall back to file system (for local development)
      try {
        const keyPath = path.join(process.cwd(), 'certs', 'server.key');
        if (fs.existsSync(keyPath)) {
          this.privateKey = fs.readFileSync(keyPath, 'utf8');
          console.log('JWT private key loaded from file system');
        }
      } catch {
        console.log('JWT private key not found, will use fallback authentication');
      }
    }
  }

  /**
   * Generate JWT token for authentication
   */
  private generateJWT(): string {
    if (!this.privateKey) {
      throw new Error('Private key not available for JWT');
    }

    const claims = {
      iss: SF_CLIENT_ID,     // Consumer Key from Connected App
      sub: SF_USERNAME,      // Salesforce username
      aud: SF_LOGIN_URL,     // Login URL
      exp: Math.floor(Date.now() / 1000) + 300  // 5 minutes expiry
    };

    return jwt.sign(claims, this.privateKey, { 
      algorithm: 'RS256',
      header: {
        alg: 'RS256'
      }
    });
  }

  /**
   * Get access token using JWT Bearer flow
   */
  private async getJWTAccessToken(): Promise<{ access_token: string; instance_url: string }> {
    const jwtToken = this.generateJWT();
    
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken
    });

    const tokenUrl = `${SF_LOGIN_URL}/services/oauth2/token`;
    
    console.log('Requesting access token using JWT Bearer flow...');
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`JWT authentication failed: ${error}`);
    }

    const data = await response.json();
    console.log('JWT authentication successful, token obtained');
    
    return {
      access_token: data.access_token,
      instance_url: data.instance_url
    };
  }

  /**
   * Get or create a valid Salesforce connection
   * Automatically handles authentication and token refresh
   */
  private async getConnection(): Promise<Connection> {
    const now = Date.now();
    
    // Check if we need to refresh the connection
    if (!this.conn || (now - this.lastAuthTime) > this.TOKEN_DURATION) {
      console.log('Establishing Salesforce connection...');
      
      // Method 1: Try JWT Bearer authentication (fully automated)
      if (this.privateKey && SF_CLIENT_ID && SF_USERNAME) {
        try {
          const { access_token, instance_url } = await this.getJWTAccessToken();
          
          this.conn = new Connection({
            instanceUrl: instance_url,
            accessToken: access_token,
            version: '64.0'
          });
          
          // Test the connection
          const identity = await this.conn.identity();
          console.log(`Connected via JWT Bearer as: ${identity.display_name}`);
          console.log('Token will auto-refresh before expiry - no manual intervention needed!');
          
          this.lastAuthTime = now;
          return this.conn;
          
        } catch (error) {
          console.error('JWT authentication failed:', error);
          console.log('Falling back to direct access token...');
        }
      }
      
      // Method 2: Fall back to direct access token
      if (SF_INSTANCE_URL && SF_ACCESS_TOKEN) {
        try {
          this.conn = new Connection({
            instanceUrl: SF_INSTANCE_URL,
            accessToken: SF_ACCESS_TOKEN,
            version: '64.0'
          });
          
          // Test the connection
          await this.conn.identity();
          console.log('Connected using direct access token (temporary)');
          this.lastAuthTime = now;
          return this.conn;
          
        } catch (error) {
          console.error('Access token authentication failed:', error);
          throw new Error('All authentication methods failed');
        }
      }
      
      throw new Error('No valid Salesforce credentials configured');
    }
    
    return this.conn;
  }

  /**
   * Execute operation with automatic retry on failure
   */
  private async executeWithRetry<T>(
    operation: (conn: Connection) => Promise<T>
  ): Promise<T> {
    try {
      const conn = await this.getConnection();
      return await operation(conn);
    } catch (error) {
      // If authentication failed, force reconnection and retry
      const err = error as Error & { errorCode?: string };
      if (err?.errorCode === 'INVALID_SESSION_ID' || 
          err?.message?.includes('expired') ||
          err?.message?.includes('invalid')) {
        
        console.log('Session expired, re-authenticating automatically...');
        this.conn = null;
        this.lastAuthTime = 0;
        
        const conn = await this.getConnection();
        return await operation(conn);
      }
      throw error;
    }
  }

  /**
   * Create initial Registration Request when counselor submits
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createInitialRegistration(data: Record<string, any>): Promise<{
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateWithConsent(recordId: string, data: Record<string, any>): Promise<{
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
        // Add HTML-wrapped signature for display in Rich Text field
        Parent1_Signature_Display__c: data.parent1Signature ? 
          `<img src="${data.parent1Signature}" style="max-width:300px; border:1px solid #ccc; padding:5px; background:white;" alt="חתימת הורה 1"/>` : '',
        Parent2_Name__c: data.parent2Name || '',
        Parent2_ID__c: data.parent2Id || '',
        Parent2_Address__c: data.parent2Address || '',
        Parent2_Phone__c: data.parent2Phone || '',
        Parent2_Signature__c: data.parent2Signature || '',
        // Add HTML-wrapped signature for display in Rich Text field
        Parent2_Signature_Display__c: data.parent2Signature ? 
          `<img src="${data.parent2Signature}" style="max-width:300px; border:1px solid #ccc; padding:5px; background:white;" alt="חתימת הורה 2"/>` : '',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateWithStudentData(recordId: string, data: Record<string, any>): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const studentUpdate = {
        Id: recordId,
        Status__c: 'Data Submitted',
        Priority__c: data.riskLevel >= 7 ? 'High' : data.riskLevel >= 4 ? 'Medium' : 'Low',
        
        // Student Personal Information
        Student_First_Name__c: data.studentFirstName,
        Student_Last_Name__c: data.studentLastName,
        Student_ID__c: data.studentId,
        Date_of_Birth__c: data.dateOfBirth,
        Gender__c: data.gender === 'male' ? 'Male' : 'Female',
        Country_of_Birth__c: data.countryOfBirth,
        Immigration_Year__c: data.immigrationYear || '',
        Student_Address__c: data.studentAddress,
        Student_Floor__c: data.studentFloor || '',
        Student_Apartment__c: data.studentApartment || '',
        Student_Phone__c: data.studentPhone,
        Student_Mobile__c: data.studentMobile || '',
        School_System_Password__c: data.schoolSystemPassword || '',
        
        // Add all other fields as needed...
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
      if (this.privateKey && SF_CLIENT_ID) {
        authMethod = 'JWT Bearer Token (Fully Automated)';
      } else if (SF_ACCESS_TOKEN) {
        authMethod = 'Direct Access Token (Temporary)';
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
   * Check if JWT is properly configured
   */
  isJWTConfigured(): boolean {
    return !!(this.privateKey && SF_CLIENT_ID && SF_USERNAME);
  }
}

// Export singleton instance
const salesforceJWT = new SalesforceJWTService();
export default salesforceJWT;