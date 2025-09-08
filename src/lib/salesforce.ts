import jsforce from 'jsforce';

// Salesforce connection configuration
const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://test.salesforce.com';
const SF_USERNAME = process.env.SALESFORCE_USERNAME;
const SF_PASSWORD = process.env.SALESFORCE_PASSWORD;
const SF_SECURITY_TOKEN = process.env.SALESFORCE_SECURITY_TOKEN;

// Alternative: Use access token from SFDX (for development)
const SF_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;
const SF_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN;

export interface StudentReferralData {
  // Basic Information
  referralNumber: string;
  counselorName: string;
  counselorEmail: string;
  schoolName: string;
  
  // Student Information
  firstName: string;
  lastName: string;
  studentId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  email?: string;
  
  // Parent Information
  parentNames: string;
  parentPhone: string;
  parentEmail?: string;
  
  // Academic Information
  grade: string;
  homeroomTeacher: string;
  failingGradesCount: number;
  failingSubjects?: string;
  
  // Assessment Data
  behavioralIssues: boolean;
  hasPotential: boolean;
  motivationLevel: string;
  learningDisability: boolean;
  adhd: boolean;
  
  // Risk Assessment
  riskLevel: number;
  riskFactors?: string;
  criminalRecord: boolean;
  drugUse: boolean;
  
  // Family Background
  economicStatus: string;
  familyBackground?: string;
  parentInvolvement: string;
  
  // Additional Notes
  personalOpinion?: string;
  consentTimestamp: string;
  status: string;
}

class SalesforceService {
  private conn: jsforce.Connection | null = null;

  constructor() {
    // Initialize connection based on available credentials
    if (SF_INSTANCE_URL && SF_ACCESS_TOKEN) {
      // Use existing access token (from SFDX)
      this.conn = new jsforce.Connection({
        instanceUrl: SF_INSTANCE_URL,
        accessToken: SF_ACCESS_TOKEN,
        version: '64.0'
      });
    } else if (SF_USERNAME && SF_PASSWORD) {
      // Use username/password authentication
      this.conn = new jsforce.Connection({
        loginUrl: SF_LOGIN_URL,
        version: '64.0'
      });
    }
  }

  async connect(): Promise<void> {
    if (!this.conn) {
      throw new Error('Salesforce connection not configured');
    }

    // If using username/password, need to login first
    if (SF_USERNAME && SF_PASSWORD && !SF_ACCESS_TOKEN) {
      const password = SF_SECURITY_TOKEN 
        ? `${SF_PASSWORD}${SF_SECURITY_TOKEN}`
        : SF_PASSWORD;
      
      try {
        await this.conn.login(SF_USERNAME, password);
        console.log('Successfully connected to Salesforce');
      } catch (error) {
        console.error('Failed to connect to Salesforce:', error);
        throw error;
      }
    }
  }

  async createLead(data: StudentReferralData): Promise<string> {
    if (!this.conn) {
      throw new Error('Salesforce connection not available');
    }

    try {
      // Map to Salesforce Lead object
      const lead = {
        FirstName: data.firstName,
        LastName: data.lastName,
        Company: data.schoolName, // Required field for Lead
        Email: data.email,
        Phone: data.phone,
        Street: data.address,
        LeadSource: 'School Referral',
        Status: 'New',
        Description: `
מספר הפניה: ${data.referralNumber}
תאריך לידה: ${data.dateOfBirth}
ת.ז.: ${data.studentId}
כיתה: ${data.grade}

יועץ מפנה: ${data.counselorName}
בית ספר: ${data.schoolName}
מחנך/ת: ${data.homeroomTeacher}

הורים: ${data.parentNames}
טלפון הורים: ${data.parentPhone}
${data.parentEmail ? `אימייל הורים: ${data.parentEmail}` : ''}

הערכת סיכון: ${data.riskLevel}/10
מצב כלכלי: ${data.economicStatus}
מעורבות הורים: ${data.parentInvolvement}

בעיות התנהגות: ${data.behavioralIssues ? 'כן' : 'לא'}
פוטנציאל: ${data.hasPotential ? 'כן' : 'לא'}
רמת מוטיבציה: ${data.motivationLevel}

לקות למידה: ${data.learningDisability ? 'כן' : 'לא'}
ADHD: ${data.adhd ? 'כן' : 'לא'}
ציונים נכשלים: ${data.failingGradesCount}

רקע פלילי: ${data.criminalRecord ? 'כן' : 'לא'}
שימוש בסמים: ${data.drugUse ? 'כן' : 'לא'}

חוות דעת: ${data.personalOpinion || 'אין'}
        `.trim(),
        // Use existing custom fields
        Gender__c: data.gender === 'Male' ? 'זכר' : 'נקבה',
        TypeOfLead__c: 'הפניה מבית ספר',
        Field1__c: data.riskLevel >= 7 ? 'גבוהה' : data.riskLevel >= 4 ? 'בינונית' : 'נמוכה', // Priority
        Field2__c: `${data.riskLevel}`, // Rating level (as string)
        Field3__c: `${data.riskFactors || ''}${data.personalOpinion ? '\n\nחוות דעת: ' + data.personalOpinion : ''}` // Reason/notes
      };

      const result = await this.conn.sobject('Lead').create(lead);
      
      if (result.success) {
        console.log('Lead created successfully:', result.id);
        return result.id;
      } else {
        throw new Error('Failed to create Lead');
      }
    } catch (error) {
      console.error('Error creating Lead in Salesforce:', error);
      throw error;
    }
  }

  async createContact(data: StudentReferralData): Promise<string> {
    if (!this.conn) {
      throw new Error('Salesforce connection not available');
    }

    try {
      // Create Contact for the student
      const contact = {
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.email,
        Phone: data.phone,
        MailingStreet: data.address,
        Birthdate: data.dateOfBirth,
        Description: `Student referred by ${data.counselorName} from ${data.schoolName}`,
        // Custom fields
        Student_ID__c: data.studentId,
        Gender__c: data.gender,
        Grade__c: data.grade,
        School_Name__c: data.schoolName,
        Referral_Number__c: data.referralNumber
      };

      const result = await this.conn.sobject('Contact').create(contact);
      
      if (result.success) {
        console.log('Contact created successfully:', result.id);
        return result.id;
      } else {
        throw new Error('Failed to create Contact');
      }
    } catch (error) {
      console.error('Error creating Contact in Salesforce:', error);
      throw error;
    }
  }

  async createCase(data: StudentReferralData, contactId?: string): Promise<string> {
    if (!this.conn) {
      throw new Error('Salesforce connection not available');
    }

    try {
      // Create Case for tracking the referral
      const caseData = {
        Subject: `Student Referral - ${data.firstName} ${data.lastName}`,
        Description: `
          Referral from ${data.schoolName}
          Counselor: ${data.counselorName}
          Grade: ${data.grade}
          Risk Level: ${data.riskLevel}/10
          
          Academic Status:
          - Failing Grades: ${data.failingGradesCount}
          - Subjects: ${data.failingSubjects || 'N/A'}
          
          Assessment:
          - Behavioral Issues: ${data.behavioralIssues ? 'Yes' : 'No'}
          - Learning Disability: ${data.learningDisability ? 'Yes' : 'No'}
          - ADHD: ${data.adhd ? 'Yes' : 'No'}
          - Motivation Level: ${data.motivationLevel}
          
          Family:
          - Economic Status: ${data.economicStatus}
          - Parent Involvement: ${data.parentInvolvement}
          
          Notes: ${data.personalOpinion || 'None'}
        `.trim(),
        Status: 'New',
        Priority: data.riskLevel >= 7 ? 'High' : data.riskLevel >= 4 ? 'Medium' : 'Low',
        Origin: 'School Referral',
        ContactId: contactId,
        // Custom fields
        Referral_Number__c: data.referralNumber,
        Risk_Level__c: data.riskLevel
      };

      const result = await this.conn.sobject('Case').create(caseData);
      
      if (result.success) {
        console.log('Case created successfully:', result.id);
        return result.id;
      } else {
        throw new Error('Failed to create Case');
      }
    } catch (error) {
      console.error('Error creating Case in Salesforce:', error);
      throw error;
    }
  }

  async createOpportunity(data: StudentReferralData, contactId?: string): Promise<string> {
    if (!this.conn) {
      throw new Error('Salesforce connection not available');
    }

    try {
      // Create Opportunity for program enrollment tracking
      const opportunity = {
        Name: `${data.firstName} ${data.lastName} - Gesher Program`,
        StageName: 'Qualification',
        CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        Amount: 0, // Non-profit, no amount
        Description: `
          Student referral for Gesher Al HaNoar program
          Risk Level: ${data.riskLevel}/10
          Grade: ${data.grade}
        `.trim(),
        ContactId: contactId,
        // Custom fields
        Referral_Number__c: data.referralNumber,
        Program_Type__c: 'Student Support',
        Risk_Level__c: data.riskLevel
      };

      const result = await this.conn.sobject('Opportunity').create(opportunity);
      
      if (result.success) {
        console.log('Opportunity created successfully:', result.id);
        return result.id;
      } else {
        throw new Error('Failed to create Opportunity');
      }
    } catch (error) {
      console.error('Error creating Opportunity in Salesforce:', error);
      throw error;
    }
  }

  async processReferral(data: StudentReferralData): Promise<{
    success: boolean;
    leadId?: string;
    contactId?: string;
    caseId?: string;
    opportunityId?: string;
    error?: string;
  }> {
    try {
      await this.connect();

      // Create Lead (or Contact based on org preference)
      const leadId = await this.createLead(data);
      
      // Optionally create related records
      // const contactId = await this.createContact(data);
      // const caseId = await this.createCase(data, contactId);
      // const opportunityId = await this.createOpportunity(data, contactId);

      return {
        success: true,
        leadId,
        // contactId,
        // caseId,
        // opportunityId
      };
    } catch (error) {
      console.error('Error processing referral in Salesforce:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async checkCustomFields(): Promise<void> {
    if (!this.conn) {
      throw new Error('Salesforce connection not available');
    }

    try {
      await this.connect();
      
      // Describe Lead object to check available fields
      const leadDescription = await this.conn.sobject('Lead').describe();
      
      console.log('Lead object custom fields:');
      leadDescription.fields
        .filter(field => field.custom)
        .forEach(field => {
          console.log(`- ${field.name}: ${field.type}`);
        });
    } catch (error) {
      console.error('Error checking custom fields:', error);
    }
  }
}

export default SalesforceService;