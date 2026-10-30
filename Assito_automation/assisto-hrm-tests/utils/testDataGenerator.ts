import { randomString } from './helpers';
import type { MailSacClient } from './MailSacClient';
import {
  randomString as randomLowerString,
  randomStringUpperCase,
  randomNum,
} from './mailGrabber';

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
    gradingSystem: string;
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
 * Generate random uppercase letters only (no digits), used for PAN letter blocks
 */
function generateRandomLetters(length: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters[Math.floor(Math.random() * letters.length)];
  }
  return result;
}

/**
 * Generate unique candidate data for all fields
 */
export function generateUniqueCandidateData(): CandidateData {
  const timestamp = generateTimestamp();
  const randomStr = randomString(6);

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
    mobileNumber: `9999${Date.now().toString().slice(-6)}`,

    // Use same timestamp for date of birth to keep it valid
    dateOfBirth: `01/01/2000`,

    // Unique national ID (10 digits with timestamp)
    nationalId: `12345${timestamp.slice(0, 5)}`,

    // Unique Aadhaar number (with spaces)
    aadhaarNumber: `1234 5678 90${timestamp.slice(0, 2)}`,

    // Name on Aadhaar (same as first and last name)
    aadhaarName: `${alphaFirstName} ${alphaLastName}`,

    // Valid Indian PAN format: 5 letters, 4 digits, 1 letter (e.g. AAAAA9999A)
    panNumber: `${generateRandomLetters(5)}${timestamp.slice(0, 4).padStart(4, '0')}${generateRandomLetters(1)}`,

    // Name on PAN (same as first and last name)
    panName: `${alphaFirstName} ${alphaLastName}`,

    // Father's name for PAN
    panFatherName: `Father${randomStr} ${timestamp.slice(0, 2)}`,

    // Education data - year-only values for the year combobox fields.
    // startYear (2011+d) is always 4 years before endYear (2015+d), so
    // startYear < endYear always holds for any single timestamp digit d (0-9).
    education: {
      endYear: String(2015 + parseInt(timestamp.slice(0, 1))),
      institutionName: `${generateAlphaName()} University`,
      degree: `Bachelor of ${generateAlphaName()}`,
      specialization: `${generateAlphaName()} Engineering`,
      startYear: String(2011 + parseInt(timestamp.slice(0, 1))),
      gpa: `${(Math.random() * 2 + 8).toFixed(2)}`,
      gradingSystem: 'CGPA',
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
  const personalEmail =
    email || `hr_candidate_${timestamp}_${randomStr}@mailsac.com`;

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
export async function generateCandidateData(
  mailSacClient?: MailSacClient,
  applicationNumber?: string,
): Promise<SimplifiedCandidateData> {
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

// ============================================================
// Self-service registration ("Start Free Trial") test data
// ============================================================

/**
 * Test-scoped data for one admin registration run.
 *
 * Deliberately an in-memory object rather than a config file: unlike the
 * Selenium framework (which wrote every generated value back into
 * config.ini), nothing here needs to outlive the test.
 */
export interface RegistrationTestData {
  email: string;
  domain?: string;
  fullName?: string;
  companyName?: string;
  phoneNumber?: string;
  password?: string;
  verificationLink?: string;
  verificationDomain?: string;
  token?: string;
}

/**
 * Password matching the Selenium generator's shape:
 * 1 uppercase + 10 lowercase + "@" + 3 digits, e.g. "Aahqhvdibem@748".
 */
export function generateRegistrationPassword(): string {
  return `${randomStringUpperCase(1)}${randomLowerString(10)}@${randomNum(3)}`;
}

/** Random lowercase-alphabetic domain name (no special characters) */
export function generateDomainName(length: number = 10): string {
  return randomLowerString(length);
}

/** Random alphabetic-only full name (the app rejects digits/symbols) */
export function generateFullName(length: number = 10): string {
  return randomLowerString(length);
}

/** Random alphabetic-only company name */
export function generateCompanyName(length: number = 10): string {
  return randomLowerString(length);
}

/** 10-digit phone number starting with 6-9 */
export function generatePhoneNumber(): string {
  return randomNum(10);
}
