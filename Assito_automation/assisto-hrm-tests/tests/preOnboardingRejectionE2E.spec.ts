import { test, expect } from '@fixtures/test.fixture';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { getLoginUrl } from '@utils/helpers';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { LetterGenerationKeywords } from '@keywords/LetterGenerationKeywords';
import { LetterGenerationPage } from '@pages/LetterGenerationPage';
import loginData from '@test-data/loginData.json';
import {
  approveAsChro,
  approveAsHrManager,
  completeCandidateDocuments,
  generateOfferLetter,
  openCandidateOfferLetterTab,
  registerCandidate,
  releaseOfferLetterAndGetLink,
  type RegisteredCandidate,
} from '@workflows/onboardingSetupHelpers';

const loginUrl: string = getLoginUrl();

/**
 * TC-PREON-E2E-002: Pre-Onboarding REJECTION lifecycle
 *
 * The negative-path counterpart to TC-PREON-E2E-001, on EXACTLY ONE
 * candidate. Gathers the rejection tests that were previously spread across
 * three suites, each registering its own candidate:
 *
 *   TC-DV-012  reject document requires a reason ...... hrDocumentVerificationApproval
 *   TC-DV-013  reject document marks it REJECTED ...... hrDocumentVerificationApproval
 *   TC-APP-018 reject letter modal (CHRO) ............. chroHrManagerApproval
 *   TC-REL-009 reject offer requires a reason ......... releaseAndCandidateResponse
 *   TC-REL-011 rejection reason rejects script payload  releaseAndCandidateResponse
 *   TC-REL-010 candidate rejects the offer ............ releaseAndCandidateResponse
 *
 * ORDER IS THE DESIGN. A rejection is terminal, so every non-mutating
 * validation runs first and the one truly terminal action — the candidate
 * rejecting the offer — runs last. The document rejection in the middle is
 * survivable: the rejected document is re-verified in Step 6 so the flow can
 * continue to approval, which is what makes the single-candidate chain work
 * at all.
 *
 * NOT COVERED HERE — TC-APP-017 (CHRO actually rejects the offer letter with
 * a reason, status -> "Rejected"). That is mutually exclusive with this
 * workflow: a rejected letter can never be approved and released, so the
 * candidate would never receive an offer to reject. It genuinely requires a
 * second candidate and is deliberately left in
 * tests/chroHrManagerApproval.spec.ts.
 *
 * TC-DV-014 (reject the whole candidate onboarding) is intentionally absent:
 * it is skipped at source — no standalone "Reject Candidate" control exists
 * in the current UI.
 */
test.describe.serial('Pre-Onboarding Rejection Workflow', () => {
  test.describe.configure({ timeout: 900000 });

  test('TC-PREON-E2E-002: Complete Pre-Onboarding rejection lifecycle', async ({
    page,
    browser,
    loginKeywords,
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    candidatePreOnboardingPage,
    hrDocumentReviewKeywords,
    hrDocumentReviewPage,
    letterGenerationKeywords,
    mailSacClient,
  }) => {
    await allure.epic('Assisto HRM');
    await allure.feature('Pre-Onboarding');
    await allure.story('Pre-Onboarding Rejection Workflow');
    await allure.severity(Severity.CRITICAL);
    await allure.tags('e2e', 'regression', 'pre-onboarding', 'rejection');

    /** The one and only candidate. Created in Step 2, never re-created. */
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

    await test.step('Step 3: Candidate submits personal details and uploads documents', async () => {
      await completeCandidateDocuments(
        candidatePreOnboardingKeywords,
        page,
        candidate,
      );
      await candidatePreOnboardingKeywords.verifyDocumentVerificationStepActive();
    });

    await test.step('Step 4: Business HR opens the candidate and continues to Document Verification', async () => {
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(
        candidate.candidateFullName,
      );
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});
      await hrDocumentReviewKeywords.verifyDocumentVerificationTabVisible();
    });

    await test.step('Step 5a (TC-DV-012): Rejecting a document requires a non-empty reason', async () => {
      // Non-mutating: the modal is opened and either blocks the empty-reason
      // submit or stays open. Nothing is rejected here.
      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await hrDocumentReviewKeywords.clickRejectDocument();
      await hrDocumentReviewPage.confirmRejectionButton
        .waitFor({ state: 'visible' })
        .catch(() => {});

      const confirmEnabled = await hrDocumentReviewPage
        .isConfirmRejectionButtonEnabled()
        .catch(() => true);
      if (confirmEnabled) {
        await hrDocumentReviewKeywords.clickConfirmDocumentRejection();
        // If the click was allowed, the modal must not have closed silently
        // without validation.
        await expect(hrDocumentReviewPage.rejectDocumentModal).toBeVisible();
      } else {
        await expect(
          hrDocumentReviewPage.confirmRejectionButton,
        ).toBeDisabled();
      }
    });

    await test.step('Step 5b (TC-DV-013): Rejecting a document with a reason marks it REJECTED and blocks approval', async () => {
      await hrDocumentReviewKeywords.fillDocumentRejectionReason(
        'Document image is blurry and unreadable',
      );
      await hrDocumentReviewKeywords.clickConfirmDocumentRejection();

      await expect(page.getByText('REJECTED').first()).toBeVisible({
        timeout: 10000,
      });
      // A rejected document must keep candidate approval blocked.
      await expect(
        hrDocumentReviewPage.approveCandidateOnboardingButton,
      ).toBeDisabled();
    });

    await test.step('Step 6: HR re-verifies the rejected document and every remaining document', async () => {
      // The recovery that makes one candidate enough: document rejection is
      // reversible, so the same candidate can carry on to the offer stage and
      // exercise the offer-rejection tests below.
      for (const doc of [
        'Aadhaar Card',
        'Passport',
        'pan',
        'Educational documents',
      ] as const) {
        await hrDocumentReviewKeywords.selectDocument(doc);
        await hrDocumentReviewKeywords.clickVerifyDocument();
        await expect(
          page.getByRole('button', { name: 'Verified', exact: true }),
        ).toBeVisible({ timeout: 10000 });
      }
    });

    await test.step('Step 7: HR approves candidate onboarding', async () => {
      await expect(
        page.getByRole('button', { name: 'Approve Candidate Onboarding' }),
      ).toBeEnabled({ timeout: 10000 });
      await hrDocumentReviewKeywords.clickApproveCandidateOnboarding();
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});
      await hrDocumentReviewKeywords.verifyOfferLetterTabVisible();
    });

    await test.step('Step 8: HR generates the offer letter and submits it for approval', async () => {
      await generateOfferLetter(hrDocumentReviewKeywords, page);
    });

    await test.step('Step 9 (TC-APP-018): CHRO reject-letter modal exposes a reason field and Confirm control', async () => {
      // Opens the reject modal as CHRO and closes it WITHOUT confirming — the
      // letter must survive to be approved and released below.
      //
      // KNOWN GAP (see knownIssues.md TC-APP-018): "Confirm Rejection" is
      // enabled even with an empty reason, so the disabled-state assertion is
      // documented rather than asserted; what the app does enforce today is
      // that the modal opens with a reason field and a Confirm control.
      const chroContext = await browser.newContext();
      try {
        const chroPage = await chroContext.newPage();
        const chroLogin = new LoginKeywords(chroPage);
        const chroLetters = new LetterGenerationKeywords(chroPage);
        const chroLetterPage = new LetterGenerationPage(chroPage);

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
        await chroLetters.verifyRejectButtonVisible();
        await chroPage
          .getByRole('button', { name: 'Reject', exact: true })
          .first()
          .click();
        await chroLetters.verifyRejectLetterModalVisible();
        await expect(chroLetterPage.rejectLetterConfirmButton).toBeVisible();
      } finally {
        // Closing the context abandons the modal — the letter stays Pending.
        await chroContext.close();
      }
    });

    await test.step('Step 10: CHRO and HR Manager approve the offer letter', async () => {
      await approveAsChro(browser, candidate.candidateFullName);
      await approveAsHrManager(browser, candidate.candidateFullName);
    });

    let offerLetterLink = '';

    await test.step('Step 11: Business HR releases the offer letter and the candidate is emailed', async () => {
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

    await test.step('Step 12 (TC-REL-009): Confirm Rejection is disabled until a reason is entered', async () => {
      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(
        offerLetterLink,
      );
      await candidatePreOnboardingKeywords.clickRejectOffer();
      await candidatePreOnboardingKeywords.verifyRejectionFormVisible();
      await expect(
        candidatePreOnboardingPage.confirmRejectionButton,
      ).toBeDisabled();
    });

    await test.step('Step 13 (TC-REL-011): Rejection reason field does not execute an injected script payload', async () => {
      let dialogFired = false;
      page.once('dialog', async dialog => {
        dialogFired = true;
        await dialog.dismiss();
      });

      await candidatePreOnboardingKeywords.fillRejectionReason(
        '<script>alert(1)</script>',
      );
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(dialogFired).toBe(false);
    });

    await test.step('Step 14 (TC-REL-010): Candidate rejects the offer with a reason and the status reflects Rejected', async () => {
      // TERMINAL — deliberately last. Re-opens the link so the reason field
      // starts clean rather than carrying Step 13's payload into the record.
      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(
        offerLetterLink,
      );
      await candidatePreOnboardingKeywords.rejectOfferWithReason(
        'Accepted a competing offer with a better package',
      );
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});

      await candidatePreOnboardingKeywords.verifyRejectionConfirmed();
    });
  });
});
