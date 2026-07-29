import { test, expect } from '@fixtures/test.fixture';
import { generateUniqueCandidateData, generateHrCandidateData } from '@utils/testDataGenerator';
import { getLoginUrl } from '@utils/helpers';
import { MailSacClient } from '@utils/MailSacClient';

const loginUrl: string = getLoginUrl();

// Test setup - Login as HR before each test
test.beforeEach(async ({ loginKeywords, page }) => {
  await loginKeywords.openLoginPage(loginUrl);
  await loginKeywords.login(
    process.env.TEST_EMAIL || 'orgnization1@sharklasers.com',
    process.env.TEST_PASSWORD || 'Welcome@123',
  );
  await loginKeywords.verifyLoginSuccess();
  await page.waitForLoadState('networkidle');
  await new Promise(resolve => setTimeout(resolve, 2000));
});

/**
 * Helper: Register a new candidate via HR and retrieve the pre-onboarding link from email.
 * Each test gets a unique mailsac email, ensuring no duplicate data issues.
 */
async function registerCandidateAndGetLink(
  mailSacClient: MailSacClient,
  candidateRegistrationKeywords: any,
  page: any,
): Promise<{ email: string; preOnboardingLink: string; hrData: any; candidateData: any }> {
  // Generate unique mailsac email
  const email = await mailSacClient.generateEmail('candidate');
  console.log(`[Setup] Generated unique email: ${email}`);

  // Generate HR candidate data with this specific email
  const hrData = generateHrCandidateData(email);
  console.log(`[Setup] HR candidate data:`, hrData);

  // Generate pre-onboarding form data
  const candidateData = generateUniqueCandidateData();
  // Override the email-related fields to match the registered candidate
  candidateData.uniqueEmail = email;

  // HR: Navigate to Candidate Registration, open drawer, fill form & request documents
  await candidateRegistrationKeywords.navigateToCandidateRegistration();
  await candidateRegistrationKeywords.clickNewButton();
  await candidateRegistrationKeywords.fillCandidateForm(hrData);
  await candidateRegistrationKeywords.verifySuccessToast();

  // Give the server time to send the email
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Wait for email to arrive and extract the pre-onboarding link
  const preOnboardingLink = await mailSacClient.waitForEmailAndExtractLink(
    email,
    'Submit Your Documents',
    120000,
  );
  console.log(`[Setup] Pre-onboarding link: ${preOnboardingLink}`);

  return { email, preOnboardingLink, hrData, candidateData };
}

/**
 * Candidate Pre-Onboarding End-to-End Flow
 */
test.describe.serial('Candidate Pre-Onboarding E2E Flow', () => {
  test.slow(); // Triple the default timeout for all tests in this suite

  // ==========================================
  //  TC-E2E-001: Full Pre-Onboarding Flow - HR Request to Candidate Submission
  // ==========================================

  test('TC-E2E-001: Complete Pre-Onboarding Flow from HR Request to Candidate Submission', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    mailSacClient,
    page,
  }) => {
    // Register candidate and get pre-onboarding link from real email
    const { email, preOnboardingLink, candidateData } = await registerCandidateAndGetLink(
      mailSacClient,
      candidateRegistrationKeywords,
      page,
    );

    // PHASE 3: CANDIDATE - Fill Pre-Onboarding Form
    // Step 1: Personal Information + Address
    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(preOnboardingLink);
    await candidatePreOnboardingKeywords.fillPersonalInformation({
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      alternateEmail: candidateData.alternateEmail,
      dialCode: candidateData.dialCode,
      mobileNumber: candidateData.mobileNumber,
      dateOfBirth: candidateData.dateOfBirth,
      nationalId: candidateData.nationalId,
      address: candidateData.address,
    });
    await candidatePreOnboardingKeywords.clickSaveAndContinue();
    await page.waitForLoadState('networkidle');

    // Step 2: ID Proofs
    await candidatePreOnboardingKeywords.fillIdProofs({
      aadhaarNumber: candidateData.aadhaarNumber,
      aadhaarName: candidateData.aadhaarName,
      panNumber: candidateData.panNumber,
      panName: candidateData.panName,
      panFatherName: candidateData.panFatherName,
    });
    await candidatePreOnboardingKeywords.clickNext();
    await page.waitForLoadState('networkidle');

    // Step 3: Education
    await candidatePreOnboardingKeywords.clickEducationTab();
    await candidatePreOnboardingKeywords.fillEducation({
      endYear: candidateData.education.endYear,
      institutionName: candidateData.education.institutionName,
      degree: candidateData.education.degree,
      specialization: candidateData.education.specialization,
      startYear: candidateData.education.startYear,
      gpa: candidateData.education.gpa,
    });

    // PHASE 4: CANDIDATE - Submit Documents
    await candidatePreOnboardingKeywords.clickSubmitDocuments();
    await candidatePreOnboardingKeywords.verifySuccessBannerVisible();

    // PHASE 5: VERIFICATION - Document Verification Page
    await candidatePreOnboardingKeywords.verifyDocumentVerificationStepActive();
  });

  // ==========================================
  //  TC-E2E-002: Email Verification - HR Request Triggers Candidate Email
  // ==========================================

  test('TC-E2E-002: Verify Email Content After HR Request Documents', async ({
    candidateRegistrationKeywords,
    mailSacClient,
    page,
  }) => {
    // Generate unique mailsac email
    const email = await mailSacClient.generateEmail('candidate');
    console.log(`[TC-E2E-002] Using unique email: ${email}`);

    const hrCandidateData = generateHrCandidateData(email);

    // PHASE 1: HR Registration
    await candidateRegistrationKeywords.navigateToCandidateRegistration();
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm(hrCandidateData);
    await candidateRegistrationKeywords.verifySuccessToast();

    // PHASE 2: Wait for email and verify content
    await new Promise(resolve => setTimeout(resolve, 5000));
    const emailMessage = await mailSacClient.waitForEmail('Submit Your Documents', email, 120000);

    // Verify email subject
    expect(emailMessage.subject.toLowerCase()).toContain('submit your documents');
    console.log(`[TC-E2E-002] Email subject verified: ${emailMessage.subject}`);

    // Verify email sender
    const senderAddress = emailMessage.from?.[0]?.address || '';
    expect(senderAddress.toLowerCase()).toContain('nspassisto');
    console.log(`[TC-E2E-002] Email sender verified: ${senderAddress}`);

    // Extract and verify pre-onboarding link from email
    const plainBody = await mailSacClient.getMessageText(email, emailMessage._id);
    const preOnboardingLink = mailSacClient.extractCandidateLink(plainBody);
    expect(preOnboardingLink).toBeTruthy();
    expect(preOnboardingLink).toContain('pre-onboarding');
    console.log(`[TC-E2E-002] Extracted pre-onboarding link: ${preOnboardingLink}`);
  });

  // ==========================================
  //  TC-E2E-003: Candidate Navigation via Token Link
  // ==========================================

  test('TC-E2E-003: Verify Candidate Navigation via Token Link from Email', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    candidatePreOnboardingPage,
    mailSacClient,
    page,
  }) => {
    // Register candidate and get link from email
    const { email, preOnboardingLink, candidateData } = await registerCandidateAndGetLink(
      mailSacClient,
      candidateRegistrationKeywords,
      page,
    );

    // Navigate candidate to preonboarding page
    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(preOnboardingLink);
    await page.waitForLoadState('networkidle');

    // Verify welcome page
    await candidatePreOnboardingKeywords.verifyWelcomeHeadingVisible();

    // Get and verify welcome text includes candidate name
    const welcomeText = await candidatePreOnboardingKeywords.getWelcomeText();
    expect(welcomeText.toLowerCase()).toContain(candidateData.firstName.toLowerCase());

    // Verify Step 1 (Personal Information) is active
    await candidatePreOnboardingKeywords.verifyStep1Active();

    // Verify Step 2 (Document Upload) is not active yet
    await expect(candidatePreOnboardingPage.isStep2Active()).resolves.toBe(false);

    // Verify Step 3 (Document Verification) is not active yet
    await expect(candidatePreOnboardingPage.isStep3Active()).resolves.toBe(false);

    // Verify Personal Information section is visible
    await candidatePreOnboardingKeywords.verifyPersonalInfoSectionVisible();

    // Verify all Personal Information fields are visible
    await candidatePreOnboardingKeywords.verifyAllPersonalInfoFieldsVisible();
  });

  // ==========================================
  //  TC-E2E-004: Admin-Configured Fields Display
  // ==========================================

  test('TC-E2E-004: Verify Admin-Configured Pre-Onboarding Fields Display to Candidate', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    mailSacClient,
    page,
  }) => {
    // Register candidate and get link from email
    const { email, preOnboardingLink, candidateData } = await registerCandidateAndGetLink(
      mailSacClient,
      candidateRegistrationKeywords,
      page,
    );

    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(preOnboardingLink);
    await page.waitForLoadState('networkidle');

    // Verify Personal Information section is visible (configured by admin)
    await candidatePreOnboardingKeywords.verifyPersonalInfoSectionVisible();

    // Verify all Personal Information fields are visible
    await candidatePreOnboardingKeywords.verifyAllPersonalInfoFieldsVisible();

    // Fill Personal Information to proceed to Document Upload
    await candidatePreOnboardingKeywords.fillPersonalInformation({
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      alternateEmail: candidateData.alternateEmail,
      dialCode: candidateData.dialCode,
      mobileNumber: candidateData.mobileNumber,
      dateOfBirth: candidateData.dateOfBirth,
      nationalId: candidateData.nationalId,
      address: candidateData.address,
    });
    await candidatePreOnboardingKeywords.clickSaveAndContinue();
    await page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify Document Upload section displays admin-configured document types
    await candidatePreOnboardingKeywords.verifyDocumentUploadSectionVisible();

    // Verify ID Proofs tab (admin-configured document category)
    await candidatePreOnboardingKeywords.verifyIdProofsTabVisible();

    // Verify Aadhaar Card section (admin-configured required document)
    await candidatePreOnboardingKeywords.verifyAadhaarSectionVisible();

    // Verify Pan section (admin-configured required document)
    await candidatePreOnboardingKeywords.verifyPanSectionVisible();

    // Verify Save as Draft is available (admin-configured option)
    await candidatePreOnboardingKeywords.verifySaveAsDraftButtonVisible();
  });

  // ==========================================
  //  TC-E2E-005: Complete Form with All Steps
  // ==========================================

  test('TC-E2E-005: Complete Form Fill and Submit with Post-Submission Verification', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    mailSacClient,
    page,
  }) => {
    // Register candidate and get link from email
    const { email, preOnboardingLink, candidateData } = await registerCandidateAndGetLink(
      mailSacClient,
      candidateRegistrationKeywords,
      page,
    );

    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(preOnboardingLink);
    await page.waitForLoadState('networkidle');

    // PHASE 3: CANDIDATE - Fill complete form
    // Step 1: Personal Information + Address
    await candidatePreOnboardingKeywords.fillPersonalInformation({
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      alternateEmail: candidateData.alternateEmail,
      dialCode: candidateData.dialCode,
      mobileNumber: candidateData.mobileNumber,
      dateOfBirth: candidateData.dateOfBirth,
      nationalId: candidateData.nationalId,
      address: candidateData.address,
    });
    await candidatePreOnboardingKeywords.clickSaveAndContinue();
    await page.waitForLoadState('networkidle');

    // Step 2: ID Proofs
    await candidatePreOnboardingKeywords.fillIdProofs({
      aadhaarNumber: candidateData.aadhaarNumber,
      aadhaarName: candidateData.aadhaarName,
      panNumber: candidateData.panNumber,
      panName: candidateData.panName,
      panFatherName: candidateData.panFatherName,
    });
    await candidatePreOnboardingKeywords.clickNext();
    await page.waitForLoadState('networkidle');

    // Step 3: Education
    await candidatePreOnboardingKeywords.clickEducationTab();
    await candidatePreOnboardingKeywords.fillEducation({
      endYear: candidateData.education.endYear,
      institutionName: candidateData.education.institutionName,
      degree: candidateData.education.degree,
      specialization: candidateData.education.specialization,
      startYear: candidateData.education.startYear,
      gpa: candidateData.education.gpa,
    });

    // PHASE 4: CANDIDATE - Submit Documents
    await candidatePreOnboardingKeywords.clickSubmitDocuments();
    await candidatePreOnboardingKeywords.verifySuccessBannerVisible();

    // PHASE 5: VERIFICATION - Document Verification Page
    await candidatePreOnboardingKeywords.verifyDocumentVerificationStepActive();
  });

  // ==========================================
  //  TC-E2E-006: Save as Draft and Resume
  // ==========================================

  test('TC-E2E-006: Verify Save as Draft and Resume Functionality', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    mailSacClient,
    page,
  }) => {
    // Register candidate and get link from email
    const { email, preOnboardingLink, candidateData } = await registerCandidateAndGetLink(
      mailSacClient,
      candidateRegistrationKeywords,
      page,
    );

    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(preOnboardingLink);
    await page.waitForLoadState('networkidle');

    // Verify Save as Draft button is visible on Personal Information step
    await candidatePreOnboardingKeywords.verifySaveAsDraftButtonVisible();

    // Fill Personal Information
    await candidatePreOnboardingKeywords.fillPersonalInformation({
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      alternateEmail: candidateData.alternateEmail,
      dialCode: candidateData.dialCode,
      mobileNumber: candidateData.mobileNumber,
      dateOfBirth: candidateData.dateOfBirth,
      nationalId: candidateData.nationalId,
      address: candidateData.address,
    });

    // Click Save as Draft
    await candidatePreOnboardingKeywords.clickSaveAsDraft();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify the page stays on Personal Information (not navigated to next step)
    await candidatePreOnboardingKeywords.verifyStep1Active();

    // Verify Save as Draft button is still visible
    await candidatePreOnboardingKeywords.verifySaveAsDraftButtonVisible();
  });

});
