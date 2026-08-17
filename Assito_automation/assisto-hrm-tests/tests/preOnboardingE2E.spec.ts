import { test, expect } from '@fixtures/test.fixture';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { getLoginUrl } from '@utils/helpers';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { LetterGenerationKeywords } from '@keywords/LetterGenerationKeywords';
import loginData from '@test-data/loginData.json';
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

/**
 * TC-PREON-E2E-001: Complete Pre-Onboarding candidate lifecycle
 *
 * The single master workflow for pre-onboarding. Covers the whole 17-step
 * business process across all four roles (Business HR, Candidate, CHRO,
 * HR Manager) using EXACTLY ONE candidate from creation to offer response.
 *
 *   Business HR → create candidate → Request Documents  ....... "Requested"
 *   Candidate   → personal details → upload documents   ....... "In Progress"
 *   Business HR → verify details → verify each document → approve
 *   Business HR → generate offer letter → submit for approval . "Pending"
 *   CHRO        → approve with signature ...................... "1 of 2"
 *   HR Manager  → approve ..................................... "Approved"
 *   Business HR → release ..................................... "Released"
 *   Candidate   → accept with drawn signature ................. "Accepted"
 *
 * ONE CANDIDATE. No stage re-registers. The `candidate` object captured in
 * Step 2 is the only identity used for every subsequent stage, every grid
 * lookup, and both candidate emails.
 *
 * Steps 11a-11h are the former TC-OL-* offer-letter configuration tests
 * (tests/offerLetterGeneration.spec.ts, now removed). They were merged in
 * rather than kept as a separate spec because a separate file needs its own
 * candidate, and its checks require the very same Offer Letter tab state this
 * workflow passes through between Step 11 and Step 12.
 *
 * KNOWN COVERAGE GAP from that merge: the old TC-OL-011 also probed the
 * "Generate Draft stays disabled without a Contract Template" rule by clicking
 * Generate Draft. That click generates a real draft, so it cannot run against
 * the shared candidate — Step 11d keeps only the non-mutating half. Restoring
 * it would require a second candidate.
 *
 * The candidate ACCEPTS here. The reject branch is a terminal outcome that
 * cannot share this candidate, so it lives in
 * tests/releaseAndCandidateResponse.spec.ts (TC-REL-010) on its own
 * candidate — deliberately not duplicated into this workflow.
 */
test.describe.serial('Pre-Onboarding End-to-End Workflow', () => {
  test.describe.configure({ timeout: 900000 });

  test('TC-PREON-E2E-001: Complete Pre-Onboarding candidate lifecycle', async ({
    page,
    browser,
    loginKeywords,
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    hrDocumentReviewKeywords,
    hrDocumentReviewPage,
    letterGenerationKeywords,
    mailSacClient,
  }) => {
    await allure.epic('Assisto HRM');
    await allure.feature('Pre-Onboarding');
    await allure.story('Pre-Onboarding End-to-End Workflow');
    await allure.severity(Severity.BLOCKER);
    await allure.tags('e2e', 'regression', 'pre-onboarding');

    /**
     * The one and only candidate. Created in Step 2, then read — never
     * re-created — by every step below.
     */
    let candidate: RegisteredCandidate;

    await test.step('Step 1: Business HR logs in', async () => {
      await loginKeywords.openLoginPage(loginUrl);
      await loginKeywords.login(
        loginData.roles.businessHR.email,
        loginData.roles.businessHR.password,
      );
      await loginKeywords.verifyLoginSuccess();
    });

    await test.step('Step 2: Create ONE candidate and request documents', async () => {
      // The single source of candidate creation for this workflow.
      candidate = await registerCandidate(
        candidateRegistrationKeywords,
        mailSacClient,
      );

      await allure.parameter('candidateName', candidate.candidateFullName);
      await allure.parameter('candidateEmail', candidate.email);
      await allure.parameter(
        'applicantNumber',
        candidate.hrData.applicantNumber,
      );
    });

    await test.step('Step 2a: Verify candidate status is "Requested"', async () => {
      await candidateRegistrationKeywords.verifyCandidateDocumentStatus(
        candidate.hrData.applicantNumber,
        'Requested',
      );
    });

    await test.step('Steps 3-4: Candidate opens the Pre-Onboarding link from their email', async () => {
      // registerCandidate() already waited for the "Submit Your Documents"
      // email addressed to THIS candidate and extracted the link.
      expect(candidate.preOnboardingLink).toContain('http');
      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(
        candidate.preOnboardingLink,
      );
      await candidatePreOnboardingKeywords.verifyWelcomeHeadingVisible();
      await candidatePreOnboardingKeywords.verifyStep1Active();
    });

    await test.step('Steps 5-6: Candidate submits personal details and uploads documents', async () => {
      await completeCandidateDocuments(
        candidatePreOnboardingKeywords,
        page,
        candidate,
      );
      await candidatePreOnboardingKeywords.verifyDocumentVerificationStepActive();
    });

    await test.step('Steps 7-8: Business HR opens the SAME candidate for verification', async () => {
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(
        candidate.candidateFullName,
      );
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});
    });

    await test.step('Step 9: HR verifies personal details and continues to Document Verification', async () => {
      await hrDocumentReviewKeywords.verifyPersonalInfoTabVisible();
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});
      await hrDocumentReviewKeywords.verifyDocumentVerificationTabVisible();
    });

    await test.step('Step 10: HR verifies every required document', async () => {
      // Kept explicit rather than delegated to verifyAndApproveAllDocuments():
      // that helper re-navigates to the grid and re-opens the candidate, which
      // Steps 7-8 have already done, and it does not assert the per-tab state
      // this master workflow checks.
      for (const doc of [
        'Aadhaar Card',
        'Passport',
        'pan',
        'Educational documents',
      ] as const) {
        await hrDocumentReviewKeywords.selectDocument(doc);
        await hrDocumentReviewKeywords.clickVerifyDocument();
        // Confirm THIS document flipped to Verified before moving on, rather
        // than assuming the click landed.
        await expect(
          page.getByRole('button', { name: 'Verified', exact: true }),
        ).toBeVisible({ timeout: 10000 });
      }
    });

    await test.step('Step 11: HR approves candidate onboarding', async () => {
      await hrDocumentReviewKeywords.verifyApproveCandidateOnboardingButtonVisible();
      await expect(
        page.getByRole('button', { name: 'Approve Candidate Onboarding' }),
      ).toBeEnabled({ timeout: 10000 });
      await hrDocumentReviewKeywords.clickApproveCandidateOnboarding();
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});
      await hrDocumentReviewKeywords.verifyOfferLetterTabVisible();
    });

    // -----------------------------------------------------------------------
    // Steps 11a-11h: Offer Letter tab checks (formerly TC-OL-* in
    // tests/offerLetterGeneration.spec.ts, merged here so the whole flow —
    // including offer-letter configuration coverage — runs on the SINGLE
    // candidate registered in Step 2 instead of a second one.
    //
    // They sit between Step 11 and Step 12 deliberately: Step 11's "Approve
    // Candidate Onboarding" auto-lands on the Offer Letter tab in this same
    // session with a pristine, unconfigured form, and Step 12 then generates
    // and submits the letter — after which the tab renders the approval
    // summary instead of the form and none of these checks would be possible.
    //
    // Nothing here persists server-side: the form is client-side state until
    // "Generate Draft" is clicked, and Step 12 re-fills every field with
    // .fill() (which replaces), so the deliberately-invalid values typed below
    // cannot leak into the real letter.
    // -----------------------------------------------------------------------

    await test.step('Step 11a: Offer Letter tab shows Letter Configuration and Letter Details sections', async () => {
      await hrDocumentReviewKeywords.verifyOfferLetterTabVisible();
      await hrDocumentReviewKeywords.verifyContractTemplateDropdownVisible();
      await hrDocumentReviewKeywords.verifyChroApproverDropdownVisible();
      await hrDocumentReviewKeywords.verifyHrManagerApproverDropdownVisible();
    });

    await test.step('Step 11b: Contract Template offers multiple templates; CHRO "Can sign", HR Manager "Cannot sign"', async () => {
      await expect(page.getByText('Can sign')).toBeVisible();
      await expect(page.getByText('Cannot sign')).toBeVisible();

      // Asserts the dropdown is POPULATED, not that specific templates exist.
      // Contract templates are tenant data renamed outside this suite — the
      // hard-coded 'Offer_Letter_2026' and 'Sample_Letter_Template' were both
      // gone by the time the tenant reached "New_updated_Offer_letter", which
      // failed this step and left Step 12 unable to generate a letter at all.
      const templates =
        await hrDocumentReviewKeywords.listContractTemplateOptions();
      expect(
        templates.length,
        `Contract Template dropdown offered no options (available: [${templates.join(', ')}])`,
      ).toBeGreaterThan(0);
      await allure.parameter('contractTemplates', templates.join(', '));
    });

    await test.step('Step 11c: "Approvers notified in sequence" note is visible', async () => {
      await expect(
        hrDocumentReviewPage.approversNotifiedInSequenceText,
      ).toBeVisible();
    });

    await test.step('Step 11d: Generate Draft is gated on a Contract Template being set', async () => {
      // Reduced from the standalone TC-OL-011, deliberately.
      //
      // That test asserted "Generate Draft is DISABLED until a Contract
      // Template is selected", but this environment PRE-SELECTS a default
      // template ("NEW_Offer_Letter") — confirmed to survive a full tab
      // re-open, so it is a server-side default, not leftover form state.
      // The form is therefore never template-less, and the only way the old
      // test could probe the rule was to click Generate Draft and look for a
      // validation error. That click generates a real draft, which is exactly
      // why the standalone version kept its own candidate and why it cannot
      // run against the shared one here without corrupting Step 12.
      //
      // What remains is the non-mutating half of the rule: a template IS set,
      // and Generate Draft is correspondingly enabled. The disabled-state half
      // is NOT covered by this workflow — see the note in the file header.
      await openCandidateOfferLetterTab(
        candidateRegistrationKeywords,
        hrDocumentReviewKeywords,
        page,
        candidate.candidateFullName,
      );
      await expect(hrDocumentReviewPage.contractTemplateDropdown).not.toHaveText(
        /^\s*$/,
      );
      await expect(hrDocumentReviewPage.generateDraftButton).toBeEnabled();
    });

    await test.step('Step 11e: CTC field only accepts numeric input', async () => {
      await hrDocumentReviewPage.ctcInput.click();
      await page.keyboard.type('abc123xyz', { delay: 30 });
      const value = await hrDocumentReviewPage.ctcInput.inputValue();
      // A numeric-only CTC field must reject/strip letters, keeping the digits.
      expect(/^\d+$/.test(value)).toBe(true);
      expect(value).toContain('123');
    });

    await test.step('Step 11f: Salary Components default to zero and can be left unedited', async () => {
      // The field is empty by default and displays "0" via placeholder text
      // (not an actual value) — confirm both, and that it stays submittable.
      const basicRow = page
        .locator('div,tr')
        .filter({ hasText: /^Basic$/ })
        .first()
        .locator('..');
      const monthlyInput = basicRow.locator('input').first();
      await expect(monthlyInput).toHaveValue('');
      await expect(monthlyInput).toHaveAttribute('placeholder', '0');
      await expect(monthlyInput).toBeEnabled();
    });

    await test.step('Step 11g: Letter Title field does not execute an injected script payload', async () => {
      let dialogFired = false;
      page.once('dialog', async dialog => {
        dialogFired = true;
        await dialog.dismiss();
      });

      await hrDocumentReviewPage.letterTitleInput.fill('<script>alert(1)</script>');
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(dialogFired).toBe(false);
    });

    await test.step('Step 11h: Offer Letter tab and its fields load within an acceptable time', async () => {
      await candidateRegistrationKeywords.navigateToCandidateRegistration();

      const start = Date.now();
      await candidateRegistrationKeywords.clickCandidateRow(
        candidate.candidateFullName,
      );
      await hrDocumentReviewKeywords.verifyOfferLetterTabVisible();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(8000);
    });

    await test.step('Step 12: HR generates the offer letter and submits it for approval', async () => {
      // Step 11h navigated away via the grid, and re-opening an
      // already-approved candidate lands on Personal Information rather than
      // auto-jumping to Offer Letter — so the tab is re-opened explicitly here
      // before configuring the letter.
      await openCandidateOfferLetterTab(
        candidateRegistrationKeywords,
        hrDocumentReviewKeywords,
        page,
        candidate.candidateFullName,
      );
      await generateOfferLetter(hrDocumentReviewKeywords, page);
    });

    await test.step('Step 13: CHRO approves the offer letter with a signature', async () => {
      // CHRO and HR Manager run in their own browser contexts (separate
      // sessions) rather than via approveAsChro()/approveAsHrManager(),
      // because this workflow asserts the approval-count progression
      // (Pending -> 1 of 2 -> Approved) which those helpers do not expose.
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

    await test.step('Step 14: HR Manager approves the offer letter', async () => {
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

    let offerLetterLink = '';

    await test.step('Steps 15-16: Business HR releases the offer letter and the candidate is emailed', async () => {
      await letterGenerationKeywords.navigateToLetterGeneration();
      await letterGenerationKeywords.verifyLetterStatus(
        candidate.candidateFullName,
        'Approved',
      );

      // Releases, asserts the grid flips to "Released", then waits for the
      // "Offer letter" email addressed to the SAME candidate email captured
      // in Step 2. The Released assertion lives inside the helper so it runs
      // before the email wait rather than after it.
      offerLetterLink = await releaseOfferLetterAndGetLink(
        letterGenerationKeywords,
        mailSacClient,
        candidate,
      );
      expect(offerLetterLink).toContain('http');
    });

    await test.step('Step 17: Candidate opens the link and accepts the offer with a drawn signature', async () => {
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
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});

      await candidatePreOnboardingKeywords.verifyCompletionPageVisible();
      await candidatePreOnboardingKeywords.verifyAllStepsCompletedBadgeVisible();
      const offerStatus =
        await candidatePreOnboardingKeywords.getJoiningSummaryOfferStatus();
      expect(offerStatus.toLowerCase()).toContain('accepted');
    });
  });
});
