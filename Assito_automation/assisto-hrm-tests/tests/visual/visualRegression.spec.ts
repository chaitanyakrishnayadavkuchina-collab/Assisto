import { test, expect } from '@fixtures/test.fixture';
import { getLoginUrl } from '@utils/helpers';
import loginData from '@test-data/loginData.json';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { LetterGenerationKeywords } from '@keywords/LetterGenerationKeywords';
import { LetterGenerationPage } from '@pages/LetterGenerationPage';
import { generateUniqueCandidateData } from '@utils/testDataGenerator';
import {
  registerCandidate,
  bringCandidateToOfferLetterTabReady,
  generateOfferLetter,
} from '@workflows/onboardingSetupHelpers';

const loginUrl = getLoginUrl();

/**
 * Visual regression suite — pixel-diffs stable, structural chrome of key
 * screens using Playwright's built-in toHaveScreenshot(). This is Phase 1 of
 * the broader test-coverage-expansion plan; see test-data/knownIssues.md for
 * this session's established findings/patterns (referenced throughout below).
 *
 * DESIGN NOTE — why these screens/scoping choices, not full-page screenshots:
 * Every other suite in this repo registers a FRESH, randomly-generated
 * candidate per test (name/email/applicant number/timestamps all differ run
 * to run — see registerCandidate() / generateUniqueCandidateData()). A raw
 * full-page screenshot of any candidate-data-bearing screen would therefore
 * never stabilize between runs. Each test below uses one of two strategies,
 * chosen per screen:
 *   1. Snapshot BEFORE any candidate-specific data is typed/rendered (a
 *      freshly-opened empty form/drawer has no per-candidate content yet —
 *      field labels/layout are identical every run).
 *   2. Scope the screenshot to a LOCATOR covering only static structural
 *      chrome (toolbar, headers, section labels) and/or use the `mask`
 *      option to blackout any locator that legitimately does hold
 *      per-candidate text, rather than trying to avoid that region entirely.
 *
 * All screenshots are Chromium-only (this repo's only configured project —
 * see playwright.config.ts), so no cross-browser baseline management is
 * needed. `expect.toHaveScreenshot` defaults (maxDiffPixelRatio: 0.02,
 * animations: 'disabled') are set centrally in playwright.config.ts.
 *
 * FIRST RUN of this spec always "fails" — toHaveScreenshot() has no baseline
 * yet on a first run, so it writes one to
 * tests/visual/visualRegression.spec.ts-snapshots/ and reports a failure for
 * that run only. Re-running immediately after should pass cleanly against
 * the baseline just written; that second, clean run is the real signal.
 */
/**
 * Polls a locator's bounding-box height until it stops changing across two
 * consecutive checks, instead of a fixed-duration wait. VR-02's card height
 * was observed to still be settling under concurrent test-worker load even
 * after a generous fixed timeout (passed in isolation, failed when run
 * alongside the other 5 visual tests) — this directly targets "is the
 * content actually done rendering" rather than guessing a duration.
 */
async function waitForStableHeight(locator: import('@playwright/test').Locator, maxWaitMs = 8000): Promise<void> {
  const start = Date.now();
  let lastHeight = -1;
  while (Date.now() - start < maxWaitMs) {
    const box = await locator.boundingBox();
    const height = box?.height ?? -1;
    if (height === lastHeight && height > 0) return;
    lastHeight = height;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

test.describe('Visual Regression', () => {
  test.describe.configure({ timeout: 120000 });

  // ===========================================================================
  // 1. HR "New Candidate" registration drawer — freshly opened, EMPTY.
  // No candidate data exists yet (nothing has been typed), so the drawer's
  // field labels/layout/placeholders are identical on every run. Scoped to
  // the drawer locator itself rather than the full page, so background grid
  // content (candidate rows, summary card counts) that DOES vary run-to-run
  // is excluded entirely.
  // ===========================================================================
  test('VR-01: HR New Candidate drawer (empty) matches baseline', async ({
    loginKeywords,
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  }) => {
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(
      process.env.TEST_EMAIL || loginData.validUser.email,
      process.env.TEST_PASSWORD || loginData.validUser.password,
    );
    await loginKeywords.verifyLoginSuccess();

    await candidateRegistrationKeywords.navigateToCandidateRegistration();
    await candidateRegistrationKeywords.clickNewButton();

    // Readiness: drawer + title are visible before snapping (auto-retrying
    // assertions, not one-shot isVisible() — see knownIssues.md guidance).
    await expect(candidateRegistrationPage.drawer).toBeVisible({ timeout: 15000 });
    await expect(candidateRegistrationPage.drawerTitle).toBeVisible({ timeout: 10000 });
    await expect(candidateRegistrationPage.requestDocumentsButton).toBeVisible({ timeout: 10000 });

    await expect(candidateRegistrationPage.drawer).toHaveScreenshot('hr-new-candidate-drawer-empty.png');
  });

  // ===========================================================================
  // 2. Candidate-facing Personal Information form — freshly loaded from a
  // pre-onboarding link, EMPTY (before filling). registerCandidate() gets a
  // real link via a freshly-registered candidate, but the CANDIDATE-FACING
  // form itself is not pre-filled by the app (only the disabled Personal
  // Email field carries per-candidate text), so scoping + masking that one
  // field keeps the rest of the screenshot stable across different candidates.
  // ===========================================================================
  test('VR-02: Candidate Personal Information form (empty) matches baseline', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    candidatePreOnboardingPage,
    mailSacClient,
    page,
  }) => {
    const login = new LoginKeywords(page);
    await login.openLoginPage(loginUrl);
    await login.login(
      process.env.TEST_EMAIL || loginData.validUser.email,
      process.env.TEST_PASSWORD || loginData.validUser.password,
    );
    await login.verifyLoginSuccess();

    const registered = await registerCandidate(candidateRegistrationKeywords, mailSacClient);

    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(registered.preOnboardingLink);
    await expect(candidatePreOnboardingPage.firstNameInput).toBeVisible({ timeout: 15000 });
    await expect(candidatePreOnboardingPage.saveContinueButton).toBeVisible({ timeout: 10000 });
    // The card includes an "Additional Information" section (Marital
    // Status/Blood Group) that can render a moment after the fields above —
    // wait for the network to settle so the card's full height is stable
    // before snapshotting, rather than racing a partially-rendered card.
    await page.waitForLoadState('networkidle').catch(() => {});
    // The card's captured bounding box has been observed to shift vertically
    // by a small, consistent offset between otherwise-identical runs (the
    // diff shows every line "doubled" at a slight offset, not missing
    // content) — forcing a deterministic scroll position before the
    // screenshot removes that source of variance.
    await page.evaluate(() => window.scrollTo(0, 0));
    // A fixed wait wasn't reliable under concurrent-worker load (this test
    // passed in isolation but failed when run alongside the other 5 visual
    // tests) — poll until the card's height genuinely stops changing.
    await waitForStableHeight(candidatePreOnboardingPage.personalInfoCard);

    await expect(candidatePreOnboardingPage.personalInfoCard).toHaveScreenshot(
      'candidate-personal-info-form-empty.png',
      {
        // Personal Email is pre-filled/disabled with this candidate's own
        // generated email address — the only per-candidate text on an
        // otherwise-empty form. Masked rather than excluded so the field's
        // layout/border/label are still covered by the diff.
        mask: [candidatePreOnboardingPage.personalEmailInput],
      },
    );
  });

  // ===========================================================================
  // 3. Document Upload / ID Proofs tab — freshly loaded, empty file inputs
  // and empty text fields. Reached by completing Personal Information (which
  // requires per-candidate data to pass validation) and landing on ID
  // Proofs before anything on THIS tab has been filled. No candidate-specific
  // text renders on this tab pre-fill, so no masking is required.
  // ===========================================================================
  test('VR-03: Candidate ID Proofs tab (empty) matches baseline', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    candidatePreOnboardingPage,
    mailSacClient,
    page,
  }) => {
    const login = new LoginKeywords(page);
    await login.openLoginPage(loginUrl);
    await login.login(
      process.env.TEST_EMAIL || loginData.validUser.email,
      process.env.TEST_PASSWORD || loginData.validUser.password,
    );
    await login.verifyLoginSuccess();

    const registered = await registerCandidate(candidateRegistrationKeywords, mailSacClient);
    const candidateData = generateUniqueCandidateData();

    await candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(registered.preOnboardingLink);
    await candidatePreOnboardingKeywords.fillPersonalInformation({
      firstName: registered.hrData.firstName,
      lastName: registered.hrData.lastName,
      alternateEmail: candidateData.alternateEmail,
      dialCode: candidateData.dialCode,
      mobileNumber: candidateData.mobileNumber,
      dateOfBirth: '01/01/2000',
      nationalId: candidateData.nationalId,
    });
    await candidatePreOnboardingKeywords.clickSaveAndContinue();
    await candidatePreOnboardingKeywords.verifyDocumentUploadSectionVisible();

    // Readiness: Aadhaar section (first ID Proofs section) visible before
    // snapping, so the tab's async render has fully settled.
    await expect(candidatePreOnboardingPage.aadhaarCardSection).toBeVisible({ timeout: 15000 });
    await expect(candidatePreOnboardingPage.nextButton).toBeVisible({ timeout: 10000 });

    await expect(candidatePreOnboardingPage.documentUploadCard).toHaveScreenshot(
      'candidate-id-proofs-tab-empty.png',
    );
  });

  // ===========================================================================
  // 4. Offer Letter Generation form's STATIC chrome — "Letter Configuration"
  // section (Contract Template / CHRO Approver / HR Manager Approver
  // dropdowns, all empty/unselected at this point) plus the Salary
  // Components table's column headers/row labels, which are fixed regardless
  // of candidate. The candidate name/summary area above this section is
  // excluded by scoping to the config panel locator rather than the full page.
  // ===========================================================================
  test('VR-04: Offer Letter Generation static chrome (Letter Configuration) matches baseline', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    hrDocumentReviewKeywords,
    hrDocumentReviewPage,
    mailSacClient,
    page,
  }) => {
    const login = new LoginKeywords(page);
    await login.openLoginPage(loginUrl);
    await login.login(
      process.env.TEST_EMAIL || loginData.validUser.email,
      process.env.TEST_PASSWORD || loginData.validUser.password,
    );
    await login.verifyLoginSuccess();

    await bringCandidateToOfferLetterTabReady(
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      mailSacClient,
      page,
    );

    // Readiness: the Contract Template dropdown + Generate Draft button are
    // present once the Offer Letter tab's config form has rendered.
    await expect(hrDocumentReviewPage.contractTemplateDropdown).toBeVisible({ timeout: 15000 });
    await expect(hrDocumentReviewPage.generateDraftButton).toBeVisible({ timeout: 10000 });
    await expect(hrDocumentReviewPage.salaryComponentsTable).toBeVisible({ timeout: 10000 });

    // Scope to the panel spanning from the Contract Template dropdown down
    // through the Salary Components table — this is the static "Letter
    // Configuration" + "Salary Components" chrome the task calls for, and
    // excludes the candidate-name header area above it.
    const staticConfigPanel = hrDocumentReviewPage.contractTemplateDropdown
      .locator('xpath=ancestor::*[3]');

    await expect(staticConfigPanel).toHaveScreenshot('offer-letter-generation-static-chrome.png', {
      // Approver dropdowns' available options are org-roster-driven, not
      // candidate-driven, but are masked defensively in case a differently
      // seeded environment renders a different default/placeholder chip.
      mask: [hrDocumentReviewPage.chroApproverDropdown, hrDocumentReviewPage.hrManagerApproverDropdown],
    });
  });

  // ===========================================================================
  // 5. Letter Dashboard grid's toolbar/header area — Search/Filter/Export/
  // Columns buttons. This is static regardless of which candidates/letters
  // exist in the grid below it, so scoped to a locator covering just the
  // toolbar row rather than the full grid (whose rows differ run to run).
  // ===========================================================================
  test('VR-05: Letter Dashboard toolbar matches baseline', async ({
    letterGenerationKeywords,
    letterGenerationPage,
    page,
  }) => {
    const login = new LoginKeywords(page);
    await login.openLoginPage(loginUrl);
    await login.login(
      process.env.TEST_EMAIL || loginData.validUser.email,
      process.env.TEST_PASSWORD || loginData.validUser.password,
    );
    await login.verifyLoginSuccess();

    await letterGenerationKeywords.navigateToLetterGeneration();

    // NOTE: LetterGenerationPage.filterButton (getByRole('button', { name:
    // 'Filter' })) is not scoped narrowly enough on this grid — it also
    // matches the per-column "Sort or filter <Column>" header buttons
    // (confirmed live: resolves to 6 elements), unlike the Candidate
    // Registration grid's equivalent action-bar filter toggle, which is
    // targeted via its stable data-testid instead (see
    // CandidateRegistrationPage.filterButton). Using that same, more
    // specific data-testid pattern here rather than the ambiguous role
    // locator this page object exposes.
    const filterToggle = page.getByTestId('table-filter-toggle');
    await expect(letterGenerationPage.searchLettersTextbox).toBeVisible({ timeout: 15000 });
    await expect(filterToggle).toBeVisible({ timeout: 10000 });
    await expect(letterGenerationPage.columnsButton).toBeVisible({ timeout: 10000 });

    // Toolbar row = the common ancestor of Search box, Filter, Export and
    // Columns buttons — excludes the grid body entirely.
    const toolbar = letterGenerationPage.searchLettersTextbox.locator('xpath=ancestor::*[4]');

    await expect(toolbar).toHaveScreenshot('letter-dashboard-toolbar.png');
  });

  // ===========================================================================
  // 6. "Approve Letter" modal's static chrome (CHRO role) — heading, tab
  // labels (Upload Signature / Download and Sign), consent text, and
  // button layout, masking the one region that legitimately carries
  // per-candidate text (the modal's title-area context, if any resolves
  // inside the scoped locator).
  // ===========================================================================
  test('VR-06: CHRO Approve Letter modal static chrome matches baseline', async ({
    candidateRegistrationKeywords,
    candidatePreOnboardingKeywords,
    hrDocumentReviewKeywords,
    mailSacClient,
    page,
    browser,
  }) => {
    const businessHrLogin = new LoginKeywords(page);
    await businessHrLogin.openLoginPage(loginUrl);
    await businessHrLogin.login(
      process.env.TEST_EMAIL || loginData.validUser.email,
      process.env.TEST_PASSWORD || loginData.validUser.password,
    );
    await businessHrLogin.verifyLoginSuccess();

    const registered = await bringCandidateToOfferLetterTabReady(
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      mailSacClient,
      page,
    );

    await generateOfferLetter(hrDocumentReviewKeywords, page);

    // CHRO reviews the letter in a fresh, isolated context/session (mirrors
    // approveAsChro() in onboardingSetupHelpers.ts, but stops short of
    // actually confirming approval so the modal's pre-signature state is
    // what gets snapshotted).
    const chroContext = await browser.newContext();
    const chroPage = await chroContext.newPage();
    try {
      const chroLoginKeywords = new LoginKeywords(chroPage);
      const chroLetters = new LetterGenerationKeywords(chroPage);
      const chroLetterPage = new LetterGenerationPage(chroPage);

      await chroLoginKeywords.openLoginPage(loginUrl);
      await chroLoginKeywords.login(loginData.roles.chro.email, loginData.roles.chro.password);
      await chroLoginKeywords.verifyLoginSuccess();
      await chroLetters.navigateToLetterGeneration();
      await chroLetters.clickViewLetter(registered.candidateFullName);

      await expect(chroLetterPage.approveButton).toBeVisible({ timeout: 15000 });
      await chroLetterPage.clickApprove();
      await expect(chroLetterPage.approveLetterModal).toBeVisible({ timeout: 10000 });
      await expect(chroLetterPage.approveLetterModalHeading).toBeVisible({ timeout: 10000 });
      await expect(chroLetterPage.uploadSignatureTab).toBeVisible({ timeout: 10000 });

      await expect(chroLetterPage.approveLetterModal).toHaveScreenshot(
        'chro-approve-letter-modal-static-chrome.png',
      );
    } finally {
      await chroContext.close();
    }
  });
});
