import { test, expect } from '@fixtures/test.fixture';
import { getLoginUrl } from '@utils/helpers';
import loginData from '@test-data/loginData.json';
import { CandidateRegistrationKeywords } from '@keywords/CandidateRegistrationKeywords';
import { CandidatePreOnboardingKeywords } from '@keywords/CandidatePreOnboardingKeywords';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { MailSacClient } from '@utils/MailSacClient';
import {
  bringCandidateToDocumentVerificationPending,
  RegisteredCandidate,
} from '@workflows/onboardingSetupHelpers';

const loginUrl = getLoginUrl();

/**
 * HR Document Verification & Approval — Business HR reviews a candidate's
 * Personal Information and uploaded documents (Aadhaar, PAN, Education),
 * verifies or rejects each one, and approves/rejects candidate onboarding.
 *
 * Every candidate used here is freshly generated random data (via the shared
 * onboardingSetupHelpers, which call the existing random-data generators) —
 * no fixed/reused test users.
 *
 * Coverage: positive, negative, edge, field validation, security, RBAC,
 * performance, UI/UX, business rules, and error handling.
 */
test.describe('HR Document Verification & Approval', () => {
  test.beforeEach(async ({ loginKeywords }) => {
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
    await loginKeywords.verifyLoginSuccess();
  });

  // =========================================================================
  // SECTION 1: HAPPY-PATH REVIEW & APPROVAL (one candidate, chained steps)
  // =========================================================================
  test.describe.serial('Happy-path document review and approval', () => {
    test.describe.configure({ timeout: 300000 });
    let candidate: RegisteredCandidate;

    test.beforeAll(async ({ browser }) => {
      // Default hook timeout (60s) is too short for a full real-workflow
      // setup (candidate registration + live email wait + document fill)
      // — this caused intermittent "beforeAll hook timeout" failures
      // unrelated to any locator issue.
      test.setTimeout(300000);
      const context = await browser.newContext();
      const page = await context.newPage();

      const login = new LoginKeywords(page);
      await login.openLoginPage(loginUrl);
      await login.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
      await login.verifyLoginSuccess();

      candidate = await bringCandidateToDocumentVerificationPending(
        new CandidateRegistrationKeywords(page),
        new CandidatePreOnboardingKeywords(page),
        new MailSacClient(process.env.MAIL_SAC_API_KEY || ''),
        page,
      );
      await context.close();
    });

    // NOTE: each test opens the candidate afresh (navigate -> click row) because
    // Playwright gives every test() a new, unauthenticated page even inside
    // describe.serial — tab selection ("Continue to Document Verification",
    // which document is selected) is client-side UI state that resets on
    // reload, while Verified/Rejected document status is persisted server-side
    // and is correctly re-observed by each fresh page load below.

    async function openCandidate(
      candidateRegistrationKeywords: CandidateRegistrationKeywords,
      page: import('@playwright/test').Page,
    ): Promise<void> {
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    }

    test('TC-DV-001: HR opens candidate and Personal Information reflects submitted data', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.verifyPersonalInfoTabVisible();
      // Both the header ("Firstname Lastname") and the FIRST NAME field value
      // ("Firstname") contain the first name — match the first occurrence.
      await expect(page.getByText(candidate.hrData.firstName).first()).toBeVisible();
      await expect(page.getByText(candidate.hrData.lastName).first()).toBeVisible();
    });

    test('TC-DV-002: Continue to Document Verification shows the Document Verification tab with the document list and onboarding progress', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.verifyDocumentVerificationTabVisible();
      // The standalone "ID Proofs"/"Education" KPI cards from the older
      // design no longer render — progress now lives in the Timeline panel.
      await expect(page.getByText('Onboarding Progress')).toBeVisible();
      await expect(page.getByText('Aadhaar Card', { exact: true })).toBeVisible();
      await expect(page.getByText('Educational Documents 1', { exact: false })).toBeVisible();
    });

    test('TC-DV-003/004: Aadhaar Card shows extracted fields and Verify Document marks it Verified', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await hrDocumentReviewKeywords.verifyAadhaarDocDetailsVisible();
      await hrDocumentReviewKeywords.clickVerifyDocument();
      await expect(page.getByText('VERIFIED').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-DV-004b: Verifying Passport changes its status to Verified', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('Passport');
      await hrDocumentReviewKeywords.clickVerifyDocument();

      // Once verified, the action button itself flips from "Verify Document"
      // to a disabled "Verified" — scoped to the single open document, so
      // it's unambiguous regardless of how many VERIFIED badges render elsewhere.
      await expect(page.getByRole('button', { name: 'Verified', exact: true })).toBeVisible({ timeout: 10000 });
    });

    test('TC-DV-005: Approve Candidate Onboarding stays disabled while pan and Education are still pending', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await expect(hrDocumentReviewPage.approveCandidateOnboardingButton).toBeDisabled();
    });

    test('TC-DV-006/007: pan shows extracted fields and Verify Document marks it Verified', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('pan');
      await hrDocumentReviewKeywords.verifyPanDocDetailsVisible();
      await hrDocumentReviewKeywords.clickVerifyDocument();

      await expect(page.getByRole('button', { name: 'Verified', exact: true })).toBeVisible({ timeout: 10000 });
    });

    test('TC-DV-008: Verifying Educational documents changes its status to Verified', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('Educational documents');
      await hrDocumentReviewKeywords.clickVerifyDocument();

      await expect(page.getByRole('button', { name: 'Verified', exact: true })).toBeVisible({ timeout: 10000 });
    });

    test('TC-DV-009/010: Approve Candidate Onboarding becomes enabled and navigates to the Offer Letter tab', async ({
      candidateRegistrationKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      page,
    }) => {
      await openCandidate(candidateRegistrationKeywords, page);
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await expect(hrDocumentReviewPage.approveCandidateOnboardingButton).toBeEnabled({ timeout: 10000 });
      await hrDocumentReviewKeywords.clickApproveCandidateOnboarding();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await hrDocumentReviewKeywords.verifyOfferLetterTabVisible();
    });

    test('TC-DV-011: Grid reflects the candidate as approved / on the Offer Letter stage', async ({
      candidateRegistrationKeywords,
    }) => {
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      const stage = await candidateRegistrationKeywords.getCandidateStageBadgeText(candidate.candidateFullName);
      expect(stage.toLowerCase()).toContain('offer letter');
    });
  });

  // =========================================================================
  // SECTION 2: REJECTION FLOW (independent candidate, random data)
  // =========================================================================
  test.describe('Document rejection flow', () => {
    test.describe.configure({ timeout: 300000 });

    test('TC-DV-012: Rejecting a document requires a non-empty reason', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      const candidate = await bringCandidateToDocumentVerificationPending(
        candidateRegistrationKeywords,
        candidatePreOnboardingKeywords,
        mailSacClient,
        page,
      );

      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await hrDocumentReviewKeywords.clickRejectDocument();
      // Empty reason: Confirm Rejection must not be enabled / submission must be blocked.
      // Wait for the modal's disabled-state to settle before reading it, rather
      // than trusting a single un-retried isEnabled() snapshot right after open.
      await hrDocumentReviewPage.confirmRejectionButton.waitFor({ state: 'visible' }).catch(() => {});
      const confirmEnabled = await hrDocumentReviewPage.isConfirmRejectionButtonEnabled().catch(() => true);
      if (confirmEnabled) {
        await hrDocumentReviewKeywords.clickConfirmDocumentRejection();
        // If the click was allowed, the modal must not have closed silently without validation.
        await expect(hrDocumentReviewPage.rejectDocumentModal).toBeVisible();
      } else {
        await expect(hrDocumentReviewPage.confirmRejectionButton).toBeDisabled();
      }
    });

    test('TC-DV-013: Rejecting a document with a reason marks it Rejected and blocks approval', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      const candidate = await bringCandidateToDocumentVerificationPending(
        candidateRegistrationKeywords,
        candidatePreOnboardingKeywords,
        mailSacClient,
        page,
      );

      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await hrDocumentReviewKeywords.clickRejectDocument();
      await hrDocumentReviewKeywords.fillDocumentRejectionReason('Document image is blurry and unreadable');
      await hrDocumentReviewKeywords.clickConfirmDocumentRejection();

      await expect(page.getByText('REJECTED').first()).toBeVisible({ timeout: 10000 });
      // Approve Candidate Onboarding must remain disabled with a rejected document present.
      await expect(hrDocumentReviewPage.approveCandidateOnboardingButton).toBeDisabled();
    });

    test('TC-DV-014: HR can reject the whole candidate onboarding', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      test.skip(true, 'No standalone "Reject Candidate" action exists in the current UI — the Document Verification footer only has Save as Draft and Approve Candidate Onboarding, plus a per-document Reject. Confirmed via live run (2026-08-08); re-enable if this control is reintroduced.');
      const candidate = await bringCandidateToDocumentVerificationPending(
        candidateRegistrationKeywords,
        candidatePreOnboardingKeywords,
        mailSacClient,
        page,
      );

      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Reject Candidate only renders once a document is selected (the
      // initial "Ready for Review" placeholder has no action buttons). The
      // document preview can take a moment to finish loading, so use an
      // auto-retrying assertion rather than a one-shot visibility check.
      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await expect(hrDocumentReviewPage.rejectCandidateButton).toBeVisible({ timeout: 15000 });
      await hrDocumentReviewKeywords.clickRejectCandidate();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      const rejectedCount = await candidateRegistrationKeywords.getRejectedCount();
      expect(Number(rejectedCount.replace(/\D/g, ''))).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // SECTION 3: EDGE CASES, SECURITY, PERFORMANCE, RBAC
  // =========================================================================
  test.describe('Edge cases, security, performance, and access control', () => {
    test.describe.configure({ timeout: 300000 });

    test('TC-DV-015: Re-selecting an already-verified document keeps it Verified (idempotent)', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      mailSacClient,
      page,
    }) => {
      const candidate = await bringCandidateToDocumentVerificationPending(
        candidateRegistrationKeywords,
        candidatePreOnboardingKeywords,
        mailSacClient,
        page,
      );
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await hrDocumentReviewKeywords.clickVerifyDocument();
      await expect(page.getByText('VERIFIED').first()).toBeVisible({ timeout: 10000 });

      // Navigate away and back to the same document — status must persist.
      await hrDocumentReviewKeywords.selectDocument('pan');
      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await expect(page.getByText('VERIFIED').first()).toBeVisible();
    });

    test('TC-DV-016: Switching documents mid-review preserves each document\'s independent state', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      page,
      mailSacClient,
    }) => {
      const candidate = await bringCandidateToDocumentVerificationPending(
        candidateRegistrationKeywords,
        candidatePreOnboardingKeywords,
        mailSacClient,
        page,
      );
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await hrDocumentReviewKeywords.clickVerifyDocument();
      await expect(page.getByText('VERIFIED').first()).toBeVisible({ timeout: 10000 });

      await hrDocumentReviewKeywords.selectDocument('pan');
      await expect(page.getByText('PENDING').first()).toBeVisible();
    });

    test('TC-DV-017: Rejection reason field rejects/escapes a script-injection payload', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      page,
      mailSacClient,
    }) => {
      const candidate = await bringCandidateToDocumentVerificationPending(
        candidateRegistrationKeywords,
        candidatePreOnboardingKeywords,
        mailSacClient,
        page,
      );
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      let dialogFired = false;
      page.once('dialog', async dialog => {
        dialogFired = true;
        await dialog.dismiss();
      });

      await hrDocumentReviewKeywords.selectDocument('Aadhaar Card');
      await hrDocumentReviewKeywords.clickRejectDocument();
      await hrDocumentReviewKeywords.fillDocumentRejectionReason('<script>alert("xss")</script>');
      await hrDocumentReviewKeywords.clickConfirmDocumentRejection();
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(dialogFired).toBe(false);
    });

    test('TC-DV-018: Document Verification tab renders within an acceptable time', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      page,
      mailSacClient,
    }) => {
      const candidate = await bringCandidateToDocumentVerificationPending(
        candidateRegistrationKeywords,
        candidatePreOnboardingKeywords,
        mailSacClient,
        page,
      );
      await candidateRegistrationKeywords.navigateToCandidateRegistration();
      await candidateRegistrationKeywords.clickCandidateRow(candidate.candidateFullName);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      const start = Date.now();
      await hrDocumentReviewKeywords.clickContinueToDocumentVerification();
      await hrDocumentReviewKeywords.verifyDocumentVerificationTabVisible();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(8000);
    });

    test('TC-DV-019: CHRO cannot access the Business HR Candidate Registration grid', async ({
      loginKeywords,
      candidateRegistrationKeywords,
      page,
    }) => {
      // Overwrite the Business-HR session established in beforeEach with a CHRO
      // login. The app stores auth state in localStorage as well as cookies —
      // navigating to /login while still authenticated either of those ways
      // causes an immediate auto-redirect away from the login form mid-click,
      // so both must be cleared first.
      await page.context().clearCookies();
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }).catch(() => {});
      await loginKeywords.openLoginPage(loginUrl);
      await loginKeywords.login(loginData.roles.chro.email, loginData.roles.chro.password);
      await loginKeywords.verifyLoginSuccess();

      await page.goto(`${new URL(loginUrl).origin}/people/pre-onboarding/candidate-registration`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForLoadState('networkidle').catch(() => {});

      // Auto-retrying visibility check instead of a one-shot isVisible() —
      // .isVisible() does not wait/retry even when a timeout looks implied.
      const titleVisible = await page
        .getByText('Candidate Management')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      const redirectedToLogin = page.url().includes('/login');
      // Either the module is hidden/redirected for CHRO, or access is denied outright.
      // NOTE: see knownIssues.md TC-DV-019 — this currently reflects an open RBAC gap
      // (CHRO can in fact view the grid), tracked there rather than re-litigated here.
      expect(titleVisible === false || redirectedToLogin).toBe(true);
    });

    test('TC-DV-020: Unauthenticated navigation to a candidate detail URL redirects to login', async ({ page }) => {
      // beforeEach already authenticated this page — clear both cookie- and
      // localStorage-based auth state (this app uses both) to get a genuinely
      // unauthenticated session.
      await page.context().clearCookies();
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }).catch(() => {});
      await page.goto(`${new URL(loginUrl).origin}/people/pre-onboarding/candidate/1`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForLoadState('networkidle').catch(() => {});
      // Unauthenticated users land on /welcome (not /login directly) — the
      // key assertion is that the protected candidate route itself never renders.
      expect(page.url()).not.toContain('/people/pre-onboarding/candidate/1');
    });
  });
});
