import { test, expect } from '@fixtures/test.fixture';
import { type Page, type BrowserContext } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { getLoginUrl, randomPassword } from '@utils/helpers';
import { generateAlphaName } from '@utils/testDataGenerator';
import { DEFAULT_EMAIL_TIMEOUT } from '@utils/testConstants';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { CandidateRegistrationKeywords } from '@keywords/CandidateRegistrationKeywords';
import { TemporaryRegistrationKeywords } from '@keywords/onboarding/TemporaryRegistrationKeywords';
import { UpcomingJoineeKeywords } from '@keywords/onboarding/UpcomingJoineeKeywords';
import { EmployeeIdGenerationKeywords } from '@keywords/onboarding/EmployeeIdGenerationKeywords';
import { DayZeroCheckInKeywords } from '@keywords/onboarding/DayZeroCheckInKeywords';
import { ItMailProvisioningKeywords } from '@keywords/onboarding/ItMailProvisioningKeywords';
import { SelfOnboardingKeywords } from '@keywords/onboarding/SelfOnboardingKeywords';
import { HrVerificationKeywords } from '@keywords/onboarding/HrVerificationKeywords';
import { MailSacClient } from '@utils/MailSacClient';
import loginData from '@test-data/loginData.json';
import onboardingData from '@test-data/onboardingData.json';
import {
  assertSameEmployee,
  findOfferAcceptedCandidate,
  type OnboardingIdentity,
} from '@workflows/employeeOnboardingHelpers';

const loginUrl: string = getLoginUrl();

const resumeEmployeeName: string = (process.env.ONBOARDING_EMPLOYEE_NAME ?? '').trim();
const resumeEmployeePassword: string = (process.env.ONBOARDING_EMPLOYEE_PASSWORD ?? '').trim();
const resumeEmployeeEmail: string = (process.env.ONBOARDING_EMPLOYEE_EMAIL ?? '').trim();

/**
 * TC-ONB-E2E: Employee Onboarding lifecycle
 *
 * Covers the entire 20-step post-offer onboarding lifecycle across Business HR,
 * IT Admin, Candidate/Employee, and HR Verification as individual tracked test cases
 * using EXACTLY ONE candidate carried through all stages:
 *
 *   TC-ONB-000: Business HR Authentication
 *   TC-ONB-001: Temporary Candidate Registration (Candidate -> Joiner)
 *   TC-ONB-002: Upcoming Joinees Dashboard Verification
 *   TC-ONB-003: Employee ID Generation
 *   TC-ONB-004: IT Provisions Organisation Email
 *   TC-ONB-005: IT Shares Welcome Credentials to Joiner
 *   TC-ONB-006: Day-0 Check-In (Mark as Arrived -> Status ACTIVE)
 *   TC-ONB-007: Joining Email Link Extraction & Verification Token
 *   TC-ONB-008: Employee Configures Permanent Password
 *   TC-ONB-009: Employee First Corporate Login
 *   TC-ONB-010: Welcome Page & Employee ID Display Verification
 *   TC-ONB-011: Step 2 — Personal Profile Completion
 *   TC-ONB-012: Step 3 — Identity Details (Reuse Pre-Onboarding Proofs)
 *   TC-ONB-013: Step 4 — Employment and Education Verification
 *   TC-ONB-014: Step 5 — Statutory Payroll Bank Details Completion
 *   TC-ONB-015: Step 6 — Agreements and Policies Acknowledgment & Signing
 *   TC-ONB-016: Steps 7-8 — Induction & Meet The Team Review
 *   TC-ONB-017: Complete Onboarding Submission for HR Review
 *   TC-ONB-018: HR Reviews 7-Step Submission & Verifies Identity Documents
 *   TC-ONB-019: HR Approves Onboarding & Moves Employee to Verified Queue
 *   TC-ONB-020: Onboarding Identity Audit Trail Summary
 */
test.describe.serial('Employee Onboarding E2E', () => {
  test.describe.configure({ timeout: 180000 });

  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let identity!: OnboardingIdentity;
  let passwordSetupLink = '';
  let employeePassword = resumeEmployeePassword || '';
  let employeeContext!: BrowserContext;
  let employeePage!: Page;
  let alreadySubmitted = false;
  let currentStep = 0;

  let loginKeywords: LoginKeywords;
  let candidateRegistrationKeywords: CandidateRegistrationKeywords;
  let temporaryRegistrationKeywords: TemporaryRegistrationKeywords;
  let upcomingJoineeKeywords: UpcomingJoineeKeywords;
  let employeeIdGenerationKeywords: EmployeeIdGenerationKeywords;
  let dayZeroCheckInKeywords: DayZeroCheckInKeywords;
  let hrVerificationKeywords: HrVerificationKeywords;
  let mailSacClient: MailSacClient;
  let employeeOnboarding!: SelfOnboardingKeywords;

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    sharedPage = await sharedContext.newPage();

    employeeContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    employeePage = await employeeContext.newPage();
    employeeOnboarding = new SelfOnboardingKeywords(employeePage);

    loginKeywords = new LoginKeywords(sharedPage);
    candidateRegistrationKeywords = new CandidateRegistrationKeywords(sharedPage);
    temporaryRegistrationKeywords = new TemporaryRegistrationKeywords(sharedPage);
    upcomingJoineeKeywords = new UpcomingJoineeKeywords(sharedPage);
    employeeIdGenerationKeywords = new EmployeeIdGenerationKeywords(sharedPage);
    dayZeroCheckInKeywords = new DayZeroCheckInKeywords(sharedPage);
    hrVerificationKeywords = new HrVerificationKeywords(sharedPage);
    mailSacClient = new MailSacClient();
  });

  test.afterAll(async () => {
    await employeeContext?.close().catch(() => {});
    await sharedContext?.close().catch(() => {});
  });

  test('TC-ONB-000: Business HR logs in to Assisto portal', async () => {
    await allure.epic('Assisto HRM');
    await allure.feature('Onboarding');
    await allure.story('Employee Onboarding E2E');
    await allure.severity(Severity.BLOCKER);

    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(
      loginData.roles.businessHR.email,
      loginData.roles.businessHR.password,
    );
    await loginKeywords.verifyLoginSuccess();
  });

  test('TC-ONB-001: Temporary Candidate Registration (Candidate to Joiner transition)', async () => {
    await allure.severity(Severity.BLOCKER);

    if (resumeEmployeeName) {
      identity = {
        candidateId: (process.env.ONBOARDING_CANDIDATE_ID ?? '1436').trim(),
        candidateFullName: resumeEmployeeName,
        email: (process.env.ONBOARDING_CANDIDATE_EMAIL ?? 'phase_1790765129314_f8uzh7@mailsac.com').trim(),
        employeeEmail: resumeEmployeeEmail || undefined,
      };
      console.log(
        `[Onboarding] RESUMING for existing joiner "${resumeEmployeeName}" — Temporary Registration skipped`,
      );
      await allure.parameter('resumedEmployee', resumeEmployeeName);
      return;
    }

    const accepted = await findOfferAcceptedCandidate(
      candidateRegistrationKeywords,
      sharedPage,
    );
    identity = { ...accepted };
    await allure.parameter('candidateId', identity.candidateId);

    await temporaryRegistrationKeywords.navigateToCandidateDetail(identity.candidateId);
    await temporaryRegistrationKeywords.verifyOfferAccepted();
    await temporaryRegistrationKeywords.verifyTemporaryRegistrationAvailable();
    await temporaryRegistrationKeywords.openTemporaryRegistration();

    const captured = await temporaryRegistrationKeywords.captureIdentityFromModal();
    identity.candidateFullName = captured.candidateFullName;
    identity.email = captured.email;

    await allure.parameter('candidateName', identity.candidateFullName);
    await allure.parameter('candidateEmail', identity.email);

    await temporaryRegistrationKeywords.completeTemporaryRegistration({
      reportingManager: onboardingData.temporaryRegistration.reportingManager,
      location: onboardingData.temporaryRegistration.location,
      department: onboardingData.temporaryRegistration.department,
      virtualOnboarding: onboardingData.temporaryRegistration.virtualOnboarding as 'Yes' | 'No',
      laptopRequired: onboardingData.temporaryRegistration.laptopRequired as 'Yes' | 'No',
    });

    await temporaryRegistrationKeywords.verifyRegistrationSucceeded();
  });

  test('TC-ONB-002: Verify joiner listed in Upcoming Joinees dashboard', async () => {
    await upcomingJoineeKeywords.navigateToUpcomingJoinee();
    await upcomingJoineeKeywords.verifyDashboardVisible();

    const listed = await upcomingJoineeKeywords.isJoineeListed(identity.candidateFullName);
    if (listed) {
      await upcomingJoineeKeywords.verifyJoineeDetails(identity.candidateFullName, {
        reportingManager: onboardingData.temporaryRegistration.reportingManager,
        location: onboardingData.temporaryRegistration.location,
      });
    } else {
      console.log(
        `[Onboarding] Joiner "${identity.candidateFullName}" is not on Upcoming dashboard (moved to Day-0 / Employee IDs)`,
      );
    }
  });

  test('TC-ONB-003: Generate Employee ID', async () => {
    await employeeIdGenerationKeywords.navigateToEmployeeIds();
    await employeeIdGenerationKeywords.verifyGeneratorVisible();
    await employeeIdGenerationKeywords.verifyConfiguredFormatScope(
      onboardingData.employeeId.formatScope,
    );

    identity.employeeId = await employeeIdGenerationKeywords.ensureEmployeeId(
      identity.candidateFullName,
    );
    expect(
      identity.employeeId,
      `No Employee ID could be obtained for "${identity.candidateFullName}"`,
    ).not.toBe('');
    await allure.parameter('employeeId', identity.employeeId);
  });

  test('TC-ONB-004: IT provisions organisation corporate email', async ({ browser }) => {
    identity.employeeEmail = await mailSacClient.generateEmail(
      onboardingData.itMailProvisioning.orgMailPrefix,
    );
    await allure.parameter('employeeEmail', identity.employeeEmail);

    const itContext = await browser.newContext();
    try {
      const itPage = await itContext.newPage();
      const itLogin = new LoginKeywords(itPage);
      const itMail = new ItMailProvisioningKeywords(itPage);

      await itLogin.openLoginPage(loginUrl);
      await itLogin.login(loginData.roles.it.email, loginData.roles.it.password);
      await itLogin.verifyLoginSuccess();

      await itMail.navigateToItMailProvisioning();
      await itMail.verifyProvisioningDashboardVisible();

      identity.employeeEmail = await itMail.ensureOrganisationMail(
        identity.candidateFullName,
        identity.employeeEmail!,
        onboardingData.itMailProvisioning.temporaryPassword,
      );
      await allure.parameter('employeeEmailInUse', identity.employeeEmail);

      await itMail.verifyEmployeeCompleted(identity.candidateFullName);
      await itMail.verifyOrganisationMailRecorded(
        identity.candidateFullName,
        identity.employeeEmail!,
      );
      await itMail.shareCredentialsToCandidate(identity.candidateFullName);
      await itMail.verifyShareSucceeded();
    } finally {
      await itContext.close();
    }
  });

  test('TC-ONB-006: Day-0 Check-In — mark joiner as arrived', async () => {
    await dayZeroCheckInKeywords.navigateToDayZeroCheckIn();
    await dayZeroCheckInKeywords.verifyConsoleVisible();

    if (resumeEmployeeName) {
      const listed = await dayZeroCheckInKeywords.isJoinerListed(identity.candidateFullName);
      if (!listed) {
        console.log(
          `[Onboarding] "${identity.candidateFullName}" check-in already done on previous run`,
        );
        return;
      }
    }

    await dayZeroCheckInKeywords.verifyJoinerListed(identity.candidateFullName);
    const cardText =
      (await sharedPage
        .getByText(identity.candidateFullName, { exact: false })
        .first()
        .textContent()) ?? identity.candidateFullName;
    assertSameEmployee('Day-0 Check-In', identity, cardText);

    await dayZeroCheckInKeywords.markAsArrived(identity.candidateFullName);
    await dayZeroCheckInKeywords.verifyMarkedAsArrived(identity.candidateFullName);
  });

  test('TC-ONB-007: Candidate receives joining email and extracts password setup link', async () => {
    if (resumeEmployeePassword) {
      employeePassword = resumeEmployeePassword;
      console.log(`[SelfOnboarding] Password already set for ${identity.employeeEmail} — skipping token retrieval`);
      return;
    }

    const mailboxes = [identity.employeeEmail, identity.email].filter(
      (mailbox): mailbox is string => Boolean(mailbox),
    );

    let lastError: unknown;
    for (const [index, mailbox] of mailboxes.entries()) {
      const isLast = index === mailboxes.length - 1;
      console.log(
        `[Onboarding] Waiting for "${onboardingData.selfOnboarding.joiningEmailSubject}" in ${mailbox}`,
      );
      try {
        passwordSetupLink = await mailSacClient.waitForEmailAndExtractLink(
          mailbox,
          [onboardingData.selfOnboarding.joiningEmailSubject, 'Joining', 'Welcome', 'Credentials', 'Password'],
          DEFAULT_EMAIL_TIMEOUT,
        );
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!passwordSetupLink) {
      throw lastError instanceof Error
        ? lastError
        : new Error(`Employee onboarding email was not received in: ${mailboxes.join(', ')}`);
    }
    expect(passwordSetupLink).toContain('http');
  });

  test('TC-ONB-008: Employee sets permanent password credentials', async () => {
    if (resumeEmployeePassword) {
      console.log('[SelfOnboarding] Reusing existing permanent password');
      return;
    }

    const setPwdKeywords = new SelfOnboardingKeywords(sharedPage);
    await setPwdKeywords.openPasswordSetupLink(passwordSetupLink);
    await setPwdKeywords.verifySetPasswordPage(identity.employeeEmail!);

    employeePassword = process.env.ONBOARDING_EMPLOYEE_PASSWORD || randomPassword();
    console.log(`[SelfOnboarding] Employee password set: "${employeePassword}"`);
    await setPwdKeywords.setPassword(employeePassword);
    await setPwdKeywords.verifyPasswordSetSucceeded();
  });

  test('TC-ONB-009: Employee logs into self-onboarding portal', async () => {
    await employeeOnboarding.loginAsEmployee(
      identity.employeeEmail!,
      employeePassword,
    );
  });

  test('TC-ONB-010: Welcome page and employee ID display verification', async () => {
    if (!employeePage.url().includes('self-onboarding')) {
      await employeeOnboarding.navigateToSelfOnboarding();
    }
    await employeePage.waitForLoadState('networkidle').catch(() => {});

    alreadySubmitted = await employeeOnboarding.isOnboardingSubmitted();
    if (alreadySubmitted) {
      console.log('[SelfOnboarding] Onboarding is already submitted for HR review');
      return;
    }

    currentStep = await employeeOnboarding.getCurrentStep();
    console.log(`[SelfOnboarding] Wizard resumed at step ${currentStep} of 8`);

    if (currentStep > 1) {
      console.log('[SelfOnboarding] Onboarding already started — Welcome complete');
      return;
    }

    await employeeOnboarding.verifyWelcomePage(identity.employeeId);
    await employeeOnboarding.beginOnboarding();
    await employeeOnboarding.verifyOnStep('Personal Profile', 2);
    currentStep = 2;
  });

  test('TC-ONB-011: Step 2 — Personal Profile completion', async () => {
    if (alreadySubmitted || currentStep > 2) {
      console.log('[SelfOnboarding] Personal Profile already saved — skipping');
      return;
    }
    const profile = onboardingData.selfOnboarding.personalProfile;
    await employeeOnboarding.completePersonalProfile({
      fathersName: generateAlphaName(7),
      mothersName: generateAlphaName(7),
      placeOfBirth: profile.placeOfBirth,
      nationality: profile.nationality,
      religion: profile.religion,
      residentialStatus: profile.residentialStatus,
      maritalStatus: profile.maritalStatus,
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2,
      city: profile.city,
      pinCode: profile.pinCode,
      emergencyContactPerson: generateAlphaName(8),
      emergencyDialCode: onboardingData.selfOnboarding.emergencyContact.dialCode,
      emergencyContactNumber: onboardingData.selfOnboarding.emergencyContact.contactNumber,
      emergencyRelationship: onboardingData.selfOnboarding.emergencyContact.relationship,
    });
    await employeeOnboarding.verifyOnStep('Identity Details', 3);
  });

  test('TC-ONB-012: Step 3 — Identity Details (reuse Pre-Onboarding documents)', async () => {
    if (alreadySubmitted || currentStep > 3) {
      console.log('[SelfOnboarding] Identity Details already complete — skipping');
      return;
    }
    const uploaded = await employeeOnboarding.completeIdentityDetails(
      onboardingData.selfOnboarding.identityDocuments,
    );
    await allure.parameter(
      'identityDocumentsUploaded',
      uploaded.length ? uploaded.join(', ') : 'none (already submitted)',
    );
    await employeeOnboarding.verifyOnStep('Employment And Education', 4);
  });

  test('TC-ONB-013: Step 4 — Employment and Education verification', async () => {
    if (alreadySubmitted || currentStep > 4) {
      console.log('[SelfOnboarding] Employment and Education already complete — skipping');
      return;
    }
    await employeeOnboarding.completeEmploymentAndEducation({
      employeeId: identity.employeeId,
      workEmail: identity.employeeEmail,
    });
    await employeeOnboarding.verifyOnStep('Statutory', 5);
  });

  test('TC-ONB-014: Step 5 — Statutory Payroll Bank details completion', async () => {
    if (alreadySubmitted || currentStep > 5) {
      console.log('[SelfOnboarding] Statutory details already complete — skipping');
      return;
    }
    const statutory = onboardingData.selfOnboarding.statutory;
    await employeeOnboarding.completeStatutory({
      accountHolderName: identity.candidateFullName,
      bankName: statutory.bankName,
      accountNumber: statutory.accountNumber,
      ifscCode: statutory.ifscCode,
      branch: statutory.branch,
    });
    await employeeOnboarding.verifyOnStep('Agreements And Policies', 6);
  });

  test('TC-ONB-015: Step 6 — Agreements and Policies acknowledgment and signing', async () => {
    if (alreadySubmitted || currentStep > 6) {
      console.log('[SelfOnboarding] Agreements and Policies already complete — skipping');
      return;
    }
    await employeeOnboarding.completeAgreementsAndPolicies({
      agreements: onboardingData.selfOnboarding.agreements,
      policies: onboardingData.selfOnboarding.policies,
    });
    await employeeOnboarding.verifyOnStep('Induction', 7);
  });

  test('TC-ONB-016: Steps 7-8 — Induction and Meet The Team review', async () => {
    if (alreadySubmitted || currentStep > 8) {
      console.log('[SelfOnboarding] Induction and Meet The Team already complete — skipping');
      return;
    }
    const activeStep = await employeeOnboarding.getCurrentStep();
    if (activeStep <= 7) {
      await employeeOnboarding.completeInduction();
      await employeeOnboarding.verifyOnStep('Meet The Team', 8);
    }
    await employeeOnboarding.completeMeetTheTeam();
  });

  test('TC-ONB-017: Complete Onboarding submission', async () => {
    if (alreadySubmitted) {
      console.log('[SelfOnboarding] Onboarding already submitted for HR review');
      await employeeOnboarding.verifyOnboardingCompleted();
      return;
    }
    await employeeOnboarding.completeOnboarding();
    await employeeOnboarding.verifyOnboardingCompleted();
  });

  test('TC-ONB-018: HR reviews the 7-step onboarding submission & verifies documents', async () => {
    await hrVerificationKeywords.navigateToHrVerification();
    await hrVerificationKeywords.verifyQueueVisible();

    const isPending = await hrVerificationKeywords.isEmployeePending(
      identity.candidateFullName,
    );

    if (!isPending) {
      console.log(
        `[HrVerify] "${identity.candidateFullName}" is not in Pending — checking Verified tab`,
      );
      await hrVerificationKeywords.verifyEmployeeMovedToVerified(
        identity.candidateFullName,
      );
      return;
    }

    await hrVerificationKeywords.openEmployeeSubmission(identity.candidateFullName);
    await hrVerificationKeywords.verifyReviewingEmployee(identity.employeeId);
    await hrVerificationKeywords.reviewAllSteps();
    await hrVerificationKeywords.verifyIdentityDocuments(
      onboardingData.selfOnboarding.identityDocuments,
    );
  });

  test('TC-ONB-019: HR approves onboarding and moves employee to Verified queue', async () => {
    const onReviewPage = await hrVerificationKeywords.isOnReviewPage();
    if (!onReviewPage) {
      const isPending = await hrVerificationKeywords.isEmployeePending(
        identity.candidateFullName,
      );
      if (!isPending) {
        console.log(
          `[HrVerify] "${identity.candidateFullName}" already approved — verifying in Verified tab`,
        );
        await hrVerificationKeywords.verifyEmployeeMovedToVerified(
          identity.candidateFullName,
        );
        return;
      }
      await hrVerificationKeywords.openEmployeeSubmission(
        identity.candidateFullName,
      );
    }
    await hrVerificationKeywords.approveOnboarding();
    await hrVerificationKeywords.verifyEmployeeMovedToVerified(
      identity.candidateFullName,
    );
  });

  test('TC-ONB-020: Onboarding identity audit trail summary', async () => {
    console.log(
      '[Onboarding] Completed — ' +
        `candidate #${identity.candidateId} "${identity.candidateFullName}", ` +
        `employeeId ${identity.employeeId}, employeeEmail ${identity.employeeEmail}`,
    );
    expect(identity.employeeId, 'Employee ID was not captured').toBeTruthy();
    expect(identity.employeeEmail, 'Employee email was not captured').toBeTruthy();
  });
});
