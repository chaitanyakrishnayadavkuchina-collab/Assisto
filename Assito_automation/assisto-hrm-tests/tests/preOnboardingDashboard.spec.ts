import { test, expect } from '@fixtures/test.fixture';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { currentMonthYearLabel, recentMonthLabels } from '@utils/dateHelpers';
import {
  buildDashboardPayload,
  buildZeroDashboardPayload,
  failDashboardApi,
  mockDashboardApi,
} from '@utils/apiMocks';

/**
 * COVERAGE NOTE — no drill-down tests exist, deliberately.
 *
 * Verified against the live app (2026-08-12): the KPI cards and funnel stages
 * are not interactive. Neither they nor any ancestor within four levels is a
 * button/link/role="button", carries an onclick, or even sets
 * `cursor: pointer`, and clicking a card produces no navigation and no dialog.
 *
 * The only interactive controls on this dashboard are the four navigation tabs
 * and "+ Initiate Pre-Onboarding", both already covered. Re-check this if
 * drill-down is added; until then there is no behaviour to assert and a
 * drill-down test would be asserting invented expectations.
 */

/** Route serving the Pre-Onboarding Dashboard */
const DASHBOARD_PATH = '/people/pre-onboarding';

/** Browser title served by the HRM shell */
const APP_TITLE = 'Assisto HRM';

test.describe('Pre-Onboarding Dashboard', () => {
  // Restores a cached admin session instead of logging in through the UI in
  // every test. Credentials come from .env via @utils/authState.
  test.use({ role: 'admin' });

  test.beforeEach(async ({ preOnboardingKeywords }) => {
    await allure.epic('Assisto HRM');
    await allure.feature('Pre-Onboarding');
    await allure.story('Pre-Onboarding Dashboard');
    await allure.severity(Severity.NORMAL);
    await allure.tags('regression', 'dashboard');

    await preOnboardingKeywords.navigateToPreOnboardingDashboard();
  });

  // ===== POSITIVE TEST CASES =====

  /**
   * TC001 - Verify Dashboard Page Loads After Login
   * Steps: Login -> Pre-Onboarding -> Dashboard
   * Expected: Dashboard page loads with all sections visible
   */
  test('should display the Pre-Onboarding Dashboard after navigation', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify dashboard title
    await expect(preOnboardingDashboardPage.isDashboardVisible()).resolves.toBe(
      true,
    );

    // Verify KPI cards are visible
    await expect(preOnboardingDashboardPage.areAllKPIsVisible()).resolves.toBe(
      true,
    );

    // Verify funnel is visible
    await expect(
      preOnboardingDashboardPage.isPreBoardingFunnelVisible(),
    ).resolves.toBe(true);

    // Verify monthly trend chart
    await expect(
      preOnboardingDashboardPage.isMonthlyTrendChartVisible(),
    ).resolves.toBe(true);

    // Verify offer accept/decline section
    await expect(
      preOnboardingDashboardPage.isOfferAcceptDeclineVisible(),
    ).resolves.toBe(true);
  });

  /**
   * TC002 - Verify All KPI Cards Display Correct Values
   * Steps: Navigate to Dashboard -> Check KPI cards
   * Expected: All 5 KPI cards display numeric values
   */
  test('should display valid KPI values', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Total Candidates should be a positive number
    const totalCandidates =
      await preOnboardingDashboardPage.getTotalCandidatesCount();
    expect(parseInt(totalCandidates)).toBeGreaterThan(0);

    // AI Flagged Cases should be a number
    const aiFlaggedCases =
      await preOnboardingDashboardPage.getAiFlaggedCasesCount();
    expect(parseInt(aiFlaggedCases)).toBeGreaterThanOrEqual(0);

    // Avg Time to Hire should contain "d" (days)
    const avgTimeToHire = await preOnboardingDashboardPage.getAvgTimeToHire();
    expect(avgTimeToHire).toContain('d');

    // Offer Acceptance should contain a percentage
    const offerAcceptance =
      await preOnboardingDashboardPage.getOfferAcceptancePercent();
    expect(offerAcceptance).toContain('%');

    // Ready for Review should be a number
    const readyForReview =
      await preOnboardingDashboardPage.getReadyForReviewCount();
    expect(parseInt(readyForReview)).toBeGreaterThanOrEqual(0);
  });

  /**
   * TC003 - Verify Pre-Boarding Funnel Has All Stages
   * Steps: Navigate to Dashboard -> Check Funnel
   * Expected: All 6 funnel stages (Initiated, Docs Uploaded, Verified, Offer Sent, Signed, Joined) are visible
   */
  test('should display all funnel stages', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    const stages = [
      'Initiated',
      'Docs Uploaded',
      'Verified',
      'Offer Sent',
      'Signed',
      'Joined',
    ];
    for (const stage of stages) {
      const locator =
        await preOnboardingDashboardPage.getFunnelStageLocator(stage);
      await expect(locator).toBeVisible();
    }
  });

  /**
   * TC004 - Verify Funnel Shows Correct Counts and Percentages
   * Steps: Navigate to Dashboard -> Check Funnel data
   * Expected: Each stage shows count and percentage values
   */
  test('should display correct funnel data', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Initiated should have the highest count (100%)
    const initiatedData =
      await preOnboardingDashboardPage.getFunnelStageData('Initiated');
    expect(initiatedData.count).not.toBe('');
    expect(initiatedData.percentage).toBe('100%');

    // Docs Uploaded should have lower count than Initiated
    const docsData =
      await preOnboardingDashboardPage.getFunnelStageData('Docs Uploaded');
    expect(parseInt(docsData.count)).toBeLessThan(
      parseInt(initiatedData.count),
    );
  });

  /**
   * TC005 - Verify Navigation Tabs Are Accessible
   * Steps: Navigate to Dashboard -> Check tabs
   * Expected: All 4 tabs (Dashboard, Candidate Registration, AI Verification, Letter Generation) are visible and clickable
   */
  test('should display navigation tabs', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify Dashboard tab is active
    await expect(
      preOnboardingDashboardPage.isTabActive('Dashboard'),
    ).resolves.toBe(true);

    // Verify other tabs are visible
    await expect(
      preOnboardingDashboardPage.isTabVisible('Candidate Registration'),
    ).resolves.toBe(true);
    await expect(
      preOnboardingDashboardPage.isTabVisible('AI Verification'),
    ).resolves.toBe(true);
    await expect(
      preOnboardingDashboardPage.isTabVisible('Letter Generation'),
    ).resolves.toBe(true);
  });

  /**
   * TC006 - Verify Initiate Pre-Boarding Button Is Visible
   * Steps: Navigate to Dashboard
   * Expected: The "+ Initiate Pre-Boarding" button is visible
   */
  test('should display Initiate Pre-Boarding button', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    await expect(
      preOnboardingDashboardPage.isInitiateButtonVisible(),
    ).resolves.toBe(true);
  });

  /**
   * TC007 - Verify Month/Year Header Shows Correct Period
   * Steps: Navigate to Dashboard
   * Expected: Header reads "HR Administration · All entities · <current month> <year>"
   *
   * The month is derived from today's date — the previous hardcoded
   * "May 2026|June 2026" would have started failing in July, and the
   * "HR Administration" alternative made it pass without checking any date.
   */
  test('should display correct date header', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    const headerText = await preOnboardingDashboardPage.getPeriodHeaderText();
    expect(headerText).toContain('HR Administration');
    expect(headerText).toContain(currentMonthYearLabel());
  });

  // ===== NEGATIVE TEST CASES =====

  // TC008 (zero values) and TC013 (API failure) moved to the
  // "resilience & performance" block below: both need their route mock
  // installed *before* the dashboard loads, which the navigation beforeEach
  // in this block rules out.

  /**
   * TC009 - Verify Navigation Between Tabs Works
   * Steps: Navigate to Dashboard -> Click Candidate Registration tab
   * Expected: Page navigates to Candidate Registration
   */
  test('should navigate to Candidate Registration tab', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Click on Candidate Registration tab
    await preOnboardingDashboardPage.clickTab('Candidate Registration');
    await page.waitForLoadState('networkidle');

    // Verify we navigated away from dashboard
    await expect(
      preOnboardingDashboardPage.isTabActive('Candidate Registration'),
    ).resolves.toBe(true);
  });

  /**
   * TC010 - Verify AI Verification Tab Navigation
   * Steps: Navigate to Dashboard -> Click AI Verification tab
   * Expected: Page navigates to AI Verification
   */
  test('should navigate to AI Verification tab', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Click on AI Verification tab
    await preOnboardingDashboardPage.clickTab('AI Verification');
    await page.waitForLoadState('networkidle');

    // Verify we navigated away from dashboard
    await expect(
      preOnboardingDashboardPage.isTabActive('AI Verification'),
    ).resolves.toBe(true);
  });

  /**
   * TC011 - Verify Letter Generation Tab Navigation
   * Steps: Navigate to Dashboard -> Click Letter Generation tab
   * Expected: Page navigates to Letter Generation
   */
  test('should navigate to Letter Generation tab', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Click on Letter Generation tab
    await preOnboardingDashboardPage.clickTab('Letter Generation');
    await page.waitForLoadState('networkidle');

    // Verify we navigated away from dashboard
    await expect(
      preOnboardingDashboardPage.isTabActive('Letter Generation'),
    ).resolves.toBe(true);
  });

  /**
   * TC012 - Verify Dashboard After Tab Switch Back
   * Steps: Navigate to Dashboard -> Switch to another tab -> Switch back
   * Expected: Dashboard data is still visible and accurate
   */
  test('should restore dashboard data after switching back from another tab', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Get initial dashboard data
    const initialTotalCandidates =
      await preOnboardingDashboardPage.getTotalCandidatesCount();

    // Switch to Candidate Registration tab
    await preOnboardingDashboardPage.clickTab('Candidate Registration');
    await page.waitForLoadState('networkidle');

    // Switch back to Dashboard
    await preOnboardingDashboardPage.clickTab('Dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard is still visible
    await expect(preOnboardingDashboardPage.isDashboardVisible()).resolves.toBe(
      true,
    );

    // Data should still be present
    const restoredTotalCandidates =
      await preOnboardingDashboardPage.getTotalCandidatesCount();
    expect(restoredTotalCandidates).toBe(initialTotalCandidates);
  });

  // TC014 (load performance) moved to the "resilience & performance" block
  // below: the timer has to wrap the navigation, which the beforeEach here
  // has already performed.

  // TC015 (large data sets) removed. It created no large dataset and this
  // dashboard has no table to stress — it re-asserted TC003's funnel-stage
  // visibility verbatim, so it added a maintenance cost and no coverage.

  // ===== EDGE CASE TEST CASES =====

  /**
   * TC016 - Verify MoM Indicators Display Correctly
   * Steps: Navigate to Dashboard -> Check MoM indicators
   * Expected: Month-over-month indicators show up/down arrows
   */
  test('should display MoM indicators on KPI cards', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Total Candidates should have MoM indicator
    const totalMoM =
      await preOnboardingDashboardPage.getMoMIndicator('totalCandidates');
    expect(totalMoM).toBeTruthy();

    // AI Flagged Cases should have MoM indicator
    const aiMoM =
      await preOnboardingDashboardPage.getMoMIndicator('aiFlaggedCases');
    expect(aiMoM).toBeTruthy();

    // Offer Acceptance should have MoM indicator
    const offerMoM =
      await preOnboardingDashboardPage.getMoMIndicator('offerAcceptance');
    expect(offerMoM).toBeTruthy();
  });

  /**
   * TC017 - Verify Monthly Trend Chart Renders
   * Steps: Navigate to Dashboard -> Check monthly trend chart
   * Expected: Chart renders with monthly data points
   */
  test('should display monthly trend chart', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    await expect(
      preOnboardingDashboardPage.isMonthlyTrendChartVisible(),
    ).resolves.toBe(true);

    // The chart plots the trailing six months ending with the current one.
    // Derived from today's date — the previous fixed ['Mar'..'Aug'] list would
    // have broken as soon as the calendar rolled past August.
    for (const month of recentMonthLabels(6)) {
      await expect(
        preOnboardingDashboardPage.getTrendMonthLabel(month),
      ).toBeVisible();
    }
  });

  /**
   * TC018 - Verify Offer Accept/Decline Section Shows Department Data
   * Steps: Navigate to Dashboard -> Check offer accept/decline section
   * Expected: Department data is displayed with accept/decline bars
   */
  test('should display department offer data', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    await expect(
      preOnboardingDashboardPage.isOfferAcceptDeclineVisible(),
    ).resolves.toBe(true);

    // Live data: assert the section actually rendered department bars and that
    // each is well-formed. The previous `>= 0` could not fail, and the locator
    // it counted was page-wide rather than scoped to this card.
    // Exact value fidelity is covered deterministically by the mocked
    // "renders the values returned by the API" test below.
    const barCount = await preOnboardingDashboardPage.getDepartmentBarCount();
    expect(barCount).toBeGreaterThan(0);
  });

  /**
   * TC019 - Verify Initiate Button Click Opens Modal
   * Steps: Navigate to Dashboard -> Click Initiate Pre-Boarding
   * Expected: Modal or new page opens for initiating pre-boarding
   */
  test('should open initiate pre-boarding flow when button is clicked', async ({
    preOnboardingDashboardPage,
    candidateRegistrationPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    await preOnboardingDashboardPage.clickInitiatePreBoarding();

    // The button routes to Candidate Registration and opens the "Document
    // Needed for Verification" drawer. Previously this test ended in
    // expect(true).toBeTruthy(), so it could not fail.
    await expect(page).toHaveURL(
      /\/people\/pre-onboarding\/candidate-registration/,
    );
    await expect(candidateRegistrationPage.drawer).toBeVisible();
    await expect(candidateRegistrationPage.drawerTitle).toBeVisible();
    await expect(candidateRegistrationPage.drawerSubtitle).toBeVisible();
  });

  /**
   * TC020 - Verify Dashboard is Responsive (Viewport Test)
   * Steps: Navigate to Dashboard -> Resize viewport -> Check layout
   * Expected: Dashboard elements remain visible and accessible
   */
  test('should remain functional at different viewport sizes', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    // Test at mobile viewport
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForLoadState('networkidle');

    await expect(preOnboardingDashboardPage.isDashboardVisible()).resolves.toBe(
      true,
    );
    await expect(preOnboardingDashboardPage.areAllKPIsVisible()).resolves.toBe(
      true,
    );
  });

  /**
   * TC021 - Verify Funnel Data Integrity
   * Steps: Navigate to Dashboard -> Check funnel data consistency
   * Expected: Each stage has lower count than previous (descending funnel)
   */
  test('should maintain descending funnel data', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    const initiatedData =
      await preOnboardingDashboardPage.getFunnelStageData('Initiated');
    const docsData =
      await preOnboardingDashboardPage.getFunnelStageData('Docs Uploaded');
    const verifiedData =
      await preOnboardingDashboardPage.getFunnelStageData('Verified');

    // Verify descending order
    expect(parseInt(initiatedData.count)).toBeGreaterThanOrEqual(
      parseInt(docsData.count),
    );
    expect(parseInt(docsData.count)).toBeGreaterThanOrEqual(
      parseInt(verifiedData.count),
    );
  });

  /**
   * TC022 - Verify Dashboard Works After Multiple Tab Switches
   * Steps: Navigate to Dashboard -> Switch tabs multiple times -> Return to Dashboard
   * Expected: Dashboard remains functional after multiple navigations
   */
  test('should handle multiple tab switches without losing state', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Get initial data
    const initialCandidates =
      await preOnboardingDashboardPage.getTotalCandidatesCount();

    // Switch through all tabs
    await preOnboardingDashboardPage.clickTab('Candidate Registration');
    await page.waitForLoadState('networkidle');
    await preOnboardingDashboardPage.clickTab('AI Verification');
    await page.waitForLoadState('networkidle');
    await preOnboardingDashboardPage.clickTab('Letter Generation');
    await page.waitForLoadState('networkidle');

    // Return to Dashboard
    await preOnboardingDashboardPage.clickTab('Dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard is still functional
    await expect(preOnboardingDashboardPage.isDashboardVisible()).resolves.toBe(
      true,
    );

    // Data should be consistent
    const restoredCandidates =
      await preOnboardingDashboardPage.getTotalCandidatesCount();
    expect(restoredCandidates).toBe(initialCandidates);
  });

  /**
   * TC023 - Verify Dashboard Shows Correct Title Format
   * Steps: Navigate to Dashboard
   * Expected: Browser title is exactly "Assisto HRM"
   *
   * Previously asserted only toBeTruthy(), which any non-empty title passes.
   */
  test('should display correct page title format', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(APP_TITLE);
  });
});

/**
 * Cases that must control the dashboard API *before* the page loads, so they
 * cannot use the navigation beforeEach above.
 */
test.describe('Pre-Onboarding Dashboard - resilience & performance', () => {
  test.use({ role: 'admin' });

  test.beforeEach(async () => {
    await allure.epic('Assisto HRM');
    await allure.feature('Pre-Onboarding');
    await allure.story('Pre-Onboarding Dashboard');
    await allure.severity(Severity.NORMAL);
    await allure.tags('regression', 'dashboard', 'resilience');
  });

  /**
   * TC008 - Verify Dashboard Renders When All Values Are Zero
   * Steps: Stub the dashboard API with an all-zero payload -> Navigate
   * Expected: Dashboard and all KPI cards still render, showing zeros
   *
   * Rewritten: the original never produced a zero state, so it just
   * re-asserted TC001 against live non-zero data.
   */
  test('should handle zero values gracefully', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await mockDashboardApi(page, buildZeroDashboardPayload());
    await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });

    await expect(preOnboardingDashboardPage.isDashboardVisible()).resolves.toBe(
      true,
    );
    await expect(preOnboardingDashboardPage.areAllKPIsVisible()).resolves.toBe(
      true,
    );
    await expect(
      preOnboardingDashboardPage.isPreBoardingFunnelVisible(),
    ).resolves.toBe(true);

    expect(
      parseInt(await preOnboardingDashboardPage.getTotalCandidatesCount()),
    ).toBe(0);
    expect(
      parseInt(await preOnboardingDashboardPage.getReadyForReviewCount()),
    ).toBe(0);
  });

  /**
   * TC024 - Verify the dashboard renders exactly the values the API returns
   * Steps: Stub the dashboard API with a known payload -> Navigate
   * Expected: KPI cards and funnel show those exact numbers
   *
   * This is the deterministic counterpart to TC002/TC004/TC021, which read
   * whatever the shared tenant happens to hold and so can only assert loose
   * relationships. Those tests answer "is the live data sane?"; this one
   * answers "does the UI render the API faithfully?" — a question live data
   * cannot settle. Note the live tenant currently violates funnel
   * monotonicity (Joined > Signed), which is exactly why value fidelity is
   * pinned here instead.
   */
  test('should render the KPI and funnel values returned by the API', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    const funnelCounts = [500, 400, 300, 200, 100, 50];
    await mockDashboardApi(
      page,
      buildDashboardPayload({
        totalCandidates: 500,
        aiFlaggedCases: 7,
        avgTimeToHireDays: 12,
        offerAcceptanceRate: 62.5,
        readyForReview: 23,
        funnelCounts,
        departments: [
          { department: 'Engineering', accepted: 5, declined: 2 },
          { department: 'Finance', accepted: 3, declined: 1 },
        ],
      }),
    );
    await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });
    await expect(preOnboardingDashboardPage.isDashboardVisible()).resolves.toBe(
      true,
    );

    expect(
      parseInt(await preOnboardingDashboardPage.getTotalCandidatesCount()),
    ).toBe(500);
    expect(
      parseInt(await preOnboardingDashboardPage.getAiFlaggedCasesCount()),
    ).toBe(7);
    expect(
      parseInt(await preOnboardingDashboardPage.getReadyForReviewCount()),
    ).toBe(23);
    expect(
      await preOnboardingDashboardPage.getOfferAcceptancePercent(),
    ).toContain('62.5');

    // Funnel: counts render as given, and percentages are relative to Initiated.
    const initiated =
      await preOnboardingDashboardPage.getFunnelStageData('Initiated');
    expect(parseInt(initiated.count)).toBe(500);
    expect(initiated.percentage).toBe('100%');

    const docs =
      await preOnboardingDashboardPage.getFunnelStageData('Docs Uploaded');
    expect(parseInt(docs.count)).toBe(400);
    expect(docs.percentage).toBe('80%');

    // Both mocked departments render a bar.
    expect(await preOnboardingDashboardPage.getDepartmentBarCount()).toBe(2);
  });

  /**
   * TC013 - Verify Error Handling When the API Fails
   * Steps: Force the dashboard API to fail -> Navigate
   * Expected: The app shows its error boundary with both recovery actions,
   *           rather than a blank page
   *
   * Rewritten: the original injected no failure at all and was a duplicate of
   * TC001. Both a 500 and a dropped connection are covered.
   */
  for (const mode of ['server-error', 'network-error'] as const) {
    test(`should show the error state when the dashboard API fails (${mode})`, async ({
      preOnboardingDashboardPage,
      page,
    }) => {
      await failDashboardApi(page, mode);
      await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });

      await preOnboardingDashboardPage.verifyErrorState();
      // Short timeout: this asserts ABSENCE, so there is no point burning the
      // full retry window proving a negative that verifyErrorState() already
      // established.
      await expect(
        preOnboardingDashboardPage.isDashboardVisible(1000),
      ).resolves.toBe(false);
    });
  }

  /**
   * TC014 - Verify Dashboard Loads Within an Acceptable Time
   * Steps: Time the navigation until the dashboard is rendered
   * Expected: Under 15s
   *
   * Rewritten: the original started its timer *after* the beforeEach had
   * already navigated, so it measured an already-loaded page.
   */
  test('should load dashboard within acceptable time', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    const startTime = Date.now();
    await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });
    await expect(preOnboardingDashboardPage.isDashboardVisible()).resolves.toBe(
      true,
    );
    const loadTime = Date.now() - startTime;

    console.log(`[TC014] Dashboard rendered in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(15000);
  });
});

/**
 * Role-based access and session handling.
 *
 * Business HR, CHRO and HR Manager can all view this dashboard and — per the
 * product owner — see identical figures, so the assertions are shared across
 * roles rather than per-role.
 */
test.describe('Pre-Onboarding Dashboard - roles & session', () => {
  test.beforeEach(async () => {
    await allure.epic('Assisto HRM');
    await allure.feature('Pre-Onboarding');
    await allure.story('Pre-Onboarding Dashboard');
    await allure.severity(Severity.NORMAL);
    await allure.tags('regression', 'dashboard', 'rbac');
  });

  /**
   * TC025 - Verify each role that should see the dashboard can reach it
   * Expected: dashboard, KPI cards and funnel render for every listed role
   */
  for (const role of ['businessHR', 'chro', 'hrManager'] as const) {
    test.describe(`as ${role}`, () => {
      test.use({ role });

      test(`should display the dashboard for ${role}`, async ({
        preOnboardingKeywords,
        preOnboardingDashboardPage,
      }) => {
        await preOnboardingKeywords.navigateToPreOnboardingDashboard();

        await expect(
          preOnboardingDashboardPage.isDashboardVisible(),
        ).resolves.toBe(true);
        await expect(
          preOnboardingDashboardPage.areAllKPIsVisible(),
        ).resolves.toBe(true);
        await expect(
          preOnboardingDashboardPage.isPreBoardingFunnelVisible(),
        ).resolves.toBe(true);
      });
    });
  }

  test.describe('session handling', () => {
    test.use({ role: 'admin' });

    /**
     * TC026 - Verify a page refresh keeps the dashboard rendered
     * Expected: the same data is shown after reload, not a blank or login page
     */
    test('should still show the dashboard after a page refresh', async ({
      preOnboardingKeywords,
      preOnboardingDashboardPage,
      page,
    }) => {
      await preOnboardingKeywords.navigateToPreOnboardingDashboard();
      const before = await preOnboardingDashboardPage.getTotalCandidatesCount();

      await page.reload({ waitUntil: 'domcontentloaded' });

      await expect(
        preOnboardingDashboardPage.isDashboardVisible(),
      ).resolves.toBe(true);
      expect(await preOnboardingDashboardPage.getTotalCandidatesCount()).toBe(
        before,
      );
    });

    /**
     * TC027 - Verify browser Back returns to the dashboard from a sibling tab
     * Expected: Back leaves Candidate Registration and restores the dashboard
     */
    test('should return to the dashboard on browser back', async ({
      preOnboardingKeywords,
      preOnboardingDashboardPage,
      page,
    }) => {
      await preOnboardingKeywords.navigateToPreOnboardingDashboard();
      await preOnboardingDashboardPage.clickTab('Candidate Registration');
      await expect(
        preOnboardingDashboardPage.isTabActive('Candidate Registration'),
      ).resolves.toBe(true);

      await page.goBack({ waitUntil: 'domcontentloaded' });

      await expect(
        preOnboardingDashboardPage.isDashboardVisible(),
      ).resolves.toBe(true);
    });
  });

  /**
   * TC028 - Verify an unauthenticated session cannot view the dashboard
   * Expected: the protected route either redirects or refuses to render
   *
   * Deliberately runs with role 'none' rather than signing in and then
   * clearing the token: the authenticated fixture replays this app's
   * sessionStorage-based session via context.addInitScript(), which re-runs on
   * every navigation — so a cleared token would simply be re-injected by the
   * next goto() and the test would assert nothing. Starting with no session at
   * all tests the same guarantee without fighting the fixture.
   */
  test.describe('unauthenticated access', () => {
    test.use({ role: 'none' });

    test('should not render the dashboard without a session', async ({
      preOnboardingDashboardPage,
      page,
    }) => {
      await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });

      // Either the app redirects away from the protected route, or it refuses
      // to render the dashboard on it. Both are acceptable; silently serving
      // the dashboard to an unauthenticated visitor is not.
      const stillOnDashboardRoute = page.url().includes(DASHBOARD_PATH);
      const dashboardRendered =
        await preOnboardingDashboardPage.isDashboardVisible(2000);
      expect(stillOnDashboardRoute && dashboardRendered).toBe(false);
    });
  });
});
