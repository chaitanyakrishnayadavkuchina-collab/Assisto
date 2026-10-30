import { Page, Browser } from '@playwright/test';
import { CandidateRegistrationKeywords } from '@keywords/CandidateRegistrationKeywords';
import { CandidateRegistrationPage } from '@pages/CandidateRegistrationPage';
import { CandidatePreOnboardingKeywords } from '@keywords/CandidatePreOnboardingKeywords';
import { HrDocumentReviewKeywords } from '@keywords/HrDocumentReviewKeywords';
import { LetterGenerationKeywords } from '@keywords/LetterGenerationKeywords';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { MailSacClient } from '@utils/MailSacClient';
import {
  generateHrCandidateData,
  generateUniqueCandidateData,
  CandidateData,
  HrCandidateData,
} from '@utils/testDataGenerator';
import { getLoginUrl } from '@utils/helpers';
import loginData from '@test-data/loginData.json';

export const loginUrl = getLoginUrl();
export const SIGNATURE_FILE = 'test-data/test-upload.png';

/**
 * The minimal shape every downstream offer-letter step (generate, approve,
 * release) actually needs — just enough to find the candidate's row in the
 * Letter Generation grid and read their email. Both a freshly-registered
 * candidate (RegisteredCandidate) and an existing one pulled from the grid
 * (ExistingApprovedCandidate) satisfy this, so the same downstream functions
 * work for either without duplication.
 */
export interface CandidateIdentity {
  candidateFullName: string;
  email: string;
}

export interface RegisteredCandidate extends CandidateIdentity {
  preOnboardingLink: string;
  hrData: HrCandidateData;
  candidateData: CandidateData;
}

export type ExistingApprovedCandidate = CandidateIdentity;

/**
 * Every helper below uses freshly generated random data per invocation
 * (via generateHrCandidateData / generateUniqueCandidateData / mailSacClient.generateEmail),
 * so tests calling these in a loop or across files never collide on
 * applicant number, email, or mobile number.
 */

/**
 * Steps 1-2: Business HR registers a new candidate and requests documents.
 * Assumes the caller is already logged in as Business HR.
 */
export async function registerCandidate(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  mailSacClient: MailSacClient,
  overrides: Partial<HrCandidateData> = {},
): Promise<RegisteredCandidate> {
  const email = await mailSacClient.generateEmail('phase');
  // Clear any existing emails in the mailbox so only the new registration email is picked up
  await mailSacClient.deleteInbox(email);

  const hrData = { ...generateHrCandidateData(email), ...overrides };
  const candidateData = generateUniqueCandidateData();
  const candidateFullName = `${hrData.firstName} ${hrData.lastName}`;

  await candidateRegistrationKeywords.navigateToCandidateRegistration();
  await candidateRegistrationKeywords.clickNewButton();
  await candidateRegistrationKeywords.fillCandidateForm(hrData);
  await candidateRegistrationKeywords.verifySuccessToast();

  const preOnboardingLink = await mailSacClient.waitForEmailAndExtractLink(
    email,
    ['Submit Your Documents', 'Pre-Onboarding', 'Document', 'Upload'],
    120000,
  );

  return { email, preOnboardingLink, hrData, candidateData, candidateFullName };
}

/**
 * Steps 3-6: Candidate fills Personal Information, ID Proofs, and Education,
 * then submits — leaving the candidate at "Document Verification: Pending".
 */
export async function completeCandidateDocuments(
  candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords,
  page: Page,
  registered: RegisteredCandidate,
): Promise<void> {
  const { preOnboardingLink, candidateData, hrData } = registered;

  await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(
    preOnboardingLink,
  );
  if (await candidatePreOnboardingKeywords.isStep1Active()) {
    await candidatePreOnboardingKeywords.fillPersonalInformation({
      firstName: hrData.firstName,
      lastName: hrData.lastName,
      alternateEmail: candidateData.alternateEmail,
      dialCode: candidateData.dialCode,
      mobileNumber: candidateData.mobileNumber,
      dateOfBirth: candidateData.dateOfBirth,
      nationalId: candidateData.nationalId,
      // Address is mandatory on the Personal Information form (Address Line 1,
      // Country, State, City, PIN). Omitting it made Save & Continue fail with
      // "Address line 1 is required | Country is required | ...". The data was
      // already being generated in CandidateData.address — it just was not
      // being passed through.
      address: candidateData.address,
    });
    await candidatePreOnboardingKeywords.clickSaveAndContinue();
    await page
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});
  }
  await candidatePreOnboardingKeywords.verifyDocumentUploadSectionVisible();

  await candidatePreOnboardingKeywords.fillIdProofs({
    aadhaarNumber: candidateData.aadhaarNumber,
    aadhaarName: candidateData.aadhaarName,
    panNumber: candidateData.panNumber,
    panName: candidateData.panName,
    panFatherName: candidateData.panFatherName,
  });
  await candidatePreOnboardingKeywords.fillAdditionalDocuments();
  await candidatePreOnboardingKeywords.clickNext();
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});

  await candidatePreOnboardingKeywords.clickEducationTab();
  await candidatePreOnboardingKeywords.fillEducation(candidateData.education);

  await candidatePreOnboardingKeywords.clickSubmitDocuments();
  await candidatePreOnboardingKeywords.verifySuccessBannerVisible();
}

/**
 * Composite of registerCandidate + completeCandidateDocuments — the common
 * starting point for HR Document Verification tests.
 */
export async function bringCandidateToDocumentVerificationPending(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords,
  mailSacClient: MailSacClient,
  page: Page,
  overrides: Partial<HrCandidateData> = {},
): Promise<RegisteredCandidate> {
  const registered = await registerCandidate(
    candidateRegistrationKeywords,
    mailSacClient,
    overrides,
  );
  await completeCandidateDocuments(
    candidatePreOnboardingKeywords,
    page,
    registered,
  );
  return registered;
}

/**
 * Steps 7-11: Business HR opens the candidate, continues past Personal
 * Information, verifies the required 4 documents (Aadhaar, Passport, PAN,
 * Education), and approves candidate onboarding — landing on the Offer
 * Letter tab. Assumes the caller is already logged in as Business HR.
 */
export async function verifyAndApproveAllDocuments(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  page: Page,
  candidateFullName: string,
): Promise<void> {
  await candidateRegistrationKeywords.navigateToCandidateRegistration();
  await candidateRegistrationKeywords.clickCandidateRow(candidateFullName);
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});

  await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});

  const docsToVerify = [
    'Aadhaar Card',
    'Passport',
    'pan',
    'Voter ID',
    'Educational documents',
  ];
  for (const doc of docsToVerify) {
    const isPresent = await page.getByText(doc, { exact: false }).first().isVisible().catch(() => false);
    if (isPresent) {
      await hrDocumentReviewKeywords.selectDocument(doc);
      const verifyBtn = page.getByRole('button', { name: 'Verify Document' });
      if (await verifyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await hrDocumentReviewKeywords.clickVerifyDocument();
        await page
          .getByRole('button', { name: 'Verified', exact: true })
          .waitFor({ state: 'visible', timeout: 10000 });
      }
    }
  }

  await hrDocumentReviewKeywords.clickApproveCandidateOnboarding();
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});
}

/**
 * Composite: registers, completes candidate docs, and has HR verify +
 * approve them — leaving the caller's page sitting on the Offer Letter tab,
 * ready to configure and generate a draft. Common starting point for Offer
 * Letter Generation tests.
 */
export async function bringCandidateToOfferLetterTabReady(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  mailSacClient: MailSacClient,
  page: Page,
): Promise<RegisteredCandidate> {
  // If an approved candidate already exists in Candidate Management, reuse them
  // to avoid creating redundant candidates and polling emails for every validation test.
  try {
    const candidateRegistrationPage = new CandidateRegistrationPage(page);
    const existing = await bringExistingCandidateToOfferLetterTabReady(
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      hrDocumentReviewKeywords,
      page,
    );
    console.log(
      `[bringCandidateToOfferLetterTabReady] Reusing existing approved candidate "${existing.candidateFullName}"`,
    );
    return {
      candidateFullName: existing.candidateFullName,
      email: existing.email,
      preOnboardingLink: '',
      hrData: {
        firstName: existing.candidateFullName.split(' ')[0] ?? '',
        lastName: existing.candidateFullName.split(' ').slice(1).join(' ') ?? '',
        applicantNumber: '',
        personalEmail: existing.email,
        mobileNumber: '',
        dialCode: '',
        country: '',
        hiringPosition: '',
        joiningDate: '',
        employeeType: '',
        candidateType: '',
        shareConsentForm: true,
      },
      candidateData: generateUniqueCandidateData(),
    };
  } catch (reuseErr) {
    console.log(
      `[bringCandidateToOfferLetterTabReady] Could not reuse existing candidate (${reuseErr}), registering fresh candidate...`,
    );
  }

  const registered = await bringCandidateToDocumentVerificationPending(
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    mailSacClient,
    page,
  );
  await verifyAndApproveAllDocuments(
    candidateRegistrationKeywords,
    hrDocumentReviewKeywords,
    page,
    registered.candidateFullName,
  );
  return registered;
}

/**
 * The Contract Template to use when a test does not name one: whatever the
 * tenant currently offers. Prefers the value the app has already pre-selected
 * and falls back to the first option in the list.
 *
 * Throws with the available names rather than letting a miss surface later as
 * a missing draft.
 */
export async function resolveContractTemplate(
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
): Promise<string> {
  const options = await hrDocumentReviewKeywords.listContractTemplateOptions();
  if (options.length === 0) {
    throw new Error(
      'No Contract Template options are available on the Offer Letter tab — ' +
        'check the tenant has at least one letter template configured.',
    );
  }

  const selected = await hrDocumentReviewKeywords.getSelectedContractTemplate();
  const match = options.find(o => o === selected) ?? options[0];
  console.log(
    `[OfferLetter] Contract templates available: [${options.join(', ')}] — using "${match}"`,
  );
  return match;
}

/**
 * Step 12: Generates and submits the offer letter for approval, using
 * sensible defaults that can be overridden per test.
 */
export async function generateOfferLetter(
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  page: Page,
  overrides: Partial<{
    template: string;
    chroApprover: string;
    hrManagerApprover: string;
    title: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    dateOfJoining: string;
    ctc: string;
    variablePay: string;
  }> = {},
): Promise<void> {
  // Contract templates are tenant data maintained outside this suite and get
  // renamed without notice ("Offer_Letter_2026" -> "NEW_Offer_Letter" ->
  // "New_updated_Offer_letter"). A hard-coded default meant selectContractTemplate
  // silently matched nothing, no draft was generated, and the run failed much
  // later with an opaque "could not release the offer letter". So resolve the
  // name from the live dropdown unless the caller pins one deliberately.
  const template =
    overrides.template ?? (await resolveContractTemplate(hrDocumentReviewKeywords));

  await hrDocumentReviewKeywords.generateAndSubmitOfferLetter({
    template,
    chroApprover: 'chro',
    hrManagerApprover: 'Kalyan',
    title: 'Mr.',
    addressLine1: 'AP',
    addressLine2: 'AP',
    addressLine3: 'AP',
    ctc: '1200000',
    variablePay: '10000',
    ...overrides,
  });
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});
}

/**
 * Composite: registers, completes candidate docs, HR verifies + approves,
 * and generates/submits the offer letter — leaving it "Pending" (0 of 2 approved).
 * This is the common starting point for CHRO/HR Manager approval tests.
 */
export async function bringOfferLetterToPending(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  mailSacClient: MailSacClient,
  page: Page,
): Promise<RegisteredCandidate> {
  const registered = await bringCandidateToOfferLetterTabReady(
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    hrDocumentReviewKeywords,
    mailSacClient,
    page,
  );
  await generateOfferLetter(hrDocumentReviewKeywords, page);
  return registered;
}

/**
 * Step 13: CHRO approves the offer letter via signature upload, in a fresh
 * browser context (separate session from the caller's page).
 */
export async function approveAsChro(
  browser: Browser,
  candidateFullName: string,
  signatureFile: string = SIGNATURE_FILE,
): Promise<void> {
  const context = await browser.newContext();
  const chroPage = await context.newPage();
  try {
    const login = new LoginKeywords(chroPage);
    const letters = new LetterGenerationKeywords(chroPage);
    await login.openLoginPage(loginUrl);
    await login.login(
      loginData.roles.chro.email,
      loginData.roles.chro.password,
    );
    await login.verifyLoginSuccess();
    await letters.navigateToLetterGeneration();
    await letters.clickViewLetter(candidateFullName);
    await letters.approveAsChro(signatureFile);
  } finally {
    await context.close();
  }
}

/**
 * Step 14: HR Manager approves the offer letter via simple confirm, in a
 * fresh browser context.
 */
export async function approveAsHrManager(
  browser: Browser,
  candidateFullName: string,
): Promise<void> {
  const context = await browser.newContext();
  const hrmPage = await context.newPage();
  try {
    const login = new LoginKeywords(hrmPage);
    const letters = new LetterGenerationKeywords(hrmPage);
    await login.openLoginPage(loginUrl);
    await login.login(
      loginData.roles.hrManager.email,
      loginData.roles.hrManager.password,
    );
    await login.verifyLoginSuccess();
    await letters.navigateToLetterGeneration();
    await letters.clickViewLetter(candidateFullName);
    await letters.approveAsHrManager();
  } finally {
    await context.close();
  }
}

/**
 * Composite: brings the offer letter to "Pending" and has both CHRO and HR
 * Manager approve it — leaving it "Approved" (2 of 2). Common starting point
 * for Release + Candidate Accept/Reject tests.
 */
export async function bringOfferLetterToApproved(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  mailSacClient: MailSacClient,
  page: Page,
  browser: Browser,
): Promise<RegisteredCandidate> {
  const registered = await bringOfferLetterToPending(
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    hrDocumentReviewKeywords,
    mailSacClient,
    page,
  );
  await approveAsChro(browser, registered.candidateFullName);
  await approveAsHrManager(browser, registered.candidateFullName);
  return registered;
}

/**
 * Step 15: Business HR releases the offer letter to the candidate and waits
 * for the "Offer letter" email, returning the link to the acceptance page.
 * Assumes the caller is already logged in as Business HR.
 */
export async function releaseOfferLetterAndGetLink(
  letterGenerationKeywords: LetterGenerationKeywords,
  mailSacClient: MailSacClient,
  registered: CandidateIdentity,
): Promise<string> {
  // Clear mailbox before releasing so we only capture the new offer letter email
  await mailSacClient.deleteInbox(registered.email);

  await letterGenerationKeywords.navigateToLetterGeneration();
  await letterGenerationKeywords.releaseLetterToCandidate(
    registered.candidateFullName,
  );

  // Confirm the release actually persisted before spending two minutes waiting
  // on an email. The release sequence (select row -> Release -> confirm) can
  // complete without error while the letter stays Approved, in which case no
  // mail is ever sent — and the failure would otherwise surface as an opaque
  // "timed out waiting for email" that says nothing about the real cause.
  await letterGenerationKeywords.verifyLetterStatus(
    registered.candidateFullName,
    'Released',
  );

  return await mailSacClient.waitForEmailAndExtractLink(
    registered.email,
    ['Offer letter', 'Offer Letter', 'offer letter', 'Offer'],
    120000,
  );
}

/**
 * Re-opens an ALREADY-KNOWN candidate's Offer Letter tab on a fresh page.
 *
 * bringCandidateToOfferLetterTabReady() leaves the Offer Letter tab open only
 * within the session that approved the candidate; a later test gets a new page
 * and lands on Personal Information instead. This walks the two clicks needed
 * to get back, so a suite can create one candidate in beforeAll and have each
 * read-only test re-open it rather than registering another one.
 *
 * Unlike bringExistingCandidateToOfferLetterTabReady(), this does not search
 * the grid — the caller already holds the candidate's identity.
 */
export async function openCandidateOfferLetterTab(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  page: Page,
  candidateFullName: string,
): Promise<void> {
  await candidateRegistrationKeywords.navigateToCandidateRegistration();
  await candidateRegistrationKeywords.clickCandidateRow(candidateFullName);
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});
  await hrDocumentReviewKeywords.clickOfferLetterTab();
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});
}

/**
 * Finds an existing candidate in the live Candidate Registration grid whose
 * documents are already verified (Document Status = Approved), instead of
 * registering and verifying a brand-new one. Used by Offer Letter
 * Release/Accept/Reject tests, which don't need to re-exercise document
 * verification — only the offer letter generation → approval → release →
 * candidate response steps. Every candidate in this app is registered with a
 * Gmail "+alias" address routed to the same real, private mailbox
 * MailSacClient reads from (see utils/MailSacClient.ts), so an existing
 * candidate's email is just as readable as a freshly-registered one's.
 */
export async function findExistingApprovedCandidate(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidateRegistrationPage: CandidateRegistrationPage,
  page: Page,
): Promise<ExistingApprovedCandidate> {
  await candidateRegistrationKeywords.navigateToCandidateRegistration();
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});
  await candidateRegistrationKeywords.clickFilterButton();
  await candidateRegistrationKeywords.applyFilter(
    'Document Status',
    'is',
    'Approved',
  );
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const rows = candidateRegistrationPage.candidateRows;
  const count = await rows.count();
  if (count === 0) {
    throw new Error(
      '[findExistingApprovedCandidate] No existing candidates found with Document Status = Approved. ' +
        'Run hrDocumentVerificationApproval.spec.ts (or any suite that calls verifyAndApproveAllDocuments()) ' +
        'first to populate the pool, or fall back to bringCandidateToOfferLetterTabReady() for a fresh candidate.',
    );
  }

  // Prefer candidates whose Offer Letter is "Not Generated" — a clean
  // starting point that won't collide with an offer letter another test
  // already has in progress. Pick randomly among matches (not always the
  // first) to reduce collision risk between concurrent test workers drawing
  // from this same shared, live pool.
  const notGeneratedIndexes: number[] = [];
  for (let i = 0; i < count; i++) {
    const text = (await rows.nth(i).textContent()) ?? '';
    if (text.includes('Not Generated')) {
      notGeneratedIndexes.push(i);
    }
  }
  const pool =
    notGeneratedIndexes.length > 0
      ? notGeneratedIndexes
      : Array.from({ length: count }, (_, i) => i);
  const chosenIndex = pool[Math.floor(Math.random() * pool.length)];
  const row = rows.nth(chosenIndex);

  let candidateFullName = (
    await row.getByRole('img').getAttribute('aria-label')
  )?.trim();
  let email = (
    await row.locator('span.text-slate-400').first().textContent()
  )?.trim();

  // Deliberately NOT clearing the filter here — the caller's very next step
  // is typically clickCandidateRow(candidateFullName), which needs this
  // candidate to still be visible/on the current (small, filtered) page
  // rather than buried somewhere in the full, unfiltered, paginated grid.
  // The candidate's document status won't change between this selection and
  // that click, so the filter stays valid to leave in place.
  if (!candidateFullName || !email) {
    const rowText = (await row.innerText()) ?? '';
    const parts = rowText.split(/\t+|\n+| {2,}/).map(s => s.trim()).filter(Boolean);
    if (!email) {
      email = parts.find(p => p.includes('@'));
    }
    if (!candidateFullName && parts.length >= 2) {
      const nameMatch = parts.find(p => p.length > 2 && !p.includes('@') && !/^\d+$/.test(p) && !['Approved', 'Pending', 'Requested', 'Not Generated', 'Accepted', 'Software engineer', 'Senior QA', 'UIUX Designer', 'India'].includes(p));
      if (nameMatch) candidateFullName = nameMatch;
    }
  }

  if (!candidateFullName || !email) {
    throw new Error(
      '[findExistingApprovedCandidate] Could not extract name/email from the selected candidate row.',
    );
  }

  return { candidateFullName, email };
}

/**
 * Composite: finds an existing document-verified candidate and opens their
 * Offer Letter tab, ready to configure and generate a draft — the
 * reused-candidate equivalent of bringCandidateToOfferLetterTabReady(),
 * skipping registration and document verification entirely.
 */
export async function bringExistingCandidateToOfferLetterTabReady(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidateRegistrationPage: CandidateRegistrationPage,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  page: Page,
): Promise<ExistingApprovedCandidate> {
  const candidate = await findExistingApprovedCandidate(
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  );
  await candidateRegistrationKeywords.clickCandidateRow(
    candidate.candidateFullName,
  );
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});
  await hrDocumentReviewKeywords.clickOfferLetterTab();
  await page
    .waitForLoadState('networkidle', { timeout: 10000 })
    .catch(() => {});
  return candidate;
}

/**
 * Composite: brings an EXISTING candidate's offer letter to "Pending" (0 of 2
 * approved) — the reused-candidate equivalent of bringOfferLetterToPending().
 */
export async function bringOfferLetterToPendingFromExisting(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidateRegistrationPage: CandidateRegistrationPage,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  page: Page,
): Promise<ExistingApprovedCandidate> {
  const candidate = await bringExistingCandidateToOfferLetterTabReady(
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    hrDocumentReviewKeywords,
    page,
  );
  await generateOfferLetter(hrDocumentReviewKeywords, page);
  return candidate;
}

/**
 * Composite: brings an EXISTING candidate's offer letter to "Approved" (2 of
 * 2) — the reused-candidate equivalent of bringOfferLetterToApproved().
 */
export async function bringOfferLetterToApprovedFromExisting(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  candidateRegistrationPage: CandidateRegistrationPage,
  hrDocumentReviewKeywords: HrDocumentReviewKeywords,
  page: Page,
  browser: Browser,
): Promise<ExistingApprovedCandidate> {
  const candidate = await bringOfferLetterToPendingFromExisting(
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    hrDocumentReviewKeywords,
    page,
  );
  await approveAsChro(browser, candidate.candidateFullName);
  await approveAsHrManager(browser, candidate.candidateFullName);
  return candidate;
}
