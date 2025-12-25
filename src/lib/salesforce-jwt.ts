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
    // JWT authentication successful
    
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
          await this.conn.identity();
          
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
      // IMPORTANT: Using Name field for referral number
      const initialRequest = {
        Name: data.referralNumber,  // Using standard Name field
        Status__c: 'Pending Consent',
        School_Counselor_Name__c: data.counselorName,
        Counselor_Email__c: data.counselorEmail || '',
        School_Counselor_Phone__c: data.counselorMobile,
        School_Name__c: data.schoolName,
        Warm_House__c: data.warmHomeDestination || '',
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
      // Format date of birth properly for Salesforce (YYYY-MM-DD format only, no time)
      let formattedDOB = '';
      if (data.dateOfBirth) {
        // If it's already in YYYY-MM-DD format, use as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
          formattedDOB = data.dateOfBirth;
        } else {
          // Try to parse and format
          try {
            const date = new Date(data.dateOfBirth);
            if (!isNaN(date.getTime())) {
              formattedDOB = date.toISOString().split('T')[0]; // Get YYYY-MM-DD part only
            }
          } catch {
            console.warn('Invalid date of birth format:', data.dateOfBirth);
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentUpdate: Record<string, any> = {
        Id: recordId,
        Status__c: 'Data Submitted',

        // Student Personal Information
        Student_First_Name__c: data.studentFirstName,
        Student_Last_Name__c: data.studentLastName,
        Student_ID__c: data.studentId,
        // Only include Date_of_Birth__c if we have a valid formatted date - don't overwrite existing value with null
        ...(formattedDOB && { Date_of_Birth__c: formattedDOB }),
        Gender__c: data.gender === 'male' ? 'Male' : 'Female',
        Country_of_Birth__c: data.countryOfBirth,
        Immigration_Year__c: data.immigrationYear || '',
        Student_Address__c: data.studentAddress,
        Student_Floor__c: data.studentFloor || '',
        Student_Apartment__c: data.studentApartment || '',
        Student_Phone__c: data.studentPhone,
        Student_Mobile__c: data.studentMobile || '',
        School_Info_Username__c: data.schoolInfoUsername || '',
        School_Info_Password__c: data.schoolInfoPassword || '',
        
        // Family Information
        Siblings_Count__c: data.siblingsCount || 0,
        Parent1_Name__c: data.parent1Name || '',
        Parent1_Phone__c: data.parent1Phone || '',
        Parent1_Occupation__c: data.parent1Occupation || '',
        Parent1_Profession__c: data.parent1Profession || '',
        Parent1_Income__c: data.parent1Income || '',
        Parent2_Name__c: data.parent2Name || '',
        Parent2_Phone__c: data.parent2Phone || '',
        Parent2_Occupation__c: data.parent2Occupation || '',
        Parent2_Profession__c: data.parent2Profession || '',
        Parent2_Income__c: data.parent2Income || '',
        Debts_Loans__c: data.debtsLoans || '',
        Parent_Involvement__c: data.parentInvolvement || '',
        Economic_Status__c: data.economicStatus ? 
          (data.economicStatus === 'low' ? 'Low' : 
           data.economicStatus === 'medium' ? 'Medium' : 'High') : '',
        Economic_Details__c: data.economicDetails || '',
        Family_Background__c: data.familyBackground || '',
        
        // School & Academic Information
        Grade__c: data.grade || '',
        Homeroom_Teacher__c: data.homeroomTeacher || '',
        Teacher_Phone__c: data.teacherPhone || '',
        School_Counselor_Name__c: data.schoolCounselorName || '',
        School_Counselor_Phone__c: data.schoolCounselorPhone || '',
        Failing_Grades_Count__c: data.failingGradesCount || 0,
        Failing_Subjects__c: data.failingSubjects || '',
        Failing_Subjects_Details__c: data.failingSubjectsDetails || '',
        
        // Welfare & Social Services
        Known_to_Welfare__c: data.knownToWelfare || '',
        Social_Worker_Name__c: data.socialWorkerName || '',
        Social_Worker_Phone__c: data.socialWorkerPhone || '',
        Youth_Promotion__c: data.youthPromotion || '',
        Youth_Worker_Name__c: data.youthWorkerName || '',
        Youth_Worker_Phone__c: data.youthWorkerPhone || '',
        
        // Assessment
        Behavioral_Issues__c: data.behavioralIssues || '',
        Behavioral_Issues_Details__c: data.behavioralIssuesDetails || '',
        Potential_Explanation__c: data.potentialExplanation || '',
        Motivation_Level__c: data.motivationLevel || '',
        Social_Status__c: data.socialStatus || '',
        Afternoon_Activities__c: data.afternoonActivities || '',
        
        // Learning & Health
        Learning_Disability__c: data.learningDisability || '',
        Learning_Disability_Explanation__c: data.learningDisabilityExplanation || '',
        Requires_Remedial_Teaching__c: data.requiresRemedialTeaching || '',
        ADHD__c: data.adhd || '',
        ADHD_Treatment__c: data.adhdTreatment || '',
        Assessment_Done__c: data.assessmentDone || '',
        Assessment_Needed__c: data.assessmentNeeded || '',
        Assessment_Details__c: data.assessmentDetails || '',
        
        // Risk Assessment
        Criminal_Record__c: data.criminalRecord || '',
        Criminal_Record_Details__c: data.criminalRecordDetails || '',
        Drug_Use__c: data.drugUse || '',
        Smoking__c: data.smoking || '',
        Probation_Officer__c: data.probationOfficer || '',
        Youth_Probation_Officer__c: data.youthProbationOfficer || '',
        Psychological_Treatment__c: data.psychologicalTreatment || '',
        Psychiatric_Treatment__c: data.psychiatricTreatment || '',
        Takes_Medication__c: data.takesMedication || '',
        Medication_Description__c: data.medicationDescription || '',
        Risk_Level__c: data.riskLevel || 1,
        Risk_Factors__c: data.riskFactors || '',
        
        // Final Assessment
        Military_Service_Potential__c: data.militaryServicePotential || '',
        Can_Handle_Program__c: data.canHandleProgram || '',
        Personal_Opinion__c: data.personalOpinion || ''
      };

      console.log('Updating Registration Request with student data...');

      const result = await this.executeWithRetry(async (conn) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await conn.sobject('Registration_Request__c').update(studentUpdate as any);
      }) as unknown as { success: boolean; id?: string };

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
   * Upload consent image to Salesforce with HTML storage
   */
  async uploadConsentImage(
    registrationRequestId: string,
    imageBase64: string,
    filename: string,
    consentHTML?: string
  ): Promise<{ success: boolean; error?: string; contentDocumentId?: string }> {
    try {
      if (!imageBase64 || !filename) {
        return {
          success: false,
          error: 'Missing image data or filename'
        };
      }

      console.log(`Uploading consent image: ${filename} to Registration Request: ${registrationRequestId}`);
      
      // First, store the HTML in a custom field if provided
      if (consentHTML) {
        try {
          const htmlUpdate = {
            Id: registrationRequestId,
            Consent_HTML__c: consentHTML
          };
          
          await this.executeWithRetry(async (conn) => {
            return await conn.sobject('Registration_Request__c').update(htmlUpdate);
          });
          
          console.log('Consent HTML stored successfully in Registration_Request__c');
        } catch (htmlError) {
          console.error('Failed to store consent HTML:', htmlError);
          // Continue with image upload even if HTML storage fails
        }
      }
      
      // Create ContentVersion for the image
      const contentVersionResult = await this.executeWithRetry(async (conn) => {
        return await conn.sobject('ContentVersion').create({
          Title: filename.replace('.png', ''),
          PathOnClient: filename,
          VersionData: imageBase64,
          FirstPublishLocationId: registrationRequestId,
          Description: 'Consent form with parent signatures and timestamp'
        });
      });
      
      if (!contentVersionResult.success) {
        console.error('Failed to create ContentVersion:', contentVersionResult);
        return {
          success: false,
          error: 'Failed to upload image to Salesforce'
        };
      }

      console.log('ContentVersion created successfully:', contentVersionResult.id);
      
      // Query to get the ContentDocumentId
      const contentVersionQuery = await this.executeWithRetry(async (conn) => {
        return await conn.query(
          `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${contentVersionResult.id}'`
        );
      });
      
      if (contentVersionQuery.records && contentVersionQuery.records.length > 0) {
        const contentDocumentId = (contentVersionQuery.records[0] as { ContentDocumentId: string }).ContentDocumentId;
        console.log('Image uploaded successfully. ContentDocumentId:', contentDocumentId);
        
        return {
          success: true,
          contentDocumentId
        };
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error uploading consent image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload consent PDF to Salesforce (legacy method kept for compatibility)
   */
  async uploadConsentPDF(
    registrationRequestId: string,
    pdfBase64: string,
    filename: string
  ): Promise<{ success: boolean; error?: string; contentDocumentId?: string }> {
    try {
      if (!pdfBase64 || !filename) {
        return {
          success: false,
          error: 'Missing PDF data or filename'
        };
      }

      console.log(`Uploading consent PDF: ${filename} to Registration Request: ${registrationRequestId}`);
      
      // Create ContentVersion (the file itself)
      const contentVersionResult = await this.executeWithRetry(async (conn) => {
        return await conn.sobject('ContentVersion').create({
          Title: filename.replace('.pdf', ''),
          PathOnClient: filename,
          VersionData: pdfBase64,
          FirstPublishLocationId: registrationRequestId, // This links it to the record
          Description: 'Consent form with parent signatures'
        });
      });
      
      if (!contentVersionResult.success) {
        console.error('Failed to create ContentVersion:', contentVersionResult);
        return {
          success: false,
          error: 'Failed to upload PDF to Salesforce'
        };
      }

      console.log('ContentVersion created successfully:', contentVersionResult.id);
      
      // Query to get the ContentDocumentId
      const contentVersionQuery = await this.executeWithRetry(async (conn) => {
        return await conn.query(
          `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${contentVersionResult.id}'`
        );
      });
      
      if (contentVersionQuery.records && contentVersionQuery.records.length > 0) {
        const contentDocumentId = (contentVersionQuery.records[0] as { ContentDocumentId: string }).ContentDocumentId;
        console.log('PDF uploaded successfully. ContentDocumentId:', contentDocumentId);
        
        return {
          success: true,
          contentDocumentId
        };
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error uploading consent PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generic file upload method for any file type
   */
  async uploadFile(
    parentRecordId: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    description?: string
  ): Promise<{ success: boolean; error?: string; contentDocumentId?: string }> {
    try {
      if (!fileBuffer || !filename) {
        return {
          success: false,
          error: 'Missing file data or filename'
        };
      }

      // Convert buffer to base64
      const fileBase64 = fileBuffer.toString('base64');

      console.log(`Uploading file ${filename} to Salesforce (${fileBuffer.length} bytes)`);

      // Create ContentVersion for the file
      const contentVersionResult = await this.executeWithRetry(async (conn) => {
        return await conn.sobject('ContentVersion').create({
          Title: filename.replace(/\.[^/.]+$/, ''), // Remove file extension
          PathOnClient: filename,
          VersionData: fileBase64,
          FirstPublishLocationId: parentRecordId, // This links it to the parent record
          Description: description || `File upload: ${filename}`
        });
      });

      if (!contentVersionResult.success) {
        console.error('Failed to create ContentVersion:', contentVersionResult);
        return {
          success: false,
          error: 'Failed to upload file to Salesforce'
        };
      }

      console.log('ContentVersion created successfully:', contentVersionResult.id);

      // Query to get the ContentDocumentId
      const contentVersionQuery = await this.executeWithRetry(async (conn) => {
        return await conn.query(
          `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${contentVersionResult.id}'`
        );
      });

      if (contentVersionQuery.records && contentVersionQuery.records.length > 0) {
        const contentDocumentId = (contentVersionQuery.records[0] as { ContentDocumentId: string }).ContentDocumentId;
        console.log('File uploaded successfully. ContentDocumentId:', contentDocumentId);

        return {
          success: true,
          contentDocumentId
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error uploading file:', error);
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

  /**
   * Get Registration Request by referral number
   */
  async getRegistrationByReferralNumber(referralNumber: string): Promise<{
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>;
    error?: string;
  }> {
    try {
      console.log(`Fetching Registration Request by referral number: ${referralNumber}`);

      const query = `SELECT Id, Name, Status__c,
           Student_First_Name__c, Student_Last_Name__c, Student_ID__c, Date_of_Birth__c,
           Gender__c, Country_of_Birth__c, Immigration_Year__c, Student_Address__c,
           Student_Floor__c, Student_Apartment__c, Student_Phone__c, Student_Mobile__c,
           School_Info_Username__c, School_Info_Password__c,
           Known_to_Welfare__c, Social_Worker_Name__c, Social_Worker_Phone__c,
           Youth_Promotion__c, Youth_Worker_Name__c, Youth_Worker_Phone__c,
           Siblings_Count__c, Parent1_Name__c, Parent1_Phone__c, Parent1_Occupation__c,
           Parent1_Profession__c, Parent1_Income__c, Parent2_Name__c, Parent2_Phone__c,
           Parent2_Occupation__c, Parent2_Profession__c, Parent2_Income__c, Debts_Loans__c,
           Parent_Involvement__c, Economic_Status__c, Economic_Details__c, Family_Background__c,
           School_Name__c, Grade__c, Homeroom_Teacher__c, Teacher_Phone__c,
           School_Counselor_Name__c, School_Counselor_Phone__c,
           Behavioral_Issues__c, Behavioral_Issues_Details__c,
           Potential_Explanation__c, Motivation_Level__c,
           Social_Status__c, Afternoon_Activities__c,
           Learning_Disability__c, Learning_Disability_Explanation__c,
           Requires_Remedial_Teaching__c, ADHD__c, ADHD_Treatment__c,
           Assessment_Done__c, Assessment_Needed__c, Assessment_Details__c,
           Criminal_Record__c, Criminal_Record_Details__c, Drug_Use__c, Smoking__c, Probation_Officer__c,
           Youth_Probation_Officer__c, Psychological_Treatment__c,
           Psychiatric_Treatment__c, Takes_Medication__c, Medication_Description__c,
           Military_Service_Potential__c, Can_Handle_Program__c, Risk_Level__c,
           Risk_Factors__c, Personal_Opinion__c, Failing_Grades_Count__c,
           Assessment_File_Uploaded__c, Grade_Sheet_Uploaded__c
           FROM Registration_Request__c
           WHERE Name = '${referralNumber}'
           LIMIT 1`;

      console.log('Executing SOQL query:', query);

      const result = await this.executeWithRetry(async (conn) => {
        return await conn.query(query);
      });

      console.log('Query result:', JSON.stringify(result, null, 2));

      if (result.records && result.records.length > 0) {
        console.log('Registration Request found:', result.records[0]);
        return {
          success: true,
          data: result.records[0] as Record<string, unknown>
        };
      } else {
        console.log('No records found for referral:', referralNumber);
        return {
          success: false,
          error: `Registration Request not found for referral number: ${referralNumber}`
        };
      }
    } catch (error) {
      console.error('Error fetching Registration Request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update Registration Request with partial student data (for progress saving)
   * @param recordId - Salesforce record ID
   * @param data - Data to update
   * @param updateStatus - Whether to update status to 'In Progress' (default: true)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updatePartialStudentData(recordId: string, data: Record<string, any>, updateStatus: boolean = true): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Build update object with only provided fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {
        Id: recordId,
      };

      // Only update status if explicitly requested (for progress saving, not file uploads after final submit)
      if (updateStatus) {
        updateData.Status__c = 'In Progress';
      }

      // Map form fields to Salesforce fields (only if provided AND not empty)
      if (data.studentFirstName && typeof data.studentFirstName === 'string' && data.studentFirstName.trim()) updateData.Student_First_Name__c = data.studentFirstName;
      if (data.studentLastName && typeof data.studentLastName === 'string' && data.studentLastName.trim()) updateData.Student_Last_Name__c = data.studentLastName;
      if (data.studentId && typeof data.studentId === 'string' && data.studentId.trim()) updateData.Student_ID__c = data.studentId;
      if (data.dateOfBirth && typeof data.dateOfBirth === 'string' && data.dateOfBirth.trim()) updateData.Date_of_Birth__c = data.dateOfBirth;
      if (data.gender) updateData.Gender__c = data.gender === 'male' ? 'Male' : 'Female';
      if (data.countryOfBirth && typeof data.countryOfBirth === 'string' && data.countryOfBirth.trim()) updateData.Country_of_Birth__c = data.countryOfBirth;
      if (data.immigrationYear && typeof data.immigrationYear === 'string' && data.immigrationYear.trim()) updateData.Immigration_Year__c = data.immigrationYear;
      if (data.studentAddress && typeof data.studentAddress === 'string' && data.studentAddress.trim()) updateData.Student_Address__c = data.studentAddress;
      if (data.studentFloor && typeof data.studentFloor === 'string' && data.studentFloor.trim()) updateData.Student_Floor__c = data.studentFloor;
      if (data.studentApartment && typeof data.studentApartment === 'string' && data.studentApartment.trim()) updateData.Student_Apartment__c = data.studentApartment;
      if (data.studentPhone && typeof data.studentPhone === 'string' && data.studentPhone.trim()) updateData.Student_Phone__c = data.studentPhone;
      if (data.studentMobile && typeof data.studentMobile === 'string' && data.studentMobile.trim()) updateData.Student_Mobile__c = data.studentMobile;
      if (data.schoolInfoUsername && typeof data.schoolInfoUsername === 'string' && data.schoolInfoUsername.trim()) updateData.School_Info_Username__c = data.schoolInfoUsername;
      if (data.schoolInfoPassword && typeof data.schoolInfoPassword === 'string' && data.schoolInfoPassword.trim()) updateData.School_Info_Password__c = data.schoolInfoPassword;

      // Helper to check valid picklist values
      const isValidPicklist = (val: unknown): boolean =>
        typeof val === 'string' && ['כן', 'לא', 'לא ידוע'].includes(val);

      // Welfare & Social Services - picklist fields
      if (isValidPicklist(data.knownToWelfare)) updateData.Known_to_Welfare__c = data.knownToWelfare as string;
      if (data.socialWorkerName && typeof data.socialWorkerName === 'string' && data.socialWorkerName.trim()) updateData.Social_Worker_Name__c = data.socialWorkerName;
      if (data.socialWorkerPhone && typeof data.socialWorkerPhone === 'string' && data.socialWorkerPhone.trim()) updateData.Social_Worker_Phone__c = data.socialWorkerPhone;
      if (isValidPicklist(data.youthPromotion)) updateData.Youth_Promotion__c = data.youthPromotion as string;
      if (data.youthWorkerName && typeof data.youthWorkerName === 'string' && data.youthWorkerName.trim()) updateData.Youth_Worker_Name__c = data.youthWorkerName;
      if (data.youthWorkerPhone && typeof data.youthWorkerPhone === 'string' && data.youthWorkerPhone.trim()) updateData.Youth_Worker_Phone__c = data.youthWorkerPhone;

      // Family fields - only update if has value
      if (data.siblingsCount !== undefined && data.siblingsCount !== null) updateData.Siblings_Count__c = data.siblingsCount;
      if (data.parent1Name && typeof data.parent1Name === 'string' && data.parent1Name.trim()) updateData.Parent1_Name__c = data.parent1Name;
      if (data.parent1Phone && typeof data.parent1Phone === 'string' && data.parent1Phone.trim()) updateData.Parent1_Phone__c = data.parent1Phone;
      if (data.parent1Occupation && typeof data.parent1Occupation === 'string' && data.parent1Occupation.trim()) updateData.Parent1_Occupation__c = data.parent1Occupation;
      if (data.parent1Profession && typeof data.parent1Profession === 'string' && data.parent1Profession.trim()) updateData.Parent1_Profession__c = data.parent1Profession;
      if (data.parent1Income && typeof data.parent1Income === 'string' && data.parent1Income.trim()) updateData.Parent1_Income__c = data.parent1Income;
      if (data.parent2Name && typeof data.parent2Name === 'string' && data.parent2Name.trim()) updateData.Parent2_Name__c = data.parent2Name;
      if (data.parent2Phone && typeof data.parent2Phone === 'string' && data.parent2Phone.trim()) updateData.Parent2_Phone__c = data.parent2Phone;
      if (data.parent2Occupation && typeof data.parent2Occupation === 'string' && data.parent2Occupation.trim()) updateData.Parent2_Occupation__c = data.parent2Occupation;
      if (data.parent2Profession && typeof data.parent2Profession === 'string' && data.parent2Profession.trim()) updateData.Parent2_Profession__c = data.parent2Profession;
      if (data.parent2Income && typeof data.parent2Income === 'string' && data.parent2Income.trim()) updateData.Parent2_Income__c = data.parent2Income;
      if (data.debtsLoans && typeof data.debtsLoans === 'string' && data.debtsLoans.trim()) updateData.Debts_Loans__c = data.debtsLoans;
      if (data.parentInvolvement && typeof data.parentInvolvement === 'string' && data.parentInvolvement.trim()) updateData.Parent_Involvement__c = data.parentInvolvement;

      // Background
      if (data.economicStatus && data.economicStatus !== '') {
        updateData.Economic_Status__c =
          data.economicStatus === 'low' ? 'Low' :
          data.economicStatus === 'medium' ? 'Medium' : 'High';
      }
      if (data.economicDetails && typeof data.economicDetails === 'string' && data.economicDetails.trim()) updateData.Economic_Details__c = data.economicDetails;
      if (data.familyBackground && typeof data.familyBackground === 'string' && data.familyBackground.trim()) updateData.Family_Background__c = data.familyBackground;

      // School
      if (data.schoolName && typeof data.schoolName === 'string' && data.schoolName.trim()) updateData.School_Name__c = data.schoolName;
      if (data.grade && typeof data.grade === 'string' && data.grade.trim()) updateData.Grade__c = data.grade;
      if (data.homeroomTeacher && typeof data.homeroomTeacher === 'string' && data.homeroomTeacher.trim()) updateData.Homeroom_Teacher__c = data.homeroomTeacher;
      if (data.teacherPhone && typeof data.teacherPhone === 'string' && data.teacherPhone.trim()) updateData.Teacher_Phone__c = data.teacherPhone;
      if (data.schoolCounselorName && typeof data.schoolCounselorName === 'string' && data.schoolCounselorName.trim()) updateData.School_Counselor_Name__c = data.schoolCounselorName;
      if (data.schoolCounselorPhone && typeof data.schoolCounselorPhone === 'string' && data.schoolCounselorPhone.trim()) updateData.School_Counselor_Phone__c = data.schoolCounselorPhone;

      // Intake assessment
      if (isValidPicklist(data.behavioralIssues)) updateData.Behavioral_Issues__c = data.behavioralIssues as string;
      if (data.behavioralIssuesDetails && typeof data.behavioralIssuesDetails === 'string' && data.behavioralIssuesDetails.trim()) updateData.Behavioral_Issues_Details__c = data.behavioralIssuesDetails;
      if (data.potentialExplanation && typeof data.potentialExplanation === 'string' && data.potentialExplanation.trim()) updateData.Potential_Explanation__c = data.potentialExplanation;
      if (data.motivationLevel && typeof data.motivationLevel === 'string' && data.motivationLevel.trim()) updateData.Motivation_Level__c = data.motivationLevel;
      if (data.socialStatus && typeof data.socialStatus === 'string' && data.socialStatus.trim()) updateData.Social_Status__c = data.socialStatus;
      if (data.afternoonActivities && typeof data.afternoonActivities === 'string' && data.afternoonActivities.trim()) updateData.Afternoon_Activities__c = data.afternoonActivities;

      // Learning assessment
      if (isValidPicklist(data.learningDisability)) updateData.Learning_Disability__c = data.learningDisability as string;
      if (data.learningDisabilityExplanation && typeof data.learningDisabilityExplanation === 'string' && data.learningDisabilityExplanation.trim()) updateData.Learning_Disability_Explanation__c = data.learningDisabilityExplanation;
      if (isValidPicklist(data.requiresRemedialTeaching)) updateData.Requires_Remedial_Teaching__c = data.requiresRemedialTeaching as string;
      if (isValidPicklist(data.adhd)) updateData.ADHD__c = data.adhd as string;
      if (data.adhdTreatment && typeof data.adhdTreatment === 'string' && data.adhdTreatment.trim()) updateData.ADHD_Treatment__c = data.adhdTreatment;
      if (isValidPicklist(data.assessmentDone)) updateData.Assessment_Done__c = data.assessmentDone as string;
      if (isValidPicklist(data.assessmentNeeded)) updateData.Assessment_Needed__c = data.assessmentNeeded as string;
      if (data.assessmentDetails && typeof data.assessmentDetails === 'string' && data.assessmentDetails.trim()) updateData.Assessment_Details__c = data.assessmentDetails;

      // Risk assessment
      if (isValidPicklist(data.criminalRecord)) updateData.Criminal_Record__c = data.criminalRecord as string;
      if (data.criminalRecordDetails && typeof data.criminalRecordDetails === 'string' && data.criminalRecordDetails.trim()) updateData.Criminal_Record_Details__c = data.criminalRecordDetails;
      if (isValidPicklist(data.drugUse)) updateData.Drug_Use__c = data.drugUse as string;
      if (isValidPicklist(data.smoking)) updateData.Smoking__c = data.smoking as string;
      if (data.probationOfficer && typeof data.probationOfficer === 'string' && data.probationOfficer.trim()) updateData.Probation_Officer__c = data.probationOfficer;
      if (data.youthProbationOfficer && typeof data.youthProbationOfficer === 'string' && data.youthProbationOfficer.trim()) updateData.Youth_Probation_Officer__c = data.youthProbationOfficer;
      if (isValidPicklist(data.psychologicalTreatment)) updateData.Psychological_Treatment__c = data.psychologicalTreatment as string;
      if (isValidPicklist(data.psychiatricTreatment)) updateData.Psychiatric_Treatment__c = data.psychiatricTreatment as string;
      if (isValidPicklist(data.takesMedication)) updateData.Takes_Medication__c = data.takesMedication as string;
      if (data.medicationDescription && typeof data.medicationDescription === 'string' && data.medicationDescription.trim()) updateData.Medication_Description__c = data.medicationDescription;

      // Final assessment
      if (isValidPicklist(data.militaryServicePotential)) updateData.Military_Service_Potential__c = data.militaryServicePotential as string;
      if (isValidPicklist(data.canHandleProgram)) updateData.Can_Handle_Program__c = data.canHandleProgram as string;
      if (data.riskLevel && typeof data.riskLevel === 'string' && data.riskLevel.trim()) updateData.Risk_Level__c = data.riskLevel;
      if (data.riskFactors && typeof data.riskFactors === 'string' && data.riskFactors.trim()) updateData.Risk_Factors__c = data.riskFactors;
      if (data.personalOpinion && typeof data.personalOpinion === 'string' && data.personalOpinion.trim()) updateData.Personal_Opinion__c = data.personalOpinion;
      if (data.failingGradesCount !== undefined) updateData.Failing_Grades_Count__c = data.failingGradesCount || 0;

      // File upload tracking
      if (data.assessmentFileUploaded !== undefined) updateData.Assessment_File_Uploaded__c = data.assessmentFileUploaded;
      if (data.gradeSheetUploaded !== undefined) updateData.Grade_Sheet_Uploaded__c = data.gradeSheetUploaded;

      console.log('Updating Registration Request with partial student data...');

      const result = await this.executeWithRetry(async (conn) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await conn.sobject('Registration_Request__c').update(updateData as any);
      });

      // Handle both single result and array of results
      const singleResult = Array.isArray(result) ? result[0] : result;

      if (singleResult.success) {
        console.log('Registration Request updated with partial data');
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Failed to update with partial data'
        };
      }
    } catch (error) {
      console.error('Error updating with partial data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
const salesforceJWT = new SalesforceJWTService();
export default salesforceJWT;