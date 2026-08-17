import { randomString } from './helpers';

/**
 * Deliberately-invalid data variants for negative/validation testing.
 * Counterpart to testDataGenerator.ts, which only ever produces valid data.
 */
export interface InvalidVariant {
  value: string;
  description: string;
}

export function generateInvalidEmailFormats(): InvalidVariant[] {
  const stamp = randomString(4);
  return [
    { value: `no-at-symbol-${stamp}.com`, description: 'missing @ symbol' },
    { value: `no-domain-${stamp}@`, description: 'missing domain' },
    { value: `@no-local-part-${stamp}.com`, description: 'missing local part' },
    { value: `no tld ${stamp}@mailsac`, description: 'missing TLD and contains spaces' },
    { value: `double..dot-${stamp}@mailsac.com`, description: 'consecutive dots in local part' },
    { value: `trailing-dot-${stamp}@mailsac.com.`, description: 'trailing dot after TLD' },
    { value: `${'a'.repeat(65)}${stamp}@mailsac.com`, description: 'local part exceeds 64 chars' },
  ];
}

export function generateInvalidPhoneNumbers(): InvalidVariant[] {
  return [
    { value: '123', description: 'too short (3 digits)' },
    { value: '9999999999999999', description: 'too long (16 digits)' },
    { value: 'abcdefghij', description: 'alphabetic characters' },
    { value: '99999-99999', description: 'contains a hyphen' },
    { value: '0000000000', description: 'all-zero number' },
    { value: '99 99 99 99 99', description: 'contains spaces' },
  ];
}

export function generateInvalidAadhaarNumbers(): InvalidVariant[] {
  return [
    { value: '1234 5678 901', description: '11 digits (too short)' },
    { value: '1234 5678 90123', description: '13 digits (too long)' },
    { value: 'ABCD 5678 9012', description: 'contains alphabetic characters' },
    { value: '0000 0000 0000', description: 'all zeros' },
    { value: '1234-5678-9012', description: 'wrong separator (hyphens instead of spaces)' },
  ];
}

export function generateInvalidPanNumbers(): InvalidVariant[] {
  return [
    { value: '12345ABCDE', description: 'digits-then-letters (wrong order)' },
    { value: 'aaaaa1234a', description: 'lowercase instead of uppercase' },
    { value: 'AAAA1234A', description: '9 characters (too short)' },
    { value: 'AAAAAA1234A', description: '11 characters (too long)' },
    { value: 'AAAAA12345', description: 'missing trailing letter' },
    { value: '1234567890', description: 'all-numeric' },
  ];
}

export function generateNameMismatchData(baseFirstName: string, baseLastName: string): {
  aadhaarName: string;
  panName: string;
  formName: string;
} {
  return {
    aadhaarName: `${baseFirstName} ${baseLastName}`,
    panName: `Mismatched${randomString(4)} NotSameName${randomString(4)}`,
    formName: `${baseFirstName} ${baseLastName}`,
  };
}

export function generateInvalidDatesOfBirth(): InvalidVariant[] {
  const nextYear = new Date().getFullYear() + 1;
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  return [
    { value: `01/01/${nextYear}`, description: 'date of birth in the future' },
    { value: todayStr, description: "today's date" },
    { value: '01/01/1899', description: 'implausibly old (pre-1900)' },
    { value: '30/02/2000', description: 'invalid calendar date (Feb 30)' },
    { value: '13/13/2000', description: 'malformed month value' },
  ];
}

export function generateInvalidEducationYearPairs(): { startYear: string; endYear: string; description: string }[] {
  const currentYear = new Date().getFullYear();
  return [
    { startYear: '2020', endYear: '2020', description: 'start year equals end year' },
    { startYear: '2022', endYear: '2018', description: 'start year after end year' },
    { startYear: '2020', endYear: String(currentYear + 5), description: 'end year far in the future' },
    { startYear: '1940', endYear: '1945', description: 'implausibly old start year (pre-1950)' },
  ];
}

export function generateInvalidGpaValues(): InvalidVariant[] {
  return [
    { value: '-1.0', description: 'negative GPA' },
    { value: '10.5', description: 'exceeds 10.0 CGPA scale' },
    { value: '105', description: 'exceeds 100 percentage scale' },
    { value: '0', description: 'zero GPA' },
    { value: 'abc', description: 'non-numeric GPA' },
  ];
}

export function generateInvalidCtcValues(): InvalidVariant[] {
  return [
    { value: '0', description: 'zero CTC' },
    { value: '-500000', description: 'negative CTC' },
    { value: 'abcdef', description: 'non-numeric CTC' },
    { value: '12345.6789', description: 'excessive decimal precision' },
    { value: '999999999999999', description: 'unrealistic overflow value (15 digits)' },
  ];
}

export function generateInvalidVariablePayValues(ctc: number): InvalidVariant[] {
  return [
    { value: '-10000', description: 'negative variable pay' },
    { value: 'xyz', description: 'non-numeric variable pay' },
    { value: String(ctc + 100000), description: 'variable pay greater than CTC' },
  ];
}

export function generateOverlongAddressStrings(): { boundaryLength: string; overBoundary: string } {
  return {
    boundaryLength: 'A'.repeat(255),
    overBoundary: 'A'.repeat(256),
  };
}

export function generateFakeOfferLetterTitles(): InvalidVariant[] {
  return [
    { value: 'A'.repeat(300), description: 'excessively long title (300 chars)' },
    { value: 'Ünïcödé Öffér Lëttér Tïtlé 你好', description: 'unicode characters' },
    { value: '!@#$%^&*()_+-=[]{}|;:,.<>?', description: 'special characters only' },
    { value: '1234567890', description: 'numeric-only title' },
    { value: '   ', description: 'whitespace-only title' },
  ];
}

export interface InvalidFileUpload {
  path: string;
  description: string;
}

/** References prep fixture files under test-data/ — see test-data/README for how they were generated. */
export function generateInvalidFileUploads(): InvalidFileUpload[] {
  return [
    { path: 'test-data/test-upload-wrong-type.txt', description: 'wrong MIME type (.txt instead of an image)' },
    { path: 'test-data/test-upload-oversized.png', description: 'oversized image file' },
    { path: 'test-data/test-upload-corrupt.png', description: 'zero-byte/corrupt file' },
  ];
}
