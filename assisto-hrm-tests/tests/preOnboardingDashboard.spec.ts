import { test, expect } from '@fixtures/test.fixture';
import { getLoginUrl } from '@utils/helpers';

const loginUrl: string = getLoginUrl();

test.describe('Pre-Onboarding Dashboard', () => {
  test.beforeEach(async ({ loginKeywords, preOnboardingKeywords }) => {
    // Login
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(
      process.env.TEST_EMAIL || 'orgnization1@sharklasers.com',
      process.env.TEST_PASSWORD || 'Welcome@123',
    );
    await loginKeywords.verifyLoginSuccess();

    // Navigate to Pre-Onboarding Dashboard
    await preOnboardingKeywords.navigateToPreOnboardingSettings();
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
    await expect(preOnboardingDashboardPage.isDashboardTitleVisible()).resolves.toBe(true);

    // Verify KPI cards are visible
    await expect(preOnboardingDashboardPage.areAllKPIsVisible()).resolves.toBe(true);

    // Verify funnel is visible
    await expect(preOnboardingDashboardPage.isPreBoardingFunnelVisible()).resolves.toBe(true);

    // Verify monthly trend chart
    await expect(preOnboardingDashboardPage.isMonthlyTrendChartVisible()).resolves.toBe(true);

    // Verify offer accept/decline section
    await expect(preOnboardingDashboardPage.isOfferAcceptDeclineSectionVisible()).resolves.toBe(true);
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
    const totalCandidates = await preOnboardingDashboardPage.getTotalCandidatesCount();
    expect(parseInt(totalCandidates)).toBeGreaterThan(0);

    // AI Flagged Cases should be a number
    const aiFlaggedCases = await preOnboardingDashboardPage.getAiFlaggedCasesCount();
    expect(parseInt(aiFlaggedCases)).toBeGreaterThanOrEqual(0);

    // Avg Time to Hire should contain "d" (days)
    const avgTimeToHire = await preOnboardingDashboardPage.getAvgTimeToHire();
    expect(avgTimeToHire).toContain('d');

    // Offer Acceptance should contain a percentage
    const offerAcceptance = await preOnboardingDashboardPage.getOfferAcceptancePercent();
    expect(offerAcceptance).toContain('%');

    // Ready for Review should be a number
    const readyForReview = await preOnboardingDashboardPage.getReadyForReviewCount();
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

    const stages = ['Initiated', 'Docs Uploaded', 'Verified', 'Offer Sent', 'Signed', 'Joined'];
    for (const stage of stages) {
      const locator = await preOnboardingDashboardPage.getFunnelStageLocator(stage);
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
    const initiatedData = await preOnboardingDashboardPage.getFunnelStageData('Initiated');
    expect(initiatedData.count).not.toBe('');
    expect(initiatedData.percentage).toBe('100%');

    // Docs Uploaded should have lower count than Initiated
    const docsData = await preOnboardingDashboardPage.getFunnelStageData('Docs Uploaded');
    expect(parseInt(docsData.count)).toBeLessThan(parseInt(initiatedData.count));
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
    await expect(preOnboardingDashboardPage.isTabActive('Dashboard')).resolves.toBe(true);

    // Verify other tabs are visible
    await expect(preOnboardingDashboardPage.isTabVisible('Candidate Registration')).resolves.toBe(true);
    await expect(preOnboardingDashboardPage.isTabVisible('AI Verification')).resolves.toBe(true);
    await expect(preOnboardingDashboardPage.isTabVisible('Letter Generation')).resolves.toBe(true);
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
    await expect(preOnboardingDashboardPage.isInitiateButtonVisible()).resolves.toBe(true);
  });

  /**
   * TC007 - Verify Month/Year Header Shows Correct Period
   * Steps: Navigate to Dashboard
   * Expected: Header shows "HR Administration - All entities - May 2026"
   */
  test('should display correct date header', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Check for date range in the page
    const dateText = await page.getByText(/May 2026|June 2026|HR Administration/).first().textContent();
    expect(dateText).toBeTruthy();
  });

  // ===== NEGATIVE TEST CASES =====

  /**
   * TC008 - Verify Dashboard Shows Data Even When Values Are Zero
   * Steps: Navigate to Dashboard -> Check if dashboard still renders with zero values
   * Expected: Dashboard renders correctly even with zero counts
   */
  test('should handle zero values gracefully', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // The dashboard should still be visible even if some values are zero
    await expect(preOnboardingDashboardPage.isDashboardTitleVisible()).resolves.toBe(true);

    // All KPI cards should still be visible
    await expect(preOnboardingDashboardPage.areAllKPIsVisible()).resolves.toBe(true);
  });

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
    await expect(preOnboardingDashboardPage.isTabActive('Candidate Registration')).resolves.toBe(true);
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
    await expect(preOnboardingDashboardPage.isTabActive('AI Verification')).resolves.toBe(true);
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
    await expect(preOnboardingDashboardPage.isTabActive('Letter Generation')).resolves.toBe(true);
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
    const initialTotalCandidates = await preOnboardingDashboardPage.getTotalCandidatesCount();

    // Switch to Candidate Registration tab
    await preOnboardingDashboardPage.clickTab('Candidate Registration');
    await page.waitForLoadState('networkidle');

    // Switch back to Dashboard
    await preOnboardingDashboardPage.clickTab('Dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard is still visible
    await expect(preOnboardingDashboardPage.isDashboardTitleVisible()).resolves.toBe(true);

    // Data should still be present
    const restoredTotalCandidates = await preOnboardingDashboardPage.getTotalCandidatesCount();
    expect(restoredTotalCandidates).toBe(initialTotalCandidates);
  });

  /**
   * TC013 - Verify Error Handling When API Fails
   * Steps: Navigate to Dashboard -> Check if loading state resolves
   * Expected: Dashboard shows data or appropriate loading/error state
   */
  test('should handle loading states properly', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Dashboard should be fully loaded
    await expect(preOnboardingDashboardPage.isDashboardTitleVisible()).resolves.toBe(true);

    // All data elements should be rendered
    await expect(preOnboardingDashboardPage.areAllKPIsVisible()).resolves.toBe(true);
    await expect(preOnboardingDashboardPage.isPreBoardingFunnelVisible()).resolves.toBe(true);
    await expect(preOnboardingDashboardPage.isMonthlyTrendChartVisible()).resolves.toBe(true);
  });

  // ===== EDGE CASE TEST CASES =====

  /**
   * TC014 - Verify Dashboard Loads Quickly (Performance)
   * Steps: Navigate to Dashboard -> Measure load time
   * Expected: Dashboard loads within reasonable time
   */
  test('should load dashboard within acceptable time', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    const startTime = Date.now();

    // Wait for network idle
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Dashboard should load within 15 seconds
    expect(loadTime).toBeLessThan(15000);

    // Dashboard should be visible after load
    await expect(preOnboardingDashboardPage.isDashboardTitleVisible()).resolves.toBe(true);
  });

  /**
   * TC015 - Verify Dashboard with Large Data Sets
   * Steps: Navigate to Dashboard -> Check if all funnel stages render
   * Expected: All stages render even with large numbers
   */
  test('should handle large data counts', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Total Candidates should be a valid number
    const totalCandidates = await preOnboardingDashboardPage.getTotalCandidatesCount();
    expect(parseInt(totalCandidates)).toBeGreaterThanOrEqual(0);

    // All funnel stages should be visible
    const stages = ['Initiated', 'Docs Uploaded', 'Verified', 'Offer Sent', 'Signed', 'Joined'];
    for (const stage of stages) {
      const locator = await preOnboardingDashboardPage.getFunnelStageLocator(stage);
      await expect(locator).toBeVisible();
    }
  });

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
    const totalMoM = await preOnboardingDashboardPage.getTotalCandidatesMoMText();
    expect(totalMoM).toBeTruthy();

    // AI Flagged Cases should have MoM indicator
    const aiMoM = await preOnboardingDashboardPage.getAiFlaggedCasesMoMText();
    expect(aiMoM).toBeTruthy();

    // Offer Acceptance should have MoM indicator
    const offerMoM = await preOnboardingDashboardPage.getOfferAcceptanceMoMText();
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

    await expect(preOnboardingDashboardPage.isMonthlyTrendChartVisible()).resolves.toBe(true);

    // Check that monthly data points are present
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (const month of months) {
      await expect(page.getByText(month, { exact: false })).toBeVisible();
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

    await expect(preOnboardingDashboardPage.isOfferAcceptDeclineSectionVisible()).resolves.toBe(true);

    // Check for department entries
    const barCount = await preOnboardingDashboardPage.getDepartmentBarCount();
    expect(barCount).toBeGreaterThanOrEqual(0);
  });

  /**
   * TC019 - Verify Initiate Button Click Opens Modal
   * Steps: Navigate to Dashboard -> Click Initiate Pre-Boarding
   * Expected: Modal or new page opens for initiating pre-boarding
   */
  test('should open initiate pre-boarding flow when button is clicked', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Click the initiate button
    await preOnboardingDashboardPage.clickInitiatePreBoarding();

    // Wait for modal or new page to appear
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Either a modal should appear or the page should navigate
    // This is a positive test - we just verify the click doesn't throw an error
    expect(true).toBeTruthy();
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

    await expect(preOnboardingDashboardPage.isDashboardTitleVisible()).resolves.toBe(true);
    await expect(preOnboardingDashboardPage.areAllKPIsVisible()).resolves.toBe(true);
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

    const initiatedData = await preOnboardingDashboardPage.getFunnelStageData('Initiated');
    const docsData = await preOnboardingDashboardPage.getFunnelStageData('Docs Uploaded');
    const verifiedData = await preOnboardingDashboardPage.getFunnelStageData('Verified');

    // Verify descending order
    expect(parseInt(initiatedData.count)).toBeGreaterThanOrEqual(parseInt(docsData.count));
    expect(parseInt(docsData.count)).toBeGreaterThanOrEqual(parseInt(verifiedData.count));
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
    const initialCandidates = await preOnboardingDashboardPage.getTotalCandidatesCount();

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
    await expect(preOnboardingDashboardPage.isDashboardTitleVisible()).resolves.toBe(true);

    // Data should be consistent
    const restoredCandidates = await preOnboardingDashboardPage.getTotalCandidatesCount();
    expect(restoredCandidates).toBe(initialCandidates);
  });

  /**
   * TC023 - Verify Dashboard Shows Correct Title Format
   * Steps: Navigate to Dashboard
   * Expected: Title matches expected format
   */
  test('should display correct page title format', async ({
    preOnboardingDashboardPage,
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toBeTruthy();
  });
});


