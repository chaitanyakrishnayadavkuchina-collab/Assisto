import { randomString } from './helpers';

/**
 * Test data generator for candidate pre-onboarding tests
 * Generates unique test data for each test run - supporting both YOP Mail and MailSac
 */
export interface CandidateData {
  uniqueEmail: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  dateOfBirth: string;
  nationalId: string;
  aadhaarNumber: string;
  aadhaarName: string;
  panNumber: string;
  panName: string;
  panFatherName: string;
  education: {
    endYear: string;
    institutionName: string;
    degree: string;
    specialization: string;
    startYear: string;
    gpa: string;
  };
  alternateEmail: string;
  dialCode: string;
  address: {
    addressLine1: string;
    country: string;
    state: string;
    city: string;
    pinCode: string;
  };
  applicationNumber?: string;
}

/**
 * Simplified candidate data for core requirements
 */
export interface SimplifiedCandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicationNumber: string;
}

export interface HrCandidateData {
  applicantNumber: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  dialCode: string;
  mobileNumber: string;
  country: string;
  hiringPosition: string;
  joiningDate: string;
  employeeType: string;
  candidateType: string;
  shareConsentForm?: boolean;
}

/**
 * Generate alphabetic-only name (no numbers or special characters)
 */
export function generateAlphaName(length: number = 6): string {
  const alphabet = 'bcdfghjklmnpqrstvwxyz';
  let name = '';
  for (let i = 0; i < length; i++) {
    name += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Generate alphabetic-only last name (no numbers or special characters)
 */
export function generateAlphaLastName(length: number = 6): string {
  const alphabet = 'lmnopqrstuvwxyz';
  let name = '';
  for (let i = 0; i < length; i++) {
    name += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Generate unique timestamp suffix for test data
 */
function generateTimestamp(): string {
  return Date.now().toString().slice(-6);
}

/**
 * Generate random uppercase string
 */
function generateRandomUpper(length: number = 4): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return randomString(length).toUpperCase();
}

/**
 * Generate unique candidate data for all fields
 */
export function generateUniqueCandidateData(): CandidateData {
  const timestamp = generateTimestamp();
  const randomStr = randomString(6);
  const randomUpper = generateRandomUpper(4);
  
  // Use alphabetic-only names to meet validation requirements
  const alphaFirstName = generateAlphaName();
  const alphaLastName = generateAlphaLastName();

  return {
    // Unique email using mailsac.com format
    uniqueEmail: `candidate_${timestamp}_${randomStr}@mailsac.com`,
    
    // Unique applicant number (prefix with timestamp to ensure uniqueness)
    applicantNumber: `2026${timestamp}${randomStr}`,
    
    // Unique first name (alphabetic only)
    firstName: alphaFirstName,
    
    // Unique last name (alphabetic only)
    lastName: alphaLastName,
    
    // Unique mobile number (10 digits to match validation)
    mobileNumber: `99999${timestamp}`,
    
    // Use same timestamp for date of birth to keep it valid
    dateOfBirth: `01/01/2000`,
    
    // Unique national ID (10 digits with timestamp)
    nationalId: `12345${timestamp.slice(0,5)}`,
    
    // Unique Aadhaar number (with spaces)
    aadhaarNumber: `1234 5678 90${timestamp.slice(0,2)}`,
    
    // Name on Aadhaar (same as first and last name)
    aadhaarName: `${randomStr} ${randomStr} ${timestamp.slice(0,2)}`,
    
    // Unique PAN number
    panNumber: `${randomUpper}${randomUpper}${timestamp.slice(0,4)}${randomUpper}${randomUpper}`,
    
    // Name on PAN (same as first and last name)
    panName: `${randomStr} ${randomStr} ${timestamp.slice(0,2)}`,
    
    // Father's name for PAN
    panFatherName: `Father${randomStr} ${timestamp.slice(0,2)}`,
    
    // Education data
    education: {
      endYear: `${2015 + parseInt(timestamp.slice(0,1))}`,
      institutionName: `University${randomStr}${timestamp.slice(0,2)}`,
      degree: `Bachelor${randomStr}`,
      specialization: `Engineering${randomStr}`,
      startYear: `${2011 + parseInt(timestamp.slice(0,1))}`,
      gpa: `${(Math.random() * 2 + 8).toFixed(2)}`,
    },
    
    // Alternate email (different from unique email)
    alternateEmail: `alt_${timestamp}_${randomStr}@mailsac.com`,
    
    // Dial code
    dialCode: `+91`,

    // Address data
    address: {
      addressLine1: `123 Test Street${timestamp.slice(0, 2)}`,
      country: `India`,
      state: `Karnataka`,
      city: `Bengaluru`,
      pinCode: `560001`,
    },
  };
}

/**
 * Generate HR candidate data for registration
 * @param email - Optional email address (if not provided, generates a mailsac.com email)
 */
export function generateHrCandidateData(email?: string): HrCandidateData {
  const timestamp = generateTimestamp();
  const randomNumbers = Date.now().toString().slice(-6); // Purely numeric suffix
  
  // Use alphabetic-only names to meet validation requirements
  const firstName = generateAlphaName();
  const lastName = generateAlphaLastName();
  
  // Keep same random string for email to maintain consistency in test data
  const randomStr = randomString(6);
  
  // Use provided email or generate a mailsac.com email
  const personalEmail = email || `hr_candidate_${timestamp}_${randomStr}@mailsac.com`;
  
  return {
    applicantNumber: `2026${timestamp}${randomNumbers}`, // Purely numeric
    firstName: firstName,
    lastName: lastName,
    personalEmail: personalEmail,
    dialCode: `India (+91)`,
    mobileNumber: `9999${timestamp}`,
    country: `India`,
    hiringPosition: `Software Engineer`,
    joiningDate: `17-07-2026`,
    employeeType: `Full Time`,
    candidateType: `Fresher`,
    shareConsentForm: true, // Mandatory field - ensure consent is enabled
  };
}

/**
 * Generate unique email using MailSac format
 */
export function generateUniqueEmail(): string {
  const timestamp = generateTimestamp();
  const randomStr = randomString(6);
  return `test_${timestamp}_${randomStr}@mailsac.com`;
}

/**
 * Generate a random email address using MailSac format
 * @param prefix - Optional prefix for the email
 * @returns Email address like 'automation_1721887612345@mailsac.com'
 */
export function generateRandomEmail(prefix: string = 'automation'): string {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}@mailsac.com`;
}

/**
 * Generate a random name (first name only)
 * @param length - Optional length of random string (default: 6)
 * @returns Random name like 'TestAbCdEf'
 */
export function generateRandomName(length: number = 6): string {
  const randomStr = randomString(length);
  return `Test${randomStr}`;
}

/**
 * Generate a random phone number
 * @param prefix - Optional prefix for the phone number (default: '9999')
 * @returns Random phone number like '9999172188'
 */
export function generateRandomPhone(prefix: string = '9999'): string {
  const timestamp = Date.now();
  const suffix = timestamp.toString().slice(-4);
  return `${prefix}${suffix}`;
}

/**
 * Generate simplified candidate data for email generation workflows
 * @param mailSacClient - Optional MailSacClient instance to generate email
 * @param applicationNumber - Optional application number (auto-generated if not provided)
 * @returns SimplifiedCandidateData object with firstName, lastName, email, phone, applicationNumber
 */
export async function generateCandidateData(mailSacClient?: any, applicationNumber?: string): Promise<SimplifiedCandidateData> {
  // Generate compact email using MailSac format
  const email = generateRandomEmail('candidate');
  
  // Generate concise first and last name
  const firstName = generateRandomName(6);
  const lastName = `Candidate${randomString(6)}`;
  
  // Generate phone number
  const phone = generateRandomPhone();
  
  // Generate application number if not provided
  if (!applicationNumber) {
    applicationNumber = `APP${Date.now()}C${randomString(6).toUpperCase()}`;
  }
  
  return {
    firstName,
    lastName,
    email,
    phone,
    applicationNumber,
  };
}
