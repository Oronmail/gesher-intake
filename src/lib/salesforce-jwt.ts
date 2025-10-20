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
        School_Counselor_Phone__c: data.counselorMobile,
        School_Name__c: data.schoolName,
        Warm_Home_Destination__c: data.warmHomeDestination || '',
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
        School_Info_Username__c: data.schoolInfoUsername || '',
        School_Info_Password__c: data.schoolInfoPassword || '',
        
        // Family Information
        Siblings_Count__c: data.siblingsCount || 0,
        Father_Name__c: data.fatherName || '',
        Father_Mobile__c: data.fatherMobile || '',
        Father_Occupation__c: data.fatherOccupation || '',
        Father_Profession__c: data.fatherProfession || '',
        Father_Income__c: data.fatherIncome || '',
        Mother_Name__c: data.motherName || '',
        Mother_Mobile__c: data.motherMobile || '',
        Mother_Occupation__c: data.motherOccupation || '',
        Mother_Profession__c: data.motherProfession || '',
        Mother_Income__c: data.motherIncome || '',
        Debts_Loans__c: data.debtsLoans || '',
        Parent_Involvement__c: data.parentInvolvement ? 
          (data.parentInvolvement === 'inhibiting' ? 'Inhibiting' : 
           data.parentInvolvement === 'promoting' ? 'Promoting' : 'No Involvement') : '',
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
        Known_to_Welfare__c: data.knownToWelfare || false,
        Social_Worker_Name__c: data.socialWorkerName || '',
        Social_Worker_Phone__c: data.socialWorkerPhone || '',
        Youth_Promotion__c: data.youthPromotion || false,
        Youth_Worker_Name__c: data.youthWorkerName || '',
        Youth_Worker_Phone__c: data.youthWorkerPhone || '',
        
        // Assessment
        Behavioral_Issues__c: data.behavioralIssues || false,
        Behavioral_Issues_Details__c: data.behavioralIssuesDetails || '',
        Has_Potential__c: data.hasPotential || false,
        Potential_Explanation__c: data.potentialExplanation || '',
        Motivation_Level__c: data.motivationLevel ? 
          (data.motivationLevel === 'low' ? 'Low' : 
           data.motivationLevel === 'medium' ? 'Medium' : 'High') : '',
        Motivation_Type__c: data.motivationType ? 
          (data.motivationType === 'internal' ? 'Internal' : 'External') : '',
        External_Motivators__c: data.externalMotivators || '',
        Social_Status__c: data.socialStatus || '',
        Afternoon_Activities__c: data.afternoonActivities || '',
        
        // Learning & Health
        Learning_Disability__c: data.learningDisability || false,
        Learning_Disability_Explanation__c: data.learningDisabilityExplanation || '',
        Requires_Remedial_Teaching__c: data.requiresRemedialTeaching || false,
        ADHD__c: data.adhd || false,
        ADHD_Treatment__c: data.adhdTreatment || '',
        Assessment_Done__c: data.assessmentDone || false,
        Assessment_Needed__c: data.assessmentNeeded || false,
        Assessment_Details__c: data.assessmentDetails || '',
        
        // Risk Assessment
        Criminal_Record__c: data.criminalRecord || false,
        Drug_Use__c: data.drugUse || false,
        Smoking__c: data.smoking || false,
        Probation_Officer__c: data.probationOfficer || '',
        Youth_Probation_Officer__c: data.youthProbationOfficer || '',
        Psychological_Treatment__c: data.psychologicalTreatment || false,
        Psychiatric_Treatment__c: data.psychiatricTreatment || false,
        Takes_Medication__c: data.takesMedication || false,
        Medication_Description__c: data.medicationDescription || '',
        Risk_Level__c: data.riskLevel || 1,
        Risk_Factors__c: data.riskFactors || '',
        
        // Final Assessment
        Military_Service_Potential__c: data.militaryServicePotential || false,
        Can_Handle_Program__c: data.canHandleProgram || false,
        Personal_Opinion__c: data.personalOpinion || ''
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
           Siblings_Count__c, Father_Name__c, Father_Mobile__c, Father_Occupation__c,
           Father_Profession__c, Father_Income__c, Mother_Name__c, Mother_Mobile__c,
           Mother_Occupation__c, Mother_Profession__c, Mother_Income__c, Debts_Loans__c,
           Parent_Involvement__c, Economic_Status__c, Economic_Details__c, Family_Background__c,
           School_Name__c, Grade__c, Homeroom_Teacher__c, Teacher_Phone__c,
           School_Counselor_Name__c, School_Counselor_Phone__c,
           Behavioral_Issues__c, Behavioral_Issues_Details__c, Has_Potential__c,
           Potential_Explanation__c, Motivation_Level__c, Motivation_Type__c,
           External_Motivators__c, Social_Status__c, Afternoon_Activities__c,
           Learning_Disability__c, Learning_Disability_Explanation__c,
           Requires_Remedial_Teaching__c, ADHD__c, ADHD_Treatment__c,
           Assessment_Done__c, Assessment_Needed__c, Assessment_Details__c,
           Criminal_Record__c, Drug_Use__c, Smoking__c, Probation_Officer__c,
           Youth_Probation_Officer__c, Psychological_Treatment__c,
           Psychiatric_Treatment__c, Takes_Medication__c, Medication_Description__c,
           Military_Service_Potential__c, Can_Handle_Program__c, Risk_Level__c,
           Risk_Factors__c, Personal_Opinion__c, Failing_Grades_Count__c
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
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updatePartialStudentData(recordId: string, data: Record<string, any>): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Build update object with only provided fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {
        Id: recordId,
        Status__c: 'In Progress', // Mark as in progress, not fully submitted
      };

      // Map form fields to Salesforce fields (only if provided)
      if (data.studentFirstName !== undefined) updateData.Student_First_Name__c = data.studentFirstName;
      if (data.studentLastName !== undefined) updateData.Student_Last_Name__c = data.studentLastName;
      if (data.studentId !== undefined) updateData.Student_ID__c = data.studentId;
      if (data.dateOfBirth !== undefined) updateData.Date_of_Birth__c = data.dateOfBirth;
      if (data.gender !== undefined) updateData.Gender__c = data.gender === 'male' ? 'Male' : 'Female';
      if (data.countryOfBirth !== undefined) updateData.Country_of_Birth__c = data.countryOfBirth;
      if (data.immigrationYear !== undefined) updateData.Immigration_Year__c = data.immigrationYear || '';
      if (data.studentAddress !== undefined) updateData.Student_Address__c = data.studentAddress;
      if (data.studentFloor !== undefined) updateData.Student_Floor__c = data.studentFloor || '';
      if (data.studentApartment !== undefined) updateData.Student_Apartment__c = data.studentApartment || '';
      if (data.studentPhone !== undefined) updateData.Student_Phone__c = data.studentPhone;
      if (data.studentMobile !== undefined) updateData.Student_Mobile__c = data.studentMobile || '';
      if (data.schoolInfoUsername !== undefined) updateData.School_Info_Username__c = data.schoolInfoUsername || '';
      if (data.schoolInfoPassword !== undefined) updateData.School_Info_Password__c = data.schoolInfoPassword || '';

      // Family fields
      if (data.siblingsCount !== undefined) updateData.Siblings_Count__c = data.siblingsCount || 0;
      if (data.fatherName !== undefined) updateData.Father_Name__c = data.fatherName || '';
      if (data.fatherMobile !== undefined) updateData.Father_Mobile__c = data.fatherMobile || '';
      if (data.fatherOccupation !== undefined) updateData.Father_Occupation__c = data.fatherOccupation || '';
      if (data.fatherProfession !== undefined) updateData.Father_Profession__c = data.fatherProfession || '';
      if (data.fatherIncome !== undefined) updateData.Father_Income__c = data.fatherIncome || '';
      if (data.motherName !== undefined) updateData.Mother_Name__c = data.motherName || '';
      if (data.motherMobile !== undefined) updateData.Mother_Mobile__c = data.motherMobile || '';
      if (data.motherOccupation !== undefined) updateData.Mother_Occupation__c = data.motherOccupation || '';
      if (data.motherProfession !== undefined) updateData.Mother_Profession__c = data.motherProfession || '';
      if (data.motherIncome !== undefined) updateData.Mother_Income__c = data.motherIncome || '';
      if (data.debtsLoans !== undefined) updateData.Debts_Loans__c = data.debtsLoans || '';
      if (data.parentInvolvement !== undefined) updateData.Parent_Involvement__c =
        data.parentInvolvement === 'inhibiting' ? 'Inhibiting' :
        data.parentInvolvement === 'promoting' ? 'Promoting' : 'No Involvement';

      // Background
      if (data.economicStatus !== undefined) updateData.Economic_Status__c =
        data.economicStatus === 'low' ? 'Low' :
        data.economicStatus === 'medium' ? 'Medium' : 'High';
      if (data.economicDetails !== undefined) updateData.Economic_Details__c = data.economicDetails || '';
      if (data.familyBackground !== undefined) updateData.Family_Background__c = data.familyBackground || '';

      // School
      if (data.schoolName !== undefined) updateData.School_Name__c = data.schoolName;
      if (data.grade !== undefined) updateData.Grade__c = data.grade;
      if (data.homeroomTeacher !== undefined) updateData.Homeroom_Teacher__c = data.homeroomTeacher;
      if (data.teacherPhone !== undefined) updateData.Teacher_Phone__c = data.teacherPhone;
      if (data.schoolCounselorName !== undefined) updateData.School_Counselor_Name__c = data.schoolCounselorName;
      if (data.schoolCounselorPhone !== undefined) updateData.School_Counselor_Phone__c = data.schoolCounselorPhone;

      // Intake assessment
      if (data.behavioralIssues !== undefined) updateData.Behavioral_Issues__c = data.behavioralIssues;
      if (data.behavioralIssuesDetails !== undefined) updateData.Behavioral_Issues_Details__c = data.behavioralIssuesDetails || '';
      if (data.hasPotential !== undefined) updateData.Has_Potential__c = data.hasPotential;
      if (data.potentialExplanation !== undefined) updateData.Potential_Explanation__c = data.potentialExplanation || '';
      if (data.motivationLevel !== undefined) updateData.Motivation_Level__c =
        data.motivationLevel === 'low' ? 'Low' :
        data.motivationLevel === 'medium' ? 'Medium' : 'High';
      if (data.motivationType !== undefined) updateData.Motivation_Type__c =
        data.motivationType === 'internal' ? 'Internal' : 'External';
      if (data.externalMotivators !== undefined) updateData.External_Motivators__c = data.externalMotivators || '';
      if (data.socialStatus !== undefined) updateData.Social_Status__c = data.socialStatus || '';
      if (data.afternoonActivities !== undefined) updateData.Afternoon_Activities__c = data.afternoonActivities || '';

      // Learning assessment
      if (data.learningDisability !== undefined) updateData.Learning_Disability__c = data.learningDisability;
      if (data.learningDisabilityExplanation !== undefined) updateData.Learning_Disability_Explanation__c = data.learningDisabilityExplanation || '';
      if (data.requiresRemedialTeaching !== undefined) updateData.Requires_Remedial_Teaching__c = data.requiresRemedialTeaching;
      if (data.adhd !== undefined) updateData.ADHD__c = data.adhd;
      if (data.adhdTreatment !== undefined) updateData.ADHD_Treatment__c = data.adhdTreatment || '';
      if (data.assessmentDone !== undefined) updateData.Assessment_Done__c = data.assessmentDone;
      if (data.assessmentNeeded !== undefined) updateData.Assessment_Needed__c = data.assessmentNeeded;
      if (data.assessmentDetails !== undefined) updateData.Assessment_Details__c = data.assessmentDetails || '';

      // Risk assessment
      if (data.criminalRecord !== undefined) updateData.Criminal_Record__c = data.criminalRecord;
      if (data.drugUse !== undefined) updateData.Drug_Use__c = data.drugUse;
      if (data.smoking !== undefined) updateData.Smoking__c = data.smoking;
      if (data.probationOfficer !== undefined) updateData.Probation_Officer__c = data.probationOfficer || '';
      if (data.youthProbationOfficer !== undefined) updateData.Youth_Probation_Officer__c = data.youthProbationOfficer || '';
      if (data.psychologicalTreatment !== undefined) updateData.Psychological_Treatment__c = data.psychologicalTreatment;
      if (data.psychiatricTreatment !== undefined) updateData.Psychiatric_Treatment__c = data.psychiatricTreatment;
      if (data.takesMedication !== undefined) updateData.Takes_Medication__c = data.takesMedication;
      if (data.medicationDescription !== undefined) updateData.Medication_Description__c = data.medicationDescription || '';

      // Final assessment
      if (data.militaryServicePotential !== undefined) updateData.Military_Service_Potential__c = data.militaryServicePotential;
      if (data.canHandleProgram !== undefined) updateData.Can_Handle_Program__c = data.canHandleProgram;
      if (data.riskLevel !== undefined) updateData.Risk_Level__c = data.riskLevel;
      if (data.riskFactors !== undefined) updateData.Risk_Factors__c = data.riskFactors || '';
      if (data.personalOpinion !== undefined) updateData.Personal_Opinion__c = data.personalOpinion || '';
      if (data.failingGradesCount !== undefined) updateData.Failing_Grades_Count__c = data.failingGradesCount || 0;

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