import { test, expect } from '@fixtures/test.fixture';
import { getLoginUrl } from '@utils/helpers';
import loginData from '@test-data/loginData.json';
import {
  bringOfferLetterToApprovedFromExisting,
  bringOfferLetterToPendingFromExisting,
  releaseOfferLetterAndGetLink,
} from '@workflows/onboardingSetupHelpers';

const loginUrl = getLoginUrl();
const SIGNATURE_FILE = 'test-data/test-upload.png';

/**
 * Release + Candidate Accept/Reject — Business HR releases a fully-approved
 * offer letter to the candidate, and the candidate then accepts (via drawn
 * or uploaded signature) or rejects (with a reason) the offer.
 *
 * Unlike the rest of this framework's suites, these tests do NOT register a
 * fresh candidate — they pull an EXISTING candidate from the live grid whose
 * document verification is already complete (Document Status = Approved),
 * via bringOfferLetterToApprovedFromExisting()/bringOfferLetterToPendingFromExisting().
 * This suite only exercises offer-letter generation → approval → release →
 * candidate response, which doesn't need to re-verify documents every time.
 *
 * Coverage: positive, negative, edge, security, RBAC, performance, UI/UX,
 * business rules, and error handling.
 */
test.describe('Release + Candidate Accept/Reject', () => {
  test.beforeEach(async ({ loginKeywords }) => {
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
    await loginKeywords.verifyLoginSuccess();
  });

  // =========================================================================
  // SECTION 1: RELEASE FLOW (Business HR)
  // =========================================================================
  test.describe('Business HR release flow', () => {
    test.describe.configure({ timeout: 400000 });

    test('TC-REL-001: Release button appears only after selecting an Approved letter, and Cancel ("No") keeps status Approved', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );

      await letterGenerationKeywords.navigateToLetterGeneration();
      await letterGenerationKeywords.verifyLetterStatus(candidate.candidateFullName, 'Approved');
      await letterGenerationKeywords.selectLetterRow(candidate.candidateFullName);
      await letterGenerationKeywords.verifyReleaseButtonVisible();

      await letterGenerationKeywords.clickRelease();
      await letterGenerationKeywords.cancelRelease();

      await letterGenerationKeywords.verifyLetterStatus(candidate.candidateFullName, 'Approved');
    });

    test('TC-REL-002: Confirming release ("Yes") sets the letter status to Released', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );

      await letterGenerationKeywords.navigateToLetterGeneration();
      await letterGenerationKeywords.releaseLetterToCandidate(candidate.candidateFullName);
      await letterGenerationKeywords.verifyLetterStatus(candidate.candidateFullName, 'Released');
    });

    test('TC-REL-003: Release is not available for a letter still Pending approval', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      page,
    }) => {
      const candidate = await bringOfferLetterToPendingFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
      );

      await letterGenerationKeywords.navigateToLetterGeneration();
      await letterGenerationKeywords.verifyLetterStatus(candidate.candidateFullName, 'Pending');

      // A letter still Pending approval cannot be selected for Release at all —
      // its row checkbox renders disabled, so Release is unreachable by design.
      const selectable = await letterGenerationKeywords.isLetterRowSelectable(candidate.candidateFullName);
      expect(selectable).toBe(false);
    });

    test('TC-REL-004: Release completes and the grid reflects the new status within an acceptable time', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );

      await letterGenerationKeywords.navigateToLetterGeneration();
      await letterGenerationKeywords.selectLetterRow(candidate.candidateFullName);

      const start = Date.now();
      await letterGenerationKeywords.clickRelease();
      await letterGenerationKeywords.confirmRelease();
      await letterGenerationKeywords.verifyLetterStatus(candidate.candidateFullName, 'Released');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(15000);
    });
  });

  // =========================================================================
  // SECTION 2: CANDIDATE ACCEPT FLOW
  // =========================================================================
  test.describe('Candidate accept flow', () => {
    test.describe.configure({ timeout: 400000 });

    test('TC-REL-005: Candidate sees Offer Summary with "Awaiting Response" status after the link is opened', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      mailSacClient,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );
      const offerLink = await releaseOfferLetterAndGetLink(letterGenerationKeywords, mailSacClient, candidate);

      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(offerLink);
      await candidatePreOnboardingKeywords.verifyOfferSummaryPanelVisible();
      await candidatePreOnboardingKeywords.verifyOfferPositionVisible();
      await candidatePreOnboardingKeywords.verifyOfferCompanyVisible();
      await candidatePreOnboardingKeywords.verifyOfferCtcVisible();
      await candidatePreOnboardingKeywords.verifyAwaitingResponseVisible();
    });

    test('TC-REL-006: Submit & Accept Offer is disabled until a signature is drawn', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      candidatePreOnboardingPage,
      mailSacClient,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );
      const offerLink = await releaseOfferLetterAndGetLink(letterGenerationKeywords, mailSacClient, candidate);

      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(offerLink);
      await candidatePreOnboardingKeywords.clickAcceptAndUploadSignedLetter();
      await candidatePreOnboardingKeywords.verifyAcceptOfferModalVisible();

      // Auto-retrying assertion against the real button state instead of a
      // one-shot isEnabled() read.
      await expect(candidatePreOnboardingPage.submitAndAcceptOfferButton).toBeDisabled();
    });

    test('TC-REL-007: Candidate draws a signature and accepts the offer, reaching Completion with Offer Status "Accepted"', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      mailSacClient,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );
      const offerLink = await releaseOfferLetterAndGetLink(letterGenerationKeywords, mailSacClient, candidate);

      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(offerLink);
      await candidatePreOnboardingKeywords.clickAcceptAndUploadSignedLetter();
      await candidatePreOnboardingKeywords.verifyAcceptOfferModalVisible();
      await candidatePreOnboardingKeywords.drawSignature();
      await candidatePreOnboardingKeywords.verifySignatureCanvasDrawn();
      await candidatePreOnboardingKeywords.clickSubmitAndAcceptOffer();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await candidatePreOnboardingKeywords.verifyCompletionPageVisible();
      await candidatePreOnboardingKeywords.verifyAllStepsCompletedBadgeVisible();
      const status = await candidatePreOnboardingKeywords.getJoiningSummaryOfferStatus();
      expect(status.toLowerCase()).toContain('accepted');
    });

    test('TC-REL-008: Clear removes the drawn signature, re-disabling Submit & Accept Offer', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      candidatePreOnboardingPage,
      mailSacClient,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );
      const offerLink = await releaseOfferLetterAndGetLink(letterGenerationKeywords, mailSacClient, candidate);

      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(offerLink);
      await candidatePreOnboardingKeywords.clickAcceptAndUploadSignedLetter();
      await candidatePreOnboardingKeywords.drawSignature();
      await candidatePreOnboardingKeywords.verifySignatureCanvasDrawn();

      await candidatePreOnboardingKeywords.clickClearSignature();
      // Auto-retrying assertion against the real button state instead of a
      // one-shot isEnabled() read.
      await expect(candidatePreOnboardingPage.submitAndAcceptOfferButton).toBeDisabled();
    });
  });

  // =========================================================================
  // SECTION 3: CANDIDATE REJECT FLOW, SECURITY, RBAC
  // =========================================================================
  test.describe('Candidate reject flow, security, and access control', () => {
    test.describe.configure({ timeout: 400000 });

    test('TC-REL-009: Reject Offer requires a non-empty reason before Confirm Rejection', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      candidatePreOnboardingPage,
      mailSacClient,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );
      const offerLink = await releaseOfferLetterAndGetLink(letterGenerationKeywords, mailSacClient, candidate);

      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(offerLink);
      await candidatePreOnboardingKeywords.clickRejectOffer();
      await candidatePreOnboardingKeywords.verifyRejectionFormVisible();

      // Auto-retrying assertion against the real button state instead of a
      // one-shot isEnabled() read.
      await expect(candidatePreOnboardingPage.confirmRejectionButton).toBeDisabled();
    });

    test('TC-REL-010: Candidate rejects the offer with a reason, and the status reflects Rejected', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      mailSacClient,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );
      const offerLink = await releaseOfferLetterAndGetLink(letterGenerationKeywords, mailSacClient, candidate);

      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(offerLink);
      await candidatePreOnboardingKeywords.rejectOfferWithReason('Accepted a competing offer with a better package');
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await candidatePreOnboardingKeywords.verifyRejectionConfirmed();
    });

    test('TC-REL-011: Rejection reason field does not execute an injected script payload', async ({
      candidateRegistrationKeywords,
      candidateRegistrationPage,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      letterGenerationKeywords,
      mailSacClient,
      page,
      browser,
    }) => {
      const candidate = await bringOfferLetterToApprovedFromExisting(
        candidateRegistrationKeywords,
        candidateRegistrationPage,
        hrDocumentReviewKeywords,
        page,
        browser,
      );
      const offerLink = await releaseOfferLetterAndGetLink(letterGenerationKeywords, mailSacClient, candidate);

      await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(offerLink);
      await candidatePreOnboardingKeywords.clickRejectOffer();

      let dialogFired = false;
      page.once('dialog', async dialog => {
        dialogFired = true;
        await dialog.dismiss();
      });

      await candidatePreOnboardingKeywords.fillRejectionReason('<script>alert(1)</script>');
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(dialogFired).toBe(false);
    });

    test('TC-REL-012: An invalid/garbage token does not expose a real candidate\'s offer letter', async ({ page }) => {
      await page.goto(`${new URL(loginUrl).origin}/preonboarding/candidate?token=00000000-0000-0000-0000-000000000000`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForLoadState('networkidle').catch(() => {});

      // .isVisible({timeout}) does not actually retry/poll despite accepting a
      // timeout option, so a snapshot read here can race the page's redirect.
      // Read the "welcome back" (denied) signal first; only if it's genuinely
      // absent do we require the explicit error/invalid signal, using a real
      // auto-retrying assertion for that half of the check.
      const welcomeVisible = await page.getByText(/welcome back/i).isVisible({ timeout: 5000 }).catch(() => false);
      if (welcomeVisible) {
        expect(welcomeVisible).toBe(false);
      } else {
        await expect(page.getByText(/invalid|not found|expired|error/i).first()).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
