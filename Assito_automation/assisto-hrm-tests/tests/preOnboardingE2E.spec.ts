import { test, expect } from '@fixtures/test.fixture';
import { type Page, type BrowserContext } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { getLoginUrl } from '@utils/helpers';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { CandidateRegistrationKeywords } from '@keywords/CandidateRegistrationKeywords';
import { CandidatePreOnboardingKeywords } from '@keywords/CandidatePreOnboardingKeywords';
import { HrDocumentReviewKeywords } from '@keywords/HrDocumentReviewKeywords';
import { HrDocumentReviewPage } from '@pages/HrDocumentReviewPage';
import { LetterGenerationKeywords } from '@keywords/LetterGenerationKeywords';
import { MailSacClient } from '@utils/MailSacClient';
import loginData from '@test-data/loginData.json';
import { generateUniqueCandidateData } from '@utils/testDataGenerator';
import {
  completeCandidateDocuments,
  generateOfferLetter,
  openCandidateOfferLetterTab,
  registerCandidate,
  releaseOfferLetterAndGetLink,
  SIGNATURE_FILE,
  type RegisteredCandidate,
} from '@workflows/onboardingSetupHelpers';

const loginUrl: string = getLoginUrl();

const existingCandidateName = process.env.PREONBOARDING_CANDIDATE_NAME?.trim();
const existingCandidateLink = process.env.PREONBOARDING_CANDIDATE_LINK?.trim();
const existingCandidateEmail = process.env.PREONBOARDING_CANDIDATE_EMAIL?.trim();
const existingApplicantNumber = process.env.PREONBOARDING_APPLICANT_NUMBER?.trim();

/**
 * Pre-Onboarding End-to-End Workflow
 *
 * Covers the entire 17-step business process across all four roles (Business HR,
 * Candidate, CHRO, HR Manager) as individual tracked test cases using EXACTLY ONE
 * candidate from creation to offer response:
 *
 *   TC-PREON-001: Business HR Authentication
 *   TC-PREON-002: Candidate Creation & Document Request (Status -> "Requested")
 *   TC-PREON-003: Verify Candidate Document Status
 *   TC-PREON-004: Candidate Opens Pre-Onboarding Link from Email
 *   TC-PREON-005: Candidate Submits Personal Details & Uploads Documents
 *   TC-PREON-006: Business HR Opens Candidate Record for Verification
 *   TC-PREON-007: HR Verifies Personal Details Tab
 *   TC-PREON-008: HR Verifies Required Identity & Education Documents
 *   TC-PREON-009: HR Approves Candidate Onboarding
 *   TC-PREON-010: Offer Letter Configuration & Details Form Verification
 *   TC-PREON-011: Contract Template & Multi-Level Approver Roles Verification
 *   TC-PREON-012: Letter Configuration Field Validation & Security Payload Checks
 *   TC-PREON-013: HR Generates Offer Letter & Submits for Approvals
 *   TC-PREON-014: CHRO Approves with Digital Drawn Signature (Level 1)
 *   TC-PREON-015: HR Manager Approves Offer Letter (Level 2)
 *   TC-PREON-016: Business HR Releases Offer Letter to Candidate
 *   TC-PREON-017: Candidate Accepts Offer with Drawn Digital Signature (Status -> "Accepted")
 */
test.describe.serial('Pre-Onboarding End-to-End Workflow', () => {
  test.describe.configure({ timeout: 180000 });

  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let candidate!: RegisteredCandidate;
  let offerLetterLink = process.env.PREONBOARDING_OFFER_LETTER_LINK ?? '';

  let loginKeywords: LoginKeywords;
  let candidateRegistrationKeywords: CandidateRegistrationKeywords;
  let candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords;
  let hrDocumentReviewKeywords: HrDocumentReviewKeywords;
  let hrDocumentReviewPage: HrDocumentReviewPage;
  let letterGenerationKeywords: LetterGenerationKeywords;
  let mailSacClient: MailSacClient;

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    sharedPage = await sharedContext.newPage();

    loginKeywords = new LoginKeywords(sharedPage);
    candidateRegistrationKeywords = new CandidateRegistrationKeywords(sharedPage);
    candidatePreOnboardingKeywords = new CandidatePreOnboardingKeywords(sharedPage);
    hrDocumentReviewKeywords = new HrDocumentReviewKeywords(sharedPage);
    hrDocumentReviewPage = new HrDocumentReviewPage(sharedPage);
    letterGenerationKeywords = new LetterGenerationKeywords(sharedPage);
    mailSacClient = new MailSacClient();
  });

  test.afterAll(async () => {
    await sharedContext?.close().catch(() => {});
  });

  test('TC-PREON-001: Business HR logs in to Assisto portal', async () => {
    await allure.epic('Assisto HRM');
    await allure.feature('Pre-Onboarding');
    await allure.story('Pre-Onboarding E2E');
    await allure.severity(Severity.BLOCKER);

    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(
      loginData.roles.businessHR.email,
      loginData.roles.businessHR.password,
    );
    await loginKeywords.verifyLoginSuccess();
  });

  test('TC-PREON-002: Create ONE candidate and request documents', async () => {
    await allure.severity(Severity.BLOCKER);

    if (
      existingCandidateName &&
      existingCandidateLink &&
      existingCandidateEmail &&
      existingApplicantNumber
    ) {
      const parts = existingCandidateName.split(' ');
      candidate = {
        candidateFullName: existingCandidateName,
        email: existingCandidateEmail,
        preOnboardingLink: existingCandidateLink,
        hrData: {
          firstName: parts[0],
          lastName: parts.slice(1).join(' '),
          applicantNumber: existingApplicantNumber,
          personalEmail: existingCandidateEmail,
          mobileNumber: '9876543210',
          dialCode: 'India (+91)',
          country: 'India',
          hiringPosition: 'Software Engineer',
          joiningDate: '30-09-2026',
          employeeType: 'Full Time',
          candidateType: 'Fresher',
          shareConsentForm: true,
        },
        candidateData: generateUniqueCandidateData(),
      };
      console.log(`[PreOnboarding] Reusing existing candidate "${existingCandidateName}"`);
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
    } else {
      candidate = await registerCandidate(
        candidateRegistrationKeywords,
        mailSacClient,
      );
    }

    await allure.parameter('candidateName', candidate.candidateFullName);
    await allure.parameter('candidateEmail', candidate.email);
    await allure.parameter('applicantNumber', candidate.hrData.applicantNumber);
  });

  test('TC-PREON-003: Verify candidate status is "Requested"', async () => {
    await candidateRegistrationKeywords.verifyCandidateDocumentStatus(
      candidate.hrData.applicantNumber,
      'Requested',
    );
  });

  test('TC-PREON-004: Candidate opens the Pre-Onboarding link from their email', async () => {
    expect(candidate.preOnboardingLink).toContain('http');
    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(
      candidate.preOnboardingLink,
    );
    await candidatePreOnboardingKeywords.verifyWelcomeHeadingVisible();
    if (await candidatePreOnboardingKeywords.isStep1Active()) {
      await candidatePreOnboardingKeywords.verifyStep1Active();
    } else {
      await candidatePreOnboardingKeywords.verifyStep2Active();
    }
  });

  test('TC-PREON-005: Candidate submits personal details and uploads documents', async () => {
    await completeCandidateDocuments(
      candidatePreOnboardingKeywords,
      sharedPage,
      candidate,
    );
    await candidatePreOnboardingKeywords.verifyDocumentVerificationStepActive();
  });

  test('TC-PREON-006: Business HR opens the SAME candidate for verification', async () => {
    await candidateRegistrationKeywords.navigateToCandidateRegistration();
    if (sharedPage.url().includes('login') || (await sharedPage.getByPlaceholder('Enter your email').isVisible().catch(() => false))) {
      await loginKeywords.login(
        loginData.roles.businessHR.email,
        loginData.roles.businessHR.password,
      );
      await loginKeywords.verifyLoginSuccess();
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
    }
    await candidateRegistrationKeywords.clickCandidateRow(
      candidate.candidateFullName,
    );
    await sharedPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});
  });

  test('TC-PREON-007: HR verifies personal details and continues to Document Verification', async () => {
    await hrDocumentReviewKeywords.verifyPersonalInfoTabVisible();
    await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
    await sharedPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});
    await hrDocumentReviewKeywords.verifyDocumentVerificationTabVisible();
  });

  test('TC-PREON-008: HR verifies every required document', async () => {
    const docsToVerify = [
      'Aadhaar Card',
      'Passport',
      'pan',
      'Voter ID',
      'Educational documents',
    ];
    for (const doc of docsToVerify) {
      const isPresent = await sharedPage.getByText(doc, { exact: false }).first().isVisible().catch(() => false);
      if (isPresent) {
        console.log(`[HR Review] Verifying document: ${doc}`);
        await hrDocumentReviewKeywords.selectDocument(doc);
        const verifyBtn = sharedPage.getByRole('button', { name: 'Verify Document' });
        if (await verifyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await hrDocumentReviewKeywords.clickVerifyDocument();
          await expect(
            sharedPage.getByRole('button', { name: 'Verified', exact: true }),
          ).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('TC-PREON-009: HR approves candidate onboarding', async () => {
    await hrDocumentReviewKeywords.verifyApproveCandidateOnboardingButtonVisible();
    await expect(
      sharedPage.getByRole('button', { name: 'Approve Candidate Onboarding' }),
    ).toBeEnabled({ timeout: 10000 });
    await hrDocumentReviewKeywords.clickApproveCandidateOnboarding();
    await sharedPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});
    await hrDocumentReviewKeywords.verifyOfferLetterTabVisible();
  });

  test('TC-PREON-010: Offer Letter tab shows Letter Configuration and Letter Details sections', async () => {
    await hrDocumentReviewKeywords.verifyOfferLetterTabVisible();
    await hrDocumentReviewKeywords.verifyContractTemplateDropdownVisible();
    await hrDocumentReviewKeywords.verifyChroApproverDropdownVisible();
    await hrDocumentReviewKeywords.verifyHrManagerApproverDropdownVisible();
  });

  test('TC-PREON-011: Contract Template offers multiple templates; CHRO "Can sign", HR Manager "Cannot sign"', async () => {
    await expect(sharedPage.getByText('Can sign')).toBeVisible();
    await expect(sharedPage.getByText('Cannot sign')).toBeVisible();

    const templates = await hrDocumentReviewKeywords.listContractTemplateOptions();
    expect(
      templates.length,
      `Contract Template dropdown offered no options (available: [${templates.join(', ')}])`,
    ).toBeGreaterThan(0);
    await allure.parameter('contractTemplates', templates.join(', '));
  });

  test('TC-PREON-012: Offer letter fields validation, approvers sequence note, and script injection safety', async () => {
    await expect(hrDocumentReviewPage.approversNotifiedInSequenceText).toBeVisible();

    await openCandidateOfferLetterTab(
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      sharedPage,
      candidate.candidateFullName,
    );
    await expect(hrDocumentReviewPage.contractTemplateDropdown).not.toHaveText(/^\s*$/);
    await expect(hrDocumentReviewPage.generateDraftButton).toBeEnabled();

    // CTC numeric-only check
    await hrDocumentReviewPage.ctcInput.click();
    await sharedPage.keyboard.type('abc123xyz', { delay: 30 });
    const value = await hrDocumentReviewPage.ctcInput.inputValue();
    expect(/^\d+$/.test(value)).toBe(true);
    expect(value).toContain('123');

    // Salary Component default check
    const basicRow = sharedPage
      .locator('div,tr')
      .filter({ hasText: /^Basic$/ })
      .first()
      .locator('..');
    const monthlyInput = basicRow.locator('input').first();
    await expect(monthlyInput).toHaveValue('');
    await expect(monthlyInput).toHaveAttribute('placeholder', '0');

    // Script injection payload safety
    let dialogFired = false;
    sharedPage.once('dialog', async dialog => {
      dialogFired = true;
      await dialog.dismiss();
    });
    await hrDocumentReviewPage.letterTitleInput.fill('<script>alert(1)</script>');
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(dialogFired).toBe(false);
  });

  test('TC-PREON-013: HR generates the offer letter and submits it for approval', async () => {
    await openCandidateOfferLetterTab(
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      sharedPage,
      candidate.candidateFullName,
    );
    await generateOfferLetter(hrDocumentReviewKeywords, sharedPage);
  });

  test('TC-PREON-014: CHRO approves the offer letter with a drawn digital signature (Level 1)', async ({ browser }) => {
    const chroContext = await browser.newContext();
    try {
      const chroPage = await chroContext.newPage();
      const chroLogin = new LoginKeywords(chroPage);
      const chroLetters = new LetterGenerationKeywords(chroPage);

      await chroLogin.openLoginPage(loginUrl);
      await chroLogin.login(
        loginData.roles.chro.email,
        loginData.roles.chro.password,
      );
      await chroLogin.verifyLoginSuccess();

      await chroLetters.navigateToLetterGeneration();
      await chroLetters.verifyLetterStatus(
        candidate.candidateFullName,
        'Pending',
      );
      await chroLetters.clickViewLetter(candidate.candidateFullName);
      await chroLetters.approveAsChro(SIGNATURE_FILE);
      await expect
        .poll(async () => await chroLetters.getLevelsApprovedText(), {
          timeout: 15000,
        })
        .toContain('1 of 2');
    } finally {
      await chroContext.close();
    }
  });

  test('TC-PREON-015: HR Manager approves the offer letter (Level 2)', async ({ browser }) => {
    const hrmContext = await browser.newContext();
    try {
      const hrmPage = await hrmContext.newPage();
      const hrmLogin = new LoginKeywords(hrmPage);
      const hrmLetters = new LetterGenerationKeywords(hrmPage);

      await hrmLogin.openLoginPage(loginUrl);
      await hrmLogin.login(
        loginData.roles.hrManager.email,
        loginData.roles.hrManager.password,
      );
      await hrmLogin.verifyLoginSuccess();

      await hrmLetters.navigateToLetterGeneration();
      await hrmLetters.clickViewLetter(candidate.candidateFullName);
      await hrmLetters.approveAsHrManager();
      await hrmLetters.verifyOfferLetterStatus('Approved');
    } finally {
      await hrmContext.close();
    }
  });

  test('TC-PREON-016: Business HR releases the offer letter and candidate is emailed', async () => {
    await letterGenerationKeywords.navigateToLetterGeneration();
    await letterGenerationKeywords.verifyLetterStatus(
      candidate.candidateFullName,
      'Approved',
    );

    offerLetterLink = await releaseOfferLetterAndGetLink(
      letterGenerationKeywords,
      mailSacClient,
      candidate,
    );
    expect(offerLetterLink).toContain('http');
  });

  test('TC-PREON-017: Candidate accepts the offer with drawn digital signature', async () => {
    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(
      offerLetterLink,
    );
    await candidatePreOnboardingKeywords.verifyOfferSummaryPanelVisible();
    await candidatePreOnboardingKeywords.verifyAwaitingResponseVisible();

    await candidatePreOnboardingKeywords.clickAcceptAndUploadSignedLetter();
    await candidatePreOnboardingKeywords.verifyAcceptOfferModalVisible();
    await candidatePreOnboardingKeywords.drawSignature();
    await candidatePreOnboardingKeywords.verifySignatureCanvasDrawn();
    await candidatePreOnboardingKeywords.clickSubmitAndAcceptOffer();
    await sharedPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});

    await candidatePreOnboardingKeywords.verifyCompletionPageVisible();
    await candidatePreOnboardingKeywords.verifyAllStepsCompletedBadgeVisible();
    const offerStatus = await candidatePreOnboardingKeywords.getJoiningSummaryOfferStatus();
    expect(offerStatus.toLowerCase()).toContain('accepted');
  });
});
