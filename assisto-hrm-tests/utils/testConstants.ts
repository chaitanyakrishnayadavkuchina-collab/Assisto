/**
 * Test configuration constants for candidate pre-onboarding tests
 */

// Email service configuration
export const YOP_MAIL_BASE_URL = 'https://yopmail.com/wm';
export const MAIL_SAC_BASE_URL = 'https://api.mailsac.com';
export const DEFAULT_EMAIL_TIMEOUT = 120000; // 2 minutes timeout for MailSac
export const MAIL_SAC_POLL_INTERVAL = 5000; // 5 seconds between polls
export const DEFAULT_MAIL_SAC_API_KEY = 'your-mail-sac-api-key';

// Page load timeouts
export const DEFAULT_PAGE_LOAD_TIMEOUT = 30000;
export const DEFAULT_ELEMENT_TIMEOUT = 10000;

// Retry configuration
export const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_RETRY_DELAY = 2000;

// Test data defaults
export const DEFAULT_DIAL_CODE = '+91';
export const DEFAULT_COUNTRY = 'India';
export const DEFAULT_HIRING_POSITION = 'Software engineer';
export const DEFAULT_JOINING_DATE = '17-07-2026';
export const DEFAULT_EMPLOYEE_TYPE = 'Full Time';
export const DEFAULT_CANDIDATE_TYPE = 'Fresher';

// Email verification constants
export const EMAIL_SUBJECT_SUBSTRING = 'Submit Your Documents';
export const EMAIL_SENDER = 'onboarding@nspassisto.com';

// UI element locators (can be overridden if needed)
export const UI_SELECTORS = {
  candidateManagementTitle: 'h1:has-text("Candidate Management")',
  newButton: 'button:has-text("New")',
  drawer: 'div[role="dialog"]',
  requestDocumentsButton: 'button:has-text("Request Documents")',
  submitDocumentsButton: 'button:has-text("Submit Documents")',
};

// Test environment defaults
export const TEST_EMAIL = 'orgnization1@sharklasers.com';
export const TEST_PASSWORD = 'Welcome@123';
