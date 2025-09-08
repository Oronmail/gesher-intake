import jsforce from 'jsforce';

// Salesforce connection configuration
const SF_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || '';
const SF_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN || '';

// Interface for the complete registration request data
export interface RegistrationRequestData {
  // Metadata
  referralNumber: string;
  submissionDate: string;
  consentDate: string;
  
  // Counselor & School
  counselorName: string;
  counselorEmail: string;
  schoolName: string;
  
  // Student Personal Information
  studentFirstName: string;
  studentLastName: string;
  studentId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  countryOfBirth: string;
  immigrationYear?: string;
  studentAddress: string;
  studentFloor?: string;
  studentApartment?: string;
  studentPhone: string;
  studentMobile?: string;
  schoolSystemPassword?: string;
  
  // Parent/Guardian Information
  parent1Name: string;
  parent1Id: string;
  parent1Address?: string;
  parent1Phone?: string;
  parent1Signature: string; // Base64
  parent2Name?: string;
  parent2Id?: string;
  parent2Address?: string;
  parent2Phone?: string;
  parent2Signature?: string; // Base64
  parentEmail?: string;
  
  // Family Information
  siblingsCount: number;
  fatherName: string;
  fatherMobile: string;
  fatherOccupation: string;
  fatherProfession: string;
  fatherIncome?: string;
  motherName: string;
  motherMobile: string;
  motherOccupation: string;
  motherProfession: string;
  motherIncome?: string;
  debtsLoans?: string;
  parentInvolvement: 'inhibiting' | 'promoting' | 'no_involvement';
  economicStatus: 'low' | 'medium' | 'high';
  economicDetails?: string;
  familyBackground?: string;
  
  // School & Academic
  grade: string;
  homeroomTeacher: string;
  teacherPhone: string;
  schoolCounselorName: string;
  schoolCounselorPhone: string;
  failingGradesCount: number;
  failingSubjects?: string;
  
  // Welfare & Social Services
  knownToWelfare: boolean;
  socialWorkerName?: string;
  socialWorkerPhone?: string;
  youthPromotion: boolean;
  youthWorkerName?: string;
  youthWorkerPhone?: string;
  
  // Assessment
  behavioralIssues: boolean;
  hasPotential: boolean;
  motivationLevel: 'low' | 'medium' | 'high';
  motivationType: 'internal' | 'external';
  externalMotivators?: string;
  socialStatus?: string;
  afternoonActivities?: string;
  
  // Learning & Health
  learningDisability: boolean;
  requiresRemedialTeaching?: boolean;
  adhd: boolean;
  adhdTreatment?: string;
  assessmentDone: boolean;
  assessmentNeeded: boolean;
  assessmentDetails?: string;
  
  // Risk Assessment
  criminalRecord: boolean;
  drugUse: boolean;
  smoking: boolean;
  probationOfficer?: string;
  youthProbationOfficer?: string;
  psychologicalTreatment: boolean;
  psychiatricTreatment: boolean;
  takesMedication: boolean;
  medicationDescription?: string;
  riskLevel: number;
  riskFactors?: string;
  
  // Final Assessment
  militaryServicePotential: boolean;
  canHandleProgram: boolean;
  personalOpinion?: string;
}

class SalesforceService {
  private conn: jsforce.Connection | null = null;

  constructor() {
    // Initialize connection with access token
    if (SF_INSTANCE_URL && SF_ACCESS_TOKEN) {
      this.conn = new jsforce.Connection({
        instanceUrl: SF_INSTANCE_URL,
        accessToken: SF_ACCESS_TOKEN,
        version: '64.0'
      });
      console.log('Salesforce connection initialized');
    } else {
      console.error('Salesforce credentials not configured');
    }
  }

  /**
   * Create a Registration Request record in Salesforce Queue
   */
  async createRegistrationRequest(data: RegistrationRequestData): Promise<{
    success: boolean;
    recordId?: string;
    error?: string;
  }> {
    if (!this.conn) {
      return {
        success: false,
        error: 'Salesforce connection not available'
      };
    }

    try {
      // Map data to Salesforce Registration_Request__c object
      const registrationRequest = {
        // Metadata
        Referral_Number__c: data.referralNumber,
        Status__c: 'Pending Review',
        Priority__c: data.riskLevel >= 7 ? 'High' : data.riskLevel >= 4 ? 'Medium' : 'Low',
        Submission_Date__c: data.submissionDate,
        Consent_Date__c: data.consentDate,
        
        // Counselor & School
        Counselor_Name__c: data.counselorName,
        Counselor_Email__c: data.counselorEmail,
        School_Name__c: data.schoolName,
        
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
        
        // Parent/Guardian Information
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
        Parent_Email__c: data.parentEmail || '',
        
        // Family Information
        Siblings_Count__c: data.siblingsCount,
        Father_Name__c: data.fatherName,
        Father_Mobile__c: data.fatherMobile,
        Father_Occupation__c: data.fatherOccupation,
        Father_Profession__c: data.fatherProfession,
        Father_Income__c: data.fatherIncome || '',
        Mother_Name__c: data.motherName,
        Mother_Mobile__c: data.motherMobile,
        Mother_Occupation__c: data.motherOccupation,
        Mother_Profession__c: data.motherProfession,
        Mother_Income__c: data.motherIncome || '',
        Debts_Loans__c: data.debtsLoans || '',
        Parent_Involvement__c: 
          data.parentInvolvement === 'inhibiting' ? 'Inhibiting' :
          data.parentInvolvement === 'promoting' ? 'Promoting' : 'No Involvement',
        Economic_Status__c: 
          data.economicStatus === 'low' ? 'Low' :
          data.economicStatus === 'medium' ? 'Medium' : 'High',
        Economic_Details__c: data.economicDetails || '',
        Family_Background__c: data.familyBackground || '',
        
        // School & Academic
        Grade__c: data.grade,
        Homeroom_Teacher__c: data.homeroomTeacher,
        Teacher_Phone__c: data.teacherPhone,
        School_Counselor_Name__c: data.schoolCounselorName,
        School_Counselor_Phone__c: data.schoolCounselorPhone,
        Failing_Grades_Count__c: data.failingGradesCount,
        Failing_Subjects__c: data.failingSubjects || '',
        
        // Welfare & Social Services
        Known_to_Welfare__c: data.knownToWelfare,
        Social_Worker_Name__c: data.socialWorkerName || '',
        Social_Worker_Phone__c: data.socialWorkerPhone || '',
        Youth_Promotion__c: data.youthPromotion,
        Youth_Worker_Name__c: data.youthWorkerName || '',
        Youth_Worker_Phone__c: data.youthWorkerPhone || '',
        
        // Assessment
        Behavioral_Issues__c: data.behavioralIssues,
        Has_Potential__c: data.hasPotential,
        Motivation_Level__c: 
          data.motivationLevel === 'low' ? 'Low' :
          data.motivationLevel === 'medium' ? 'Medium' : 'High',
        Motivation_Type__c: 
          data.motivationType === 'internal' ? 'Internal' : 'External',
        External_Motivators__c: data.externalMotivators || '',
        Social_Status__c: data.socialStatus || '',
        Afternoon_Activities__c: data.afternoonActivities || '',
        
        // Learning & Health
        Learning_Disability__c: data.learningDisability,
        Requires_Remedial_Teaching__c: data.requiresRemedialTeaching || false,
        ADHD__c: data.adhd,
        ADHD_Treatment__c: data.adhdTreatment || '',
        Assessment_Done__c: data.assessmentDone,
        Assessment_Needed__c: data.assessmentNeeded,
        Assessment_Details__c: data.assessmentDetails || '',
        
        // Risk Assessment
        Criminal_Record__c: data.criminalRecord,
        Drug_Use__c: data.drugUse,
        Smoking__c: data.smoking,
        Probation_Officer__c: data.probationOfficer || '',
        Youth_Probation_Officer__c: data.youthProbationOfficer || '',
        Psychological_Treatment__c: data.psychologicalTreatment,
        Psychiatric_Treatment__c: data.psychiatricTreatment,
        Takes_Medication__c: data.takesMedication,
        Medication_Description__c: data.medicationDescription || '',
        Risk_Level__c: data.riskLevel,
        Risk_Factors__c: data.riskFactors || '',
        
        // Final Assessment
        Military_Service_Potential__c: data.militaryServicePotential,
        Can_Handle_Program__c: data.canHandleProgram,
        Personal_Opinion__c: data.personalOpinion || ''
      };

      console.log('Creating Registration Request in Salesforce...');
      const result = await this.conn.sobject('Registration_Request__c').create(registrationRequest);
      
      if (result.success) {
        console.log('Registration Request created successfully:', result.id);
        return {
          success: true,
          recordId: result.id
        };
      } else {
        console.error('Failed to create Registration Request:', result);
        return {
          success: false,
          error: 'Failed to create record in Salesforce'
        };
      }
    } catch (error) {
      console.error('Error creating Registration Request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Test connection and check if Registration_Request__c object exists
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!this.conn) {
      return {
        success: false,
        message: 'Salesforce connection not configured'
      };
    }

    try {
      // Try to describe the Registration_Request__c object
      const objectMetadata = await this.conn.sobject('Registration_Request__c').describe();
      
      console.log('Registration_Request__c object found');
      console.log(`Object has ${objectMetadata.fields.length} fields`);
      
      return {
        success: true,
        message: `Connected to Salesforce. Registration_Request__c object has ${objectMetadata.fields.length} fields.`
      };
    } catch (error) {
      console.error('Error testing Salesforce connection:', error);
      
      if (error instanceof Error && error.message.includes('INVALID_TYPE')) {
        return {
          success: false,
          message: 'Registration_Request__c object not found in Salesforce. Please create the custom object first.'
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

export default SalesforceService;